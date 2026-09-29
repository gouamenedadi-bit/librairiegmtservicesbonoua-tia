"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useTransition } from "react";
import { Link2, Loader2, Search, X } from "lucide-react";

import { primaryImagePath, storagePublicUrl } from "@/lib/catalog/storage";
import {
  linkProductVariant,
  searchProductsForLinking,
  unlinkProductVariant,
} from "@/app/(admin)/admin/produits/actions";

type ProductImage = { storage_path: string; position: number; is_primary: boolean };
type Variant = { id: string; name: string; slug: string; variant_label: string | null; product_images: ProductImage[] };
type Candidate = { id: string; name: string; slug: string; product_images: ProductImage[] };

/**
 * There's no reliable way to auto-detect that two imported catalog rows are
 * the same item in a different color (same lesson as photo matching
 * elsewhere in this project) — the shop owner links them by hand here, by
 * searching for the other product by name. Linking sets both products'
 * `variant_group_id` to the same value; the storefront product page then
 * shows every product sharing that id as a color swatch to switch between.
 */
export function VariantLinker({ productId, variants }: { productId: string; variants: Variant[] }) {
  const [query, setQuery] = useState("");
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  async function handleSearch(value: string) {
    setQuery(value);
    setError(null);
    if (!value.trim()) {
      setCandidates([]);
      return;
    }
    setIsSearching(true);
    const results = await searchProductsForLinking(value, productId);
    setCandidates(results);
    setIsSearching(false);
  }

  function handleLink(otherId: string) {
    setError(null);
    startTransition(async () => {
      const result = await linkProductVariant(productId, otherId);
      if ("error" in result) {
        setError(result.error);
        return;
      }
      setQuery("");
      setCandidates([]);
    });
  }

  function handleUnlink(variantId: string) {
    setError(null);
    startTransition(async () => {
      const result = await unlinkProductVariant(variantId);
      if ("error" in result) setError(result.error);
    });
  }

  return (
    <div>
      {variants.length > 0 && (
        <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {variants.map((variant) => {
            const path = primaryImagePath(variant.product_images);
            return (
              <div key={variant.id} className="group relative overflow-hidden rounded-xl border border-black/10">
                <Link href={`/admin/produits/${variant.id}`} className="block">
                  <div className="relative aspect-square bg-black/5">
                    {path && (
                      <Image src={storagePublicUrl(path)} alt="" fill unoptimized className="object-cover" />
                    )}
                  </div>
                  <div className="p-2">
                    <p className="truncate text-xs font-semibold text-brand-navy">
                      {variant.variant_label || variant.name}
                    </p>
                  </div>
                </Link>
                <button
                  type="button"
                  title="Délier cette variante"
                  onClick={() => handleUnlink(variant.id)}
                  className="absolute right-1 top-1 rounded-full bg-white p-1 text-red-600 opacity-0 shadow transition group-hover:opacity-100"
                >
                  <X size={14} />
                </button>
              </div>
            );
          })}
        </div>
      )}

      <div className="relative">
        <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-black/30" />
        <input
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Chercher un produit à lier comme variante…"
          className="w-full rounded-xl border border-black/10 bg-black/[0.015] py-2.5 pl-9 pr-4 text-sm text-brand-navy outline-none transition-colors placeholder:text-black/30 focus:border-brand-green focus:bg-white focus:ring-2 focus:ring-brand-green/20"
        />
        {isSearching && (
          <Loader2 size={16} className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-black/30" />
        )}
      </div>

      {candidates.length > 0 && (
        <div className="mt-2 max-h-64 space-y-1 overflow-y-auto rounded-xl border border-black/10 p-2">
          {candidates.map((candidate) => {
            const path = primaryImagePath(candidate.product_images);
            return (
              <button
                key={candidate.id}
                type="button"
                disabled={isPending}
                onClick={() => handleLink(candidate.id)}
                className="flex w-full items-center gap-3 rounded-lg p-2 text-left hover:bg-brand-green/5 disabled:opacity-60"
              >
                <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-md bg-black/5">
                  {path && <Image src={storagePublicUrl(path)} alt="" fill unoptimized className="object-cover" />}
                </div>
                <span className="min-w-0 flex-1 truncate text-sm text-brand-navy">{candidate.name}</span>
                <Link2 size={14} className="shrink-0 text-brand-green" />
              </button>
            );
          })}
        </div>
      )}

      {error && <p className="mt-2 text-sm font-medium text-red-600">{error}</p>}
    </div>
  );
}
