import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { notFound } from "next/navigation";

import { getCategoryNavGroups, getProductsByCategorySlug } from "@/lib/catalog/queries";
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

  const [{ category, products }, navGroups, dict] = await Promise.all([
    getProductsByCategorySlug(slug),
    getCategoryNavGroups(),
    getLocale().then(getDictionary),
  ]);

  if (!category) notFound();

  // Same split as the homepage's open book: green Librairie page, gold
  // Papeterie page.
  const isLibrairie = category.slug.startsWith("librairie-");
  const department = isLibrairie ? dict.nav.librairie : dict.nav.papeterie;
  const siblings = isLibrairie ? navGroups.librairie : navGroups.papeterie;

  const sortedProducts = sortProducts(products, sort);
  const articleWord = sortedProducts.length > 1 ? dict.category.articlePlural : dict.category.articleSingular;

  return (
    <div>
      <section className="bg-gradient-to-b from-brand-green/[0.07] to-white">
        <div className="mx-auto max-w-6xl px-4 pb-6 pt-6 sm:pt-8">
          <nav aria-label="Fil d'Ariane" className="flex flex-wrap items-center gap-1 text-xs text-black/50">
            <Link href="/" className="hover:text-brand-green">
              {dict.category.breadcrumbHome}
            </Link>
            <ChevronRight size={12} />
            <Link href="/#rayons" className="hover:text-brand-green">
              {department}
            </Link>
            <ChevronRight size={12} />
            <span className="font-medium text-brand-navy">{category.name}</span>
          </nav>

          <div
            className={`animate-fade-in-up mt-5 flex items-center justify-between gap-6 rounded-[1.75rem] p-6 sm:p-9 ${
              isLibrairie
                ? "bg-brand-green text-white shadow-[-8px_8px_0_0_var(--color-brand-green-dark),-16px_16px_0_0_rgba(0,191,99,0.22)]"
                : "bg-brand-gold text-brand-navy shadow-[8px_8px_0_0_#e8c63e,16px_16px_0_0_rgba(255,222,89,0.4)]"
            }`}
          >
            <div className="min-w-0">
              <p
                className={`text-xs font-bold uppercase tracking-[0.4em] ${isLibrairie ? "text-white/75" : "text-brand-navy/60"}`}
              >
                {department}
              </p>
              <h1 className="mt-2 font-display text-4xl font-extrabold uppercase leading-[0.95] sm:text-6xl">
                {category.name}
              </h1>
              <p className={`mt-3 text-sm font-semibold ${isLibrairie ? "text-white/85" : "text-brand-navy/70"}`}>
                {sortedProducts.length} {articleWord}
              </p>
            </div>
            <span
              aria-hidden
              className={`hidden h-24 w-24 shrink-0 items-center justify-center rounded-full bg-brand-navy sm:flex ${isLibrairie ? "text-brand-gold" : "text-brand-green"}`}
            >
              <CategoryIcon slug={category.slug} size={40} />
            </span>
          </div>
        </div>
      </section>

      {siblings.length > 1 && (
        <nav aria-label={dict.category.otherShelves} className="mx-auto max-w-6xl px-4 pt-4">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-brand-navy/50">{dict.category.otherShelves}</p>
          {/* Scrolls sideways on phones rather than wrapping into a wall of chips. */}
          <ul className="-mx-4 mt-3 flex gap-2 overflow-x-auto px-4 pb-2 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0">
            {siblings.map((shelf) => {
              const isCurrent = shelf.slug === category.slug;
              return (
                <li key={shelf.slug} className="shrink-0">
                  <Link
                    href={`/categorie/${shelf.slug}`}
                    aria-current={isCurrent ? "page" : undefined}
                    className={`block rounded-full border px-3.5 py-1.5 text-xs font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-navy ${
                      isCurrent
                        ? "border-brand-navy bg-brand-navy text-white"
                        : "border-black/10 bg-white text-brand-navy hover:border-brand-green hover:text-brand-green"
                    }`}
                  >
                    {shelf.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      )}

      <div className="mx-auto max-w-6xl px-4 pb-16 pt-6">
        <div className="flex items-center justify-between gap-4 border-b border-black/10 pb-4">
          <p className="text-sm text-black/55">
            <span className="font-bold text-brand-navy">{sortedProducts.length}</span> {articleWord}
          </p>
          <SortSelect />
        </div>

        {sortedProducts.length === 0 ? (
          <div className="mt-10 rounded-3xl border-2 border-dashed border-black/10 px-6 py-14 text-center">
            <p className="font-display text-2xl font-bold uppercase text-brand-navy">{category.name}</p>
            <p className="mt-2 text-sm text-black/55">{dict.category.noProducts}</p>
            <Link
              href="/#rayons"
              className="mt-5 inline-block rounded-full bg-brand-green px-6 py-2.5 text-sm font-bold text-white transition hover:bg-brand-green-dark"
            >
              {dict.search.browseCta}
            </Link>
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
            {sortedProducts.map((product, index) => (
              <div
                key={product.id}
                style={{ animationDelay: `${Math.min(index, 12) * 50}ms` }}
                className="animate-fade-in-up"
              >
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
