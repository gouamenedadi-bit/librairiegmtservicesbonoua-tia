import Link from "next/link";
import { ChevronLeft } from "lucide-react";

import { getCategoriesForSelect } from "@/lib/admin/queries";
import { ProductForm } from "@/components/admin/product-form";
import { createProduct } from "../actions";

export default async function NewProductPage() {
  const categories = await getCategoriesForSelect();

  return (
    <div>
      <Link href="/admin/produits" className="flex items-center gap-1 text-sm text-black/50 hover:text-brand-navy">
        <ChevronLeft size={16} />
        Retour aux produits
      </Link>
      <div className="mt-4">
        <ProductForm categories={categories} action={createProduct} />
      </div>
    </div>
  );
}
