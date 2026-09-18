import { readFileSync } from "node:fs";
import path from "node:path";

import { createAdminClient } from "../../lib/supabase/admin";
import { CATEGORY_MAP } from "../../lib/catalog/category-map";

type PreparedProduct = {
  sourceSheet: string;
  sourceCode: string;
  categorySlug: string;
  categoryName: string;
  sku: string;
  name: string;
  slug: string;
  typeRaw: string | null;
  price: number | null;
  priceStatus: "priced" | "on_request";
};

type ImageMatch = { categorySlug: string; sourceCode: string; absPath: string; confidence: number };

const CONTENT_TYPE_BY_EXT: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
};

export async function applyImport({
  prepared,
  allMatches,
  hashFile,
}: {
  prepared: PreparedProduct[];
  allMatches: ImageMatch[];
  hashFile: (absPath: string) => string;
}) {
  const supabase = createAdminClient();
  const startedAt = new Date().toISOString();

  console.log("\n=== Application des écritures Supabase ===");

  // 1. Catégories (dédupliquées par slug — deux feuilles peuvent partager une catégorie).
  const uniqueCategories = new Map(
    Object.values(CATEGORY_MAP)
      .filter((c) => c !== null)
      .map((c) => [c.slug, c]),
  );

  const categoryIdBySlug = new Map<string, string>();
  for (const category of uniqueCategories.values()) {
    const { data, error } = await supabase.rpc("upsert_category", {
      p_slug: category.slug,
      p_name: category.name,
      p_parent_id: null,
    });
    if (error || !data) throw new Error(`upsert_category(${category.slug}): ${error?.message}`);
    categoryIdBySlug.set(category.slug, data);
  }
  console.log(`Catégories synchronisées : ${categoryIdBySlug.size}`);

  // 2. Produits, un par un via la fonction non-destructive (voir migration 0005).
  const productIdBySourceCode = new Map<string, string>();
  let created = 0;
  let updated = 0;

  for (const product of prepared) {
    const categoryId = categoryIdBySlug.get(product.categorySlug);
    if (!categoryId) continue;

    const { data, error } = await supabase
      .rpc("upsert_imported_product", {
        p_source_sheet: product.sourceSheet,
        p_source_code: product.sourceCode,
        p_sku: product.sku,
        p_name: product.name,
        p_slug: product.slug,
        p_category_id: categoryId,
        p_type_raw: product.typeRaw,
        p_price: product.price,
        p_price_status: product.priceStatus,
      })
      .single();

    if (error || !data) {
      console.error(`  échec produit ${product.sku} (${product.sourceSheet}): ${error?.message}`);
      continue;
    }

    productIdBySourceCode.set(`${product.categorySlug}::${product.sourceCode}`, data.id);
    if (data.was_created) created += 1;
    else updated += 1;
  }
  console.log(`Produits créés : ${created} · mis à jour : ${updated}`);

  // 3. Images à haute confiance : upload + liaison, dédupliquées par hash de contenu.
  let uploaded = 0;
  let skippedDuplicate = 0;

  for (const match of allMatches) {
    const productId = productIdBySourceCode.get(`${match.categorySlug}::${match.sourceCode}`);
    if (!productId) continue;

    const contentHash = hashFile(match.absPath);
    const ext = path.extname(match.absPath).toLowerCase();
    const storagePath = `${match.categorySlug}/${match.sourceCode}${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("products")
      .upload(storagePath, readFileSync(match.absPath), {
        contentType: CONTENT_TYPE_BY_EXT[ext] ?? "application/octet-stream",
        upsert: true,
      });

    if (uploadError) {
      console.error(`  échec upload ${storagePath}: ${uploadError.message}`);
      continue;
    }

    const { error: insertError } = await supabase.from("product_images").upsert(
      {
        product_id: productId,
        storage_path: storagePath,
        position: 0,
        is_primary: true,
        content_hash: contentHash,
        match_confidence: match.confidence,
        source: "auto_match",
      },
      { onConflict: "product_id,content_hash" },
    );

    if (insertError) {
      if (insertError.code === "23505") {
        skippedDuplicate += 1;
      } else {
        console.error(`  échec liaison image ${storagePath}: ${insertError.message}`);
      }
      continue;
    }

    uploaded += 1;
  }

  console.log(`Images uploadées et liées : ${uploaded} (doublons ignorés : ${skippedDuplicate})`);

  await supabase.from("import_runs").insert({
    started_at: startedAt,
    finished_at: new Date().toISOString(),
    sheet_name: "*(toutes les feuilles catégorie)*",
    rows_seen: prepared.length,
    rows_created: created,
    rows_updated: updated,
    rows_price_known: prepared.filter((p) => p.priceStatus === "priced").length,
    rows_price_on_request: prepared.filter((p) => p.priceStatus === "on_request").length,
    duplicates_found: [],
    notes: `images_auto_matched=${allMatches.length}, images_uploaded=${uploaded}`,
  });

  console.log("\nImport terminé.");
}
