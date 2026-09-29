// One-off import for the hand-catalogued librairie photo folder ("OUVRAGES
// LITTERAIRES ET SCOLAIRES - ROMANS 1000x1000 px webp pret pour la
// librairie", 519 files deduplicated by content hash down to 408 truly-unique
// book covers — see librairie-romans-catalogue.json). Same pattern as
// import-papeterie-photos.ts: each catalogue entry already pairs one photo
// with one hand-written name/description/category, so there is no matching
// step — each entry becomes exactly one product with exactly one image.
//
// Reuses the same non-destructive upsert_imported_product RPC (see migration
// 0005) so re-running this script is safe: source_sheet is fixed to
// "librairie-romans-photos" and source_code is the image filename, giving a
// stable natural key per photo.

import { readFileSync } from "node:fs";
import path from "node:path";

import { createClient } from "@supabase/supabase-js";

import { CATEGORY_MAP } from "../../lib/catalog/category-map";
import { slugify } from "../../lib/utils/slugify";
import { hashFile } from "./match-images";
import type { Database } from "../../types/database.types";

process.loadEnvFile(".env.local");

const APPLY = process.argv.includes("--apply");

// Runs from `web/` — the photo folder lives one level up, next to `web/`,
// same convention as import-catalog.ts / import-papeterie-photos.ts.
const PROJECT_ROOT = path.resolve(process.cwd(), "..");
const PHOTOS_ROOT = path.join(
  PROJECT_ROOT,
  "OUVRAGES LITTERAIRES ET SCOLAIRES - ROMANS 1000x1000 px webp pret pour la librairie",
);
const CATALOGUE_PATH = path.join(process.cwd(), "scripts", "import", "librairie-romans-catalogue.json");

const SOURCE_SHEET = "librairie-romans-photos";

type CatalogueEntry = { file: string; name: string; category: string; description: string };

// slug -> display name, built from the same map the Excel import uses, so
// both pipelines agree on category names.
const CATEGORY_NAME_BY_SLUG = new Map(
  Object.values(CATEGORY_MAP)
    .filter((c) => c !== null)
    .map((c) => [c.slug, c.name]),
);

function createAdminClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}

async function main() {
  const entries: CatalogueEntry[] = JSON.parse(readFileSync(CATALOGUE_PATH, "utf8"));
  console.log(`Entrées cataloguées : ${entries.length}`);

  const unknownCategories = new Set(entries.map((e) => e.category)).difference(
    new Set(CATEGORY_NAME_BY_SLUG.keys()),
  );
  if (unknownCategories.size > 0) {
    console.error(`Slugs de catégorie inconnus : ${[...unknownCategories].join(", ")}`);
    process.exit(1);
  }

  if (!APPLY) {
    console.log("\nMode dry-run (par défaut) : aucune écriture Supabase. Relancez avec --apply pour uploader les images et créer les produits.");
    return;
  }

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error("\n--apply demandé mais NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY manquent dans .env.local. Abandon.");
    process.exit(1);
  }

  const supabase = createAdminClient();

  const categoryIdBySlug = new Map<string, string>();
  for (const [slug, name] of CATEGORY_NAME_BY_SLUG) {
    // RPC scalar args aren't generated as nullable even though Postgres
    // accepts null for any of them (a Supabase typegen limitation).
    const { data, error } = await supabase.rpc("upsert_category", {
      p_slug: slug,
      p_name: name,
      p_parent_id: null as unknown as string,
    });
    if (error || !data) throw new Error(`upsert_category(${slug}): ${error?.message}`);
    categoryIdBySlug.set(slug, data);
  }
  console.log(`Catégories synchronisées : ${categoryIdBySlug.size}`);

  let created = 0;
  let updated = 0;
  let uploaded = 0;
  let failed = 0;

  for (const entry of entries) {
    const categoryId = categoryIdBySlug.get(entry.category);
    if (!categoryId) {
      console.error(`  catégorie introuvable pour ${entry.file}: ${entry.category}`);
      failed += 1;
      continue;
    }

    const baseSlug = slugify(path.basename(entry.file, path.extname(entry.file)));
    const sku = `LIBRAIRIE-ROMANS-PHOTO-${baseSlug}`.toUpperCase();
    const slug = `${slugify(entry.name)}-${baseSlug}`;

    const { data: productData, error: productError } = await supabase
      .rpc("upsert_imported_product", {
        p_source_sheet: SOURCE_SHEET,
        p_source_code: entry.file,
        p_sku: sku,
        p_name: entry.name,
        p_slug: slug,
        p_category_id: categoryId,
        p_type_raw: null as unknown as string,
        p_price: null as unknown as number,
        p_price_status: "on_request",
      })
      .single();

    if (productError || !productData) {
      console.error(`  échec produit ${entry.file}: ${productError?.message}`);
      failed += 1;
      continue;
    }

    if (productData.was_created) created += 1;
    else updated += 1;

    // Description is not part of upsert_imported_product (that function only
    // touches catalog-sourced fields shared with the Excel pipeline) — set it
    // directly, same non-destructive guard: skip if an admin already edited it.
    await supabase
      .from("products")
      .update({ description: entry.description })
      .eq("id", productData.product_id)
      .is("manually_edited_at", null);

    const absPath = path.join(PHOTOS_ROOT, entry.file);
    const ext = path.extname(entry.file).toLowerCase();
    const storagePath = `${entry.category}/${baseSlug}${ext}`;
    const fileBuffer = readFileSync(absPath);

    const { error: uploadError } = await supabase.storage
      .from("products")
      .upload(storagePath, fileBuffer, { contentType: "image/webp", upsert: true });

    if (uploadError) {
      console.error(`  échec upload ${storagePath}: ${uploadError.message}`);
      failed += 1;
      continue;
    }

    const { error: imageError } = await supabase.from("product_images").upsert(
      {
        product_id: productData.product_id,
        storage_path: storagePath,
        position: 0,
        is_primary: true,
        content_hash: hashFile(absPath),
        match_confidence: 1,
        source: "manual",
        alt_text: entry.name,
      },
      { onConflict: "product_id,content_hash" },
    );

    if (imageError && imageError.code !== "23505") {
      console.error(`  échec liaison image ${storagePath}: ${imageError.message}`);
      failed += 1;
      continue;
    }

    uploaded += 1;
    if (uploaded % 25 === 0) console.log(`  ... ${uploaded}/${entries.length} images uploadées`);
  }

  console.log(`\nProduits créés : ${created} · mis à jour : ${updated} · images uploadées : ${uploaded} · échecs : ${failed}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
