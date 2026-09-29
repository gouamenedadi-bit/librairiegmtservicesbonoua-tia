import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

const PRODUCTS_PER_PAGE = 50;

export async function getAdminProducts({
  search = "",
  categoryId = "",
  priceStatus = "",
  hasPhoto = "",
  page = 1,
}: {
  search?: string;
  categoryId?: string;
  priceStatus?: string;
  hasPhoto?: string;
  page?: number;
}) {
  const supabase = await createClient();

  let query = supabase
    .from("products")
    .select(
      "id, name, sku, price, price_status, is_active, category_id, categories(name), product_images(storage_path, position, is_primary)",
      { count: "exact" },
    )
    .order("updated_at", { ascending: false });

  if (search.trim()) query = query.ilike("name", `%${search.trim()}%`);
  if (categoryId) query = query.eq("category_id", categoryId);
  if (priceStatus === "priced" || priceStatus === "on_request") query = query.eq("price_status", priceStatus);

  const from = (page - 1) * PRODUCTS_PER_PAGE;
  const to = from + PRODUCTS_PER_PAGE - 1;
  const { data, count } = await query.range(from, to);

  // Filtered client-side (not worth a dedicated SQL clause for a checkbox
  // that only matters on an admin list capped at 50 rows/page).
  const rows = data ?? [];
  const filtered =
    hasPhoto === "with"
      ? rows.filter((p) => (p.product_images?.length ?? 0) > 0)
      : hasPhoto === "without"
        ? rows.filter((p) => (p.product_images?.length ?? 0) === 0)
        : rows;

  return { products: filtered, total: count ?? 0, perPage: PRODUCTS_PER_PAGE };
}

export async function getProductForEdit(id: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select("*, product_images(id, storage_path, position, is_primary, source)")
    .eq("id", id)
    .maybeSingle();
  return data;
}

export async function getProductVariantSiblings(groupId: string | null, excludeId: string) {
  if (!groupId) return [];

  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select("id, name, slug, variant_label, product_images(storage_path, position, is_primary)")
    .eq("variant_group_id", groupId)
    .neq("id", excludeId)
    .order("name");

  return data ?? [];
}

/**
 * Emails only live in `auth.users`, not `profiles` — merging them in needs
 * the service-role client (`auth.admin.listUsers()`), bypassing RLS. Safe
 * here because this is only ever called from Server Components already
 * behind the admin layout's own role check, not a public-facing query.
 */
export async function getAdminAccounts() {
  const supabase = await createClient();
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, full_name, created_at")
    .eq("role", "admin")
    .order("created_at");

  if (!profiles || profiles.length === 0) return [];

  const admin = createAdminClient();
  const { data: usersData } = await admin.auth.admin.listUsers();
  const emailById = new Map(usersData?.users.map((u) => [u.id, u.email]) ?? []);

  return profiles.map((p) => ({ ...p, email: emailById.get(p.id) ?? null }));
}

export async function getCategoriesForSelect() {
  const supabase = await createClient();
  const { data } = await supabase.from("categories").select("id, name").order("name");
  return data ?? [];
}

export async function getAdminCategories() {
  const supabase = await createClient();
  const { data: categories } = await supabase.from("categories").select("id, slug, name").order("name");

  if (!categories) return [];

  const counts = await Promise.all(
    categories.map((c) => supabase.from("products").select("id", { count: "exact", head: true }).eq("category_id", c.id)),
  );

  return categories.map((c, i) => ({ ...c, productCount: counts[i].count ?? 0 }));
}

export async function getCategoryForEdit(id: string) {
  const supabase = await createClient();
  const { data } = await supabase.from("categories").select("*").eq("id", id).maybeSingle();
  return data;
}

export async function getDashboardStats() {
  const supabase = await createClient();

  const [totalActive, onRequest, photoLinks, inactive, categories, pendingOrders, totalProducts] = await Promise.all([
    supabase.from("products").select("id", { count: "exact", head: true }).eq("is_active", true),
    supabase.from("products").select("id", { count: "exact", head: true }).eq("price_status", "on_request"),
    supabase.from("product_images").select("product_id"),
    supabase.from("products").select("id", { count: "exact", head: true }).eq("is_active", false),
    supabase.from("categories").select("id", { count: "exact", head: true }),
    supabase.from("orders").select("id", { count: "exact", head: true }).eq("fulfillment_status", "received"),
    supabase.from("products").select("id", { count: "exact", head: true }),
  ]);

  const productIdsWithPhoto = new Set((photoLinks.data ?? []).map((r) => r.product_id));
  const withoutPhotoCount = (totalProducts.count ?? 0) - productIdsWithPhoto.size;

  return {
    totalProducts: totalProducts.count ?? 0,
    totalActive: totalActive.count ?? 0,
    onRequest: onRequest.count ?? 0,
    withoutPhoto: Math.max(withoutPhotoCount, 0),
    inactive: inactive.count ?? 0,
    totalCategories: categories.count ?? 0,
    pendingOrders: pendingOrders.count ?? 0,
  };
}

export async function getAdminOrders() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("orders")
    .select("id, order_number, guest_name, guest_phone, total_amount, payment_status, fulfillment_status, created_at")
    .order("created_at", { ascending: false })
    .limit(100);
  return data ?? [];
}

export async function getOrderForAdmin(id: string) {
  const supabase = await createClient();
  const { data: order } = await supabase.from("orders").select("*").eq("id", id).maybeSingle();
  if (!order) return null;

  const { data: items } = await supabase
    .from("order_items")
    .select("id, sku_snapshot, name_snapshot, unit_price_snapshot, quantity, subtotal")
    .eq("order_id", id);

  return { order, items: items ?? [] };
}
