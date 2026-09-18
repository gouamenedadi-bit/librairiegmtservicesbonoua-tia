import { searchProducts } from "@/lib/catalog/queries";
import { ProductCard } from "@/components/product/product-card";

export default async function SearchPage({
  searchParams,
}: PageProps<"/recherche">) {
  const { q } = await searchParams;
  const query = typeof q === "string" ? q : "";
  const products = query ? await searchProducts(query) : [];

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <form className="mx-auto max-w-lg" action="/recherche">
        <input
          type="search"
          name="q"
          defaultValue={query}
          placeholder="Rechercher un livre, une fourniture…"
          className="w-full rounded-full border border-black/10 px-5 py-3 text-sm outline-none focus:border-brand-green focus:ring-1 focus:ring-brand-green"
        />
      </form>

      {query && (
        <p className="mt-6 text-sm text-black/60">
          {products.length} résultat{products.length > 1 ? "s" : ""} pour « {query} »
        </p>
      )}

      <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
