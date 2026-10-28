import Link from "next/link";
import { ChevronRight, ShoppingCart } from "lucide-react";

import { getAdminOrders } from "@/lib/admin/queries";
import { PAYMENT_BADGE_CLASS, PAYMENT_LABELS } from "@/lib/admin/order-labels";
import { formatXOF } from "@/lib/utils/format-xof";
import { ADMIN_CARD, TABLE_CONTAINER, TABLE_HEAD, TABLE_ROW } from "@/lib/ui/table-styles";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { OrderStatusSelect } from "@/components/admin/order-status-select";

const DATE_FORMATTER = new Intl.DateTimeFormat("fr-FR", { dateStyle: "short", timeStyle: "short" });

export default async function AdminOrdersPage() {
  const orders = await getAdminOrders();

  return (
    <div>
      <AdminPageHeader sticky title="Commandes" description={`${orders.length} commande(s) récente(s)`} />

      {orders.length === 0 ? (
        <div className={`mt-6 flex flex-col items-center gap-2 px-5 py-16 text-center ${ADMIN_CARD}`}>
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-navy/[0.06] text-brand-navy/40">
            <ShoppingCart size={22} />
          </span>
          <p className="mt-2 font-semibold text-brand-navy">Aucune commande pour le moment</p>
          <p className="max-w-xs text-sm text-brand-navy/55">
            Les commandes passées sur le site apparaîtront ici dès qu&apos;un client validera un panier.
          </p>
        </div>
      ) : (
        <>
          {/* Phones: one card per order. */}
          <ul className={`mt-6 divide-y divide-brand-navy/[0.08] md:hidden ${ADMIN_CARD}`}>
            {orders.map((order) => (
              <li key={order.id} className="p-4">
                <Link href={`/admin/commandes/${order.id}`} className="flex items-start justify-between gap-3">
                  <span className="min-w-0">
                    <span className="block font-semibold text-brand-navy">{order.order_number}</span>
                    <span className="block truncate text-sm text-brand-navy/60">{order.guest_name}</span>
                    <span className="block text-xs text-brand-navy/40">{DATE_FORMATTER.format(new Date(order.created_at))}</span>
                  </span>
                  <span className="flex shrink-0 items-center gap-1 font-semibold text-brand-navy">
                    {formatXOF(order.total_amount)}
                    <ChevronRight size={16} className="text-brand-navy/30" />
                  </span>
                </Link>
                <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${PAYMENT_BADGE_CLASS[order.payment_status]}`}>
                    {PAYMENT_LABELS[order.payment_status]}
                  </span>
                  <OrderStatusSelect orderId={order.id} status={order.fulfillment_status} />
                </div>
              </li>
            ))}
          </ul>

          <div className={`hidden md:block ${TABLE_CONTAINER}`}>
            <table className="w-full text-left text-sm">
              <thead className={TABLE_HEAD}>
                <tr>
                  <th className="px-5 py-3">Commande</th>
                  <th className="px-5 py-3">Client</th>
                  <th className="px-5 py-3">Total</th>
                  <th className="px-5 py-3">Paiement</th>
                  <th className="px-5 py-3">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-navy/[0.06]">
                {orders.map((order) => (
                  <tr key={order.id} className={TABLE_ROW}>
                    <td className="px-5 py-3.5">
                      <Link
                        href={`/admin/commandes/${order.id}`}
                        className="font-semibold text-brand-navy transition hover:text-brand-green"
                      >
                        {order.order_number}
                      </Link>
                      <p className="text-xs text-brand-navy/40">{DATE_FORMATTER.format(new Date(order.created_at))}</p>
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="text-brand-navy">{order.guest_name}</p>
                      <p className="text-xs text-brand-navy/40">{order.guest_phone}</p>
                    </td>
                    <td className="px-5 py-3.5 font-semibold text-brand-navy">{formatXOF(order.total_amount)}</td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${PAYMENT_BADGE_CLASS[order.payment_status]}`}
                      >
                        {PAYMENT_LABELS[order.payment_status]}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <OrderStatusSelect orderId={order.id} status={order.fulfillment_status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
