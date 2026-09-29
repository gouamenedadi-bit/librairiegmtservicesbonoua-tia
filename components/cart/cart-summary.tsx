"use client";

import { ShoppingCart } from "lucide-react";

import { useCartStore } from "@/lib/cart/store";
import { formatXOF } from "@/lib/utils/format-xof";
import { useTranslations } from "@/lib/i18n/locale-provider";

/** Header cart pill: icon + label + live running total, à la "Cart $0.00". */
export function CartSummary() {
  const hasHydrated = useCartStore((state) => state.hasHydrated);
  const count = useCartStore((state) =>
    state.lines.reduce((total, line) => total + line.quantity, 0),
  );
  // "Prix sur demande" lines (price=null) don't count towards this total —
  // same rule as the cart/checkout pages.
  const total = useCartStore((state) =>
    state.lines.reduce((sum, line) => sum + (line.price ?? 0) * line.quantity, 0),
  );
  const dict = useTranslations();

  // Avoid a hydration mismatch: the persisted store is only readable after
  // mount, so render 0 until then (matches the server-rendered markup).
  const displayCount = hasHydrated ? count : 0;
  const displayTotal = hasHydrated ? total : 0;

  return (
    <div className="relative flex items-center gap-2 rounded-full bg-brand-green px-4 py-2.5 text-white transition-all duration-200 hover:scale-[1.03] hover:bg-brand-green-dark">
      <ShoppingCart size={18} />
      {displayCount > 0 && (
        <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-gold px-1 text-[11px] font-bold text-brand-navy">
          {displayCount}
        </span>
      )}
      <span className="hidden flex-col leading-tight sm:flex">
        <span className="text-xs font-medium text-white/80">{dict.nav.panier}</span>
        <span className="text-sm font-bold">{formatXOF(displayTotal)}</span>
      </span>
    </div>
  );
}
