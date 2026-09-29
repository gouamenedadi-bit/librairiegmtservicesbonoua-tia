/**
 * Reads NEXT_PUBLIC_WHATSAPP_NUMBER (international format, digits only or
 * with a leading "+", e.g. "+2250700000000"). Returns null when unset so
 * callers can hide WhatsApp contact points instead of linking to a broken
 * "https://wa.me/" with no number.
 */
export function getWhatsAppNumber(): string | null {
  const raw = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;
  const digits = raw?.replace(/[^\d]/g, "");
  return digits && digits.length >= 8 ? digits : null;
}

export function getWhatsAppLink(message?: string): string | null {
  const number = getWhatsAppNumber();
  if (!number) return null;
  const base = `https://wa.me/${number}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

/** "2250700000000" -> "+225 07 00 00 00 00" (country code, then pairs). */
export function getWhatsAppDisplayNumber(): string | null {
  const number = getWhatsAppNumber();
  if (!number) return null;
  const countryCodeLength = number.length > 10 ? number.length - 10 : 3;
  const countryCode = number.slice(0, countryCodeLength);
  const rest = number.slice(countryCodeLength).match(/.{1,2}/g)?.join(" ") ?? "";
  return `+${countryCode} ${rest}`.trim();
}
