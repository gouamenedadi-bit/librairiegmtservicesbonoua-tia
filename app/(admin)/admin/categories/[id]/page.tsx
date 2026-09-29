import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";

import { getCategoryForEdit } from "@/lib/admin/queries";
import { CategoryForm } from "@/components/admin/category-form";
import { updateCategory } from "../actions";

export default async function EditCategoryPage({
  params,
}: PageProps<"/admin/categories/[id]">) {
  const { id } = await params;

  const category = await getCategoryForEdit(id);
  if (!category) notFound();

  return (
    <div>
      <Link href="/admin/categories" className="flex items-center gap-1 text-sm text-black/50 hover:text-brand-navy">
        <ChevronLeft size={16} />
        Retour aux catégories
      </Link>
      <div className="mt-4">
        <CategoryForm category={category} action={updateCategory.bind(null, id)} />
      </div>
    </div>
  );
}
