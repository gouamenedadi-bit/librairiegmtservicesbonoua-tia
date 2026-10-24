// Shared Tailwind class strings for every admin list/table page (categories,
// products, orders) — the table equivalent of lib/ui/form-styles.ts.

// shadow-xl (not shadow-sm) is deliberate — a real drop shadow gives these
// cards/tables a "lifted off the page" depth, not animation (the user
// explicitly asked for shadows, not motion). Applied consistently across
// every admin page via this one shared constant.
export const TABLE_CONTAINER =
  "mt-6 animate-fade-in-up overflow-x-auto rounded-3xl border border-black/5 bg-white shadow-xl";

export const TABLE_HEAD = "border-b border-black/5 bg-black/[0.02] text-xs uppercase tracking-wide text-black/40";

export const TABLE_ROW = "transition-colors duration-150 hover:bg-brand-green/[0.04]";

export const ICON_BUTTON = "rounded-full p-2 transition-all duration-200 hover:scale-110";
