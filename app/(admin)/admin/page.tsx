import Link from "next/link";
import { FolderTree, ImageOff, Package, PackageX, ShoppingCart, Tag } from "lucide-react";

import { getDashboardStats } from "@/lib/admin/queries";

export default async function AdminDashboardPage() {
  const stats = await getDashboardStats();

  const statCards = [
    { label: "Produits actifs", value: stats.totalActive, icon: Package, href: "/admin/produits" },
    {
      label: "Prix à fixer",
      value: stats.onRequest,
      icon: Tag,
      href: "/admin/produits?prix=on_request",
      accent: stats.onRequest > 0,
    },
    {
      label: "Sans photo",
      value: stats.withoutPhoto,
      icon: ImageOff,
      href: "/admin/produits?photo=without",
      accent: stats.withoutPhoto > 0,
    },
    { label: "Masqués", value: stats.inactive, icon: PackageX, href: "/admin/produits" },
    {
      label: "Commandes à traiter",
      value: stats.pendingOrders,
      icon: ShoppingCart,
      href: "/admin/commandes",
      accent: stats.pendingOrders > 0,
    },
    { label: "Catégories", value: stats.totalCategories, icon: FolderTree, href: "/admin/categories" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-navy">Tableau de bord</h1>
      <p className="mt-1 text-sm text-black/60">Bienvenue dans l&apos;administration de la boutique.</p>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
        {statCards.map((card, index) => (
          <Link
            key={card.label}
            href={card.href}
            style={{ animationDelay: `${index * 60}ms` }}
            className="group flex animate-fade-in-up flex-col gap-3 rounded-2xl border border-black/5 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:scale-[1.02] hover:border-brand-green hover:shadow-md"
          >
            <span
              className={`flex h-10 w-10 items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-110 ${
                card.accent ? "bg-brand-gold/20 text-brand-gold" : "bg-brand-green/10 text-brand-green"
              }`}
            >
              <card.icon size={18} />
            </span>
            <div>
              <p className="text-2xl font-extrabold text-brand-navy">{card.value}</p>
              <p className="text-xs font-medium text-black/50">{card.label}</p>
            </div>
          </Link>
        ))}
      </div>

      <h2 className="mt-10 text-sm font-bold uppercase tracking-wide text-black/40">Accès rapide</h2>
      <div className="mt-3 grid gap-3 sm:grid-cols-3">
        <Link
          href="/admin/produits/nouveau"
          className="rounded-2xl border border-black/5 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-green hover:shadow-md"
        >
          <p className="font-bold text-brand-navy">Ajouter un produit</p>
          <p className="mt-1 text-xs text-black/50">Nom, description, photos, prix</p>
        </Link>
        <Link
          href="/admin/categories/nouvelle"
          className="rounded-2xl border border-black/5 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-green hover:shadow-md"
        >
          <p className="font-bold text-brand-navy">Créer une catégorie</p>
          <p className="mt-1 text-xs text-black/50">Apparaît aussitôt sur le site</p>
        </Link>
        <Link
          href="/admin/produits?prix=on_request"
          className="rounded-2xl border border-black/5 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-green hover:shadow-md"
        >
          <p className="font-bold text-brand-navy">Fixer des prix</p>
          <p className="mt-1 text-xs text-black/50">Produits en « prix sur demande »</p>
        </Link>
      </div>
    </div>
  );
}
