import { notFound } from "next/navigation";

import { getCategoryForEdit } from "@/lib/admin/queries";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { CategoryForm } from "@/components/admin/category-form";
import { updateCategory } from "../actions";

export default async function EditCategoryPage({
  params,
}: PageProps<"/admin/categories/[id]">) {
  const { id } = await params;

  const category = await getCategoryForEdit(id);
  if (!category) notFound();

  return (
    <div className="mx-auto max-w-2xl">
      <AdminPageHeader
        back={{ href: "/admin/categories", label: "Retour aux catégories" }}
        title="Modifier la catégorie"
        description={category.name}
      />
      <div className="mt-6">
        <CategoryForm category={category} action={updateCategory.bind(null, id)} />
      </div>
    </div>
  );
}
