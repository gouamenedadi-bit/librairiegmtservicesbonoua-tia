import { getCategoriesForSelect } from "@/lib/admin/queries";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { ProductForm } from "@/components/admin/product-form";
import { createProduct } from "../actions";

export default async function NewProductPage() {
  const categories = await getCategoriesForSelect();

  return (
    <div className="mx-auto max-w-2xl">
      <AdminPageHeader
        back={{ href: "/admin/produits", label: "Retour aux produits" }}
        title="Nouveau produit"
        description="Les photos s'ajoutent juste après l'enregistrement."
      />
      <div className="mt-6">
        <ProductForm categories={categories} action={createProduct} />
      </div>
    </div>
  );
}
