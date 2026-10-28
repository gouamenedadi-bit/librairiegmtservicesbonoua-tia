"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ExternalLink, FolderTree, LayoutGrid, LogOut, Menu, Package, ShoppingCart, Users, X } from "lucide-react";

import { signOut } from "@/app/login/actions";

const NAV_LINKS = [
  { href: "/admin", label: "Tableau de bord", icon: LayoutGrid },
  { href: "/admin/produits", label: "Produits", icon: Package },
  { href: "/admin/categories", label: "Catégories", icon: FolderTree },
  { href: "/admin/commandes", label: "Commandes", icon: ShoppingCart },
  { href: "/admin/equipe", label: "Équipe", icon: Users },
];

function BrandLockup({ logoSize }: { logoSize: number }) {
  return (
    <>
      <span className="rounded-lg bg-white p-1">
        <Image src="/brand/logo.png" alt="" width={logoSize} height={logoSize} />
      </span>
      <span className="leading-tight">
        <span className="block text-sm font-bold">TIA Librairie</span>
        <span className="block text-xs font-medium text-white/55">Administration</span>
      </span>
    </>
  );
}

export function AdminSidebar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      {/* Barre mobile/tablette (60px, cf. AdminPageHeader sticky) : le menu
          latéral devient un tiroir en dessous du breakpoint lg. */}
      <div className="sticky top-0 z-30 flex h-[60px] items-center justify-between bg-brand-navy px-4 text-white lg:hidden">
        <Link href="/admin" className="flex items-center gap-2.5">
          <BrandLockup logoSize={26} />
        </Link>
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Ouvrir le menu"
          aria-expanded={open}
          className="rounded-lg p-2 hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-brand-gold"
        >
          <Menu size={20} />
        </button>
      </div>

      {open && (
        <div
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-40 bg-brand-navy/50 backdrop-blur-sm lg:hidden"
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 shrink-0 flex-col overflow-y-auto bg-brand-navy px-3 py-5 text-white transition-transform duration-200 lg:sticky lg:top-0 lg:z-auto lg:h-screen lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="mb-8 flex items-center justify-between px-2">
          <Link href="/admin" className="flex items-center gap-2.5" onClick={() => setOpen(false)}>
            <BrandLockup logoSize={30} />
          </Link>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Fermer le menu"
            className="rounded-lg p-1.5 hover:bg-white/10 lg:hidden"
          >
            <X size={18} />
          </button>
        </div>

        <p className="px-3 text-[11px] font-semibold uppercase tracking-wider text-white/35">Gestion</p>
        <nav className="mt-2 space-y-0.5">
          {NAV_LINKS.map((link) => {
            const isActive = link.href === "/admin" ? pathname === "/admin" : pathname?.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                aria-current={isActive ? "page" : undefined}
                className={`relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-brand-gold ${
                  isActive ? "bg-white/10 text-white" : "text-white/65 hover:bg-white/[0.06] hover:text-white"
                }`}
              >
                {/* Current page: a gold marker on the left edge, the gold of the logo's plate. */}
                {isActive && <span aria-hidden className="absolute inset-y-2 left-0 w-[3px] rounded-full bg-brand-gold" />}
                <link.icon size={17} className={isActive ? "text-brand-gold" : ""} />
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto space-y-0.5 border-t border-white/10 pt-4">
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-white/65 transition-colors hover:bg-white/[0.06] hover:text-white"
          >
            <ExternalLink size={17} />
            Voir la boutique
          </Link>
          <form action={signOut}>
            <button
              type="submit"
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-white/65 transition-colors hover:bg-white/[0.06] hover:text-white"
            >
              <LogOut size={17} />
              Déconnexion
            </button>
          </form>
        </div>
      </aside>
    </>
  );
}
