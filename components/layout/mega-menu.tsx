"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { ChevronDown } from "lucide-react";

import { CategoryIcon } from "@/lib/catalog/category-icons";
import { NAV_ACTIVE_GOLD, NAV_ACTIVE_GREEN, NAV_IDLE, NAV_LINK } from "@/components/layout/nav-styles";

type MegaMenuItem = { name: string; slug: string };

/**
 * Dropdown panel for a top-level nav item (Librairie / Papeterie), listing
 * every subcategory. Lives inside the *sticky* header's category bar, so
 * unlike the old page-level CategorySidebar it never scrolls out of view —
 * that's the whole point (see site-header.tsx for why).
 *
 * Positioned `absolute inset-x-0 top-full` relative to the parent <nav>
 * (not to this trigger), so the panel is always full-width and centered
 * under the header regardless of which item is hovered — no hardcoded
 * header height needed, it just rides along with the sticky bar.
 *
 * `accent` is the department's page color from the homepage's open book:
 * green for Librairie, gold for Papeterie.
 */
export function MegaMenu({
  label,
  href,
  items,
  accent,
  isActive,
  seeAllLabel,
}: {
  label: string;
  href: string;
  items: MegaMenuItem[];
  accent: "green" | "gold";
  isActive: boolean;
  seeAllLabel: string;
}) {
  const [open, setOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  function openMenu() {
    clearTimeout(closeTimer.current);
    setOpen(true);
  }

  function scheduleClose() {
    closeTimer.current = setTimeout(() => setOpen(false), 150);
  }

  const isGreen = accent === "green";
  const underline = isActive ? (isGreen ? NAV_ACTIVE_GREEN : NAV_ACTIVE_GOLD) : NAV_IDLE;

  return (
    <div onMouseEnter={openMenu} onMouseLeave={scheduleClose} className="flex">
      <Link href={href} aria-current={isActive ? "page" : undefined} className={`${NAV_LINK} ${underline}`}>
        {label}
        <ChevronDown size={14} className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </Link>

      {open && (
        <div
          className={`absolute inset-x-0 top-full z-30 border-t-4 bg-white shadow-xl animate-fade-in-down ${isGreen ? "border-brand-green" : "border-brand-gold"}`}
        >
          <div className="mx-auto flex max-w-6xl items-baseline justify-between px-4 pt-5">
            <p className="font-display text-2xl font-extrabold uppercase text-brand-navy">{label}</p>
            <Link href="/#rayons" className="text-xs font-bold text-brand-navy/60 hover:text-brand-green">
              {seeAllLabel} →
            </Link>
          </div>
          <div className="mx-auto grid max-w-6xl grid-cols-2 gap-x-6 gap-y-1 px-4 pb-6 pt-3 sm:grid-cols-3 md:grid-cols-4">
            {items.map((item) => (
              <Link
                key={item.slug}
                href={`/categorie/${item.slug}`}
                className="group flex items-center gap-2.5 rounded-lg px-2 py-2 text-sm text-brand-navy/80 transition-all duration-200 hover:translate-x-1 hover:bg-brand-green/5 hover:text-brand-green"
              >
                <span
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md transition-colors ${
                    isGreen
                      ? "bg-brand-green/10 text-brand-green group-hover:bg-brand-green group-hover:text-white"
                      : "bg-brand-gold/30 text-brand-navy group-hover:bg-brand-gold"
                  }`}
                >
                  <CategoryIcon slug={item.slug} size={14} />
                </span>
                <span className="line-clamp-1">{item.name}</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
