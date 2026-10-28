import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2, ChevronRight, MessageCircle, ShieldCheck, Store } from "lucide-react";

import { getProductBySlug, getProductVariants } from "@/lib/catalog/queries";
import { primaryImagePath, storagePublicUrl } from "@/lib/catalog/storage";
import { formatXOF } from "@/lib/utils/format-xof";
import { getDictionary } from "@/lib/i18n/dictionary";
import { getLocale } from "@/lib/i18n/get-locale";
import { getWhatsAppLink } from "@/lib/whatsapp";
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

  const category = product.categories;
  const isLibrairie = category?.slug.startsWith("librairie-") ?? true;
  const department = isLibrairie ? dict.nav.librairie : dict.nav.papeterie;
  const askLink = getWhatsAppLink(`${dict.product.askMessage}${product.name}`);

  return (
    <div className="bg-gradient-to-b from-brand-green/[0.06] to-white to-40%">
      <div className="mx-auto max-w-6xl px-4 pb-16 pt-6 sm:pt-8">
        <nav aria-label="Fil d'Ariane" className="flex flex-wrap items-center gap-1 text-xs text-black/50">
          <Link href="/" className="hover:text-brand-green">
            {dict.category.breadcrumbHome}
          </Link>
          <ChevronRight size={12} />
          <Link href="/#rayons" className="hover:text-brand-green">
            {department}
          </Link>
          {category && (
            <>
              <ChevronRight size={12} />
              <Link href={`/categorie/${category.slug}`} className="hover:text-brand-green">
                {category.name}
              </Link>
            </>
          )}
        </nav>

        <div className="mt-6 grid gap-10 md:grid-cols-2 md:gap-14">
          <div>
            {/* The photo sits on a page of the logo's book — green for
                Librairie, gold for Papeterie — with the same fanned edges. */}
            <div
              className={`animate-fade-in-up rounded-[1.75rem] p-3 sm:p-4 ${
                isLibrairie
                  ? "bg-brand-green shadow-[-8px_8px_0_0_var(--color-brand-green-dark),-16px_16px_0_0_rgba(0,191,99,0.22)]"
                  : "bg-brand-gold shadow-[8px_8px_0_0_#e8c63e,16px_16px_0_0_rgba(255,222,89,0.4)]"
              }`}
            >
              <div className="relative aspect-square overflow-hidden rounded-[1.25rem] bg-white">
                {imageUrl ? (
                  <Image src={imageUrl} alt={product.name} fill unoptimized priority className="object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center font-display text-lg font-bold uppercase tracking-widest text-brand-navy/25">
                    {dict.product.photoComing}
                  </div>
                )}
              </div>
            </div>

            <VariantSwatches variants={variants} dict={dict} />
          </div>

          <div className="animate-fade-in-up" style={{ animationDelay: "80ms" }}>
            {category && (
              <Link
                href={`/categorie/${category.slug}`}
                className="text-xs font-bold uppercase tracking-[0.3em] text-brand-navy/55 hover:text-brand-green"
              >
                {category.name}
              </Link>
            )}
            <h1 className="mt-3 font-display text-4xl font-extrabold leading-[1.02] text-brand-navy sm:text-5xl">
              {product.name}
            </h1>

            <div className="mt-3">
              <StarRating ratings={product.product_reviews} size={16} />
            </div>

            <div className="mt-6">
              {isPriced ? (
                <p className="label-plate font-display text-3xl font-extrabold sm:text-4xl">
                  {formatXOF(product.price!)}
                </p>
              ) : (
                <p className="font-display text-2xl font-bold uppercase text-brand-navy">{dict.product.priceOnRequest}</p>
              )}
            </div>

            <p className="mt-4 flex items-center gap-1.5 text-sm font-semibold text-brand-green">
              <CheckCircle2 size={16} />
              {product.stock_quantity !== null
                ? `${dict.product.inStock} — ${product.stock_quantity} ${dict.product.inStockCount}`
                : isPriced
                  ? dict.product.inStock
                  : dict.product.availableOnRequest}
            </p>

            {product.description && (
              <p className="mt-5 whitespace-pre-line leading-relaxed text-black/70">{product.description}</p>
            )}

            <div className="mt-7 border-t border-black/10 pt-6">
              <ProductPageActions
                productId={product.id}
                name={product.name}
                slug={product.slug}
                price={isPriced ? product.price : null}
                imageUrl={imageUrl}
              />
            </div>

            <ul className="mt-7 space-y-3 rounded-2xl bg-brand-navy/[0.04] p-5 text-sm text-brand-navy">
              {isPriced && (
                <li className="flex items-start gap-3">
                  <ShieldCheck size={18} className="mt-px shrink-0 text-brand-green" />
                  {dict.product.payWave}
                </li>
              )}
              <li className="flex items-start gap-3">
                <Store size={18} className="mt-px shrink-0 text-brand-green" />
                {dict.product.pickupPlace}
              </li>
              {askLink && (
                <li className="flex items-start gap-3">
                  <MessageCircle size={18} className="mt-px shrink-0 text-brand-green" />
                  <a
                    href={askLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold underline decoration-brand-green/40 underline-offset-2 hover:text-brand-green"
                  >
                    {dict.product.askQuestion}
                  </a>
                </li>
              )}
            </ul>

            <div className="mt-6 flex items-center gap-3">
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-brand-navy/50">{dict.product.share}</span>
              <ShareButtons title={product.name} />
            </div>
          </div>
        </div>

        <ReviewList reviews={product.product_reviews} />
      </div>
    </div>
  );
}
