import Link from "next/link";
import { FolderTree, Plus } from "lucide-react";

import { getAdminCategories } from "@/lib/admin/queries";
import { FORM_BUTTON_PRIMARY } from "@/lib/ui/form-styles";
import { ADMIN_CARD, TABLE_CONTAINER, TABLE_HEAD, TABLE_ROW } from "@/lib/ui/table-styles";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { CategoryRowActions } from "@/components/admin/category-row-actions";
import { CategoryIcon } from "@/lib/catalog/category-icons";

function CategoryChip({ slug }: { slug: string }) {
  // Same split as the storefront's open book: green Librairie, gold Papeterie.
  const isLibrairie = slug.startsWith("librairie-");
  return (
    <span
      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
        isLibrairie ? "bg-brand-green/10 text-brand-green" : "bg-brand-gold/30 text-brand-navy"
      }`}
    >
      <CategoryIcon slug={slug} size={17} />
    </span>
  );
}

function ProductCount({ count }: { count: number }) {
  return (
    <span
      className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
        count > 0 ? "bg-brand-navy/[0.06] text-brand-navy" : "bg-brand-navy/[0.03] text-brand-navy/35"
      }`}
    >
      {count} produit{count > 1 ? "s" : ""}
    </span>
  );
}

export default async function AdminCategoriesPage() {
  const categories = await getAdminCategories();

  const empty = (
    <div className="px-5 py-14 text-center text-sm text-brand-navy/45">
      <FolderTree size={28} className="mx-auto mb-2 text-brand-navy/15" />
      Aucune catégorie pour le moment.
    </div>
  );

  return (
    <div>
      <AdminPageHeader
        sticky
        title="Catégories"
        description={`${categories.length} catégorie(s)`}
        actions={
          <Link href="/admin/categories/nouvelle" className={FORM_BUTTON_PRIMARY}>
            <Plus size={16} strokeWidth={3} />
            Nouvelle catégorie
          </Link>
        }
      />

      <ul className={`mt-6 divide-y divide-brand-navy/[0.08] md:hidden ${ADMIN_CARD}`}>
        {categories.length === 0 ? (
          <li>{empty}</li>
        ) : (
          categories.map((category) => (
            <li key={category.id} className="flex items-center gap-3 p-4">
              <CategoryChip slug={category.slug} />
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-brand-navy">{category.name}</p>
                <div className="mt-1">
                  <ProductCount count={category.productCount} />
                </div>
              </div>
              <CategoryRowActions id={category.id} canDelete={category.productCount === 0} />
            </li>
          ))
        )}
      </ul>

      <div className={`hidden md:block ${TABLE_CONTAINER}`}>
        <table className="w-full text-left text-sm">
          <thead className={TABLE_HEAD}>
            <tr>
              <th className="px-5 py-3">Nom</th>
              <th className="px-5 py-3">Adresse web</th>
              <th className="px-5 py-3">Produits</th>
              <th className="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-navy/[0.06]">
            {categories.length === 0 ? (
              <tr>
                <td colSpan={4}>{empty}</td>
              </tr>
            ) : (
              categories.map((category) => (
                <tr key={category.id} className={TABLE_ROW}>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <CategoryChip slug={category.slug} />
                      <span className="font-semibold text-brand-navy">{category.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 font-mono text-xs text-brand-navy/40">/categorie/{category.slug}</td>
                  <td className="px-5 py-3">
                    <ProductCount count={category.productCount} />
                  </td>
                  <td className="px-5 py-3">
                    <CategoryRowActions id={category.id} canDelete={category.productCount === 0} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
