import Link from "next/link";
import { ShoppingCart } from "lucide-react";

import { getAdminOrders } from "@/lib/admin/queries";
import { PAYMENT_BADGE_CLASS, PAYMENT_LABELS } from "@/lib/admin/order-labels";
import { formatXOF } from "@/lib/utils/format-xof";
import { TABLE_CONTAINER, TABLE_HEAD, TABLE_ROW } from "@/lib/ui/table-styles";
import { OrderStatusSelect } from "@/components/admin/order-status-select";

const DATE_FORMATTER = new Intl.DateTimeFormat("fr-FR", { dateStyle: "short", timeStyle: "short" });

export default async function AdminOrdersPage() {
  const orders = await getAdminOrders();

  return (
    <div>
      <div className="sticky top-0 z-10 -mx-4 -mt-4 border-b border-black/5 bg-white px-4 pt-4 pb-5 sm:-mx-6 sm:-mt-6 sm:px-6 sm:pt-6 lg:-mx-8 lg:-mt-8 lg:px-8 lg:pt-8">
        <h1 className="text-2xl font-bold text-brand-navy">Commandes</h1>
        <p className="mt-1 text-sm text-black/60">{orders.length} commande(s) récente(s)</p>
      </div>

      {orders.length === 0 ? (
        <div className="mt-6 flex flex-col items-center gap-2 rounded-3xl border-2 border-dashed border-black/10 bg-white px-5 py-16 text-center shadow-sm">
          <ShoppingCart size={28} className="text-black/15" />
          <p className="font-semibold text-brand-navy">Aucune commande pour le moment.</p>
          <p className="max-w-xs text-sm text-black/50">
            Les commandes passées sur le site apparaîtront ici dès qu&apos;un client validera un panier.
          </p>
        </div>
      ) : (
        <div className={TABLE_CONTAINER}>
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className={TABLE_HEAD}>
              <tr>
                <th className="px-5 py-3.5 font-medium">Commande</th>
                <th className="px-5 py-3.5 font-medium">Client</th>
                <th className="px-5 py-3.5 font-medium">Total</th>
                <th className="px-5 py-3.5 font-medium">Paiement</th>
                <th className="px-5 py-3.5 font-medium">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {orders.map((order) => (
                <tr key={order.id} className={`${TABLE_ROW} even:bg-black/[0.015]`}>
                  <td className="px-5 py-3.5">
                    <Link
                      href={`/admin/commandes/${order.id}`}
                      className="font-semibold text-brand-navy transition hover:text-brand-green"
                    >
                      {order.order_number}
                    </Link>
                    <p className="text-xs text-black/40">{DATE_FORMATTER.format(new Date(order.created_at))}</p>
                  </td>
                  <td className="px-5 py-3.5">
                    <p className="text-brand-navy">{order.guest_name}</p>
                    <p className="text-xs text-black/40">{order.guest_phone}</p>
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
      )}
    </div>
  );
}
