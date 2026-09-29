import Link from "next/link";
import { ChevronLeft } from "lucide-react";

import { CategoryForm } from "@/components/admin/category-form";
import { createCategory } from "../actions";

export default function NewCategoryPage() {
  return (
    <div>
      <Link href="/admin/categories" className="flex items-center gap-1 text-sm text-black/50 hover:text-brand-navy">
        <ChevronLeft size={16} />
        Retour aux catégories
      </Link>
      <div className="mt-4">
        <CategoryForm action={createCategory} />
      </div>
    </div>
  );
}
