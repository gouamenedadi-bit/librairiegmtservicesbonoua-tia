import { readFileSync } from "node:fs";

import * as XLSX from "xlsx";

export type CatalogRow = {
  sheetName: string;
  sourceCode: string;
  name: string;
  typeRaw: string | null;
  price: number | null;
};

/**
 * Reads every category sheet (all sheets except "Table 1", see
 * lib/catalog/category-map.ts for why that one is excluded) and returns
 * normalized rows. Columns are `Code | NOM DU MATERIEL | TYPE | PRIX` on
 * every category sheet (verified against the real file).
 */
export function readCatalogRows(xlsxPath: string, sheetFilter: (sheetName: string) => boolean): CatalogRow[] {
  const workbook = XLSX.read(readFileSync(xlsxPath), { type: "buffer" });
  const rows: CatalogRow[] = [];

  for (const sheetName of workbook.SheetNames) {
    if (!sheetFilter(sheetName)) continue;

    const sheet = workbook.Sheets[sheetName];
    const raw = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: "" });

    for (const row of raw) {
      const sourceCode = String(row["Code"] ?? "").trim();
      const name = String(row["NOM DU MATERIEL"] ?? "").trim();
      const typeRaw = String(row["TYPE"] ?? "").trim();
      const priceRaw = row["PRIX"];

      if (!sourceCode || !name) continue; // skip blank/malformed rows

      const price = typeof priceRaw === "number" && priceRaw > 0 ? priceRaw : null;

      rows.push({ sheetName, sourceCode, name, typeRaw: typeRaw || null, price });
    }
  }

  return rows;
}
