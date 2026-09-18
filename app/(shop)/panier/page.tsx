"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2 } from "lucide-react";

import { useCartStore } from "@/lib/cart/store";
import { formatXOF } from "@/lib/utils/format-xof";

export default function CartPage() {
  const hasHydrated = useCartStore((state) => state.hasHydrated);
  const lines = useCartStore((state) => state.lines);
  const setQuantity = useCartStore((state) => state.setQuantity);
  const removeLine = useCartStore((state) => state.removeLine);

  if (!hasHydrated) return null;

  const total = lines.reduce((sum, line) => sum + line.price * line.quantity, 0);

  if (lines.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-brand-navy">Votre panier est vide</h1>
        <p className="mt-2 text-black/60">Parcourez le catalogue pour ajouter des articles.</p>
        <Link
          href="/"
          className="mt-6 inline-block rounded-full bg-brand-green px-6 py-3 text-sm font-bold text-white"
        >
          Retour à la boutique
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-bold text-brand-navy">Mon panier</h1>

      <ul className="mt-6 divide-y divide-black/5">
        {lines.map((line) => (
          <li key={line.productId} className="flex items-center gap-4 py-4">
            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-black/5">
              {line.imageUrl && (
                <Image src={line.imageUrl} alt={line.name} fill className="object-cover" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <Link
                href={`/produit/${line.slug}`}
                className="line-clamp-2 text-sm font-semibold text-brand-navy hover:text-brand-green"
              >
                {line.name}
              </Link>
              <p className="mt-1 text-sm text-black/60">{formatXOF(line.price)}</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                aria-label="Diminuer la quantité"
                onClick={() => setQuantity(line.productId, line.quantity - 1)}
                className="rounded-full border border-black/10 p-1.5 hover:bg-black/5"
              >
                <Minus size={14} />
              </button>
              <span className="w-6 text-center text-sm font-semibold">{line.quantity}</span>
              <button
                type="button"
                aria-label="Augmenter la quantité"
                onClick={() => setQuantity(line.productId, line.quantity + 1)}
                className="rounded-full border border-black/10 p-1.5 hover:bg-black/5"
              >
                <Plus size={14} />
              </button>
            </div>
            <button
              type="button"
              aria-label="Retirer du panier"
              onClick={() => removeLine(line.productId)}
              className="rounded-full p-2 text-black/40 hover:bg-red-50 hover:text-red-600"
            >
              <Trash2 size={16} />
            </button>
          </li>
        ))}
      </ul>

      <div className="mt-8 flex items-center justify-between border-t border-black/10 pt-6">
        <span className="text-lg font-bold text-brand-navy">Total</span>
        <span className="text-lg font-bold text-brand-navy">{formatXOF(total)}</span>
      </div>

      <Link
        href="/commande"
        className="mt-6 block w-full rounded-full bg-brand-green py-3 text-center text-sm font-bold text-white transition hover:bg-brand-green-dark"
      >
        Passer la commande
      </Link>
    </div>
  );
}
