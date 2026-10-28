import Image from "next/image";
import Link from "next/link";

import { primaryImagePath, storagePublicUrl } from "@/lib/catalog/storage";
import type { Dictionary } from "@/lib/i18n/dictionary";

type ProductImage = { storage_path: string; position: number; is_primary: boolean };
type Variant = { id: string; name: string; slug: string; variant_label: string | null; product_images: ProductImage[] };

export function VariantSwatches({ variants, dict }: { variants: Variant[]; dict: Dictionary }) {
  if (variants.length === 0) return null;

  return (
    <div className="mt-8">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-navy/55">{dict.product.variantsTitle}</p>
      <div className="mt-3 flex gap-3 overflow-x-auto pb-2">
        {variants.map((variant) => {
          const path = primaryImagePath(variant.product_images);
          return (
            <Link
              key={variant.id}
              href={`/produit/${variant.slug}`}
              className="group w-20 shrink-0 text-center"
            >
              <div className="relative aspect-square overflow-hidden rounded-xl border border-black/10 bg-black/5 transition group-hover:border-brand-green">
                {path && (
                  <Image src={storagePublicUrl(path)} alt={variant.variant_label ?? variant.name} fill unoptimized className="object-cover" />
                )}
              </div>
              <p className="mt-1 truncate text-xs text-black/60 group-hover:text-brand-navy">
                {variant.variant_label || variant.name}
              </p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
