import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, Images, Palette } from "lucide-react";

import { getCategoriesForSelect, getProductForEdit, getProductVariantSiblings } from "@/lib/admin/queries";
import { ProductForm } from "@/components/admin/product-form";
import { ImageManager } from "@/components/admin/image-manager";
import { VariantLinker } from "@/components/admin/variant-linker";
import { updateProduct } from "../actions";

export default async function EditProductPage({
  params,
}: PageProps<"/admin/produits/[id]">) {
  const { id } = await params;

  const [product, categories] = await Promise.all([
    getProductForEdit(id),
    getCategoriesForSelect(),
  ]);

  if (!product) notFound();

  const variants = await getProductVariantSiblings(product.variant_group_id, id);

  return (
    <div>
      <Link href="/admin/produits" className="flex items-center gap-1 text-sm text-black/50 hover:text-brand-navy">
        <ChevronLeft size={16} />
        Retour aux produits
      </Link>

      <div className="mt-4 grid gap-8 lg:grid-cols-2 lg:items-start">
        <ProductForm categories={categories} product={product} action={updateProduct.bind(null, id)} />

        <div className="animate-fade-in-up rounded-3xl border border-black/5 bg-white p-6 shadow-xl sm:p-8">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-brand-green/10 text-brand-green">
              <Images size={20} />
            </span>
            <div>
              <p className="font-bold text-brand-navy">Photos</p>
              <p className="text-xs text-black/40">La première ajoutée devient l&apos;image principale.</p>
            </div>
          </div>
          <div className="mt-7">
            <ImageManager productId={id} images={product.product_images ?? []} />
          </div>
        </div>

        <div className="animate-fade-in-up rounded-3xl border border-black/5 bg-white p-6 shadow-xl sm:p-8 lg:col-span-2">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-brand-gold/20 text-brand-navy">
              <Palette size={20} />
            </span>
            <div>
              <p className="font-bold text-brand-navy">Variantes de couleur</p>
              <p className="text-xs text-black/40">
                Lie ce produit à d&apos;autres déjà dans le catalogue (même article, couleur différente).
              </p>
            </div>
          </div>
          <div className="mt-7">
            <VariantLinker productId={id} variants={variants} />
          </div>
        </div>
      </div>
    </div>
  );
}
