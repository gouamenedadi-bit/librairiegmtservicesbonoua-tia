import type { FulfillmentStatus, PaymentStatus } from "@/types/database.types";

export const FULFILLMENT_LABELS: Record<FulfillmentStatus, string> = {
  received: "Reçue",
  preparing: "En préparation",
  ready: "Prête",
  delivered: "Livrée",
  cancelled: "Annulée",
};

export const PAYMENT_LABELS: Record<PaymentStatus, string> = {
  pending: "En attente",
  processing: "En cours",
  succeeded: "Payée",
  failed: "Échouée",
  cancelled: "Annulée",
};

export const PAYMENT_BADGE_CLASS: Record<PaymentStatus, string> = {
  pending: "bg-brand-gold/20 text-brand-gold",
  processing: "bg-blue-100 text-blue-700",
  succeeded: "bg-green-100 text-green-700",
  failed: "bg-red-100 text-red-600",
  cancelled: "bg-black/10 text-black/50",
};
