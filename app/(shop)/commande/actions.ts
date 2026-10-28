"use server";

import { redirect } from "next/navigation";

import { createCheckoutSession } from "@/lib/wave/client";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { checkoutFormSchema } from "@/lib/validations/checkout";

export type CheckoutCartLine = { productId: string; quantity: number };

// On success this function calls `redirect()`, which throws internally and
// never returns — callers only ever observe the error case.
export type CheckoutResult = { error: string };

/**
 * The client cart is display-only. `create_order` (SQL, SECURITY DEFINER)
 * re-reads every price from `products` itself, so nothing here trusts the
 * amounts the browser sent — see supabase/migrations/0003_create_order_function.sql.
 */
export async function submitOrder(
  cartLines: CheckoutCartLine[],
  formValues: unknown,
): Promise<CheckoutResult> {
  const parsed = checkoutFormSchema.safeParse(formValues);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Formulaire invalide." };
  }

  if (cartLines.length === 0) {
    return { error: "Votre panier est vide." };
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .rpc("create_order", {
      payload: {
        guest_name: parsed.data.guestName,
        guest_phone: parsed.data.guestPhone,
        guest_address: parsed.data.guestAddress,
        items: cartLines.map((line) => ({ product_id: line.productId, quantity: line.quantity })),
      },
    })
    .single();

  if (error || !data) {
    if (error?.message.includes("out_of_stock")) {
      return { error: "Un article du panier est en rupture de stock." };
    }
    if (error?.message.includes("invalid_or_unpriced_product")) {
      return { error: "Un article du panier n'est plus disponible ou n'a pas de prix." };
    }
    if (error?.message.includes("too_many_pending_orders")) {
      return {
        error: "Plusieurs commandes non payées existent déjà pour ce numéro. Réessayez dans 45 minutes ou contactez-nous.",
      };
    }
    if (error?.message.includes("invalid_quantity") || error?.message.includes("too_many_items")) {
      return { error: "Quantité trop importante. Contactez-nous pour une commande en gros." };
    }
    return { error: "Impossible de créer la commande, veuillez réessayer." };
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL!;
  const admin = createAdminClient();

  let session: Awaited<ReturnType<typeof createCheckoutSession>>;
  try {
    session = await createCheckoutSession({
      amountXOF: data.total_amount,
      orderNumber: data.order_number,
      successUrl: `${siteUrl}/commande/${data.order_id}/confirmation`,
      errorUrl: `${siteUrl}/commande/${data.order_id}/echec`,
    });
  } catch {
    // No payment can ever reach this order — release the stock it reserved
    // right away instead of waiting for the 45-minute expiry (0013 migration).
    await admin.rpc("cancel_unpaid_order", { p_order_id: data.order_id });
    return { error: "Le paiement Wave est momentanément indisponible, veuillez réessayer." };
  }

  // RLS intentionally has no anon/authenticated UPDATE policy on `orders`
  // (see 0002_rls_policies.sql), so attaching the Wave session id — a value
  // we just received from Wave's own API, not from the client — requires the
  // service-role client rather than the guest-scoped one used for create_order.
  await admin
    .from("orders")
    .update({ wave_checkout_session_id: session.id })
    .eq("id", data.order_id);

  redirect(session.wave_launch_url);
}
