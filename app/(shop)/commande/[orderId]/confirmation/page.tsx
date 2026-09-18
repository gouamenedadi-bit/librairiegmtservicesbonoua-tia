import Link from "next/link";
import { CheckCircle2, Clock } from "lucide-react";

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
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <p className="text-brand-navy">Commande introuvable.</p>
      </div>
    );
  }

  const isConfirmed = data.payment_status === "succeeded";

  return (
    <div className="mx-auto max-w-lg px-4 py-16 text-center">
      {isConfirmed ? (
        <CheckCircle2 className="mx-auto text-brand-green" size={56} />
      ) : (
        <Clock className="mx-auto text-brand-gold" size={56} />
      )}

      <h1 className="mt-4 text-2xl font-bold text-brand-navy">
        {isConfirmed ? "Paiement confirmé" : "Paiement en cours de confirmation"}
      </h1>
      <p className="mt-2 text-black/60">
        Commande <span className="font-semibold text-brand-navy">{data.order_number}</span> —{" "}
        {formatXOF(data.total_amount)}
      </p>
      {!isConfirmed && (
        <p className="mt-2 text-sm text-black/50">
          Wave confirme le paiement en quelques instants. Rafraîchissez cette page si besoin.
        </p>
      )}

      <Link
        href="/"
        className="mt-8 inline-block rounded-full bg-brand-green px-6 py-3 text-sm font-bold text-white"
      >
        Retour à la boutique
      </Link>
    </div>
  );
}
