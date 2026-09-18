const XOF_FORMATTER = new Intl.NumberFormat("fr-FR", {
  maximumFractionDigits: 0,
});

/** 12500 -> "12 500 FCFA" (XOF has no decimal subdivision in practice). */
export function formatXOF(amount: number): string {
  return `${XOF_FORMATTER.format(amount)} FCFA`;
}
