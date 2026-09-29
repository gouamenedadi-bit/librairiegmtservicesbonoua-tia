import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { notFound } from "next/navigation";

import { getProductsByCategorySlug } from "@/lib/catalog/queries";
import { CategoryIcon } from "@/lib/catalog/category-icons";
import { getDictionary } from "@/lib/i18n/dictionary";
import { getLocale } from "@/lib/i18n/get-locale";
import { SortSelect } from "@/components/catalog/sort-select";
import { ProductCard } from "@/components/product/product-card";

type SortableProduct = { name: string; price: number | null };

function sortProducts<T extends SortableProduct>(products: T[], sort: string): T[] {
  const sorted = [...products];
  if (sort === "prix-asc") {
    sorted.sort((a, b) => (a.price ?? Infinity) - (b.price ?? Infinity));
  } else if (sort === "prix-desc") {
    sorted.sort((a, b) => (b.price ?? -Infinity) - (a.price ?? -Infinity));
  } else {
    sorted.sort((a, b) => a.name.localeCompare(b.name, "fr"));
  }
  return sorted;
}

export default async function CategoryPage({
  params,
  searchParams,
}: PageProps<"/categorie/[slug]">) {
  const { slug } = await params;
  const { tri } = await searchParams;
  const sort = typeof tri === "string" ? tri : "nom";

  const [{ category, products }, dict] = await Promise.all([
    getProductsByCategorySlug(slug),
    getLocale().then(getDictionary),
  ]);

  if (!category) notFound();

  const sortedProducts = sortProducts(products, sort);
  const articleWord = sortedProducts.length > 1 ? dict.category.articlePlural : dict.category.articleSingular;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <nav className="flex items-center gap-1 text-xs text-black/50">
        <Link href="/" className="hover:text-brand-green">
          {dict.category.breadcrumbHome}
        </Link>
        <ChevronRight size={12} />
        <span className="font-medium text-brand-navy">{category.name}</span>
      </nav>

      {/* Bannière propre à chaque catégorie : icône + couleurs de la marque,
          pour que chaque page ait une identité visuelle immédiate. */}
      <div className="relative mt-4 overflow-hidden rounded-2xl bg-gradient-to-r from-brand-navy to-brand-navy-light px-6 py-8 sm:px-10 sm:py-10">
        <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-brand-green/20 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-12 right-24 h-32 w-32 rounded-full bg-brand-gold/20 blur-2xl" />

        <div className="relative flex items-center gap-4">
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-brand-gold">
            <CategoryIcon slug={category.slug} size={28} />
          </span>
          <div>
            <h1 className="text-2xl font-extrabold text-white sm:text-3xl">{category.name}</h1>
            <p className="mt-1 text-sm text-white/70">
              {sortedProducts.length} {articleWord}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-6 flex justify-end">
        <SortSelect />
      </div>

      {sortedProducts.length === 0 ? (
        <p className="mt-10 text-black/60">{dict.category.noProducts}</p>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {sortedProducts.map((product, index) => (
            <div
              key={product.id}
              style={{ animationDelay: `${Math.min(index, 12) * 60}ms` }}
              className="animate-fade-in-up"
            >
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
