"use client";

import Image from "next/image";
import Link from "next/link";
import { MessageCircle, Minus, Plus, Trash2 } from "lucide-react";

import { useCartStore, type CartLine } from "@/lib/cart/store";
import { formatXOF } from "@/lib/utils/format-xof";
import { useTranslations } from "@/lib/i18n/locale-provider";
import { getWhatsAppLink } from "@/lib/whatsapp";
import type { Dictionary } from "@/lib/i18n/dictionary";

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
    <div className="flex items-center gap-2">
      <button
        type="button"
        aria-label={dict.cart.decreaseQty}
        onClick={() => setQuantity(line.productId, line.quantity - 1)}
        className="rounded-full border border-black/10 p-1.5 hover:bg-black/5"
      >
        <Minus size={14} />
      </button>
      <span className="w-6 text-center text-sm font-semibold">{line.quantity}</span>
      <button
        type="button"
        aria-label={dict.cart.increaseQty}
        onClick={() => setQuantity(line.productId, line.quantity + 1)}
        className="rounded-full border border-black/10 p-1.5 hover:bg-black/5"
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
      <div className="mx-auto max-w-2xl px-4 py-10">
        <div className="rounded-3xl border-[3px] border-brand-navy bg-white p-10 text-center shadow-lg sm:p-16">
          <h1 className="text-2xl font-bold text-brand-navy">{dict.cart.empty}</h1>
          <p className="mt-2 text-black/60">{dict.cart.emptyDesc}</p>
          <Link
            href="/"
            className="mt-6 inline-block rounded-full bg-brand-green px-6 py-3 text-sm font-bold text-white"
          >
            {dict.cart.backToShop}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="rounded-3xl border-[3px] border-brand-navy bg-white p-6 shadow-lg sm:p-10">
        <h1 className="text-2xl font-bold text-brand-navy">{dict.cart.title}</h1>

        <ul className="mt-6 divide-y divide-black/5">
          {lines.map((line) => (
            <li key={line.productId} className="flex gap-3 py-4 sm:items-center sm:gap-4">
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-black/5">
                {line.imageUrl && (
                  <Image src={line.imageUrl} alt={line.name} fill unoptimized className="object-cover" />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <Link
                  href={`/produit/${line.slug}`}
                  className="line-clamp-2 text-sm font-semibold text-brand-navy hover:text-brand-green"
                >
                  {line.name}
                </Link>
                <p className="mt-1 text-sm text-black/60">
                  {line.price !== null ? formatXOF(line.price) : dict.product.priceOnRequest}
                </p>

                {/* Sous le nom sur mobile, faute de place pour tout aligner sur une ligne */}
                <div className="mt-2 flex items-center justify-between sm:hidden">
                  <QuantityControls line={line} setQuantity={setQuantity} dict={dict} />
                  <button
                    type="button"
                    aria-label={dict.cart.remove}
                    onClick={() => removeLine(line.productId)}
                    className="rounded-full p-2 text-black/40 hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <div className="hidden sm:block">
                <QuantityControls line={line} setQuantity={setQuantity} dict={dict} />
              </div>
              <button
                type="button"
                aria-label={dict.cart.remove}
                onClick={() => removeLine(line.productId)}
                className="hidden rounded-full p-2 text-black/40 hover:bg-red-50 hover:text-red-600 sm:block"
              >
                <Trash2 size={16} />
              </button>
            </li>
          ))}
        </ul>

        <div className="mt-8 flex items-center justify-between border-t border-black/10 pt-6">
          <span className="text-lg font-bold text-brand-navy">{dict.cart.total}</span>
          <span className="text-lg font-bold text-brand-navy">{formatXOF(total)}</span>
        </div>

        {pendingLines.length > 0 && (
          <p className="mt-2 text-xs text-brand-navy/60">
            {pendingLines.length} {dict.cart.pendingNote}
          </p>
        )}

        <Link
          href="/commande"
          className="mt-6 block w-full rounded-full bg-brand-green py-3 text-center text-sm font-bold text-white transition hover:bg-brand-green-dark"
        >
          {dict.cart.checkout}
        </Link>

        {whatsappOrderLink && (
          <>
            <div className="my-4 flex items-center gap-3 text-xs font-semibold uppercase tracking-wide text-black/30">
              <span className="h-px flex-1 bg-black/10" />
              {dict.cart.orDivider}
              <span className="h-px flex-1 bg-black/10" />
            </div>

            <a
              href={whatsappOrderLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-full items-center justify-center gap-2 rounded-full bg-[#25D366] py-3 text-center text-sm font-bold text-white transition hover:brightness-95"
            >
              <MessageCircle size={18} />
              {dict.cart.whatsappOrder}
            </a>
            <p className="mt-2 text-center text-xs text-black/50">{dict.cart.whatsappOrderDesc}</p>
          </>
        )}
      </div>
    </div>
  );
}
