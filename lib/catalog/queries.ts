import { createClient } from "@/lib/supabase/server";

// Card/grid views only render name, price, an image and a review summary —
// selecting `*` pulls description, sku, search_vector, timestamps, etc. for
// every row, which is real payload weight once a category has a couple
// thousand rows. `product_reviews(rating)` only pulls the one column needed
// to compute an average client-side — real reviews only (see migration
// 0007), never seeded/fake ones, so most products return an empty array and
// simply show no rating yet (components/product/star-rating.tsx hides
// itself when count is 0, same "don't fabricate" rule as everywhere else).
const PRODUCT_CARD_FIELDS =
  "id, name, slug, price, price_status, product_images(storage_path, position, is_primary), product_reviews(rating)";

/**
 * Products in a category.
 *
 * Category *identity* comes from the `categories` table itself (not a static
 * map) so that categories created via the admin panel show up immediately —
 * this used to read a hand-written `CATEGORY_MAP`, which meant a new admin
 * category could never actually be reached at `/categorie/{slug}`. Two round
 * trips (category lookup, then its products) rather than one: a category
 * with zero products yet (freshly created in the admin) must still render
 * its empty state instead of 404ing, which a single inner-join query can't
 * distinguish from "unknown slug".
 *
 * Categories are flat, one level (see `parent_id` on the table) — this
 * doesn't traverse subcategories. Revisit if that changes.
 *
 * Capped at 200 products ("Littérature" alone has ~2000) until this page
 * gets real pagination — a hard limit here is deliberate so a huge category
 * doesn't quietly ship a multi-MB response.
 */
export async function getProductsByCategorySlug(slug: string) {
  const supabase = await createClient();

  const { data: category } = await supabase
    .from("categories")
    .select("id, slug, name")
    .eq("slug", slug)
    .maybeSingle();

  if (!category) return { category: null, products: [] };

  const { data: products } = await supabase
    .from("products")
    .select(PRODUCT_CARD_FIELDS)
    .eq("category_id", category.id)
    .eq("is_active", true)
    .order("name")
    .limit(200);

  return { category, products: products ?? [] };
}

/**
 * Category slugs/names grouped for the storefront's two-section nav
 * (sidebar accordion, homepage grids) — grouped by slug prefix rather than
 * `parent_id` since that's the convention the admin category form enforces
 * (every new category is created as "librairie-…" or "papeterie-…").
 */
export async function getCategoryNavGroups() {
  const supabase = await createClient();
  const { data } = await supabase.from("categories").select("slug, name").order("name");
  const categories = data ?? [];

  return {
    librairie: categories.filter((c) => c.slug.startsWith("librairie-")),
    papeterie: categories.filter((c) => c.slug.startsWith("papeterie-")),
  };
}

export async function getProductBySlug(slug: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select(
      "*, categories(slug, name), product_images(storage_path, position, is_primary), product_reviews(id, rating, comment, created_at)",
    )
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();
  return data;
}

/**
 * Sibling color/style variants of a product — see migration
 * 0011_product_variants.sql. Admin-curated (no reliable automatic matching),
 * so this is a plain lookup by the shared `variant_group_id`, not a guess.
 */
export async function getProductVariants(groupId: string | null, excludeId: string) {
  if (!groupId) return [];

  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select("id, name, slug, variant_label, product_images(storage_path, position, is_primary)")
    .eq("variant_group_id", groupId)
    .eq("is_active", true)
    .neq("id", excludeId)
    .order("name");

  return data ?? [];
}

export async function searchProducts(query: string) {
  if (!query.trim()) return [];

  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select(PRODUCT_CARD_FIELDS)
    .eq("is_active", true)
    .textSearch("search_vector", query, { type: "websearch", config: "french" })
    .limit(40);

  return data ?? [];
}
