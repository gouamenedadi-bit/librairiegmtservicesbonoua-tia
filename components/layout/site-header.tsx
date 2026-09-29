"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ChevronDown, Menu, Phone, Search, User, X } from "lucide-react";

import { CartSummary } from "@/components/cart/cart-summary";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { MegaMenu } from "@/components/layout/mega-menu";
import { useTranslations } from "@/lib/i18n/locale-provider";
import { getWhatsAppDisplayNumber, getWhatsAppLink } from "@/lib/whatsapp";

type NavCategory = { name: string; slug: string };

function MobileCategoryGroup({
  title,
  href,
  items,
  onNavigate,
}: {
  title: string;
  href: string;
  items: NavCategory[];
  onNavigate: () => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <li>
      <div className="flex items-center rounded-lg transition-all duration-200 hover:translate-x-1 hover:bg-brand-navy/5">
        <Link
          href={href}
          onClick={onNavigate}
          className="flex-1 px-3 py-2 text-sm font-medium text-brand-navy hover:text-brand-green"
        >
          {title}
        </Link>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label={title}
          className="p-2 text-brand-navy/60"
        >
          <ChevronDown size={16} className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
        </button>
      </div>
      {open && (
        <ul className="ml-3 space-y-0.5 border-l-2 border-brand-green/20 pl-3">
          {items.map((item) => (
            <li key={item.slug}>
              <Link
                href={`/categorie/${item.slug}`}
                onClick={onNavigate}
                className="block rounded-lg px-3 py-1.5 text-[13px] text-brand-navy/70 transition-all duration-200 hover:translate-x-1 hover:bg-brand-navy/5 hover:text-brand-green"
              >
                {item.name}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </li>
  );
}

export function SiteHeader({
  librairie,
  papeterie,
}: {
  librairie: NavCategory[];
  papeterie: NavCategory[];
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const dict = useTranslations();

  const whatsappDisplayNumber = getWhatsAppDisplayNumber();
  const whatsappLink = getWhatsAppLink();

  return (
    <header className="sticky top-0 z-40 border-b border-black/5 bg-white/95 shadow-[0_8px_24px_-6px_rgba(255,222,89,0.55)] backdrop-blur">
      {/* Top utility bar */}
      <div className="hidden border-b border-black/5 bg-brand-navy/[0.03] sm:block">
        <div className="mx-auto flex h-9 max-w-6xl items-center justify-between px-4">
          <span className="text-xs text-brand-navy/60">{dict.nav.welcome}</span>
          <LanguageSwitcher />
        </div>
      </div>

      {/* Main bar */}
      <div className="mx-auto flex h-20 max-w-6xl items-center gap-4 px-4">
        <button
          type="button"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label={menuOpen ? dict.nav.closeMenu : dict.nav.openMenu}
          className="rounded-lg p-2 text-brand-navy hover:bg-brand-navy/5 md:hidden"
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>

        <Link href="/" className="flex items-center gap-2 shrink-0">
          <Image src="/brand/logo.png" alt="TIA Librairie" width={44} height={44} priority />
          <span className="hidden text-sm font-bold uppercase tracking-wide text-brand-navy sm:block">
            TIA Librairie
            <span className="block text-[10px] font-medium tracking-widest text-brand-green">
              GMT Services Bonoua
            </span>
          </span>
        </Link>

        <form action="/recherche" className="mx-auto hidden max-w-md flex-1 md:block">
          <div className="relative">
            <input
              type="search"
              name="q"
              placeholder={dict.search.placeholder}
              className="w-full rounded-full border border-black/10 bg-black/[0.015] py-2.5 pl-4 pr-11 text-sm outline-none transition-colors focus:border-brand-green focus:bg-white focus:ring-1 focus:ring-brand-green"
            />
            <button
              type="submit"
              aria-label={dict.nav.recherche}
              className="absolute right-1.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-brand-green text-white transition hover:bg-brand-green-dark"
            >
              <Search size={16} />
            </button>
          </div>
        </form>

        <div className="ml-auto flex items-center gap-2 sm:gap-4">
          {whatsappDisplayNumber && whatsappLink && (
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden items-center gap-2 lg:flex"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-green/10 text-brand-green">
                <Phone size={18} />
              </span>
              <span className="flex flex-col leading-tight">
                <span className="text-xs font-medium text-brand-navy/60">{dict.product.contactUs}</span>
                <span className="text-sm font-bold text-brand-navy">{whatsappDisplayNumber}</span>
              </span>
            </a>
          )}

          <Link
            href="/recherche"
            className="rounded-full p-2 text-brand-navy transition hover:bg-brand-navy/5 md:hidden"
            aria-label={dict.nav.recherche}
          >
            <Search size={20} />
          </Link>

          <Link href="/compte/inscription" className="hidden items-center gap-2 sm:flex">
            <span className="flex h-10 w-10 items-center justify-center rounded-full text-brand-navy transition hover:bg-brand-navy/5">
              <User size={18} />
            </span>
            <span className="hidden flex-col leading-tight lg:flex">
              <span className="text-xs font-medium text-brand-navy/60">{dict.nav.account}</span>
              <span className="text-sm font-bold text-brand-navy">{dict.footer.inscription}</span>
            </span>
          </Link>

          <Link href="/panier" aria-label={dict.nav.panier}>
            <CartSummary />
          </Link>
        </div>
      </div>

      {/* Category bar — sticky (it's inside <header>), and the dropdown
          panels are positioned relative to this <nav> so they stay put no
          matter how far the page has scrolled. Centered per user request:
          justify-center instead of the old left-aligned row. */}
      <nav className="relative hidden border-t border-black/5 md:block">
        <div className="mx-auto flex h-11 max-w-6xl items-center justify-center gap-10 px-4">
          <Link
            href="/"
            className="text-base font-semibold text-brand-navy transition-all duration-200 hover:scale-105 hover:text-brand-green"
          >
            {dict.category.breadcrumbHome}
          </Link>
          <MegaMenu label={dict.nav.librairie} href="/categorie/librairie-litterature" items={librairie} />
          <MegaMenu label={dict.nav.papeterie} href="/categorie/papeterie-bureau" items={papeterie} />
          <Link
            href="/recherche"
            className="text-base font-semibold text-brand-navy transition-all duration-200 hover:scale-105 hover:text-brand-green"
          >
            {dict.nav.recherche}
          </Link>
          <Link
            href="/compte/avis"
            className="text-base font-semibold text-brand-navy transition-all duration-200 hover:scale-105 hover:text-brand-green"
          >
            {dict.nav.avis}
          </Link>
        </div>
      </nav>

      {menuOpen && (
        <nav className="border-t border-black/5 bg-white px-4 py-3 md:hidden">
          <ul className="space-y-1">
            <li>
              <Link
                href="/"
                onClick={() => setMenuOpen(false)}
                className="block rounded-lg px-3 py-2 text-sm font-medium text-brand-navy transition-all duration-200 hover:translate-x-1 hover:bg-brand-navy/5 hover:text-brand-green"
              >
                {dict.category.breadcrumbHome}
              </Link>
            </li>
            <MobileCategoryGroup
              title={dict.nav.librairie}
              href="/categorie/librairie-litterature"
              items={librairie}
              onNavigate={() => setMenuOpen(false)}
            />
            <MobileCategoryGroup
              title={dict.nav.papeterie}
              href="/categorie/papeterie-bureau"
              items={papeterie}
              onNavigate={() => setMenuOpen(false)}
            />
            <li>
              <Link
                href="/recherche"
                onClick={() => setMenuOpen(false)}
                className="block rounded-lg px-3 py-2 text-sm font-medium text-brand-navy transition-all duration-200 hover:translate-x-1 hover:bg-brand-navy/5 hover:text-brand-green"
              >
                {dict.nav.recherche}
              </Link>
            </li>
            <li>
              <Link
                href="/compte/avis"
                onClick={() => setMenuOpen(false)}
                className="block rounded-lg px-3 py-2 text-sm font-medium text-brand-navy transition-all duration-200 hover:translate-x-1 hover:bg-brand-navy/5 hover:text-brand-green"
              >
                {dict.nav.avis}
              </Link>
            </li>
            <li>
              <Link
                href="/compte/inscription"
                onClick={() => setMenuOpen(false)}
                className="block rounded-lg px-3 py-2 text-sm font-medium text-brand-navy transition-all duration-200 hover:translate-x-1 hover:bg-brand-navy/5 hover:text-brand-green"
              >
                {dict.nav.account}
              </Link>
            </li>
            {whatsappDisplayNumber && whatsappLink && (
              <li>
                <a
                  href={whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-brand-green transition-all duration-200 hover:translate-x-1 hover:bg-brand-green/5"
                >
                  <Phone size={16} />
                  {whatsappDisplayNumber}
                </a>
              </li>
            )}
          </ul>
        </nav>
      )}
    </header>
  );
}
