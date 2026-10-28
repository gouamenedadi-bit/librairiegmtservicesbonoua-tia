// Shared Tailwind class strings for the admin (cards, list tables) — the
// admin equivalent of lib/ui/form-styles.ts.
//
// Calm by design: white cards on a pale navy-tinted page, thin navy borders
// and a soft two-layer shadow. Still lifted off the page (the user asked for
// visible depth on admin cards), just quieter than the old shadow-xl.

export const ADMIN_CARD =
  "rounded-2xl border border-brand-navy/[0.08] bg-white shadow-[0_1px_2px_rgba(24,43,92,0.05),0_12px_32px_-18px_rgba(24,43,92,0.22)]";

export const TABLE_CONTAINER = `mt-6 animate-fade-in-up overflow-x-auto ${ADMIN_CARD}`;

export const TABLE_HEAD =
  "border-b border-brand-navy/[0.08] bg-brand-navy/[0.025] text-xs font-semibold uppercase tracking-wide text-brand-navy/50";

export const TABLE_ROW = "transition-colors duration-150 hover:bg-brand-navy/[0.025]";

export const ICON_BUTTON = "rounded-full p-2 transition-colors duration-200";
