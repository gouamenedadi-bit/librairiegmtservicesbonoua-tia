"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, MessageCircle, Minus, Plus, ShoppingCart, Trash2 } from "lucide-react";

import { useCartStore, type CartLine } from "@/lib/cart/store";
import { formatXOF } from "@/lib/utils/format-xof";
import { useTranslations } from "@/lib/i18n/locale-provider";
import { getWhatsAppLink } from "@/lib/whatsapp";
import type { Dictionary } from "@/lib/i18n/dictionary";
import { PageHeading } from "@/components/ui/page-heading";

/**
 * Always French, regardless of the site's current locale — like every other
 * WhatsApp message in the app (product-card.tsx, whatsapp-button.tsx): the
 * shop owner reading it on their phone is French-speaking, so the message
 * *to* them shouldn't follow the *customer's* language choice.
 */
function buildOrderMessage(lines: CartLine[], total: number): string {
  const itemLines = lines.map((line) => {
    const priceText = line.price !== null ? formatXOF(line.price) : "Prix sur demande";
    return `• ${line.name} x${line.quantity} — ${priceText}`;
  });
  const pendingCount = lines.filter((l) => l.price === null).length;
  const totalLine =
    pendingCount > 0
      ? `Total : ${formatXOF(total)} (+ ${pendingCount} article(s) sans prix à confirmer sur place)`
      : `Total : ${formatXOF(total)}`;

  return [
    "Bonjour, je souhaite récupérer cette commande en boutique :",
    "",
    ...itemLines,
    "",
    totalLine,
  ].join("\n");
}

function QuantityControls({
  line,
  setQuantity,
  dict,
}: {
  line: CartLine;
  setQuantity: (productId: string, quantity: number) => void;
  dict: Dictionary;
}) {
  return (
    <div className="inline-flex items-center rounded-full border-2 border-brand-navy/15 bg-white">
      <button
        type="button"
        aria-label={dict.cart.decreaseQty}
        onClick={() => setQuantity(line.productId, line.quantity - 1)}
        className="rounded-full p-2 text-brand-navy transition hover:bg-brand-navy/5 focus-visible:outline-2 focus-visible:outline-brand-navy"
      >
        <Minus size={14} />
      </button>
      <span className="w-7 text-center font-display text-lg font-bold text-brand-navy">{line.quantity}</span>
      <button
        type="button"
        aria-label={dict.cart.increaseQty}
        onClick={() => setQuantity(line.productId, line.quantity + 1)}
        className="rounded-full p-2 text-brand-navy transition hover:bg-brand-navy/5 focus-visible:outline-2 focus-visible:outline-brand-navy"
      >
        <Plus size={14} />
      </button>
    </div>
  );
}

export default function CartPage() {
  const hasHydrated = useCartStore((state) => state.hasHydrated);
  const lines = useCartStore((state) => state.lines);
  const setQuantity = useCartStore((state) => state.setQuantity);
  const removeLine = useCartStore((state) => state.removeLine);
  const dict = useTranslations();

  if (!hasHydrated) return null;

  // Seules les lignes avec un prix connu comptent dans le total — les
  // articles "Prix sur demande" restent dans le panier (pratique pour ne
  // pas les perdre) mais create_order() les refuse au paiement de toute
  // façon (voir app/(shop)/commande), donc ils ne peuvent pas contribuer à
  // un montant à payer.
  const pricedLines = lines.filter((line) => line.price !== null);
  const pendingLines = lines.filter((line) => line.price === null);
  const total = pricedLines.reduce((sum, line) => sum + line.price! * line.quantity, 0);
  const whatsappOrderLink = getWhatsAppLink(buildOrderMessage(lines, total));

  if (lines.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 sm:py-20">
        <div className="rounded-[1.75rem] border-2 border-dashed border-brand-navy/15 px-6 py-14 text-center sm:px-12">
          <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-brand-navy text-brand-gold">
            <ShoppingCart size={28} />
          </span>
          <h1 className="mt-5 font-display text-4xl font-extrabold uppercase text-brand-navy">{dict.cart.empty}</h1>
          <p className="mt-2 text-black/60">{dict.cart.emptyDesc}</p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Link
              href="/categorie/librairie-litterature"
              className="rounded-full bg-brand-green px-6 py-3 text-sm font-bold text-white transition hover:bg-brand-green-dark"
            >
              {dict.home.ctaLibrairie}
            </Link>
            <Link
              href="/categorie/papeterie-bureau"
              className="rounded-full border-2 border-brand-navy bg-brand-gold px-6 py-2.5 text-sm font-bold text-brand-navy transition hover:brightness-95"
            >
              {dict.home.ctaPapeterie}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const itemCount = lines.reduce((sum, line) => sum + line.quantity, 0);

  return (
    <div className="mx-auto max-w-6xl px-4 pb-16 pt-8 sm:pt-12">
      <PageHeading eyebrow={`${itemCount} ${dict.cart.items}`} title={dict.cart.title} />

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_380px] lg:items-start">
        <ul className="divide-y divide-black/[0.07] rounded-[1.75rem] border border-black/[0.07] bg-white px-4 sm:px-6">
          {lines.map((line) => (
            <li key={line.productId} className="flex gap-4 py-5 sm:items-center">
              <Link
                href={`/produit/${line.slug}`}
                className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-brand-navy/[0.04] sm:h-24 sm:w-24"
              >
                {line.imageUrl && (
                  <Image src={line.imageUrl} alt={line.name} fill unoptimized className="object-cover" />
                )}
              </Link>

              <div className="min-w-0 flex-1">
                <Link
                  href={`/produit/${line.slug}`}
                  className="line-clamp-2 font-semibold text-brand-navy hover:text-brand-green"
                >
                  {line.name}
                </Link>
                <p className="mt-1 text-sm text-black/55">
                  {line.price !== null ? formatXOF(line.price) : dict.product.priceOnRequest}
                </p>

                {/* Sous le nom sur mobile, faute de place pour tout aligner sur une ligne */}
                <div className="mt-3 flex items-center justify-between sm:hidden">
                  <QuantityControls line={line} setQuantity={setQuantity} dict={dict} />
                  <RemoveButton onClick={() => removeLine(line.productId)} label={dict.cart.remove} />
                </div>
              </div>

              <div className="hidden sm:block">
                <QuantityControls line={line} setQuantity={setQuantity} dict={dict} />
              </div>
              <p className="hidden w-28 text-right font-display text-xl font-bold text-brand-navy sm:block">
                {line.price !== null ? formatXOF(line.price * line.quantity) : "—"}
              </p>
              <div className="hidden sm:block">
                <RemoveButton onClick={() => removeLine(line.productId)} label={dict.cart.remove} />
              </div>
            </li>
          ))}
        </ul>

        {/* Summary as a shop receipt: navy ticket, dashed tear line. */}
        <aside className="rounded-[1.75rem] bg-brand-navy p-6 text-white shadow-[6px_6px_0_0_var(--color-brand-green)] sm:p-7 lg:sticky lg:top-28">
          <h2 className="text-xs font-bold uppercase tracking-[0.4em] text-white/60">{dict.cart.summary}</h2>

          <div className="mt-5 flex items-baseline justify-between gap-4">
            <span className="font-display text-2xl font-bold uppercase">{dict.cart.total}</span>
            <span className="font-display text-4xl font-extrabold text-brand-gold">{formatXOF(total)}</span>
          </div>

          {pendingLines.length > 0 && (
            <p className="mt-3 text-xs leading-relaxed text-white/60">
              {pendingLines.length} {dict.cart.pendingNote}
            </p>
          )}

          <div aria-hidden className="my-6 border-t-2 border-dashed border-white/20" />

          <Link
            href="/commande"
            className="flex w-full items-center justify-center gap-2 rounded-full bg-brand-green py-3.5 text-sm font-bold text-white transition hover:bg-brand-green-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-gold"
          >
            {dict.cart.checkout}
            <ArrowRight size={16} />
          </Link>

          {whatsappOrderLink && (
            <>
              <div className="my-4 flex items-center gap-3 text-xs font-semibold uppercase tracking-wide text-white/40">
                <span className="h-px flex-1 bg-white/15" />
                {dict.cart.orDivider}
                <span className="h-px flex-1 bg-white/15" />
              </div>

              <a
                href={whatsappOrderLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-full items-center justify-center gap-2 rounded-full bg-white py-3 text-center text-sm font-bold text-brand-navy transition hover:bg-brand-gold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-gold"
              >
                <MessageCircle size={18} className="text-brand-green" />
                {dict.cart.whatsappOrder}
              </a>
              <p className="mt-2 text-center text-xs leading-relaxed text-white/55">{dict.cart.whatsappOrderDesc}</p>
            </>
          )}

          <Link
            href="/"
            className="mt-6 block text-center text-xs font-semibold text-white/60 underline-offset-2 hover:text-white hover:underline"
          >
            {dict.cart.continueShopping}
          </Link>
        </aside>
      </div>
    </div>
  );
}

function RemoveButton({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="rounded-full p-2 text-black/35 transition hover:bg-red-50 hover:text-red-600 focus-visible:outline-2 focus-visible:outline-brand-navy"
    >
      <Trash2 size={17} />
    </button>
  );
}
