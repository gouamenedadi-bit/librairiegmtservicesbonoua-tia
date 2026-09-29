import Image from "next/image";
import { notFound } from "next/navigation";
import { CheckCircle2 } from "lucide-react";

import { getProductBySlug, getProductVariants } from "@/lib/catalog/queries";
import { primaryImagePath, storagePublicUrl } from "@/lib/catalog/storage";
import { formatXOF } from "@/lib/utils/format-xof";
import { getDictionary } from "@/lib/i18n/dictionary";
import { getLocale } from "@/lib/i18n/get-locale";
import { StarRating } from "@/components/product/star-rating";
import { ReviewList } from "@/components/product/review-list";
import { ProductPageActions } from "@/components/product/product-page-actions";
import { ShareButtons } from "@/components/product/share-buttons";
import { VariantSwatches } from "@/components/product/variant-swatches";

export default async function ProductPage({
  params,
}: PageProps<"/produit/[slug]">) {
  const { slug } = await params;
  const [product, dict] = await Promise.all([getProductBySlug(slug), getLocale().then(getDictionary)]);

  if (!product) notFound();

  const variants = await getProductVariants(product.variant_group_id, product.id);

  const imagePath = primaryImagePath(product.product_images);
  const imageUrl = imagePath ? storagePublicUrl(imagePath) : null;
  const isPriced = product.price_status === "priced" && product.price !== null;

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="rounded-3xl border-[3px] border-brand-navy bg-white p-6 shadow-lg sm:p-10">
        <div className="grid gap-10 sm:grid-cols-2">
          <div>
            <div className="relative aspect-square overflow-hidden rounded-2xl bg-black/5">
              {imageUrl ? (
                <Image src={imageUrl} alt={product.name} fill unoptimized className="object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-black/30">
                  {dict.product.photoComing}
                </div>
              )}
            </div>

            <VariantSwatches variants={variants} dict={dict} />
          </div>

          <div>
            <div className="flex items-start justify-between gap-4">
              <h1 className="text-2xl font-bold text-brand-navy">{product.name}</h1>
              <ShareButtons title={product.name} />
            </div>

            <div className="mt-2">
              <StarRating ratings={product.product_reviews} size={16} />
            </div>

            {product.description && <p className="mt-4 text-black/70">{product.description}</p>}

            <p className="mt-6 text-2xl font-bold text-brand-navy">
              {isPriced ? formatXOF(product.price!) : dict.product.priceOnRequest}
            </p>

            <div className="mt-2 flex items-center gap-1.5 text-sm text-brand-green">
              <CheckCircle2 size={16} />
              {product.stock_quantity !== null
                ? `${dict.product.inStock} — ${product.stock_quantity} ${dict.product.inStockCount}`
                : isPriced
                  ? dict.product.inStock
                  : dict.product.availableOnRequest}
            </div>

            <div className="mt-6">
              <ProductPageActions
                productId={product.id}
                name={product.name}
                slug={product.slug}
                price={isPriced ? product.price : null}
                imageUrl={imageUrl}
              />
            </div>
          </div>
        </div>

        <ReviewList reviews={product.product_reviews} />
      </div>
    </div>
  );
}
