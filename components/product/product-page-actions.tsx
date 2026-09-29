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
      <div className="flex items-center gap-2">
        <button
          type="button"
          aria-label="-"
          onClick={() => setQuantity((q) => Math.max(1, q - 1))}
          className="rounded-full border border-black/10 p-2.5 hover:bg-black/5"
        >
          <Minus size={14} />
        </button>
        <span className="w-8 text-center text-sm font-bold text-brand-navy">{quantity}</span>
        <button
          type="button"
          aria-label="+"
          onClick={() => setQuantity((q) => q + 1)}
          className="rounded-full border border-black/10 p-2.5 hover:bg-black/5"
        >
          <Plus size={14} />
        </button>
      </div>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={handleAddToCart}
          className="flex flex-1 items-center justify-center gap-2 rounded-full bg-brand-green px-6 py-3 text-sm font-bold text-white transition hover:bg-brand-green-dark"
        >
          <ShoppingCart size={16} />
          {dict.product.addToCart}
        </button>

        {price !== null && (
          <button
            type="button"
            onClick={handleBuyNow}
            className="flex flex-1 items-center justify-center gap-2 rounded-full bg-brand-gold px-6 py-3 text-sm font-bold text-brand-navy transition hover:brightness-95"
          >
            <Zap size={16} />
            {dict.product.buyNow}
          </button>
        )}
      </div>
    </div>
  );
}
