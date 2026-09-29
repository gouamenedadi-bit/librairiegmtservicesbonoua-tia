// Shared Tailwind class strings for every data-entry form in the app (admin
// product/category, login, customer signup, checkout) so they read as one
// consistent design instead of five components that each reinvented input
// styling slightly differently.

export const FORM_INPUT =
  "w-full rounded-xl border border-black/10 bg-black/[0.015] px-4 py-3 text-[15px] text-brand-navy outline-none transition-colors placeholder:text-black/30 focus:border-brand-green focus:bg-white focus:ring-2 focus:ring-brand-green/20";

export const FORM_LABEL = "flex items-center gap-1.5 text-sm font-semibold text-brand-navy";

export const FORM_HINT = "mt-2 text-xs text-black/40";

export const FORM_ERROR = "rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600";

export const FORM_BUTTON_PRIMARY =
  "flex items-center justify-center gap-2 rounded-full bg-brand-green px-7 py-3 text-sm font-bold text-white shadow-sm transition-all duration-200 hover:scale-[1.02] hover:bg-brand-green-dark hover:shadow-md disabled:pointer-events-none disabled:opacity-60";

export const FORM_BUTTON_SECONDARY =
  "rounded-full px-5 py-3 text-sm font-semibold text-black/50 transition hover:bg-black/5 hover:text-black/70";
