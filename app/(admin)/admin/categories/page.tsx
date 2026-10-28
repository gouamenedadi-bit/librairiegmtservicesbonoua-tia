import Link from "next/link";
import { FolderTree, Plus } from "lucide-react";

import { getAdminCategories } from "@/lib/admin/queries";
import { FORM_BUTTON_PRIMARY } from "@/lib/ui/form-styles";
import { TABLE_CONTAINER, TABLE_HEAD, TABLE_ROW } from "@/lib/ui/table-styles";
import { CategoryRowActions } from "@/components/admin/category-row-actions";
import { CategoryIcon } from "@/lib/catalog/category-icons";

export default async function AdminCategoriesPage() {
  const categories = await getAdminCategories();

  return (
    <div>
      <div className="sticky top-0 z-10 -mx-4 -mt-4 border-b border-black/5 bg-white px-4 pt-4 pb-5 shadow-[0_8px_24px_-6px_rgba(255,222,89,0.55)] sm:-mx-6 sm:-mt-6 sm:px-6 sm:pt-6 lg:-mx-8 lg:-mt-8 lg:px-8 lg:pt-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-4xl font-extrabold uppercase leading-none text-brand-navy">Catégories</h1>
            <p className="mt-1 text-sm text-black/60">{categories.length} catégorie(s)</p>
          </div>
          <Link href="/admin/categories/nouvelle" className={FORM_BUTTON_PRIMARY}>
            <Plus size={16} strokeWidth={3} />
            Nouvelle catégorie
          </Link>
        </div>
      </div>

      <div className={TABLE_CONTAINER}>
        <table className="w-full min-w-[620px] text-left text-[15px]">
          <thead className={TABLE_HEAD}>
            <tr>
              <th className="px-5 py-3.5 font-medium">Nom</th>
              <th className="px-5 py-3.5 font-medium">Slug</th>
              <th className="px-5 py-3.5 font-medium">Produits</th>
              <th className="px-5 py-3.5 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/5">
            {categories.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-5 py-14 text-center text-black/40">
                  <FolderTree size={28} className="mx-auto mb-2 text-black/15" />
                  Aucune catégorie pour le moment.
                </td>
              </tr>
            ) : (
              categories.map((category) => {
                const isLibrairie = category.slug.startsWith("librairie-");
                return (
                  <tr key={category.id} className={`${TABLE_ROW} even:bg-black/[0.015]`}>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <span
                          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                            isLibrairie ? "bg-brand-green/10 text-brand-green" : "bg-brand-gold/20 text-brand-navy"
                          }`}
                        >
                          <CategoryIcon slug={category.slug} size={18} />
                        </span>
                        <span className="font-semibold text-brand-navy">{category.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 font-mono text-xs text-black/40">{category.slug}</td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                          category.productCount > 0 ? "bg-brand-green/10 text-brand-green" : "bg-black/5 text-black/35"
                        }`}
                      >
                        {category.productCount}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <CategoryRowActions id={category.id} canDelete={category.productCount === 0} />
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
