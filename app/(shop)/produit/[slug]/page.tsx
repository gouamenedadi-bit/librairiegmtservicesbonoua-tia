import Image from "next/image";
import { notFound } from "next/navigation";

import { getProductBySlug, primaryImagePath, storagePublicUrl } from "@/lib/catalog/queries";
import { formatXOF } from "@/lib/utils/format-xof";
import { AddToCartButton } from "@/components/product/add-to-cart-button";

export default async function ProductPage({
  params,
}: PageProps<"/produit/[slug]">) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) notFound();

  const imagePath = primaryImagePath(product.product_images);
  const imageUrl = imagePath ? storagePublicUrl(imagePath) : null;

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="grid gap-8 sm:grid-cols-2">
        <div className="relative aspect-square overflow-hidden rounded-xl bg-black/5">
          {imageUrl ? (
            <Image src={imageUrl} alt={product.name} fill className="object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-black/30">
              Photo à venir
            </div>
          )}
        </div>

        <div>
          <h1 className="text-2xl font-bold text-brand-navy">{product.name}</h1>
          {product.description && <p className="mt-3 text-black/70">{product.description}</p>}

          <div className="mt-6">
            {product.price_status === "priced" && product.price !== null ? (
              <>
                <p className="text-2xl font-bold text-brand-navy">{formatXOF(product.price)}</p>
                <div className="mt-4">
                  <AddToCartButton
                    productId={product.id}
                    name={product.name}
                    slug={product.slug}
                    price={product.price}
                    imageUrl={imageUrl}
                  />
                </div>
              </>
            ) : (
              <>
                <p className="text-lg font-semibold text-brand-gold">Prix sur demande</p>
                <a
                  href="https://wa.me/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-block rounded-full border border-brand-navy/20 px-6 py-3 text-sm font-bold text-brand-navy transition hover:bg-brand-navy/5"
                >
                  Nous contacter pour le prix
                </a>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
