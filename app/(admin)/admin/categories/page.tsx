import Link from "next/link";
import { FolderTree, Plus } from "lucide-react";

import { getAdminCategories } from "@/lib/admin/queries";
import { FORM_BUTTON_PRIMARY } from "@/lib/ui/form-styles";
import { TABLE_HEAD, TABLE_ROW } from "@/lib/ui/table-styles";
import { CategoryRowActions } from "@/components/admin/category-row-actions";

export default async function AdminCategoriesPage() {
  const categories = await getAdminCategories();

  return (
    <div>
      <div className="sticky top-0 z-10 -mx-4 -mt-4 border-b border-black/5 bg-white px-4 pt-4 pb-5 shadow-[0_8px_24px_-6px_rgba(255,222,89,0.55)] sm:-mx-6 sm:-mt-6 sm:px-6 sm:pt-6 lg:-mx-8 lg:-mt-8 lg:px-8 lg:pt-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-brand-navy">Catégories</h1>
            <p className="mt-1 text-sm text-black/60">{categories.length} catégorie(s)</p>
          </div>
          <Link href="/admin/categories/nouvelle" className={FORM_BUTTON_PRIMARY}>
            <Plus size={16} strokeWidth={3} />
            Nouvelle catégorie
          </Link>
        </div>
      </div>

      <div className="mt-6 animate-fade-in-up overflow-x-auto rounded-3xl border border-black/5 bg-white shadow-xl">
        <table className="w-full min-w-[560px] text-left text-sm">
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
              categories.map((category) => (
                <tr key={category.id} className={TABLE_ROW}>
                  <td className="px-5 py-3.5 font-semibold text-brand-navy">{category.name}</td>
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
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
