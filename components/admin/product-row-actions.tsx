"use client";

import Link from "next/link";
import { useTransition } from "react";
import { Pencil, Trash2 } from "lucide-react";

import { deleteProduct, toggleProductActive } from "@/app/(admin)/admin/produits/actions";
import { ICON_BUTTON } from "@/lib/ui/table-styles";

export function ProductRowActions({ id, isActive }: { id: string; isActive: boolean }) {
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex items-center justify-end gap-2">
      <label className="mr-2 flex items-center gap-1.5 text-xs text-black/60">
        <input
          type="checkbox"
          defaultChecked={isActive}
          disabled={isPending}
          onChange={(e) => startTransition(() => toggleProductActive(id, e.target.checked))}
          className="h-3.5 w-3.5 rounded border-black/20 text-brand-green focus:ring-brand-green"
        />
        Visible
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
