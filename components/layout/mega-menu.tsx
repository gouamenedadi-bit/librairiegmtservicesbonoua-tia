"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { ChevronDown } from "lucide-react";

import { CategoryIcon } from "@/lib/catalog/category-icons";

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
 */
export function MegaMenu({ label, href, items }: { label: string; href: string; items: MegaMenuItem[] }) {
  const [open, setOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  function openMenu() {
    clearTimeout(closeTimer.current);
    setOpen(true);
  }

  function scheduleClose() {
    closeTimer.current = setTimeout(() => setOpen(false), 150);
  }

  return (
    <div onMouseEnter={openMenu} onMouseLeave={scheduleClose}>
      <Link
        href={href}
        className="flex items-center gap-1 text-base font-semibold text-brand-navy transition-all duration-200 hover:scale-105 hover:text-brand-green"
      >
        {label}
        <ChevronDown size={14} className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </Link>

      {open && (
        <div className="absolute inset-x-0 top-full z-30 border-t border-black/5 bg-white shadow-xl animate-fade-in-down">
          <div className="mx-auto grid max-w-6xl grid-cols-2 gap-x-6 gap-y-1 px-4 py-6 sm:grid-cols-3 md:grid-cols-4">
            {items.map((item) => (
              <Link
                key={item.slug}
                href={`/categorie/${item.slug}`}
                className="group flex items-center gap-2.5 rounded-lg px-2 py-2 text-sm text-brand-navy/80 transition-all duration-200 hover:translate-x-1 hover:bg-brand-green/5 hover:text-brand-green"
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-brand-navy/5 text-brand-navy transition-colors group-hover:bg-brand-green group-hover:text-white">
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
