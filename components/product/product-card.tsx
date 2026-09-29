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

  return (
    <div className="group flex flex-col overflow-hidden rounded-xl border-2 border-black/5 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-brand-green/30 hover:shadow-lg">
      <Link href={`/produit/${product.slug}`} className="relative aspect-square overflow-hidden bg-black/5">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={product.name}
            fill
            unoptimized
            className="object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-black/30">
            {dict.product.photoComing}
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

        <StarRating ratings={product.product_reviews} className="justify-center" />

        {/* Même taille (text-sm/14px) que le titre juste au-dessus, pour que
            le prix ne paraisse pas plus gros que l'article — et en noir
            foncé (pas jaune) pour rester lisible, prix connu ou non. */}
        <p className="text-center text-sm font-bold text-brand-navy">
          {product.price_status === "priced" && product.price !== null
            ? formatXOF(product.price)
            : dict.product.priceOnRequest}
        </p>

        {/* Toujours "Ajouter au panier", même sans prix pour l'instant : la
            ligne du panier garde alors price=null ("Prix sur demande") et
            create_order() rejette ces articles côté serveur au paiement —
            voir app/(shop)/panier et commande, qui filtrent/expliquent ça
            avant d'arriver à Wave. */}
        <AddToCartButton
          productId={product.id}
          name={product.name}
          slug={product.slug}
          price={product.price_status === "priced" ? product.price : null}
          imageUrl={imageUrl}
        />
      </div>
    </div>
  );
}
