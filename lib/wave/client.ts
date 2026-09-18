import "server-only";

const WAVE_API_BASE = "https://api.wave.com/v1";

type CheckoutSession = {
  id: string;
  wave_launch_url: string;
  checkout_status: "open" | "complete" | "expired";
  payment_status: "processing" | "cancelled" | "succeeded";
  client_reference: string | null;
};

/**
 * Creates a Wave Checkout session. Amount is XOF, sent as a string per the
 * Wave API (docs.wave.com/checkout) — never send a JSON number, Wave expects text.
 */
export async function createCheckoutSession(params: {
  amountXOF: number;
  orderNumber: string;
  successUrl: string;
  errorUrl: string;
}): Promise<CheckoutSession> {
  const response = await fetch(`${WAVE_API_BASE}/checkout/sessions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.WAVE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount: String(params.amountXOF),
      currency: "XOF",
      client_reference: params.orderNumber,
      success_url: params.successUrl,
      error_url: params.errorUrl,
    }),
  });

  if (!response.ok) {
    throw new Error(`wave_checkout_session_failed: ${response.status} ${await response.text()}`);
  }

  return response.json();
}

export async function getCheckoutSession(sessionId: string): Promise<CheckoutSession> {
  const response = await fetch(`${WAVE_API_BASE}/checkout/sessions/${sessionId}`, {
    headers: { Authorization: `Bearer ${process.env.WAVE_API_KEY}` },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`wave_get_session_failed: ${response.status} ${await response.text()}`);
  }

  return response.json();
}
