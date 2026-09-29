import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

import { CATEGORY_MAP } from "../../lib/catalog/category-map";
import { slugify } from "../../lib/utils/slugify";
import { readCatalogRows, type CatalogRow } from "./read-excel";
import { IMAGES_ROOT_FOLDER, IMAGE_FOLDER_MAP } from "./image-folder-map";
import { hashFile, listImageFiles, matchImagesToProducts } from "./match-images";

// Unlike `next dev`, running this file directly via `tsx` does not
// auto-load `.env.local` — needed here since `--apply` talks to Supabase.
process.loadEnvFile(".env.local");

const APPLY = process.argv.includes("--apply");

// scripts/import/import-catalog.ts runs from `web/` (see package.json
// "import:catalog" script) — the source Excel/image folders live one level
// up, next to `web/`, and are never copied into the repo.
const PROJECT_ROOT = path.resolve(process.cwd(), "..");
const XLSX_PATH = path.join(PROJECT_ROOT, "FICHIER PRODUITS BOUTIQUE EN LIGNE.xlsx");
const IMAGES_ROOT = path.join(PROJECT_ROOT, IMAGES_ROOT_FOLDER);

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

function prepareProducts(rows: CatalogRow[]) {
  const withinSheetSeen = new Set<string>();
  const duplicatesWithinSheet: { sheetName: string; sourceCode: string }[] = [];
  const prepared: PreparedProduct[] = [];

  for (const row of rows) {
    const mapping = CATEGORY_MAP[row.sheetName];
    if (mapping === null || mapping === undefined) continue; // "Table 1" or unmapped sheet

    const dedupeKey = `${row.sheetName}::${row.sourceCode}`;
    if (withinSheetSeen.has(dedupeKey)) {
      duplicatesWithinSheet.push({ sheetName: row.sheetName, sourceCode: row.sourceCode });
      continue;
    }
    withinSheetSeen.add(dedupeKey);

    // SKU is always category-prefixed rather than the bare Excel code: the
    // same numeric code can legitimately appear in two different category
    // sheets for two different products, and `sku` must be globally unique.
    const sku = `${mapping.slug.toUpperCase()}-${row.sourceCode}`;
    const slug = `${slugify(row.name)}-${row.sourceCode}`;

    prepared.push({
      sourceSheet: row.sheetName,
      sourceCode: row.sourceCode,
      categorySlug: mapping.slug,
      categoryName: mapping.name,
      sku,
      name: row.name,
      slug,
      typeRaw: row.typeRaw,
      price: row.price,
      priceStatus: row.price !== null ? "priced" : "on_request",
    });
  }

  return { prepared, duplicatesWithinSheet };
}

function buildImageMatchPreview(prepared: PreparedProduct[]) {
  const byCategorySlug = new Map<string, PreparedProduct[]>();
  for (const product of prepared) {
    const list = byCategorySlug.get(product.categorySlug) ?? [];
    list.push(product);
    byCategorySlug.set(product.categorySlug, list);
  }

  const report: {
    categorySlug: string;
    folder: string;
    imageCount: number;
    matched: number;
    unmatchedImages: number;
    unmatchedProducts: number;
  }[] = [];

  const allMatches: { categorySlug: string; sourceCode: string; absPath: string; confidence: number }[] = [];

  for (const [categorySlug, products] of byCategorySlug) {
    const folderName = IMAGE_FOLDER_MAP[categorySlug];
    if (!folderName) continue; // no image folder for this category (e.g. papeterie-imprime)

    const folderPath = path.join(IMAGES_ROOT, folderName);
    if (!existsSync(folderPath)) continue;

    const images = listImageFiles(folderPath);
    const matches = matchImagesToProducts(
      images,
      products.map((p) => ({ sourceCode: p.sourceCode, name: p.name })),
    );

    for (const match of matches) {
      allMatches.push({ categorySlug, sourceCode: match.productSourceCode, absPath: match.absPath, confidence: match.confidence });
    }

    report.push({
      categorySlug,
      folder: folderName,
      imageCount: images.length,
      matched: matches.length,
      unmatchedImages: images.length - matches.length,
      unmatchedProducts: products.length - matches.length,
    });
  }

  return { report, allMatches };
}

async function main() {
  if (!existsSync(XLSX_PATH)) {
    console.error(`Fichier introuvable : ${XLSX_PATH}`);
    process.exit(1);
  }

  const rows = readCatalogRows(XLSX_PATH, (sheetName) => sheetName !== "Table 1");
  const { prepared, duplicatesWithinSheet } = prepareProducts(rows);

  const priced = prepared.filter((p) => p.priceStatus === "priced").length;
  const onRequest = prepared.length - priced;

  const { report: imageReport, allMatches } = buildImageMatchPreview(prepared);
  const totalImagesSeen = imageReport.reduce((sum, r) => sum + r.imageCount, 0);

  console.log("=== Rapport d'import du catalogue ===");
  console.log(`Lignes lues (hors "Table 1") : ${rows.length}`);
  console.log(`Produits préparés            : ${prepared.length}`);
  console.log(`  dont prix connu (priced)   : ${priced}`);
  console.log(`  dont prix sur demande      : ${onRequest}`);
  console.log(`Doublons (même feuille+code) : ${duplicatesWithinSheet.length}`);
  console.log("");
  console.log("--- Images ---");
  console.log(`Dossiers catégorie traités   : ${imageReport.length}`);
  console.log(`Images vues au total         : ${totalImagesSeen}`);
  console.log(`Images auto-liées (>= 0.92)  : ${allMatches.length}`);
  console.log(`Images restant à attribuer   : ${totalImagesSeen - allMatches.length}`);
  console.log("");
  for (const r of imageReport) {
    console.log(
      `  ${r.categorySlug.padEnd(38)} images=${String(r.imageCount).padStart(4)}  liées=${String(r.matched).padStart(4)}  a_attribuer=${r.unmatchedImages}`,
    );
  }

  const reportDir = path.join(process.cwd(), "scripts", "import", "report");
  mkdirSync(reportDir, { recursive: true });
  const reportPath = path.join(reportDir, `dry-run-${Date.now()}.json`);
  writeFileSync(
    reportPath,
    JSON.stringify({ prepared, duplicatesWithinSheet, imageReport, allMatches }, null, 2),
  );
  console.log(`\nRapport détaillé écrit dans : ${reportPath}`);

  if (!APPLY) {
    console.log("\nMode dry-run (par défaut) : aucune écriture Supabase. Relancez avec --apply une fois les clés Supabase renseignées dans .env.local.");
    return;
  }

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error("\n--apply demandé mais NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY manquent dans .env.local. Abandon.");
    process.exit(1);
  }

  const { applyImport } = await import("./apply-import");
  await applyImport({ prepared, allMatches, hashFile });
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
