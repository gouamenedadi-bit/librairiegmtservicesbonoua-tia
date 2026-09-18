import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";

const MAX_TIMESTAMP_SKEW_SECONDS = 5 * 60;

/**
 * Verifies a `Wave-Signature: t=<unix_ts>,v1=<hmac_sha256_hex>` header against
 * the RAW request body (must be read via `request.text()` before any JSON
 * parsing) using the webhook signing secret from the Wave dashboard.
 */
export function verifyWaveSignature(params: {
  signatureHeader: string | null;
  rawBody: string;
  secret: string;
}): boolean {
  const { signatureHeader, rawBody, secret } = params;
  if (!signatureHeader) return false;

  const parts = Object.fromEntries(
    signatureHeader.split(",").map((part) => {
      const [key, value] = part.split("=");
      return [key, value];
    }),
  );

  const timestamp = parts.t;
  const providedSignature = parts.v1;
  if (!timestamp || !providedSignature) return false;

  const skew = Math.abs(Date.now() / 1000 - Number(timestamp));
  if (!Number.isFinite(skew) || skew > MAX_TIMESTAMP_SKEW_SECONDS) return false;

  const expectedSignature = createHmac("sha256", secret)
    .update(`${timestamp}${rawBody}`)
    .digest("hex");

  const expected = Buffer.from(expectedSignature, "utf8");
  const provided = Buffer.from(providedSignature, "utf8");
  if (expected.length !== provided.length) return false;

  return timingSafeEqual(expected, provided);
}
