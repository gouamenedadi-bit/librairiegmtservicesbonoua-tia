import Link from "next/link";
import { CheckCircle2, Clock, Store } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { formatXOF } from "@/lib/utils/format-xof";

export default async function OrderConfirmationPage({
  params,
}: PageProps<"/commande/[orderId]/confirmation">) {
  const { orderId } = await params;

  const supabase = await createClient();
  const { data } = await supabase.rpc("get_order_status", { p_order_id: orderId }).maybeSingle();

  if (!data) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <h1 className="font-display text-4xl font-extrabold uppercase text-brand-navy">Commande introuvable</h1>
        <p className="mt-2 text-black/60">Vérifiez le lien reçu après votre paiement, ou contactez-nous.</p>
        <Link
          href="/"
          className="mt-8 inline-block rounded-full bg-brand-green px-6 py-3 text-sm font-bold text-white transition hover:bg-brand-green-dark"
        >
          Retour à la boutique
        </Link>
      </div>
    );
  }

  const isConfirmed = data.payment_status === "succeeded";

  return (
    <div className="bg-gradient-to-b from-brand-green/[0.07] to-white">
      <div className="mx-auto max-w-xl px-4 py-16 text-center sm:py-20">
        <span
          className={`animate-fade-in-up mx-auto flex h-20 w-20 items-center justify-center rounded-full ${
            isConfirmed ? "bg-brand-green text-white" : "bg-brand-gold text-brand-navy"
          }`}
        >
          {isConfirmed ? <CheckCircle2 size={40} /> : <Clock size={40} />}
        </span>

        <h1
          style={{ animationDelay: "60ms" }}
          className="animate-fade-in-up mt-6 font-display text-5xl font-extrabold uppercase leading-[0.95] text-brand-navy"
        >
          {isConfirmed ? "Paiement confirmé" : "Paiement en cours"}
        </h1>
        {!isConfirmed && (
          <p className="mt-3 text-sm text-black/55">
            Wave confirme le paiement en quelques instants. Rafraîchissez cette page si besoin.
          </p>
        )}

        {/* The order as a receipt stub: number in the logo's yellow plate. */}
        <div
          style={{ animationDelay: "120ms" }}
          className="animate-fade-in-up mx-auto mt-8 max-w-sm rounded-[1.5rem] bg-brand-navy p-6 text-white shadow-[6px_6px_0_0_var(--color-brand-green)]"
        >
          <p className="text-xs font-bold uppercase tracking-[0.4em] text-white/60">Commande</p>
          <p className="label-plate mt-3 font-display text-3xl font-extrabold">{data.order_number}</p>
          <div aria-hidden className="my-5 border-t-2 border-dashed border-white/20" />
          <p className="flex items-baseline justify-between">
            <span className="text-sm text-white/70">Total</span>
            <span className="font-display text-3xl font-extrabold text-brand-gold">{formatXOF(data.total_amount)}</span>
          </p>
        </div>

        {isConfirmed && (
          <p className="mx-auto mt-6 flex max-w-sm items-start justify-center gap-2 text-sm text-black/60">
            <Store size={18} className="mt-px shrink-0 text-brand-green" />
            Gardez ce numéro de commande : il vous sera demandé à la librairie GMT Services, à Bonoua.
          </p>
        )}

        <Link
          href="/"
          className="mt-8 inline-block rounded-full bg-brand-green px-7 py-3 text-sm font-bold text-white transition hover:bg-brand-green-dark"
        >
          Retour à la boutique
        </Link>
      </div>
    </div>
  );
}
