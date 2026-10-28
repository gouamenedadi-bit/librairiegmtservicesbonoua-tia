import Image from "next/image";
import Link from "next/link";

import { primaryImagePath, storagePublicUrl } from "@/lib/catalog/storage";
import { formatXOF } from "@/lib/utils/format-xof";
import { getDictionary } from "@/lib/i18n/dictionary";
import { getLocale } from "@/lib/i18n/get-locale";
import { AddToCartButton } from "./add-to-cart-button";
import { StarRating } from "./star-rating";

type ProductCardData = {
  id: string;
  name: string;
  slug: string;
  price: number | null;
  price_status: "priced" | "on_request";
  product_images?: { storage_path: string; position: number; is_primary: boolean }[] | null;
  product_reviews?: { rating: number }[] | null;
};

export async function ProductCard({ product }: { product: ProductCardData }) {
  const dict = getDictionary(await getLocale());
  const imagePath = primaryImagePath(product.product_images);
  const imageUrl = imagePath ? storagePublicUrl(imagePath) : null;

  const isPriced = product.price_status === "priced" && product.price !== null;

  return (
    <div className="group flex h-full flex-col overflow-hidden rounded-2xl border border-black/[0.07] bg-white transition-all duration-300 hover:-translate-y-1 hover:border-brand-green/40 hover:shadow-[0_14px_30px_-12px_rgba(24,43,92,0.25)]">
      <Link
        href={`/produit/${product.slug}`}
        className="relative aspect-square overflow-hidden bg-brand-navy/[0.03] focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-brand-navy"
      >
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={product.name}
            fill
            unoptimized
            loading="lazy"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center font-display text-sm font-bold uppercase tracking-widest text-brand-navy/25">
            {dict.product.photoComing}
          </div>
        )}
      </Link>
      <div className="flex flex-1 flex-col gap-2 p-3.5 sm:p-4">
        <Link
          href={`/produit/${product.slug}`}
          className="line-clamp-2 min-h-[2.5rem] text-sm font-semibold leading-5 text-brand-navy hover:text-brand-green"
        >
          {product.name}
        </Link>

        <StarRating ratings={product.product_reviews} />

        <div className="mt-auto pt-1">
          {isPriced ? (
            <p className="font-display text-xl font-bold leading-none text-brand-navy">{formatXOF(product.price!)}</p>
          ) : (
            <p className="inline-block rounded-md bg-brand-gold/35 px-2 py-0.5 text-xs font-semibold text-brand-navy">
              {dict.product.priceOnRequest}
            </p>
          )}
        </div>

        {/* Toujours "Ajouter au panier", même sans prix pour l'instant : la
            ligne du panier garde alors price=null ("Prix sur demande") et
            create_order() rejette ces articles côté serveur au paiement —
            voir app/(shop)/panier et commande, qui filtrent/expliquent ça
            avant d'arriver à Wave. */}
        <AddToCartButton
          productId={product.id}
          name={product.name}
          slug={product.slug}
          price={isPriced ? product.price : null}
          imageUrl={imageUrl}
        />
      </div>
    </div>
  );
}
