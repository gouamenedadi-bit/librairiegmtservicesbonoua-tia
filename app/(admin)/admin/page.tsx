import Link from "next/link";
import { ArrowRight, CheckCircle2, ExternalLink, FolderTree, ImageOff, Package, PackageX, Plus, ShoppingCart, Tag } from "lucide-react";

import { getDashboardStats } from "@/lib/admin/queries";
import { FORM_BUTTON_PRIMARY } from "@/lib/ui/form-styles";
import { ADMIN_CARD } from "@/lib/ui/table-styles";
import { AdminPageHeader } from "@/components/admin/admin-page-header";

const QUICK_LINKS = [
  { href: "/admin/produits/nouveau", icon: Plus, title: "Ajouter un produit", desc: "Nom, description, photos, prix" },
  { href: "/admin/categories/nouvelle", icon: FolderTree, title: "Créer une catégorie", desc: "Apparaît aussitôt sur le site" },
  { href: "/admin/commandes", icon: ShoppingCart, title: "Voir les commandes", desc: "Suivre et mettre à jour leur statut" },
];

function percent(part: number, total: number) {
  return total > 0 ? Math.round((part / total) * 100) : 0;
}

export default async function AdminDashboardPage() {
  const stats = await getDashboardStats();

  const todayRaw = new Date().toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  // French capitalizes only the first word: "Mercredi 28 octobre 2026".
  const today = todayRaw.charAt(0).toUpperCase() + todayRaw.slice(1);

  const kpis = [
    { label: "Produits actifs", value: stats.totalActive, icon: Package, href: "/admin/produits" },
    { label: "Catégories", value: stats.totalCategories, icon: FolderTree, href: "/admin/categories" },
    { label: "Commandes à traiter", value: stats.pendingOrders, icon: ShoppingCart, href: "/admin/commandes", highlight: stats.pendingOrders > 0 },
    { label: "Produits masqués", value: stats.inactive, icon: PackageX, href: "/admin/produits" },
  ];

  // Catalogue completeness as progress, not alarms: how much of the
  // catalogue is actually sellable (has a price) and presentable (has a photo).
  const priced = Math.max(stats.totalProducts - stats.onRequest, 0);
  const withPhoto = Math.max(stats.totalProducts - stats.withoutPhoto, 0);
  const quality = [
    {
      label: "Produits avec un prix",
      icon: Tag,
      done: priced,
      remaining: stats.onRequest,
      remainingLabel: "en « prix sur demande »",
      cta: "Fixer des prix",
      href: "/admin/produits?prix=on_request",
    },
    {
      label: "Produits avec une photo",
      icon: ImageOff,
      done: withPhoto,
      remaining: stats.withoutPhoto,
      remainingLabel: "sans photo",
      cta: "Ajouter des photos",
      href: "/admin/produits?photo=without",
    },
  ];

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="Tableau de bord"
        description={today}
        actions={
          <>
            <Link
              href="/"
              target="_blank"
              className="inline-flex items-center gap-2 rounded-full border border-brand-navy/15 bg-white px-5 py-2.5 text-sm font-semibold text-brand-navy transition hover:border-brand-navy/30"
            >
              <ExternalLink size={15} />
              Voir la boutique
            </Link>
            <Link href="/admin/produits/nouveau" className={FORM_BUTTON_PRIMARY}>
              <Plus size={16} strokeWidth={3} />
              Nouveau produit
            </Link>
          </>
        }
      />

      {/* Key figures in one calm strip rather than four shouting cards. */}
      <section aria-label="Chiffres clés" className={`animate-fade-in-up grid grid-cols-2 lg:grid-cols-4 ${ADMIN_CARD}`}>
        {kpis.map((kpi, index) => (
          <Link
            key={kpi.label}
            href={kpi.href}
            className={`group flex flex-col gap-3 p-5 transition-colors hover:bg-brand-navy/[0.02] sm:p-6 ${
              index % 2 === 1 ? "border-l border-brand-navy/[0.08]" : ""
            } ${index >= 2 ? "border-t border-brand-navy/[0.08] lg:border-t-0" : ""} ${index === 2 ? "lg:border-l" : ""}`}
          >
            <span className="flex items-center justify-between text-sm font-medium text-brand-navy/55">
              {kpi.label}
              <kpi.icon size={17} className={kpi.highlight ? "text-brand-gold" : "text-brand-navy/30"} />
            </span>
            <span className="flex items-baseline gap-2">
              <span className="font-display text-4xl font-bold leading-none text-brand-navy sm:text-5xl">{kpi.value}</span>
              {kpi.highlight && (
                <span className="rounded-full bg-brand-gold/30 px-2 py-0.5 text-xs font-semibold text-brand-navy">À traiter</span>
              )}
            </span>
          </Link>
        ))}
      </section>

      <div className="grid gap-6 lg:grid-cols-[3fr_2fr]">
        <section style={{ animationDelay: "60ms" }} className={`animate-fade-in-up p-5 sm:p-6 ${ADMIN_CARD}`}>
          <h2 className="font-semibold text-brand-navy">Qualité du catalogue</h2>
          <p className="mt-1 text-sm text-brand-navy/55">
            Un produit se vend quand il a un prix et une photo. Voici où en est la boutique.
          </p>

          <ul className="mt-6 space-y-6">
            {quality.map((row) => {
              const pct = percent(row.done, stats.totalProducts);
              const complete = row.remaining === 0;
              return (
                <li key={row.label}>
                  <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                    <p className="text-sm font-semibold text-brand-navy">{row.label}</p>
                    <p className="text-sm text-brand-navy/55">
                      <span className="font-display text-xl font-bold text-brand-navy">{pct} %</span>
                      <span className="ml-2">
                        {row.done} / {stats.totalProducts}
                      </span>
                    </p>
                  </div>
                  <div
                    role="progressbar"
                    aria-label={row.label}
                    aria-valuenow={pct}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    className="mt-2 h-2.5 overflow-hidden rounded-full bg-brand-navy/[0.07]"
                  >
                    <div className="h-full rounded-full bg-brand-green transition-[width] duration-700" style={{ width: `${pct}%` }} />
                  </div>
                  <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2 text-sm">
                    {complete ? (
                      <span className="flex items-center gap-1.5 font-medium text-brand-green">
                        <CheckCircle2 size={15} />
                        Tout est complet
                      </span>
                    ) : (
                      <>
                        <span className="text-brand-navy/55">
                          {row.remaining} produit(s) {row.remainingLabel}
                        </span>
                        <Link
                          href={row.href}
                          className="group inline-flex items-center gap-1 font-semibold text-brand-green hover:text-brand-green-dark"
                        >
                          {row.cta}
                          <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
                        </Link>
                      </>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </section>

        <section style={{ animationDelay: "120ms" }} className={`animate-fade-in-up p-5 sm:p-6 ${ADMIN_CARD}`}>
          <h2 className="font-semibold text-brand-navy">Accès rapide</h2>
          <ul className="mt-4 divide-y divide-brand-navy/[0.08]">
            {QUICK_LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="group flex items-center gap-3 py-3.5">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-navy/[0.06] text-brand-navy transition-colors group-hover:bg-brand-navy group-hover:text-brand-gold">
                    <link.icon size={16} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold text-brand-navy">{link.title}</span>
                    <span className="block text-xs text-brand-navy/50">{link.desc}</span>
                  </span>
                  <ArrowRight size={16} className="shrink-0 text-brand-navy/25 transition group-hover:translate-x-0.5 group-hover:text-brand-navy" />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
