"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { categoryFormSchema } from "@/lib/validations/category";

function parseCategoryForm(formData: FormData) {
  return categoryFormSchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug"),
  });
}

export async function createCategory(formData: FormData): Promise<{ error: string } | { id: string }> {
  const parsed = parseCategoryForm(formData);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Formulaire invalide." };

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("categories")
    .insert({ name: parsed.data.name, slug: parsed.data.slug })
    .select("id")
    .single();

  if (error) {
    if (error.code === "23505") return { error: "Ce slug est déjà utilisé par une autre catégorie." };
    return { error: "Impossible de créer la catégorie." };
  }

  revalidatePath("/admin/categories");
  return { id: data.id };
}

export async function updateCategory(
  id: string,
  formData: FormData,
): Promise<{ error: string } | { id: string }> {
  const parsed = parseCategoryForm(formData);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Formulaire invalide." };

  const supabase = await createClient();

  const { error } = await supabase
    .from("categories")
    .update({ name: parsed.data.name, slug: parsed.data.slug })
    .eq("id", id);

  if (error) {
    if (error.code === "23505") return { error: "Ce slug est déjà utilisé par une autre catégorie." };
    return { error: "Impossible de modifier la catégorie." };
  }

  revalidatePath("/admin/categories");
  return { id };
}

export async function deleteCategory(id: string): Promise<{ error: string } | { ok: true }> {
  const supabase = await createClient();

  const { count } = await supabase
    .from("products")
    .select("id", { count: "exact", head: true })
    .eq("category_id", id);

  if (count && count > 0) {
    return {
      error: `Impossible de supprimer : ${count} produit${count > 1 ? "s" : ""} utilise${count > 1 ? "nt" : ""} encore cette catégorie. Déplacez-les d'abord.`,
    };
  }

  const { count: childCount } = await supabase
    .from("categories")
    .select("id", { count: "exact", head: true })
    .eq("parent_id", id);

  if (childCount && childCount > 0) {
    return { error: `Impossible de supprimer : ${childCount} sous-catégorie(s) en dépendent encore.` };
  }

  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) return { error: "Impossible de supprimer la catégorie." };

  revalidatePath("/admin/categories");
  return { ok: true };
}
