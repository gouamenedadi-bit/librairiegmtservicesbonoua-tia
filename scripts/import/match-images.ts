import { createHash } from "node:crypto";
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";

const IMAGE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp"]);

// High-confidence-only threshold — see plan: a wrong auto-match on a real
// shop is worse than leaving the image for manual attribution.
const MATCH_CONFIDENCE_THRESHOLD = 0.92;

export function listImageFiles(folderAbsPath: string): { absPath: string; filename: string }[] {
  return readdirSync(folderAbsPath, { withFileTypes: true })
    .filter((entry) => entry.isFile() && IMAGE_EXTENSIONS.has(path.extname(entry.name).toLowerCase()))
    .map((entry) => ({ absPath: path.join(folderAbsPath, entry.name), filename: entry.name }));
}

export function hashFile(absPath: string): string {
  return createHash("sha256").update(readFileSync(absPath)).digest("hex");
}

function normalizeForMatch(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toUpperCase()
    .replace(/\.[a-z0-9]+$/i, "") // strip extension
    .replace(/[^A-Z0-9]+/g, " ")
    .trim();
}

function levenshtein(a: string, b: string): number {
  const rows = a.length + 1;
  const cols = b.length + 1;
  const distance: number[][] = Array.from({ length: rows }, () => new Array<number>(cols).fill(0));

  for (let i = 0; i < rows; i++) distance[i][0] = i;
  for (let j = 0; j < cols; j++) distance[0][j] = j;

  for (let i = 1; i < rows; i++) {
    for (let j = 1; j < cols; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      distance[i][j] = Math.min(
        distance[i - 1][j] + 1,
        distance[i][j - 1] + 1,
        distance[i - 1][j - 1] + cost,
      );
    }
  }

  return distance[rows - 1][cols - 1];
}

function similarity(a: string, b: string): number {
  if (a === b) return 1;
  const maxLen = Math.max(a.length, b.length);
  if (maxLen === 0) return 1;
  return 1 - levenshtein(a, b) / maxLen;
}

export type ImageMatch = {
  filename: string;
  absPath: string;
  productSourceCode: string;
  confidence: number;
};

/**
 * Greedy best-match: each image is compared against every candidate product
 * name in the same category, kept only above MATCH_CONFIDENCE_THRESHOLD, and
 * once an image or a product is matched it's removed from the pool so the
 * same product doesn't silently "steal" every image in the folder.
 */
export function matchImagesToProducts(
  images: { absPath: string; filename: string }[],
  products: { sourceCode: string; name: string }[],
): ImageMatch[] {
  const candidates: { image: (typeof images)[number]; product: (typeof products)[number]; score: number }[] = [];

  for (const image of images) {
    const normalizedFile = normalizeForMatch(image.filename);
    for (const product of products) {
      const score = similarity(normalizedFile, normalizeForMatch(product.name));
      if (score >= MATCH_CONFIDENCE_THRESHOLD) {
        candidates.push({ image, product, score });
      }
    }
  }

  candidates.sort((a, b) => b.score - a.score);

  const usedImages = new Set<string>();
  const usedProducts = new Set<string>();
  const matches: ImageMatch[] = [];

  for (const candidate of candidates) {
    if (usedImages.has(candidate.image.absPath) || usedProducts.has(candidate.product.sourceCode)) continue;
    usedImages.add(candidate.image.absPath);
    usedProducts.add(candidate.product.sourceCode);
    matches.push({
      filename: candidate.image.filename,
      absPath: candidate.image.absPath,
      productSourceCode: candidate.product.sourceCode,
      confidence: candidate.score,
    });
  }

  return matches;
}
