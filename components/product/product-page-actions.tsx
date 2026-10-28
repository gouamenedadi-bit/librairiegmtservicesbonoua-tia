"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Minus, Plus, ShoppingCart, Zap } from "lucide-react";

import { useCartStore } from "@/lib/cart/store";
import { useTranslations } from "@/lib/i18n/locale-provider";

export function ProductPageActions({
  productId,
  name,
  slug,
  price,
  imageUrl,
}: {
  productId: string;
  name: string;
  slug: string;
  price: number | null;
  imageUrl: string | null;
}) {
  const [quantity, setQuantity] = useState(1);
  const addLine = useCartStore((state) => state.addLine);
  const router = useRouter();
  const dict = useTranslations();

  function handleAddToCart() {
    addLine({ productId, name, slug, price, imageUrl }, quantity);
  }

  function handleBuyNow() {
    addLine({ productId, name, slug, price, imageUrl }, quantity);
    router.push("/commande");
  }

  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-navy/50">{dict.product.quantity}</p>
      <div className="mt-2 inline-flex items-center rounded-full border-2 border-brand-navy/15 bg-white">
        <button
          type="button"
          aria-label={dict.cart.decreaseQty}
          onClick={() => setQuantity((q) => Math.max(1, q - 1))}
          className="rounded-full p-3 text-brand-navy transition hover:bg-brand-navy/5 focus-visible:outline-2 focus-visible:outline-brand-navy"
        >
          <Minus size={16} />
        </button>
        <span aria-live="polite" className="w-10 text-center font-display text-xl font-bold text-brand-navy">
          {quantity}
        </span>
        <button
          type="button"
          aria-label={dict.cart.increaseQty}
          onClick={() => setQuantity((q) => Math.min(100, q + 1))}
          className="rounded-full p-3 text-brand-navy transition hover:bg-brand-navy/5 focus-visible:outline-2 focus-visible:outline-brand-navy"
        >
          <Plus size={16} />
        </button>
      </div>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={handleAddToCart}
          className="flex flex-1 items-center justify-center gap-2 rounded-full bg-brand-green px-6 py-3.5 text-sm font-bold text-white transition hover:bg-brand-green-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-navy"
        >
          <ShoppingCart size={16} />
          {dict.product.addToCart}
        </button>

        {price !== null && (
          <button
            type="button"
            onClick={handleBuyNow}
            className="flex flex-1 items-center justify-center gap-2 rounded-full border-2 border-brand-navy bg-brand-gold px-6 py-3 text-sm font-bold text-brand-navy shadow-[3px_3px_0_0_var(--color-brand-green)] transition hover:brightness-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-navy"
          >
            <Zap size={16} />
            {dict.product.buyNow}
          </button>
        )}
      </div>
    </div>
  );
}
