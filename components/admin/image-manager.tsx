"use client";

import Image from "next/image";
import { useRef, useState, useTransition } from "react";
import { Star, Trash2, Upload } from "lucide-react";

import { storagePublicUrl } from "@/lib/catalog/storage";
import {
  deleteProductImage,
  setPrimaryImage,
  uploadProductImages,
} from "@/app/(admin)/admin/produits/[id]/image-actions";

type ProductImage = { id: string; storage_path: string; is_primary: boolean };

export function ImageManager({
  productId,
  images,
}: {
  productId: string;
  images: ProductImage[];
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);

  function handleUpload(formData: FormData) {
    setError(null);
    setWarning(null);
    startTransition(async () => {
      const result = await uploadProductImages(productId, formData);
      if ("error" in result) setError(result.error);
      else if (result.warning) setWarning(result.warning);
      if (fileInputRef.current) fileInputRef.current.value = "";
    });
  }

  return (
    <div>
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
        {images.map((image) => (
          <div key={image.id} className="group relative aspect-square overflow-hidden rounded-xl bg-black/5">
            <Image
              src={storagePublicUrl(image.storage_path)}
              alt=""
              fill
              unoptimized
              className="object-cover transition-transform duration-300 group-hover:scale-110"
            />
            {image.is_primary && (
              <span className="absolute left-1 top-1 rounded-full bg-brand-gold px-2 py-0.5 text-[10px] font-bold text-brand-navy">
                Principale
              </span>
            )}
            <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/40 opacity-0 transition group-hover:opacity-100">
              {!image.is_primary && (
                <button
                  type="button"
                  title="Définir comme image principale"
                  onClick={() => startTransition(() => setPrimaryImage(image.id, productId))}
                  className="rounded-full bg-white p-1.5 text-brand-navy hover:bg-brand-gold"
                >
                  <Star size={14} />
                </button>
              )}
              <button
                type="button"
                title="Supprimer cette image"
                onClick={() => {
                  if (confirm("Supprimer cette image ?")) {
                    startTransition(() => deleteProductImage(image.id, productId));
                  }
                }}
                className="rounded-full bg-white p-1.5 text-red-600 hover:bg-red-50"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <form
        action={handleUpload}
        className="mt-4 flex flex-wrap items-center gap-3 rounded-2xl border border-dashed border-black/15 bg-black/[0.015] p-4"
      >
        {/* The native file input is invisible — the green button below is
            the only thing the user sees, and clicking it opens the OS file
            browser directly (fileInputRef.current.click()). Before this, the
            button was a *separate* submit control next to the browser's own
            unstyled "Choisir des fichiers" text, which looked like the real
            action — people clicked the green button first, found nothing
            selected, and got a confusing "select an image" error without
            ever noticing the real file-picker was the small text beside it. */}
        <input
          ref={fileInputRef}
          type="file"
          name="files"
          accept="image/jpeg,image/png,image/webp"
          multiple
          onChange={(e) => e.currentTarget.form?.requestSubmit()}
          className="hidden"
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isPending}
          className="flex items-center gap-2 rounded-full bg-brand-green px-5 py-2.5 text-sm font-bold text-white shadow-sm transition-all duration-200 hover:scale-[1.02] hover:bg-brand-green-dark disabled:pointer-events-none disabled:opacity-60"
        >
          <Upload size={14} />
          {isPending ? "Envoi…" : "Ajouter des photos"}
        </button>
        <span className="text-xs text-black/40">JPEG, PNG ou WEBP — plusieurs à la fois possible.</span>
        {error && <p className="w-full text-sm font-medium text-red-600">{error}</p>}
        {warning && <p className="w-full text-sm font-medium text-brand-navy/70">{warning}</p>}
      </form>
    </div>
  );
}
