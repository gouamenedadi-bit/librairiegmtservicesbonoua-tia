"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { useCartStore } from "@/lib/cart/store";
import { formatXOF } from "@/lib/utils/format-xof";
import { submitOrder } from "./actions";

export default function CheckoutPage() {
  const router = useRouter();
  const hasHydrated = useCartStore((state) => state.hasHydrated);
  const lines = useCartStore((state) => state.lines);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (hasHydrated && lines.length === 0) router.replace("/panier");
  }, [hasHydrated, lines.length, router]);

  if (!hasHydrated || lines.length === 0) return null;

  const total = lines.reduce((sum, line) => sum + line.price * line.quantity, 0);

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await submitOrder(
        lines.map((line) => ({ productId: line.productId, quantity: line.quantity })),
        {
          guestName: formData.get("guestName"),
          guestPhone: formData.get("guestPhone"),
          guestAddress: formData.get("guestAddress"),
        },
      );
      // On success submitOrder redirects to Wave and never returns here.
      if (result?.error) setError(result.error);
    });
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-10">
      <h1 className="text-2xl font-bold text-brand-navy">Finaliser la commande</h1>

      <form action={handleSubmit} className="mt-6 space-y-4">
        <Field label="Nom complet" name="guestName" autoComplete="name" required />
        <Field
          label="Téléphone"
          name="guestPhone"
          type="tel"
          autoComplete="tel"
          placeholder="07 00 00 00 00"
          required
        />
        <Field
          label="Adresse de livraison / quartier"
          name="guestAddress"
          autoComplete="street-address"
          required
        />

        <div className="rounded-xl bg-black/5 p-4">
          <div className="flex items-center justify-between text-sm font-semibold text-brand-navy">
            <span>Total à payer</span>
            <span>{formatXOF(total)}</span>
          </div>
          <p className="mt-1 text-xs text-black/50">Paiement sécurisé via Wave.</p>
        </div>

        {error && <p className="text-sm font-medium text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={isPending}
          className="w-full rounded-full bg-brand-green py-3 text-sm font-bold text-white transition hover:bg-brand-green-dark disabled:opacity-60"
        >
          {isPending ? "Redirection vers Wave…" : "Payer avec Wave"}
        </button>
      </form>
    </div>
  );
}

function Field({
  label,
  name,
  type = "text",
  ...rest
}: {
  label: string;
  name: string;
  type?: string;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-brand-navy">{label}</span>
      <input
        name={name}
        type={type}
        className="mt-1 w-full rounded-lg border border-black/10 px-3 py-2 text-sm outline-none focus:border-brand-green focus:ring-1 focus:ring-brand-green"
        {...rest}
      />
    </label>
  );
}
