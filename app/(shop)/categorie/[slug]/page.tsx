import { notFound } from "next/navigation";

import { getProductsByCategorySlug } from "@/lib/catalog/queries";
import { ProductCard } from "@/components/product/product-card";

export default async function CategoryPage({
  params,
}: PageProps<"/categorie/[slug]">) {
  const { slug } = await params;
  const { category, products } = await getProductsByCategorySlug(slug);

  if (!category) notFound();

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-2xl font-bold text-brand-navy">{category.name}</h1>

      {products.length === 0 ? (
        <p className="mt-6 text-black/60">
          Aucun article disponible dans cette catégorie pour le moment.
        </p>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
