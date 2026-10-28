// Category-bar link styles shared by site-header.tsx and mega-menu.tsx.
// Condensed caps (the logo's lettering); the current section gets a thick
// underline in its page color — green for Librairie and the rest of the
// site, gold for Papeterie.

export const NAV_LINK =
  "flex items-center gap-1 border-b-[3px] pt-[3px] font-display text-lg font-bold uppercase tracking-wide text-brand-navy transition-colors hover:text-brand-green focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-navy";

export const NAV_IDLE = "border-transparent";

export const NAV_ACTIVE_GREEN = "border-brand-green";

export const NAV_ACTIVE_GOLD = "border-brand-gold";
