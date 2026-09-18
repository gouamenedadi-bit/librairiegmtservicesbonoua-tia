import Image from "next/image";
import Link from "next/link";

import { primaryImagePath, storagePublicUrl } from "@/lib/catalog/queries";
import { formatXOF } from "@/lib/utils/format-xof";
import { AddToCartButton } from "./add-to-cart-button";

type ProductCardData = {
  id: string;
  name: string;
  slug: string;
  price: number | null;
  price_status: "priced" | "on_request";
  product_images?: { storage_path: string; position: number; is_primary: boolean }[] | null;
};

export function ProductCard({ product }: { product: ProductCardData }) {
  const imagePath = primaryImagePath(product.product_images);
  const imageUrl = imagePath ? storagePublicUrl(imagePath) : null;

  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-black/5 bg-white shadow-sm">
      <Link href={`/produit/${product.slug}`} className="relative aspect-square bg-black/5">
        {imageUrl ? (
          <Image src={imageUrl} alt={product.name} fill className="object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-black/30">
            Photo à venir
          </div>
        )}
      </Link>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <Link
          href={`/produit/${product.slug}`}
          className="line-clamp-2 text-sm font-semibold text-brand-navy hover:text-brand-green"
        >
          {product.name}
        </Link>

        {product.price_status === "priced" && product.price !== null ? (
          <>
            <p className="text-sm font-bold text-brand-navy">{formatXOF(product.price)}</p>
            <AddToCartButton
              productId={product.id}
              name={product.name}
              slug={product.slug}
              price={product.price}
              imageUrl={imageUrl}
            />
          </>
        ) : (
          <>
            <p className="text-sm font-semibold text-brand-gold">Prix sur demande</p>
            <a
              href="https://wa.me/"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-brand-navy/20 px-5 py-2.5 text-center text-sm font-bold text-brand-navy transition hover:bg-brand-navy/5"
            >
              Nous contacter
            </a>
          </>
        )}
      </div>
    </div>
  );
}
