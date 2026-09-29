"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AlignLeft, Check, Coins, FolderTree, Image as ImageIcon, Package, Palette, Type, Upload } from "lucide-react";

import { uploadProductImages } from "@/app/(admin)/admin/produits/[id]/image-actions";
import { FORM_BUTTON_PRIMARY, FORM_BUTTON_SECONDARY, FORM_ERROR, FORM_HINT, FORM_INPUT, FORM_LABEL } from "@/lib/ui/form-styles";
import { FormCard } from "@/components/ui/form-card";
import { useToast } from "@/components/ui/toast";

type ProductFormAction = (formData: FormData) => Promise<{ error: string } | { id: string }>;

export function ProductForm({
  categories,
  product,
  action,
}: {
  categories: { id: string; name: string }[];
  product?: {
    name: string;
    description: string | null;
    category_id: string | null;
    price: number | null;
    price_status: "priced" | "on_request";
    is_active: boolean;
    variant_label: string | null;
  };
  action: ProductFormAction;
}) {
  const router = useRouter();
  const { showToast } = useToast();
  const [isOnRequest, setIsOnRequest] = useState(product?.price_status === "on_request");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [fileNames, setFileNames] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await action(formData);
      if ("error" in result) {
        setError(result.error);
        return;
      }

      // Creation only: the file input below has no product to attach to
      // until this point, so the photos picked alongside the other fields
      // are uploaded right after, using the id we just got back — one click
      // for the person filling the form, two calls under the hood.
      if (!product) {
        const files = formData.getAll("files").filter((f): f is File => f instanceof File && f.size > 0);
        if (files.length > 0) await uploadProductImages(result.id, formData);
      }

      const name = String(formData.get("name") ?? "");
      showToast(`${name} enregistré`);

      router.push(`/admin/produits/${result.id}`);
      router.refresh();
    });
  }

  return (
    <form action={handleSubmit}>
      <FormCard
        icon={Package}
        title={product ? "Modifier le produit" : "Nouveau produit"}
        subtitle="Nom, description, catégorie, prix et photos."
        maxWidth="max-w-2xl"
      >
        <div className="space-y-6">
          <div>
            <label htmlFor="product-name" className={FORM_LABEL}>
              <Type size={14} className="text-black/30" />
              Nom du produit
            </label>
            <input
              id="product-name"
              name="name"
              defaultValue={product?.name}
              required
              className={`mt-2 ${FORM_INPUT}`}
            />
          </div>

          <div>
            <label htmlFor="product-description" className={FORM_LABEL}>
              <AlignLeft size={14} className="text-black/30" />
              Description
            </label>
            <textarea
              id="product-description"
              name="description"
              defaultValue={product?.description ?? ""}
              rows={4}
              className={`mt-2 ${FORM_INPUT} resize-y`}
            />
          </div>

          <div>
            <label htmlFor="product-category" className={FORM_LABEL}>
              <FolderTree size={14} className="text-black/30" />
              Catégorie
            </label>
            <select
              id="product-category"
              name="categoryId"
              defaultValue={product?.category_id ?? ""}
              required
              className={`mt-2 ${FORM_INPUT}`}
            >
              <option value="" disabled>
                {categories.length === 0 ? "Aucune catégorie — importez le catalogue d'abord" : "Choisir une catégorie"}
              </option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div className="rounded-2xl border border-black/10 p-4">
            <label className="flex items-center gap-2 text-sm font-semibold text-brand-navy">
              <input
                type="checkbox"
                name="isOnRequest"
                checked={isOnRequest}
                onChange={(e) => setIsOnRequest(e.target.checked)}
                className="h-4 w-4 rounded border-black/20 text-brand-green focus:ring-brand-green"
              />
              Prix sur demande (pas de prix fixe pour l&apos;instant)
            </label>

            {!isOnRequest && (
              <div className="mt-3">
                <label htmlFor="product-price" className={FORM_LABEL}>
                  <Coins size={14} className="text-black/30" />
                  Prix (FCFA)
                </label>
                <input
                  id="product-price"
                  type="number"
                  name="price"
                  min={0}
                  step={1}
                  defaultValue={product?.price ?? undefined}
                  required={!isOnRequest}
                  className={`mt-2 ${FORM_INPUT}`}
                />
              </div>
            )}
          </div>

          <div>
            <label htmlFor="product-variant-label" className={FORM_LABEL}>
              <Palette size={14} className="text-black/30" />
              Étiquette de variante (optionnel)
            </label>
            <input
              id="product-variant-label"
              name="variantLabel"
              defaultValue={product?.variant_label ?? ""}
              placeholder="Ex : Bleu, Rouge, Petit format…"
              className={`mt-2 ${FORM_INPUT}`}
            />
            <p className={FORM_HINT}>
              À remplir si ce produit fait partie d&apos;un groupe de variantes de couleur
              (voir plus bas pour les lier entre elles).
            </p>
          </div>

          <label className="flex items-center gap-2 text-sm font-semibold text-brand-navy">
            <input
              type="checkbox"
              name="isActive"
              defaultChecked={product?.is_active ?? true}
              className="h-4 w-4 rounded border-black/20 text-brand-green focus:ring-brand-green"
            />
            Visible dans la boutique
          </label>

          {!product && (
            <div>
              <span className={FORM_LABEL}>
                <ImageIcon size={14} className="text-black/30" />
                Photos (optionnel)
              </span>
              <div className="mt-2 flex flex-wrap items-center gap-3 rounded-2xl border border-dashed border-black/15 bg-black/[0.015] p-4">
                <input
                  ref={fileInputRef}
                  type="file"
                  name="files"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  onChange={(e) => setFileNames([...(e.currentTarget.files ?? [])].map((f) => f.name))}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2 rounded-full bg-brand-green px-5 py-2.5 text-sm font-bold text-white shadow-sm transition-all duration-200 hover:scale-[1.02] hover:bg-brand-green-dark"
                >
                  <Upload size={14} />
                  Choisir des photos
                </button>
                <span className="text-xs text-black/40">
                  {fileNames.length > 0 ? fileNames.join(", ") : "JPEG, PNG ou WEBP — plusieurs à la fois possible."}
                </span>
              </div>
              <p className={FORM_HINT}>Vous pourrez en ajouter/retirer d&apos;autres après l&apos;enregistrement.</p>
            </div>
          )}
        </div>

        {error && <p className={`mt-6 ${FORM_ERROR}`}>{error}</p>}

        <div className="mt-8 flex items-center gap-3">
          <button type="submit" disabled={isPending} className={FORM_BUTTON_PRIMARY}>
            <Check size={16} strokeWidth={3} />
            {isPending ? "Enregistrement…" : "Enregistrer"}
          </button>
          <button type="button" onClick={() => router.push("/admin/produits")} className={FORM_BUTTON_SECONDARY}>
            Annuler
          </button>
        </div>
      </FormCard>
    </form>
  );
}
