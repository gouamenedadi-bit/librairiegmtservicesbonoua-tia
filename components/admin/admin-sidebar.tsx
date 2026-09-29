"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { FolderTree, LayoutGrid, LogOut, Menu, Package, ShoppingCart, Users, X } from "lucide-react";

import { signOut } from "@/app/login/actions";

const NAV_LINKS = [
  { href: "/admin", label: "Tableau de bord", icon: LayoutGrid },
  { href: "/admin/produits", label: "Produits", icon: Package },
  { href: "/admin/categories", label: "Catégories", icon: FolderTree },
  { href: "/admin/commandes", label: "Commandes", icon: ShoppingCart },
  { href: "/admin/equipe", label: "Équipe", icon: Users },
];

export function AdminSidebar() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Barre mobile/tablette : le menu latéral devient un tiroir en dessous du breakpoint lg */}
      <div className="sticky top-0 z-30 flex items-center justify-between bg-brand-navy px-4 py-3 text-white lg:hidden">
        <Link href="/admin" className="flex items-center gap-2">
          <Image src="/brand/logo.png" alt="TIA Librairie" width={28} height={28} />
          <span className="text-xs font-bold uppercase tracking-wide">Administration</span>
        </Link>
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Ouvrir le menu"
          className="rounded-lg p-2 hover:bg-white/10"
        >
          <Menu size={20} />
        </button>
      </div>

      {open && (
        <div
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 shrink-0 flex-col justify-between overflow-y-auto bg-brand-navy px-4 py-6 text-white transition-transform duration-200 lg:static lg:z-auto lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div>
          <div className="mb-8 flex items-center justify-between px-2">
            <Link href="/admin" className="flex items-center gap-2" onClick={() => setOpen(false)}>
              <Image src="/brand/logo.png" alt="TIA Librairie" width={32} height={32} />
              <span className="text-xs font-bold uppercase tracking-wide">Administration</span>
            </Link>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Fermer le menu"
              className="rounded-lg p-1 hover:bg-white/10 lg:hidden"
            >
              <X size={18} />
            </button>
          </div>

          <nav className="space-y-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-white/80 transition-all duration-200 hover:translate-x-1 hover:bg-white/10 hover:text-white"
              >
                <link.icon size={16} className="transition-transform duration-200 group-hover:scale-110" />
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <form action={signOut}>
          <button
            type="submit"
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-white/60 transition hover:bg-white/10 hover:text-white"
          >
            <LogOut size={16} />
            Déconnexion
          </button>
        </form>
      </aside>
    </>
  );
}
