import Link from "next/link";
import { BookOpen, Pencil, ShoppingBag, Smartphone, Truck } from "lucide-react";

import { CATEGORY_MAP } from "@/lib/catalog/category-map";

const categories = Array.from(
  new Map(
    Object.values(CATEGORY_MAP)
      .filter((c) => c !== null)
      .map((c) => [c.slug, c]),
  ).values(),
);
const librairieCategories = categories.filter((c) => c.slug.startsWith("librairie-"));
const papeterieCategories = categories.filter((c) => c.slug.startsWith("papeterie-"));

const STEPS = [
  {
    icon: ShoppingBag,
    title: "1. Parcourez le catalogue",
    description: "Romans, livres scolaires, littérature religieuse, fournitures de bureau…",
  },
  {
    icon: Smartphone,
    title: "2. Commandez en ligne",
    description: "Ajoutez au panier et payez simplement avec Wave.",
  },
  {
    icon: Truck,
    title: "3. Récupérez à Bonoua",
    description: "Votre commande vous attend à la librairie GMT Services.",
  },
];

export default function HomePage() {
  return (
    <div>
      <section className="bg-brand-navy">
        <div className="mx-auto flex max-w-6xl flex-col items-start gap-6 px-4 py-20 sm:py-28">
          <span className="rounded-full bg-brand-gold px-4 py-1 text-xs font-bold uppercase tracking-widest text-brand-navy">
            Bonoua, Côte d&apos;Ivoire
          </span>
          <h1 className="max-w-2xl text-4xl font-extrabold leading-tight text-white sm:text-5xl">
            Votre librairie et papeterie, maintenant en ligne.
          </h1>
          <p className="max-w-xl text-lg text-white/80">
            TIA Librairie — GMT Services Bonoua propose romans, ouvrages scolaires, littérature
            religieuse et toutes vos fournitures de bureau, livrés ou à récupérer sur place.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/categorie/librairie-litterature"
              className="rounded-full bg-brand-green px-6 py-3 text-sm font-bold text-white transition hover:bg-brand-green-dark"
            >
              Découvrir la librairie
            </Link>
            <Link
              href="/categorie/papeterie-bureau"
              className="rounded-full bg-white/10 px-6 py-3 text-sm font-bold text-white ring-1 ring-white/30 transition hover:bg-white/20"
            >
              Voir la papeterie
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid gap-6 sm:grid-cols-3">
          {STEPS.map((step) => (
            <div key={step.title} className="flex gap-4 rounded-2xl border border-black/5 p-5">
              <step.icon className="shrink-0 text-brand-green" size={28} />
              <div>
                <p className="font-bold text-brand-navy">{step.title}</p>
                <p className="mt-1 text-sm text-black/60">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-6 flex items-center gap-2">
          <BookOpen className="text-brand-green" size={22} />
          <h2 className="text-2xl font-bold text-brand-navy">Librairie</h2>
        </div>
        <CategoryGrid items={librairieCategories} />
      </section>

      <section className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-6 flex items-center gap-2">
          <Pencil className="text-brand-green" size={22} />
          <h2 className="text-2xl font-bold text-brand-navy">Papeterie</h2>
        </div>
        <CategoryGrid items={papeterieCategories} />
      </section>
    </div>
  );
}

function CategoryGrid({ items }: { items: { name: string; slug: string }[] }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
      {items.map((category) => (
        <Link
          key={category.slug}
          href={`/categorie/${category.slug}`}
          className="rounded-xl border border-black/5 bg-white p-4 text-sm font-semibold text-brand-navy shadow-sm transition hover:border-brand-green hover:text-brand-green"
        >
          {category.name}
        </Link>
      ))}
    </div>
  );
}
