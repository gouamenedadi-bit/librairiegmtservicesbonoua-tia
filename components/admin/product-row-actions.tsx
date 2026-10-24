"use client";

import Link from "next/link";
import { useTransition } from "react";
import { Pencil, Trash2 } from "lucide-react";

import { deleteProduct, toggleProductActive } from "@/app/(admin)/admin/produits/actions";
import { ICON_BUTTON } from "@/lib/ui/table-styles";

export function ProductRowActions({ id, isActive }: { id: string; isActive: boolean }) {
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex items-center justify-end gap-3">
      <label className="flex items-center gap-2 text-xs font-medium text-black/60">
        Visible
        <span className="relative inline-flex cursor-pointer items-center">
          <input
            type="checkbox"
            defaultChecked={isActive}
            disabled={isPending}
            onChange={(e) => startTransition(() => toggleProductActive(id, e.target.checked))}
            className="peer sr-only"
          />
          <span className="h-5 w-9 rounded-full bg-black/15 transition-colors duration-200 peer-checked:bg-brand-green peer-focus-visible:ring-2 peer-focus-visible:ring-brand-green/40 peer-disabled:opacity-50" />
          <span className="pointer-events-none absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform duration-200 peer-checked:translate-x-4" />
        </span>
      </label>
      <Link
        href={`/admin/produits/${id}`}
        className={`${ICON_BUTTON} text-brand-navy hover:bg-brand-navy/5`}
        title="Modifier"
      >
        <Pencil size={15} />
      </Link>
      <button
        type="button"
        title="Supprimer"
        disabled={isPending}
        onClick={() => {
          if (confirm("Supprimer définitivement ce produit ? Cette action est irréversible.")) {
            startTransition(async () => {
              await deleteProduct(id);
            });
          }
        }}
        className={`${ICON_BUTTON} text-red-500 hover:bg-red-50 disabled:pointer-events-none disabled:opacity-30`}
      >
        <Trash2 size={15} />
      </button>
    </div>
  );
}
