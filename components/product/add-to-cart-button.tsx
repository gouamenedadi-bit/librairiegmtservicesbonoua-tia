"use client";

import { ShoppingCart } from "lucide-react";

import { useCartStore } from "@/lib/cart/store";
import { useTranslations } from "@/lib/i18n/locale-provider";

export function AddToCartButton({
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
  const addLine = useCartStore((state) => state.addLine);
  const dict = useTranslations();

  return (
    <button
      type="button"
      onClick={() => addLine({ productId, name, slug, price, imageUrl })}
      className="flex items-center justify-center gap-2 rounded-full bg-brand-green px-5 py-2.5 text-sm font-bold text-white transition hover:bg-brand-green-dark"
    >
      <ShoppingCart size={16} />
      {dict.product.addToCart}
    </button>
  );
}
