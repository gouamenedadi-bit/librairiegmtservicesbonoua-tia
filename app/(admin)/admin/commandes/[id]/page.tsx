import { notFound } from "next/navigation";

import { getOrderForAdmin } from "@/lib/admin/queries";
import { PAYMENT_BADGE_CLASS, PAYMENT_LABELS } from "@/lib/admin/order-labels";
import { formatXOF } from "@/lib/utils/format-xof";
import { ADMIN_CARD } from "@/lib/ui/table-styles";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
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
      <AdminPageHeader
        back={{ href: "/admin/commandes", label: "Retour aux commandes" }}
        title={order.order_number}
        description={DATE_FORMATTER.format(new Date(order.created_at))}
        actions={
          <>
            <span className={`rounded-full px-3 py-1.5 text-sm font-semibold ${PAYMENT_BADGE_CLASS[order.payment_status]}`}>
              {PAYMENT_LABELS[order.payment_status]}
            </span>
            <OrderStatusSelect orderId={order.id} status={order.fulfillment_status} />
          </>
        }
      />

      <div className="mt-6 grid gap-6 lg:grid-cols-3 lg:items-start">
        <section className={`animate-fade-in-up p-5 sm:p-6 lg:col-span-2 ${ADMIN_CARD}`}>
          <h2 className="font-semibold text-brand-navy">Articles</h2>
          <ul className="mt-3 divide-y divide-brand-navy/[0.06]">
            {items.map((item) => (
              <li key={item.id} className="flex items-center justify-between gap-4 py-3 text-sm">
                <div className="min-w-0">
                  <p className="font-medium text-brand-navy">{item.name_snapshot}</p>
                  <p className="text-xs text-brand-navy/45">
                    {item.sku_snapshot} · {item.quantity} × {formatXOF(item.unit_price_snapshot)}
                  </p>
                </div>
                <p className="shrink-0 font-semibold text-brand-navy">{formatXOF(item.subtotal)}</p>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex items-baseline justify-between border-t border-brand-navy/[0.08] pt-4">
            <p className="font-semibold text-brand-navy">Total</p>
            <p className="font-display text-3xl font-bold text-brand-navy">{formatXOF(order.total_amount)}</p>
          </div>
        </section>

        <section style={{ animationDelay: "60ms" }} className={`animate-fade-in-up p-5 sm:p-6 ${ADMIN_CARD}`}>
          <h2 className="font-semibold text-brand-navy">Client</h2>
          <dl className="mt-4 space-y-4 text-sm">
            <div>
              <dt className="text-xs text-brand-navy/45">Nom</dt>
              <dd className="font-medium text-brand-navy">{order.guest_name}</dd>
            </div>
            <div>
              <dt className="text-xs text-brand-navy/45">Téléphone</dt>
              <dd>
                <a href={`tel:${order.guest_phone.replace(/\s/g, "")}`} className="font-medium text-brand-navy hover:text-brand-green">
                  {order.guest_phone}
                </a>
              </dd>
            </div>
            <div>
              <dt className="text-xs text-brand-navy/45">Adresse de livraison</dt>
              <dd className="font-medium text-brand-navy">{order.guest_address}</dd>
            </div>
            <div>
              <dt className="text-xs text-brand-navy/45">Moyen de paiement</dt>
              <dd className="font-medium capitalize text-brand-navy">{order.payment_method}</dd>
            </div>
          </dl>
        </section>
      </div>
    </div>
  );
}
