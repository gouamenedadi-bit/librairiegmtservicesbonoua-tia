"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, Check, MapPin, Phone, ShieldCheck, UserRound } from "lucide-react";

import { useCartStore, type CartLine } from "@/lib/cart/store";
import { formatXOF } from "@/lib/utils/format-xof";
import { useTranslations } from "@/lib/i18n/locale-provider";
import { getWhatsAppLink } from "@/lib/whatsapp";
import { FORM_BUTTON_PRIMARY, FORM_ERROR } from "@/lib/ui/form-styles";
import { LabeledField } from "@/components/ui/labeled-field";
import { PageHeading } from "@/components/ui/page-heading";
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
    <div className="rounded-2xl border border-brand-gold/50 bg-brand-gold/15 p-4">
      <p className="flex items-center gap-1.5 text-sm font-bold text-brand-navy">
        <AlertCircle size={15} />
        {dict.checkout.pendingTitle}
      </p>
      <ul className="mt-2 space-y-0.5 text-sm text-black/60">
        {pendingLines.map((line) => (
          <li key={line.productId}>• {line.name}</li>
        ))}
      </ul>
      <p className="mt-2 text-xs text-black/55">{dict.checkout.pendingNote}</p>
      {pendingWhatsAppLink && (
        <a
          href={pendingWhatsAppLink}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-block rounded-full border-2 border-brand-navy/20 px-5 py-2 text-xs font-bold text-brand-navy transition hover:bg-brand-navy/5"
        >
          {dict.product.contactUs}
        </a>
      )}
    </div>
  );

  const steps = [dict.checkout.stepCart, dict.checkout.stepDetails, dict.checkout.stepPayment];

  // Rien à payer : tout le panier est "Prix sur demande". Pas de formulaire
  // Wave dans ce cas, juste le contact — un montant de 0 FCFA n'a aucun sens.
  if (pricedLines.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 pb-16 pt-8 sm:pt-12">
        <PageHeading title={dict.checkout.title} />
        <div className="mt-8 rounded-[1.75rem] border border-black/[0.07] bg-white p-6 sm:p-8">
          <p className="font-semibold text-brand-navy">{dict.checkout.noPricedTitle}</p>
          <p className="mt-1 text-sm text-black/60">{dict.checkout.noPricedDesc}</p>
          <div className="mt-5">{pendingBlock}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 pb-16 pt-8 sm:pt-12">
      <PageHeading title={dict.checkout.title} />

      {/* A real three-stage sequence: cart (done) → details (here) → Wave. */}
      <ol className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm font-semibold">
        {steps.map((step, index) => {
          const isDone = index === 0;
          const isCurrent = index === 1;
          return (
            <li key={step} className="flex items-center gap-3">
              <span
                aria-current={isCurrent ? "step" : undefined}
                className={`flex items-center gap-2 ${isCurrent ? "text-brand-navy" : isDone ? "text-brand-green" : "text-black/40"}`}
              >
                <span
                  className={`flex h-7 w-7 items-center justify-center rounded-full font-display text-sm font-extrabold ${
                    isCurrent
                      ? "border-2 border-brand-navy bg-brand-gold text-brand-navy shadow-[2px_2px_0_0_var(--color-brand-green)]"
                      : isDone
                        ? "bg-brand-green text-white"
                        : "border-2 border-black/15"
                  }`}
                >
                  {isDone ? <Check size={14} strokeWidth={3} /> : index + 1}
                </span>
                {isDone ? <Link href="/panier" className="hover:underline">{step}</Link> : step}
              </span>
              {index < steps.length - 1 && <span aria-hidden className="h-0 w-8 border-t-2 border-dashed border-black/15" />}
            </li>
          );
        })}
      </ol>

      <form action={handleSubmit} className="mt-8 grid gap-8 lg:grid-cols-[1fr_400px] lg:items-start">
        <div className="rounded-[1.75rem] border border-black/[0.07] bg-white p-6 sm:p-8">
          <h2 className="font-display text-2xl font-bold uppercase text-brand-navy">{dict.checkout.detailsTitle}</h2>
          <div className="mt-6 space-y-5">
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
            {pendingBlock}
          </div>
        </div>

        <aside className="rounded-[1.75rem] bg-brand-navy p-6 text-white shadow-[6px_6px_0_0_var(--color-brand-green)] sm:p-7 lg:sticky lg:top-28">
          <h2 className="text-xs font-bold uppercase tracking-[0.4em] text-white/60">{dict.checkout.summaryTitle}</h2>

          <ul className="mt-5 space-y-4">
            {pricedLines.map((line) => (
              <SummaryLine key={line.productId} line={line} />
            ))}
          </ul>

          <div aria-hidden className="my-6 border-t-2 border-dashed border-white/20" />

          <div className="flex items-baseline justify-between gap-4">
            <span className="font-display text-xl font-bold uppercase">{dict.checkout.totalToPay}</span>
            <span className="font-display text-4xl font-extrabold text-brand-gold">{formatXOF(total)}</span>
          </div>

          {error && <p className={`mt-5 ${FORM_ERROR}`}>{error}</p>}

          <button type="submit" disabled={isPending} className={`mt-6 w-full ${FORM_BUTTON_PRIMARY} py-3.5`}>
            {isPending ? dict.checkout.submitting : dict.checkout.submit}
          </button>
          <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-white/60">
            <ShieldCheck size={14} className="text-brand-green" />
            {dict.checkout.securePayment}
          </p>
        </aside>
      </form>
    </div>
  );
}

function SummaryLine({ line }: { line: CartLine }) {
  return (
    <li className="flex items-center gap-3">
      <div className="relative h-12 w-12 shrink-0">
        <div className="relative h-full w-full overflow-hidden rounded-lg bg-white/10">
          {line.imageUrl && <Image src={line.imageUrl} alt="" fill unoptimized className="object-cover" />}
        </div>
        <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-gold px-1 text-[11px] font-bold text-brand-navy">
          {line.quantity}
        </span>
      </div>
      <p className="line-clamp-2 min-w-0 flex-1 text-sm text-white/85">{line.name}</p>
      <p className="shrink-0 text-sm font-bold">{formatXOF(line.price! * line.quantity)}</p>
    </li>
  );
}
