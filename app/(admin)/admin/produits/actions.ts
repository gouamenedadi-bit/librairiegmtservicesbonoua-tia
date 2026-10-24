"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { slugify } from "@/lib/utils/slugify";
import { productFormSchema } from "@/lib/validations/product";
import { requireAdmin } from "@/lib/admin/require-admin";

function parseProductForm(formData: FormData) {
  const isOnRequest = formData.get("isOnRequest") === "on";
  const priceRaw = formData.get("price");

  return productFormSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description") || undefined,
    categoryId: formData.get("categoryId"),
    isOnRequest,
    price: isOnRequest || !priceRaw ? null : Number(priceRaw),
    isActive: formData.get("isActive") === "on",
    variantLabel: formData.get("variantLabel") || undefined,
  });
}

/**
 * Admin product writes go through the normal (anon-key + session) server
 * client, never the service-role client — RLS's `products_admin_write`
 * policy (is_admin()) still backs every write here. The `requireAdmin()`
 * call in each function below is a redundant, explicit app-level check on
 * top of that (defense in depth), not a replacement for it.
 */
export async function createProduct(formData: FormData): Promise<{ error: string } | { id: string }> {
  if (!(await requireAdmin())) return { error: "Non autorisé." };

  const parsed = parseProductForm(formData);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Formulaire invalide." };

  const supabase = await createClient();

  // Manually created products have no Excel origin — a sentinel source_sheet
  // plus a random source_code/sku still satisfies the uniqueness
  // constraints shared with imported products (see migration 0001).
  const sourceCode = randomUUID();

  const { data, error } = await supabase
    .from("products")
    .insert({
      source_sheet: "admin",
      source_code: sourceCode,
      sku: `ADMIN-${sourceCode.slice(0, 8).toUpperCase()}`,
      name: parsed.data.name,
      slug: `${slugify(parsed.data.name)}-${sourceCode.slice(0, 6)}`,
      description: parsed.data.description ?? null,
      category_id: parsed.data.categoryId,
      price: parsed.data.price,
      price_status: parsed.data.isOnRequest ? "on_request" : "priced",
      is_active: parsed.data.isActive,
      variant_label: parsed.data.variantLabel ?? null,
      manually_edited_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  if (error || !data) return { error: "Impossible de créer le produit." };

  revalidatePath("/admin/produits");
  return { id: data.id };
}

export async function updateProduct(
  id: string,
  formData: FormData,
): Promise<{ error: string } | { id: string }> {
  if (!(await requireAdmin())) return { error: "Non autorisé." };

  const parsed = parseProductForm(formData);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Formulaire invalide." };

  const supabase = await createClient();

  const { error } = await supabase
    .from("products")
    .update({
      name: parsed.data.name,
      description: parsed.data.description ?? null,
      category_id: parsed.data.categoryId,
      price: parsed.data.price,
      price_status: parsed.data.isOnRequest ? "on_request" : "priced",
      is_active: parsed.data.isActive,
      variant_label: parsed.data.variantLabel ?? null,
      manually_edited_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) return { error: "Impossible de modifier le produit." };

  revalidatePath("/admin/produits");
  revalidatePath(`/admin/produits/${id}`);
  return { id };
}

export async function deleteProduct(id: string): Promise<{ error: string } | { ok: true }> {
  if (!(await requireAdmin())) return { error: "Non autorisé." };

  const supabase = await createClient();

  const { data: images } = await supabase
    .from("product_images")
    .select("storage_path")
    .eq("product_id", id);

  if (images && images.length > 0) {
    await supabase.storage.from("products").remove(images.map((i) => i.storage_path));
  }

  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) return { error: "Impossible de supprimer le produit." };

  revalidatePath("/admin/produits");
  return { ok: true };
}

export async function toggleProductActive(id: string, isActive: boolean) {
  if (!(await requireAdmin())) return;

  const supabase = await createClient();
  await supabase.from("products").update({ is_active: isActive }).eq("id", id);
  revalidatePath("/admin/produits");
}

/**
 * Product name search for the "link a color variant" picker — there's no
 * reliable automatic way to know two imported rows are the same item in a
 * different color (same lesson as photo matching earlier in this project),
 * so the shop owner finds and links the other product by name themselves.
 */
export async function searchProductsForLinking(query: string, excludeId: string) {
  if (!(await requireAdmin())) return [];
  if (!query.trim()) return [];

  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select("id, name, slug, product_images(storage_path, position, is_primary)")
    .ilike("name", `%${query.trim()}%`)
    .neq("id", excludeId)
    .limit(8);

  return data ?? [];
}

export async function linkProductVariant(
  productId: string,
  otherProductId: string,
): Promise<{ error: string } | { ok: true }> {
  if (!(await requireAdmin())) return { error: "Non autorisé." };

  const supabase = await createClient();

  const { data: rows } = await supabase
    .from("products")
    .select("id, variant_group_id")
    .in("id", [productId, otherProductId]);

  if (!rows || rows.length !== 2) return { error: "Produit introuvable." };

  const current = rows.find((r) => r.id === productId);
  const other = rows.find((r) => r.id === otherProductId);
  const groupId = current?.variant_group_id ?? other?.variant_group_id ?? randomUUID();

  const { error } = await supabase
    .from("products")
    .update({ variant_group_id: groupId })
    .in("id", [productId, otherProductId]);

  if (error) return { error: "Impossible de lier ces produits." };

  revalidatePath(`/admin/produits/${productId}`);
  return { ok: true };
}

export async function unlinkProductVariant(
  productId: string,
): Promise<{ error: string } | { ok: true }> {
  if (!(await requireAdmin())) return { error: "Non autorisé." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("products")
    .update({ variant_group_id: null })
    .eq("id", productId);

  if (error) return { error: "Impossible de délier ce produit." };

  revalidatePath(`/admin/produits/${productId}`);
  return { ok: true };
}
