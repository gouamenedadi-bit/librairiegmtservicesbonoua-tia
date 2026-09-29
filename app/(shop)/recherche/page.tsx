import Link from "next/link";
import { Search as SearchIcon } from "lucide-react";

import { searchProducts } from "@/lib/catalog/queries";
import { getDictionary } from "@/lib/i18n/dictionary";
import { getLocale } from "@/lib/i18n/get-locale";
import { ProductCard } from "@/components/product/product-card";

export default async function SearchPage({
  searchParams,
}: PageProps<"/recherche">) {
  const { q } = await searchParams;
  const query = typeof q === "string" ? q : "";
  const [products, dict] = await Promise.all([
    query ? searchProducts(query) : Promise.resolve([]),
    getLocale().then(getDictionary),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <form className="mx-auto max-w-lg" action="/recherche">
        <input
          type="search"
          name="q"
          defaultValue={query}
          placeholder={dict.search.placeholder}
          autoFocus
          className="w-full rounded-full border border-black/10 px-5 py-3 text-sm outline-none transition-colors focus:border-brand-green focus:ring-1 focus:ring-brand-green"
        />
      </form>

      {query ? (
        <p className="mt-6 text-sm text-black/60">
          {products.length} {dict.search.resultsPrefix}
          {products.length > 1 ? dict.search.resultsSuffixPlural : ""} {dict.search.resultsFor} « {query} »
        </p>
      ) : (
        <div className="mt-16 flex flex-col items-center text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-green/10 text-brand-green">
            <SearchIcon size={26} />
          </span>
          <p className="mt-4 text-lg font-bold text-brand-navy">{dict.search.noQueryTitle}</p>
          <p className="mt-1 max-w-sm text-sm text-black/60">{dict.search.noQueryDesc}</p>
          <Link
            href="/"
            className="mt-5 rounded-full bg-brand-green px-6 py-2.5 text-sm font-bold text-white transition-all duration-200 hover:scale-105 hover:bg-brand-green-dark"
          >
            {dict.search.browseCta}
          </Link>
        </div>
      )}

      {query && products.length === 0 && (
        <p className="mt-10 text-center text-black/60">{dict.search.noResults}</p>
      )}

      <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
        {products.map((product, index) => (
          <div
            key={product.id}
            style={{ animationDelay: `${Math.min(index, 12) * 60}ms` }}
            className="animate-fade-in-up"
          >
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </div>
  );
}
