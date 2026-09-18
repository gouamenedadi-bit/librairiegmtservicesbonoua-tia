"use client";

import { useCartStore } from "@/lib/cart/store";

export function CartBadge() {
  const hasHydrated = useCartStore((state) => state.hasHydrated);
  const count = useCartStore((state) =>
    state.lines.reduce((total, line) => total + line.quantity, 0),
  );

  // Avoid a hydration mismatch: the persisted store is only readable after
  // mount, so render 0 until then (matches the server-rendered markup).
  const displayCount = hasHydrated ? count : 0;

  if (displayCount === 0) return null;

  return (
    <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-gold px-1 text-xs font-bold text-brand-navy">
      {displayCount}
    </span>
  );
}
