import Link from "next/link";
import { BookOpen, Pencil, ShoppingBag, Smartphone, Truck } from "lucide-react";

import { getCategoryNavGroups } from "@/lib/catalog/queries";
import { getDictionary } from "@/lib/i18n/dictionary";
import { getLocale } from "@/lib/i18n/get-locale";
import { storagePublicUrl } from "@/lib/catalog/storage";
import { HeroCarousel } from "@/components/home/hero-carousel";

// Real product photos already in the catalog (a novel, a pen, a notebook, an
// office item) — one per hero slide, standing in for "un livre, un stylo, un
// roman, un article de fourniture de bureau" — never stock/placeholder images.
const HERO_IMAGES = [
  "librairie-parascolaire/1.webp",
  "papeterie-ecriture/1.webp",
  "papeterie-cahiers/145.webp",
  "papeterie-assemblage/45.webp",
].map(storagePublicUrl);

export default async function HomePage() {
  const [dict, { librairie: librairieCategories, papeterie: papeterieCategories }] = await Promise.all([
    getLocale().then(getDictionary),
    getCategoryNavGroups(),
  ]);

  const steps = [
    { icon: ShoppingBag, title: dict.home.step1Title, description: dict.home.step1Desc },
    { icon: Smartphone, title: dict.home.step2Title, description: dict.home.step2Desc },
    { icon: Truck, title: dict.home.step3Title, description: dict.home.step3Desc },
  ];

  return (
    <div>
      <HeroCarousel images={HERO_IMAGES}>
        <div className="mx-auto flex max-w-6xl flex-col items-start gap-6 px-4 py-20 sm:py-28">
          <span className="animate-fade-in-up rounded-full bg-brand-gold px-4 py-1 text-xs font-bold uppercase tracking-widest text-brand-navy">
            {dict.home.badge}
          </span>
          <h1
            style={{ animationDelay: "80ms" }}
            className="animate-fade-in-up max-w-2xl text-4xl font-extrabold leading-tight text-white sm:text-5xl"
          >
            {dict.home.title}
          </h1>
          <p
            style={{ animationDelay: "160ms" }}
            className="animate-fade-in-up max-w-xl text-lg text-white/80"
          >
            {dict.home.subtitle}
          </p>
          <div style={{ animationDelay: "240ms" }} className="animate-fade-in-up flex flex-wrap gap-3">
            <Link
              href="/categorie/librairie-litterature"
              className="rounded-full bg-brand-green px-6 py-3 text-sm font-bold text-white transition hover:bg-brand-green-dark"
            >
              {dict.home.ctaLibrairie}
            </Link>
            <Link
              href="/categorie/papeterie-bureau"
              className="rounded-full bg-white/10 px-6 py-3 text-sm font-bold text-white ring-1 ring-white/30 transition hover:bg-white/20"
            >
              {dict.home.ctaPapeterie}
            </Link>
          </div>
        </div>
      </HeroCarousel>

      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid gap-6 sm:grid-cols-3">
          {steps.map((step, index) => (
            <div
              key={step.title}
              style={{ animationDelay: `${index * 120}ms` }}
              className="animate-fade-in-up group flex gap-4 rounded-2xl border-2 border-brand-green/15 bg-brand-gold/15 p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:scale-[1.03] hover:border-brand-green/40 hover:shadow-lg"
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-green/10 text-brand-green transition-transform duration-300 group-hover:scale-110">
                <step.icon size={24} />
              </span>
              <div>
                <p className="font-bold text-brand-navy">{step.title}</p>
                <p className="mt-1 text-sm text-black/60">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-8">
        <div className="rounded-3xl bg-white p-6 shadow-xl sm:p-8">
          <div className="mb-6 flex items-center gap-2">
            <BookOpen className="text-brand-green" size={22} />
            <h2 className="text-2xl font-bold text-brand-navy">{dict.home.librairieHeading}</h2>
          </div>
          <CategoryGrid items={librairieCategories} />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-8">
        <div className="rounded-3xl bg-white p-6 shadow-xl sm:p-8">
          <div className="mb-6 flex items-center gap-2">
            <Pencil className="text-brand-green" size={22} />
            <h2 className="text-2xl font-bold text-brand-navy">{dict.home.papeterieHeading}</h2>
          </div>
          <CategoryGrid items={papeterieCategories} />
        </div>
      </section>
    </div>
  );
}

function CategoryGrid({ items }: { items: { name: string; slug: string }[] }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
      {items.map((category, index) => (
        <Link
          key={category.slug}
          href={`/categorie/${category.slug}`}
          style={{ animationDelay: `${index * 40}ms` }}
          className="animate-fade-in-up rounded-xl border-2 border-black/5 bg-brand-gold/15 p-4 text-sm font-semibold text-brand-navy shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:scale-105 hover:border-brand-green hover:text-brand-green hover:shadow-md"
        >
          {category.name}
        </Link>
      ))}
    </div>
  );
}
