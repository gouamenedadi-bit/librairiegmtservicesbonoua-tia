import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, ImageOff, Package, Plus } from "lucide-react";

import { getAdminProducts, getCategoriesForSelect } from "@/lib/admin/queries";
import { primaryImagePath, storagePublicUrl } from "@/lib/catalog/storage";
import { formatXOF } from "@/lib/utils/format-xof";
import { FORM_BUTTON_PRIMARY } from "@/lib/ui/form-styles";
import { TABLE_CONTAINER, TABLE_HEAD, TABLE_ROW } from "@/lib/ui/table-styles";
import { ProductRowActions } from "@/components/admin/product-row-actions";
import { ProductFilters } from "@/components/admin/product-filters";

export default async function AdminProductsPage({
  searchParams,
}: PageProps<"/admin/produits">) {
  const params = await searchParams;
  const search = typeof params.q === "string" ? params.q : "";
  const categoryId = typeof params.categorie === "string" ? params.categorie : "";
  const priceStatus = typeof params.prix === "string" ? params.prix : "";
  const hasPhoto = typeof params.photo === "string" ? params.photo : "";
  const page = Math.max(1, Number(params.page) || 1);

  const [{ products, total, perPage }, categories] = await Promise.all([
    getAdminProducts({ search, categoryId, priceStatus, hasPhoto, page }),
    getCategoriesForSelect(),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / perPage));

  // Preserves the current filters when only `page` changes (pagination links).
  function pageHref(nextPage: number) {
    const sp = new URLSearchParams();
    if (search) sp.set("q", search);
    if (categoryId) sp.set("categorie", categoryId);
    if (priceStatus) sp.set("prix", priceStatus);
    if (hasPhoto) sp.set("photo", hasPhoto);
    sp.set("page", String(nextPage));
    return `/admin/produits?${sp.toString()}`;
  }

  return (
    <div>
      <div className="sticky top-0 z-10 -mx-4 -mt-4 border-b border-black/5 bg-white px-4 pt-4 pb-5 sm:-mx-6 sm:-mt-6 sm:px-6 sm:pt-6 lg:-mx-8 lg:-mt-8 lg:px-8 lg:pt-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-brand-navy">Produits</h1>
            <p className="mt-1 text-sm text-black/60">{total} produit(s)</p>
          </div>
          <Link href="/admin/produits/nouveau" className={FORM_BUTTON_PRIMARY}>
            <Plus size={16} strokeWidth={3} />
            Nouveau produit
          </Link>
        </div>

        <ProductFilters
          categories={categories}
          search={search}
          categoryId={categoryId}
          priceStatus={priceStatus}
          hasPhoto={hasPhoto}
        />
      </div>

      <div className={TABLE_CONTAINER}>
        <table className="w-full min-w-[680px] text-left text-[15px]">
          <thead className={TABLE_HEAD}>
            <tr>
              <th className="px-5 py-3.5 font-medium">Produit</th>
              <th className="px-5 py-3.5 font-medium">Catégorie</th>
              <th className="px-5 py-3.5 font-medium">Prix</th>
              <th className="px-5 py-3.5 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/5">
            {products.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-5 py-14 text-center text-black/40">
                  <Package size={28} className="mx-auto mb-2 text-black/15" />
                  Aucun produit ne correspond à ces filtres.
                </td>
              </tr>
            ) : (
              products.map((product) => {
                const imagePath = primaryImagePath(product.product_images);
                return (
                  <tr key={product.id} className={`${TABLE_ROW} even:bg-black/[0.015]`}>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="group relative h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-black/10 bg-black/5">
                          {imagePath ? (
                            <Image
                              src={storagePublicUrl(imagePath)}
                              alt=""
                              fill
                              unoptimized
                              className="object-cover transition-transform duration-300 group-hover:scale-110"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center text-black/20">
                              <ImageOff size={16} />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-brand-navy">{product.name}</p>
                          <p className="text-xs text-black/40">{product.sku}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-black/60">
                      {(product.categories as { name: string } | null)?.name ?? "—"}
                    </td>
                    <td className="px-5 py-3">
                      {product.price_status === "priced" && product.price !== null ? (
                        <span className="whitespace-nowrap rounded-full bg-brand-green/10 px-2.5 py-1 text-xs font-bold text-brand-green">
                          {formatXOF(product.price)}
                        </span>
                      ) : (
                        <span className="whitespace-nowrap rounded-full bg-brand-gold/20 px-2.5 py-1 text-xs font-bold text-brand-navy">
                          Sur demande
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      <ProductRowActions id={product.id} isActive={product.is_active} />
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-center gap-4 text-sm">
          {page > 1 ? (
            <Link
              href={pageHref(page - 1)}
              className="flex items-center gap-1 rounded-full px-3 py-1.5 font-medium text-brand-navy transition hover:bg-black/5"
            >
              <ChevronLeft size={16} />
              Précédent
            </Link>
          ) : (
            <span className="flex items-center gap-1 px-3 py-1.5 font-medium text-black/30">
              <ChevronLeft size={16} />
              Précédent
            </span>
          )}
          <span className="font-medium text-black/60">
            Page {page} / {totalPages}
          </span>
          {page < totalPages ? (
            <Link
              href={pageHref(page + 1)}
              className="flex items-center gap-1 rounded-full px-3 py-1.5 font-medium text-brand-navy transition hover:bg-black/5"
            >
              Suivant
              <ChevronRight size={16} />
            </Link>
          ) : (
            <span className="flex items-center gap-1 px-3 py-1.5 font-medium text-black/30">
              Suivant
              <ChevronRight size={16} />
            </span>
          )}
        </div>
      )}
    </div>
  );
}
