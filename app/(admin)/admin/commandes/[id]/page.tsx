import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";

import { getOrderForAdmin } from "@/lib/admin/queries";
import { PAYMENT_BADGE_CLASS, PAYMENT_LABELS } from "@/lib/admin/order-labels";
import { formatXOF } from "@/lib/utils/format-xof";
import { OrderStatusSelect } from "@/components/admin/order-status-select";

const DATE_FORMATTER = new Intl.DateTimeFormat("fr-FR", { dateStyle: "long", timeStyle: "short" });

export default async function AdminOrderDetailPage({
  params,
}: PageProps<"/admin/commandes/[id]">) {
  const { id } = await params;
  const result = await getOrderForAdmin(id);
  if (!result) notFound();

  const { order, items } = result;

  return (
    <div>
      <Link href="/admin/commandes" className="flex items-center gap-1 text-sm text-black/50 hover:text-brand-navy">
        <ChevronLeft size={16} />
        Retour aux commandes
      </Link>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-brand-navy">{order.order_number}</h1>
          <p className="mt-1 text-sm text-black/60">{DATE_FORMATTER.format(new Date(order.created_at))}</p>
        </div>
        <div className="flex items-center gap-3">
          <span className={`rounded-full px-3 py-1.5 text-sm font-semibold ${PAYMENT_BADGE_CLASS[order.payment_status]}`}>
            {PAYMENT_LABELS[order.payment_status]}
          </span>
          <OrderStatusSelect orderId={order.id} status={order.fulfillment_status} />
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="animate-fade-in-up rounded-3xl border border-black/5 bg-white p-6 shadow-xl lg:col-span-2">
          <h2 className="text-sm font-bold uppercase tracking-wide text-black/40">Articles</h2>
          <div className="mt-3 divide-y divide-black/5">
            {items.map((item) => (
              <div key={item.id} className="flex items-center justify-between py-3 text-sm">
                <div>
                  <p className="font-medium text-brand-navy">{item.name_snapshot}</p>
                  <p className="text-xs text-black/40">
                    {item.sku_snapshot} · {item.quantity} × {formatXOF(item.unit_price_snapshot)}
                  </p>
                </div>
                <p className="font-semibold text-brand-navy">{formatXOF(item.subtotal)}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-center justify-between border-t border-black/5 pt-4">
            <p className="font-bold text-brand-navy">Total</p>
            <p className="text-lg font-extrabold text-brand-navy">{formatXOF(order.total_amount)}</p>
          </div>
        </div>

        <div
          style={{ animationDelay: "80ms" }}
          className="animate-fade-in-up rounded-3xl border border-black/5 bg-white p-6 shadow-xl"
        >
          <h2 className="text-sm font-bold uppercase tracking-wide text-black/40">Client</h2>
          <dl className="mt-3 space-y-3 text-sm">
            <div>
              <dt className="text-xs text-black/40">Nom</dt>
              <dd className="font-medium text-brand-navy">{order.guest_name}</dd>
            </div>
            <div>
              <dt className="text-xs text-black/40">Téléphone</dt>
              <dd className="font-medium text-brand-navy">{order.guest_phone}</dd>
            </div>
            <div>
              <dt className="text-xs text-black/40">Adresse de livraison</dt>
              <dd className="font-medium text-brand-navy">{order.guest_address}</dd>
            </div>
            <div>
              <dt className="text-xs text-black/40">Moyen de paiement</dt>
              <dd className="font-medium capitalize text-brand-navy">{order.payment_method}</dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}
