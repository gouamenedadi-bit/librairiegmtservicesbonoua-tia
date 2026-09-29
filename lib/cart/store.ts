import { create } from "zustand";
import { persist } from "zustand/middleware";

// Display-only cache for instant UI feedback — never a source of truth.
// create_order() revalidates every product's price/availability server-side.
export type CartLine = {
  productId: string;
  name: string;
  slug: string;
  // null = product doesn't have a set price yet ("Prix sur demande"). It can
  // still be added to the cart as an interest signal, but create_order()
  // rejects unpriced items server-side — see app/(shop)/commande/page.tsx,
  // which filters these out before ever calling submitOrder().
  price: number | null;
  imageUrl: string | null;
  quantity: number;
};

type CartState = {
  lines: CartLine[];
  hasHydrated: boolean;
  addLine: (line: Omit<CartLine, "quantity">, quantity?: number) => void;
  removeLine: (productId: string) => void;
  setQuantity: (productId: string, quantity: number) => void;
  clear: () => void;
};

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      lines: [],
      hasHydrated: false,
      addLine: (line, quantity = 1) =>
        set((state) => {
          const existing = state.lines.find((l) => l.productId === line.productId);
          if (existing) {
            return {
              lines: state.lines.map((l) =>
                l.productId === line.productId ? { ...l, quantity: l.quantity + quantity } : l,
              ),
            };
          }
          return { lines: [...state.lines, { ...line, quantity }] };
        }),
      removeLine: (productId) =>
        set((state) => ({ lines: state.lines.filter((l) => l.productId !== productId) })),
      setQuantity: (productId, quantity) =>
        set((state) => ({
          lines: quantity <= 0
            ? state.lines.filter((l) => l.productId !== productId)
            : state.lines.map((l) => (l.productId === productId ? { ...l, quantity } : l)),
        })),
      clear: () => set({ lines: [] }),
    }),
    {
      name: "tia-librairie-cart",
      onRehydrateStorage: () => (state) => {
        if (state) state.hasHydrated = true;
      },
    },
  ),
);
