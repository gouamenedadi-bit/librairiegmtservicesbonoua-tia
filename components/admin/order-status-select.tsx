"use client";

import { useTransition } from "react";

import { updateFulfillmentStatus } from "@/app/(admin)/admin/commandes/actions";
import { FULFILLMENT_LABELS } from "@/lib/admin/order-labels";
import type { FulfillmentStatus } from "@/types/database.types";

export function OrderStatusSelect({ orderId, status }: { orderId: string; status: FulfillmentStatus }) {
  const [isPending, startTransition] = useTransition();

  return (
    <select
      defaultValue={status}
      disabled={isPending}
      onChange={(e) => {
        const status = e.target.value;
        startTransition(async () => {
          await updateFulfillmentStatus(orderId, status);
        });
      }}
      aria-label="Statut de la commande"
      className="rounded-lg border border-brand-navy/15 bg-white px-3 py-1.5 text-xs font-semibold text-brand-navy outline-none transition-colors focus:border-brand-navy focus:ring-2 focus:ring-brand-navy/10 disabled:opacity-60"
    >
      {(Object.entries(FULFILLMENT_LABELS) as [FulfillmentStatus, string][]).map(([value, label]) => (
        <option key={value} value={value}>
          {label}
        </option>
      ))}
    </select>
  );
}
