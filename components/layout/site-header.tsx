import Image from "next/image";
import Link from "next/link";
import { Search, ShoppingCart } from "lucide-react";

import { CartBadge } from "@/components/cart/cart-badge";

const NAV_LINKS = [
  { href: "/categorie/librairie", label: "Librairie" },
  { href: "/categorie/papeterie", label: "Papeterie" },
  { href: "/categorie/scolaire", label: "Scolaire" },
  { href: "/recherche", label: "Recherche" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-black/5 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <Image src="/brand/logo.png" alt="TIA Librairie" width={40} height={40} priority />
          <span className="hidden text-sm font-bold uppercase tracking-wide text-brand-navy sm:block">
            TIA Librairie
            <span className="block text-[10px] font-medium tracking-widest text-brand-green">
              GMT Services Bonoua
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-brand-navy/80 transition hover:text-brand-green"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/recherche"
            className="rounded-full p-2 text-brand-navy transition hover:bg-brand-navy/5 md:hidden"
            aria-label="Recherche"
          >
            <Search size={20} />
          </Link>
          <Link
            href="/panier"
            className="relative rounded-full p-2 text-brand-navy transition hover:bg-brand-navy/5"
            aria-label="Panier"
          >
            <ShoppingCart size={20} />
            <CartBadge />
          </Link>
        </div>
      </div>
    </header>
  );
}
