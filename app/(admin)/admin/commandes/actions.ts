"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/admin/require-admin";
import type { FulfillmentStatus } from "@/types/database.types";

const VALID_STATUSES: FulfillmentStatus[] = ["received", "preparing", "ready", "delivered", "cancelled"];

export async function updateFulfillmentStatus(orderId: string, status: string) {
  if (!(await requireAdmin())) return { error: "Non autorisé." };
  if (!VALID_STATUSES.includes(status as FulfillmentStatus)) return { error: "Statut invalide." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("orders")
    .update({ fulfillment_status: status as FulfillmentStatus })
    .eq("id", orderId);

  if (error) return { error: "Impossible de mettre à jour le statut." };

  revalidatePath("/admin/commandes");
  revalidatePath(`/admin/commandes/${orderId}`);
  return { ok: true } as const;
}
