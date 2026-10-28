import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { CategoryForm } from "@/components/admin/category-form";
import { createCategory } from "../actions";

export default function NewCategoryPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <AdminPageHeader back={{ href: "/admin/categories", label: "Retour aux catégories" }} title="Nouvelle catégorie" />
      <div className="mt-6">
        <CategoryForm action={createCategory} />
      </div>
    </div>
  );
}
