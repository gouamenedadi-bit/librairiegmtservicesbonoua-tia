import { NextResponse } from "next/server";

import { createAdminClient } from "@/lib/supabase/admin";
import { verifyWaveSignature } from "@/lib/wave/verify-signature";

// Route Handler (not a Server Action): Wave calls this as a plain HTTPS
// endpoint. Must read the RAW body before any JSON parsing, or signature
// verification will fail.
export async function POST(request: Request) {
  const rawBody = await request.text();

  const isValid = verifyWaveSignature({
    signatureHeader: request.headers.get("Wave-Signature"),
    rawBody,
    secret: process.env.WAVE_WEBHOOK_SECRET!,
  });

  if (!isValid) {
    return NextResponse.json({ error: "invalid_signature" }, { status: 401 });
  }

  const event = JSON.parse(rawBody) as {
    id: string;
    type: string;
    data: { id: string; transaction_id?: string };
  };

  const supabase = createAdminClient();

  // Wave retries undelivered (non-2xx) webhooks for up to 3 days, so the same
  // event id can arrive more than once — dedupe before acting on it.
  const { error: insertError } = await supabase
    .from("processed_webhook_events")
    .insert({ event_id: event.id });

  if (insertError) {
    // Unique violation = already processed; anything else is a real failure.
    if (insertError.code === "23505") {
      return NextResponse.json({ received: true, duplicate: true });
    }
    return NextResponse.json({ error: "storage_error" }, { status: 500 });
  }

  if (event.type === "checkout.session.completed") {
    const { error: markPaidError } = await supabase.rpc("mark_order_paid", {
      p_wave_checkout_session_id: event.data.id,
      p_wave_transaction_id: event.data.transaction_id ?? event.data.id,
    });

    if (markPaidError) {
      // Don't leave this event_id recorded as "processed" if we failed to
      // act on it — otherwise a transient DB error here would permanently
      // strand the order at payment_status='pending' despite the charge
      // having succeeded, since Wave would never redeliver an event we
      // already told it we handled.
      await supabase.from("processed_webhook_events").delete().eq("event_id", event.id);
      return NextResponse.json({ error: "mark_paid_failed" }, { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}
