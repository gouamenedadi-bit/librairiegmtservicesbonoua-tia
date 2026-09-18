import { createClient } from "@/lib/supabase/server";

export async function getCategoryBySlug(slug: string) {
  const supabase = await createClient();
  const { data } = await supabase.from("categories").select("*").eq("slug", slug).maybeSingle();
  return data;
}

/** Products directly in a category, or in any of its child categories. */
export async function getProductsByCategorySlug(slug: string) {
  const supabase = await createClient();

  const category = await getCategoryBySlug(slug);
  if (!category) return { category: null, products: [] };

  const { data: children } = await supabase
    .from("categories")
    .select("id")
    .eq("parent_id", category.id);

  const categoryIds = [category.id, ...(children ?? []).map((c) => c.id)];

  const { data: products } = await supabase
    .from("products")
    .select("*, product_images(storage_path, position, is_primary)")
    .in("category_id", categoryIds)
    .eq("is_active", true)
    .order("name");

  return { category, products: products ?? [] };
}

export async function getProductBySlug(slug: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select("*, product_images(storage_path, position, is_primary)")
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();
  return data;
}

export async function searchProducts(query: string) {
  if (!query.trim()) return [];

  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select("*, product_images(storage_path, position, is_primary)")
    .eq("is_active", true)
    .textSearch("search_vector", query, { type: "websearch", config: "french" })
    .limit(40);

  return data ?? [];
}

export function primaryImagePath(
  images: { storage_path: string; position: number; is_primary: boolean }[] | null | undefined,
): string | null {
  if (!images || images.length === 0) return null;
  const primary = images.find((i) => i.is_primary) ?? [...images].sort((a, b) => a.position - b.position)[0];
  return primary.storage_path;
}

export function storagePublicUrl(path: string): string {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  return `${base}/storage/v1/object/public/products/${path}`;
}
