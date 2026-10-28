import { notFound } from "next/navigation";
import { Images, Palette } from "lucide-react";

import { getCategoriesForSelect, getProductForEdit, getProductVariantSiblings } from "@/lib/admin/queries";
import { ADMIN_CARD } from "@/lib/ui/table-styles";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { ProductForm } from "@/components/admin/product-form";
import { ImageManager } from "@/components/admin/image-manager";
import { VariantLinker } from "@/components/admin/variant-linker";
import { updateProduct } from "../actions";

function SectionCard({
  icon: Icon,
  title,
  subtitle,
  className = "",
  children,
}: {
  icon: typeof Images;
  title: string;
  subtitle: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section className={`animate-fade-in-up p-5 sm:p-7 ${ADMIN_CARD} ${className}`}>
      <div className="flex items-center gap-3 border-b border-brand-navy/[0.08] pb-5">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-navy/[0.06] text-brand-navy">
          <Icon size={19} />
        </span>
        <div className="min-w-0">
          <h2 className="text-base font-semibold text-brand-navy">{title}</h2>
          <p className="mt-0.5 text-sm text-brand-navy/50">{subtitle}</p>
        </div>
      </div>
      <div className="mt-6">{children}</div>
    </section>
  );
}

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
      <AdminPageHeader
        back={{ href: "/admin/produits", label: "Retour aux produits" }}
        title="Modifier le produit"
        description={product.name}
      />

      <div className="mt-6 grid gap-6 lg:grid-cols-2 lg:items-start">
        <ProductForm categories={categories} product={product} action={updateProduct.bind(null, id)} />

        <SectionCard icon={Images} title="Photos" subtitle="La première ajoutée devient l'image principale.">
          <ImageManager productId={id} images={product.product_images ?? []} />
        </SectionCard>

        <SectionCard
          icon={Palette}
          title="Variantes de couleur"
          subtitle="Lie ce produit à d'autres déjà dans le catalogue (même article, couleur différente)."
          className="lg:col-span-2"
        >
          <VariantLinker productId={id} variants={variants} />
        </SectionCard>
      </div>
    </div>
  );
}
