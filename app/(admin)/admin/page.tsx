import Link from "next/link";
import {
  ChevronRight,
  FolderTree,
  ImageOff,
  Package,
  PackageX,
  PlusCircle,
  ShoppingCart,
  Sparkles,
  Tag,
} from "lucide-react";

import { getDashboardStats } from "@/lib/admin/queries";

const QUICK_LINKS = [
  {
    href: "/admin/produits/nouveau",
    icon: PlusCircle,
    title: "Ajouter un produit",
    desc: "Nom, description, photos, prix",
  },
  {
    href: "/admin/categories/nouvelle",
    icon: FolderTree,
    title: "Créer une catégorie",
    desc: "Apparaît aussitôt sur le site",
  },
  {
    href: "/admin/produits?prix=on_request",
    icon: Tag,
    title: "Fixer des prix",
    desc: "Produits en « prix sur demande »",
  },
];

export default async function AdminDashboardPage() {
  const stats = await getDashboardStats();

  const today = new Date().toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const todoItems = [
    {
      label: "produit(s) en « prix sur demande »",
      hint: "Ces articles attendent un prix avant d'être vendables.",
      value: stats.onRequest,
      icon: Tag,
      href: "/admin/produits?prix=on_request",
    },
    {
      label: "produit(s) sans photo",
      hint: "Une photo rend un article bien plus vendeur.",
      value: stats.withoutPhoto,
      icon: ImageOff,
      href: "/admin/produits?photo=without",
    },
    {
      label: "commande(s) à traiter",
      hint: "De nouvelles commandes attendent une préparation.",
      value: stats.pendingOrders,
      icon: ShoppingCart,
      href: "/admin/commandes",
    },
  ].filter((item) => item.value > 0);

  const overviewCards = [
    { label: "Produits actifs", value: stats.totalActive, icon: Package, href: "/admin/produits" },
    { label: "Catégories", value: stats.totalCategories, icon: FolderTree, href: "/admin/categories" },
    { label: "Masqués", value: stats.inactive, icon: PackageX, href: "/admin/produits" },
  ];

  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-[0.4em] text-brand-navy/50">{today}</p>
      <h1 className="mt-3 font-display text-5xl font-extrabold uppercase leading-none text-brand-navy">Tableau de bord</h1>

      {/* Ce qui a besoin d'une action maintenant, distinct de l'état général
          en dessous — un admin qui ouvre cette page veut d'abord savoir ce
          qu'il doit FAIRE aujourd'hui, pas juste voir des compteurs. */}
      <section className="mt-8">
        <h2 className="text-xs font-bold uppercase tracking-[0.3em] text-brand-navy/55">À faire aujourd&apos;hui</h2>

        {todoItems.length === 0 ? (
          <div
            className="mt-3 flex animate-fade-in-up items-center gap-3 rounded-2xl border-2 border-dashed border-brand-green/25 bg-brand-green/5 px-5 py-4 text-sm font-semibold text-brand-green"
          >
            <Sparkles size={18} />
            Rien à traiter — tout est à jour.
          </div>
        ) : (
          <div className="mt-3 overflow-hidden rounded-2xl border border-black/5 bg-white shadow-xl">
            {todoItems.map((item, index) => (
              <Link
                key={item.label}
                href={item.href}
                style={{ animationDelay: `${index * 60}ms` }}
                className="group flex animate-fade-in-up items-center gap-4 border-l-4 border-brand-gold bg-brand-gold/5 px-5 py-4 transition-colors duration-150 hover:bg-brand-gold/10"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-gold/20 text-brand-navy">
                  <item.icon size={18} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-brand-navy">
                    <span className="mr-1 font-display text-2xl font-extrabold">{item.value}</span> {item.label}
                  </p>
                  <p className="truncate text-xs text-black/50">{item.hint}</p>
                </div>
                <ChevronRight
                  size={18}
                  className="shrink-0 text-black/30 transition-transform duration-150 group-hover:translate-x-1"
                />
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* État général de la boutique — calme, neutre, pas une alerte. */}
      <section className="mt-8">
        <h2 className="text-xs font-bold uppercase tracking-[0.3em] text-brand-navy/55">Aperçu de la boutique</h2>
        <div className="mt-3 grid grid-cols-2 gap-4 sm:grid-cols-3">
          {overviewCards.map((card, index) => (
            <Link
              key={card.label}
              href={card.href}
              style={{ animationDelay: `${index * 60}ms` }}
              className="group flex animate-fade-in-up flex-col gap-3 rounded-2xl border-2 border-t-4 border-black/5 border-t-brand-green bg-white p-5 shadow-xl transition-all duration-200 hover:-translate-y-1 hover:shadow-2xl"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-green/10 text-brand-green transition-transform duration-200 group-hover:scale-110">
                <card.icon size={18} />
              </span>
              <div>
                <p className="font-display text-4xl font-extrabold leading-none text-brand-navy">{card.value}</p>
                <p className="text-xs font-medium text-black/50">{card.label}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-xs font-bold uppercase tracking-[0.3em] text-brand-navy/55">Accès rapide</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          {QUICK_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="group flex items-start gap-3 rounded-2xl border border-black/5 bg-white p-5 shadow-xl transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-green hover:shadow-2xl"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-navy text-brand-gold transition-transform duration-200 group-hover:scale-110">
                <link.icon size={16} />
              </span>
              <div>
                <p className="font-bold text-brand-navy">{link.title}</p>
                <p className="mt-1 text-xs text-black/50">{link.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
