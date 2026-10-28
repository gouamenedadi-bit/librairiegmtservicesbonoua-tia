import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, ImageOff, Package, Plus } from "lucide-react";

import { getAdminProducts, getCategoriesForSelect } from "@/lib/admin/queries";
import { primaryImagePath, storagePublicUrl } from "@/lib/catalog/storage";
import { formatXOF } from "@/lib/utils/format-xof";
import { FORM_BUTTON_PRIMARY } from "@/lib/ui/form-styles";
import { ADMIN_CARD, TABLE_CONTAINER, TABLE_HEAD, TABLE_ROW } from "@/lib/ui/table-styles";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { ProductRowActions } from "@/components/admin/product-row-actions";
import { ProductFilters } from "@/components/admin/product-filters";

type ProductImage = { storage_path: string; position: number; is_primary: boolean };

function Thumbnail({ images, size }: { images: ProductImage[] | null; size: "sm" | "md" }) {
  const imagePath = primaryImagePath(images);
  return (
    <div
      className={`relative shrink-0 overflow-hidden rounded-lg border border-brand-navy/[0.08] bg-brand-navy/[0.03] ${
        size === "sm" ? "h-11 w-11" : "h-16 w-16"
      }`}
    >
      {imagePath ? (
        <Image src={storagePublicUrl(imagePath)} alt="" fill unoptimized loading="lazy" className="object-cover" />
      ) : (
        <div className="flex h-full items-center justify-center text-brand-navy/20">
          <ImageOff size={16} />
        </div>
      )}
    </div>
  );
}

function PriceBadge({ priceStatus, price }: { priceStatus: string; price: number | null }) {
  return priceStatus === "priced" && price !== null ? (
    <span className="whitespace-nowrap font-semibold text-brand-navy">{formatXOF(price)}</span>
  ) : (
    <span className="whitespace-nowrap rounded-full bg-brand-gold/30 px-2.5 py-0.5 text-xs font-semibold text-brand-navy">
      Sur demande
    </span>
  );
}

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

  const empty = (
    <div className="px-5 py-14 text-center text-sm text-brand-navy/45">
      <Package size={28} className="mx-auto mb-2 text-brand-navy/15" />
      Aucun produit ne correspond à ces filtres.
    </div>
  );

  return (
    <div>
      <AdminPageHeader
        sticky
        title="Produits"
        description={`${total} produit(s)`}
        actions={
          <Link href="/admin/produits/nouveau" className={FORM_BUTTON_PRIMARY}>
            <Plus size={16} strokeWidth={3} />
            Nouveau produit
          </Link>
        }
      >
        <ProductFilters
          categories={categories}
          search={search}
          categoryId={categoryId}
          priceStatus={priceStatus}
          hasPhoto={hasPhoto}
        />
      </AdminPageHeader>

      {/* Phones: one card per product instead of a sideways-scrolling table. */}
      <ul className={`mt-6 divide-y divide-brand-navy/[0.08] md:hidden ${ADMIN_CARD}`}>
        {products.length === 0 ? (
          <li>{empty}</li>
        ) : (
          products.map((product) => (
            <li key={product.id} className="p-4">
              <div className="flex gap-3">
                <Thumbnail images={product.product_images} size="md" />
                <div className="min-w-0 flex-1">
                  <Link href={`/admin/produits/${product.id}`} className="line-clamp-2 font-semibold text-brand-navy">
                    {product.name}
                  </Link>
                  <p className="mt-0.5 truncate text-xs text-brand-navy/45">
                    {(product.categories as { name: string } | null)?.name ?? "—"} · {product.sku}
                  </p>
                  <div className="mt-2">
                    <PriceBadge priceStatus={product.price_status} price={product.price} />
                  </div>
                </div>
              </div>
              <div className="mt-3 border-t border-brand-navy/[0.06] pt-2">
                <ProductRowActions id={product.id} isActive={product.is_active} />
              </div>
            </li>
          ))
        )}
      </ul>

      <div className={`hidden md:block ${TABLE_CONTAINER}`}>
        <table className="w-full text-left text-sm">
          <thead className={TABLE_HEAD}>
            <tr>
              <th className="px-5 py-3">Produit</th>
              <th className="px-5 py-3">Catégorie</th>
              <th className="px-5 py-3">Prix</th>
              <th className="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-navy/[0.06]">
            {products.length === 0 ? (
              <tr>
                <td colSpan={4}>{empty}</td>
              </tr>
            ) : (
              products.map((product) => (
                <tr key={product.id} className={TABLE_ROW}>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <Thumbnail images={product.product_images} size="sm" />
                      <div className="min-w-0">
                        <Link
                          href={`/admin/produits/${product.id}`}
                          className="line-clamp-1 font-semibold text-brand-navy hover:text-brand-green"
                        >
                          {product.name}
                        </Link>
                        <p className="text-xs text-brand-navy/40">{product.sku}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-brand-navy/60">
                    {(product.categories as { name: string } | null)?.name ?? "—"}
                  </td>
                  <td className="px-5 py-3">
                    <PriceBadge priceStatus={product.price_status} price={product.price} />
                  </td>
                  <td className="px-5 py-3">
                    <ProductRowActions id={product.id} isActive={product.is_active} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <nav aria-label="Pagination" className="mt-5 flex items-center justify-between gap-4 text-sm sm:justify-center">
          {page > 1 ? (
            <Link
              href={pageHref(page - 1)}
              className="flex items-center gap-1 rounded-full border border-brand-navy/15 bg-white px-4 py-2 font-medium text-brand-navy transition hover:border-brand-navy/30"
            >
              <ChevronLeft size={16} />
              Précédent
            </Link>
          ) : (
            <span className="flex items-center gap-1 px-4 py-2 font-medium text-brand-navy/25">
              <ChevronLeft size={16} />
              Précédent
            </span>
          )}
          <span className="font-medium text-brand-navy/55">
            Page {page} / {totalPages}
          </span>
          {page < totalPages ? (
            <Link
              href={pageHref(page + 1)}
              className="flex items-center gap-1 rounded-full border border-brand-navy/15 bg-white px-4 py-2 font-medium text-brand-navy transition hover:border-brand-navy/30"
            >
              Suivant
              <ChevronRight size={16} />
            </Link>
          ) : (
            <span className="flex items-center gap-1 px-4 py-2 font-medium text-brand-navy/25">
              Suivant
              <ChevronRight size={16} />
            </span>
          )}
        </nav>
      )}
    </div>
  );
}
