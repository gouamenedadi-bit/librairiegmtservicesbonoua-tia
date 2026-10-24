import Link from "next/link";
import { BookOpen, Pencil, ShoppingBag, Smartphone, Truck } from "lucide-react";

import { getCategoryNavGroups } from "@/lib/catalog/queries";
import { getDictionary } from "@/lib/i18n/dictionary";
import { getLocale } from "@/lib/i18n/get-locale";
import { storagePublicUrl } from "@/lib/catalog/storage";
import { HeroCarousel } from "@/components/home/hero-carousel";
import { CategoryIcon } from "@/lib/catalog/category-icons";

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

      {/* "Ticket" band — the 3 steps are a real sequence (browse → order →
          pick up), so numbering earns its place here. One continuous card
          instead of 3 separate ones, with dashed section dividers, reads
          like a shop receipt split into its stages — apt for a business
          whose whole pitch is "order online, collect in person." */}
      <section className="mx-auto max-w-6xl px-4 py-14 sm:py-16">
        <p className="animate-fade-in-up text-center text-xs font-bold uppercase tracking-[0.2em] text-brand-green">
          {dict.home.stepsEyebrow}
        </p>
        <div
          style={{ animationDelay: "60ms" }}
          className="animate-fade-in-up relative mt-4 overflow-hidden rounded-3xl border-2 border-black/5 bg-white shadow-xl"
        >
          <div className="h-1.5 w-full bg-gradient-to-r from-brand-green via-brand-gold to-brand-green" />
          <div className="grid divide-y-2 divide-dashed divide-black/10 sm:grid-cols-3 sm:divide-x-2 sm:divide-y-0">
            {steps.map((step, index) => (
              <div key={step.title} className="group relative flex flex-col gap-3 p-6 sm:p-8">
                <span
                  aria-hidden
                  className="pointer-events-none absolute right-4 top-2 select-none text-6xl font-extrabold text-brand-navy/[0.05]"
                >
                  0{index + 1}
                </span>
                <span className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-brand-green/10 text-brand-green transition-transform duration-300 group-hover:scale-110">
                  <step.icon size={22} />
                </span>
                <div className="relative">
                  <p className="font-bold text-brand-navy">{step.title.replace(/^\d+\.\s*/, "")}</p>
                  <p className="mt-1 text-sm text-black/60">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-8">
        <CatalogSection
          icon={BookOpen}
          heading={dict.home.librairieHeading}
          subheading={dict.home.librairieSub}
          items={librairieCategories}
          accent="green"
        />
      </section>

      <section className="mx-auto max-w-6xl px-4 py-8">
        <CatalogSection
          icon={Pencil}
          heading={dict.home.papeterieHeading}
          subheading={dict.home.papeterieSub}
          items={papeterieCategories}
          accent="gold"
        />
      </section>
    </div>
  );
}

function CatalogSection({
  icon: Icon,
  heading,
  subheading,
  items,
  accent,
}: {
  icon: typeof BookOpen;
  heading: string;
  subheading: string;
  items: { name: string; slug: string }[];
  accent: "green" | "gold";
}) {
  const accentText = accent === "green" ? "text-brand-green" : "text-brand-gold";

  return (
    <div className="rounded-3xl bg-white p-6 shadow-xl sm:p-8">
      <div className="mb-7 flex items-center gap-4">
        <span
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-navy ${accentText}`}
        >
          <Icon size={22} />
        </span>
        <div>
          <h2 className="text-2xl font-bold text-brand-navy">{heading}</h2>
          <p className="text-sm text-black/50">{subheading}</p>
        </div>
      </div>
      <CategoryGrid items={items} accent={accent} />
    </div>
  );
}

function CategoryGrid({
  items,
  accent,
}: {
  items: { name: string; slug: string }[];
  accent: "green" | "gold";
}) {
  const iconWrap = accent === "green" ? "bg-brand-green/10 text-brand-green" : "bg-brand-gold/25 text-brand-navy";
  const topBorder = accent === "green" ? "border-t-brand-green" : "border-t-brand-gold";
  const hoverBorder = accent === "green" ? "hover:border-brand-green" : "hover:border-brand-gold";

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
      {items.map((category, index) => (
        <Link
          key={category.slug}
          href={`/categorie/${category.slug}`}
          style={{ animationDelay: `${index * 40}ms` }}
          className={`animate-fade-in-up group flex flex-col items-start gap-3 rounded-2xl border-2 border-t-4 border-black/5 ${topBorder} bg-white p-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md ${hoverBorder}`}
        >
          <span
            className={`flex h-10 w-10 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110 ${iconWrap}`}
          >
            <CategoryIcon slug={category.slug} size={18} />
          </span>
          <span className="text-sm font-semibold text-brand-navy">{category.name}</span>
        </Link>
      ))}
    </div>
  );
}
