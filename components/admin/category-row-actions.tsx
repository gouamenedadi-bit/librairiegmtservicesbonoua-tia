"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { Pencil, Trash2 } from "lucide-react";

import { deleteCategory } from "@/app/(admin)/admin/categories/actions";
import { ICON_BUTTON } from "@/lib/ui/table-styles";

export function CategoryRowActions({ id, canDelete }: { id: string; canDelete: boolean }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex items-center justify-end gap-2">
        <Link
          href={`/admin/categories/${id}`}
          className={`${ICON_BUTTON} text-brand-navy hover:bg-brand-navy/5`}
          title="Modifier"
        >
          <Pencil size={15} />
        </Link>
        <button
          type="button"
          title={canDelete ? "Supprimer" : "Déplacez d'abord les produits de cette catégorie"}
          disabled={isPending || !canDelete}
          onClick={() => {
            setError(null);
            if (confirm("Supprimer définitivement cette catégorie ?")) {
              startTransition(async () => {
                const result = await deleteCategory(id);
                if ("error" in result) setError(result.error);
              });
            }
          }}
          className={`${ICON_BUTTON} text-red-500 hover:bg-red-50 disabled:pointer-events-none disabled:opacity-30`}
        >
          <Trash2 size={15} />
        </button>
      </div>
      {error && <p className="max-w-[220px] text-right text-xs text-red-600">{error}</p>}
    </div>
  );
}
