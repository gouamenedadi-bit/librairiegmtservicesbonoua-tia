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
      className="flex items-center justify-center gap-2 rounded-full bg-brand-green px-4 py-2.5 text-[13px] font-bold text-white transition hover:bg-brand-green-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-navy sm:text-sm"
    >
      <ShoppingCart size={16} className="shrink-0" />
      <span className="sm:hidden">{dict.product.addShort}</span>
      <span className="hidden truncate sm:inline">{dict.product.addToCart}</span>
    </button>
  );
}
