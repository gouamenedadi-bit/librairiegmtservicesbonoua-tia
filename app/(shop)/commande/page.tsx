"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, MapPin, Phone, ShieldCheck, Truck, UserRound } from "lucide-react";

import { useCartStore } from "@/lib/cart/store";
import { formatXOF } from "@/lib/utils/format-xof";
import { useTranslations } from "@/lib/i18n/locale-provider";
import { getWhatsAppLink } from "@/lib/whatsapp";
import { FORM_BUTTON_PRIMARY, FORM_ERROR } from "@/lib/ui/form-styles";
import { FormCard } from "@/components/ui/form-card";
import { LabeledField } from "@/components/ui/labeled-field";
import { submitOrder } from "./actions";

export default function CheckoutPage() {
  const router = useRouter();
  const hasHydrated = useCartStore((state) => state.hasHydrated);
  const lines = useCartStore((state) => state.lines);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const dict = useTranslations();

  useEffect(() => {
    if (hasHydrated && lines.length === 0) router.replace("/panier");
  }, [hasHydrated, lines.length, router]);

  if (!hasHydrated || lines.length === 0) return null;

  // create_order() rejects unpriced items server-side (invalid_or_unpriced_product),
  // so only the priced lines ever reach submitOrder — the rest are shown as
  // a separate "we'll contact you" note with a WhatsApp link.
  const pricedLines = lines.filter((line) => line.price !== null);
  const pendingLines = lines.filter((line) => line.price === null);
  const total = pricedLines.reduce((sum, line) => sum + line.price! * line.quantity, 0);

  const pendingWhatsAppLink = getWhatsAppLink(
    pendingLines.length > 0
      ? `Bonjour, je voudrais connaître le prix de : ${pendingLines.map((l) => l.name).join(", ")}.`
      : undefined,
  );

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await submitOrder(
        pricedLines.map((line) => ({ productId: line.productId, quantity: line.quantity })),
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

  const pendingBlock = pendingLines.length > 0 && (
    <div className="rounded-2xl border border-brand-gold/30 bg-brand-gold/[0.06] p-4">
      <p className="flex items-center gap-1.5 text-sm font-bold text-brand-navy">
        <AlertCircle size={15} className="text-brand-gold" />
        {dict.checkout.pendingTitle}
      </p>
      <ul className="mt-2 space-y-0.5 text-sm text-black/60">
        {pendingLines.map((line) => (
          <li key={line.productId}>• {line.name}</li>
        ))}
      </ul>
      <p className="mt-2 text-xs text-black/50">{dict.checkout.pendingNote}</p>
      {pendingWhatsAppLink && (
        <a
          href={pendingWhatsAppLink}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-block rounded-full border border-brand-navy/20 px-5 py-2 text-xs font-bold text-brand-navy transition hover:bg-brand-navy/5"
        >
          {dict.product.contactUs}
        </a>
      )}
    </div>
  );

  // Rien à payer : tout le panier est "Prix sur demande". Pas de formulaire
  // Wave dans ce cas, juste le contact — un montant de 0 FCFA n'a aucun sens.
  if (pricedLines.length === 0) {
    return (
      <div className="mx-auto max-w-lg px-4 py-10">
        <FormCard icon={Truck} title={dict.checkout.title}>
          <p className="text-sm font-semibold text-brand-navy">{dict.checkout.noPricedTitle}</p>
          <p className="mt-1 text-sm text-black/60">{dict.checkout.noPricedDesc}</p>
          <div className="mt-5">{pendingBlock}</div>
        </FormCard>
      </div>
    );
  }

  return (
    <div className="px-4 py-10">
      <form action={handleSubmit}>
        <FormCard icon={Truck} title={dict.checkout.title}>
          <div className="space-y-5">
            <LabeledField label={dict.checkout.fullName} icon={UserRound} name="guestName" autoComplete="name" required />
            <LabeledField
              label={dict.checkout.phone}
              icon={Phone}
              name="guestPhone"
              type="tel"
              autoComplete="tel"
              placeholder="07 00 00 00 00"
              required
            />
            <LabeledField
              label={dict.checkout.address}
              icon={MapPin}
              name="guestAddress"
              autoComplete="street-address"
              required
            />

            <div className="rounded-2xl bg-brand-green/[0.06] p-4">
              <div className="flex items-center justify-between text-sm font-bold text-brand-navy">
                <span>{dict.checkout.totalToPay}</span>
                <span>{formatXOF(total)}</span>
              </div>
              <p className="mt-1.5 flex items-center gap-1.5 text-xs text-black/50">
                <ShieldCheck size={13} className="text-brand-green" />
                {dict.checkout.securePayment}
              </p>
            </div>

            {pendingBlock}
          </div>

          {error && <p className={`mt-6 ${FORM_ERROR}`}>{error}</p>}

          <button type="submit" disabled={isPending} className={`mt-8 w-full ${FORM_BUTTON_PRIMARY}`}>
            {isPending ? dict.checkout.submitting : dict.checkout.submit}
          </button>
        </FormCard>
      </form>
    </div>
  );
}
