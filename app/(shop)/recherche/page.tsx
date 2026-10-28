import Link from "next/link";
import { Search as SearchIcon } from "lucide-react";

import { getCategoryNavGroups, searchProducts } from "@/lib/catalog/queries";
import { CategoryIcon } from "@/lib/catalog/category-icons";
import { getDictionary } from "@/lib/i18n/dictionary";
import { getLocale } from "@/lib/i18n/get-locale";
import { ProductCard } from "@/components/product/product-card";
import { PageHeading } from "@/components/ui/page-heading";

export default async function SearchPage({
  searchParams,
}: PageProps<"/recherche">) {
  const { q } = await searchParams;
  const query = typeof q === "string" ? q.trim() : "";
  const [products, navGroups, dict] = await Promise.all([
    query ? searchProducts(query) : Promise.resolve([]),
    getCategoryNavGroups(),
    getLocale().then(getDictionary),
  ]);

  const showShelves = !query || products.length === 0;
  const shelves = [...navGroups.librairie, ...navGroups.papeterie];

  return (
    <div>
      <section className="bg-gradient-to-b from-brand-green/[0.07] to-white">
        <div className="mx-auto max-w-3xl px-4 pb-8 pt-10 sm:pt-14">
          <PageHeading
            align="center"
            eyebrow={dict.home.eyebrow}
            title={query ? `« ${query} »` : dict.search.noQueryTitle}
            subtitle={
              query
                ? `${products.length} ${dict.search.resultsPrefix}${products.length > 1 ? dict.search.resultsSuffixPlural : ""}`
                : dict.search.noQueryDesc
            }
          />

          <form action="/recherche" role="search" className="relative mx-auto mt-7 max-w-xl">
            <label htmlFor="search-q" className="sr-only">
              {dict.search.title}
            </label>
            <SearchIcon size={20} className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-brand-navy/40" />
            <input
              id="search-q"
              type="search"
              name="q"
              defaultValue={query}
              placeholder={dict.search.placeholder}
              autoFocus={!query}
              className="w-full rounded-full border-2 border-brand-navy/15 bg-white py-4 pl-13 pr-32 text-base text-brand-navy shadow-[4px_4px_0_0_var(--color-brand-green)] outline-none transition placeholder:text-black/35 focus:border-brand-navy"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-brand-navy px-5 py-2.5 text-sm font-bold text-white transition hover:bg-brand-green focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-navy"
            >
              {dict.search.submit}
            </button>
          </form>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 pb-16">
        {query && products.length === 0 && (
          <p className="mt-2 text-center text-black/60">{dict.search.noResults}</p>
        )}

        {products.length > 0 && (
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
            {products.map((product, index) => (
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

        {showShelves && (
          <section className="mt-10">
            <h2 className="text-center text-xs font-bold uppercase tracking-[0.3em] text-brand-navy/50">
              {dict.search.browseShelves}
            </h2>
            <ul className="mx-auto mt-5 flex max-w-4xl flex-wrap justify-center gap-2">
              {shelves.map((shelf) => (
                <li key={shelf.slug}>
                  <Link
                    href={`/categorie/${shelf.slug}`}
                    className="flex items-center gap-2 rounded-full border border-black/10 bg-white px-3.5 py-2 text-xs font-semibold text-brand-navy transition hover:border-brand-green hover:text-brand-green focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-navy"
                  >
                    <CategoryIcon
                      slug={shelf.slug}
                      size={14}
                      className={shelf.slug.startsWith("librairie-") ? "text-brand-green" : "text-brand-navy/60"}
                    />
                    {shelf.name}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </div>
  );
}
