import Link from "next/link";
import { ArrowRight, MessageCircle } from "lucide-react";

import { getCategoryNavGroups } from "@/lib/catalog/queries";
import { getDictionary } from "@/lib/i18n/dictionary";
import { getLocale } from "@/lib/i18n/get-locale";
import { storagePublicUrl } from "@/lib/catalog/storage";
import { CategoryIcon } from "@/lib/catalog/category-icons";
import { getWhatsAppLink } from "@/lib/whatsapp";
import { PhotoSlider, type Slide } from "@/components/home/photo-slider";

type Category = { name: string; slug: string };

// Real product photos already in the catalog — never stock images. Five per
// book page, one per kind of shelf, each linking to that shelf.
const LIBRAIRIE_SLIDES: Slide[] = [
  { path: "librairie-scolaire-primaire/415-2.webp", alt: "Cahier d'exercices Mathématiques CE1", shelf: "librairie-scolaire-primaire" },
  { path: "librairie-scolaire-secondaire/124.webp", alt: "English For Ever 4e", shelf: "librairie-scolaire-secondaire" },
  { path: "librairie-litterature/149.webp", alt: "Acôlê Cacoula, le poussin rouge — Charlotte Ezoua Balé", shelf: "librairie-litterature" },
  { path: "librairie-litterature/152.webp", alt: "Béya déteste les crottes — Jean-Baptiste Niamkey", shelf: "librairie-litterature" },
  { path: "librairie-litterature/382.webp", alt: "Destins de clandestins — Josué Guébo", shelf: "librairie-litterature" },
].map(toSlide);

const PAPETERIE_SLIDES: Slide[] = [
  { path: "papeterie-cahiers/165.webp", alt: "Cahier étudiant motif africain", shelf: "papeterie-cahiers" },
  { path: "papeterie-assemblage/22.webp", alt: "Ciseaux métalliques, couleurs assorties", shelf: "papeterie-assemblage" },
  { path: "papeterie-bureau/256.webp", alt: "Calculatrice scientifique Casio fx-991ES Plus", shelf: "papeterie-bureau" },
  { path: "papeterie-dessin/29.webp", alt: "Ardoise effaçable quadrillée orange", shelf: "papeterie-dessin" },
  { path: "8175f3ef-6d31-4c3f-8e48-ed04cd4dac73/1ad74b658390d7bb1c1777d8.webp", alt: "Compas", shelf: "papeterie-dessin" },
].map(toSlide);

function toSlide({ path, alt, shelf }: { path: string; alt: string; shelf: string }): Slide {
  return { src: storagePublicUrl(path), alt, href: `/categorie/${shelf}` };
}

// How many shelves each book page lists before pointing to the full index.
const SHELVES_PER_PAGE = 5;

// The Papeterie page starts sliding 2s after the Librairie page, so the two
// pages never turn at the same moment.
const INTERVAL_OFFSET_MS = 2000;

export default async function HomePage() {
  const [dict, { librairie, papeterie }] = await Promise.all([
    getLocale().then(getDictionary),
    getCategoryNavGroups(),
  ]);

  const askLink = getWhatsAppLink(dict.home.askMessage);

  const steps = [
    { title: dict.home.step1Title, description: dict.home.step1Desc },
    { title: dict.home.step2Title, description: dict.home.step2Desc },
    { title: dict.home.step3Title, description: dict.home.step3Desc },
  ];

  return (
    <div>
      {/* Hero: the logo's open book. Left page = Librairie, right page =
          Papeterie — the page's one job is sending each visitor into the
          right half of the catalog, so the two halves ARE the hero. */}
      <section className="overflow-hidden bg-gradient-to-b from-brand-green/[0.07] to-white">
        <div className="mx-auto max-w-6xl px-4 pt-12 text-center sm:pt-16">
          <p className="animate-fade-in-up text-xs font-bold uppercase tracking-[0.4em] text-brand-navy/60">
            {dict.home.eyebrow}
          </p>
          <h1
            style={{ animationDelay: "60ms" }}
            className="animate-fade-in-up mt-4 font-display text-5xl font-extrabold uppercase leading-[0.95] text-brand-navy sm:text-7xl"
          >
            {dict.home.titleLead}
            <br />
            <span className="label-plate mt-2">{dict.home.titleMark}</span>
          </h1>
          <p
            style={{ animationDelay: "120ms" }}
            className="animate-fade-in-up mx-auto mt-6 max-w-xl text-base text-black/60 sm:text-lg"
          >
            {dict.home.subtitle}
          </p>
        </div>

        <div className="mx-auto mt-10 max-w-5xl px-4 pb-16 sm:mt-14 sm:pb-20">
          <div className="grid gap-0 sm:grid-cols-[1fr_auto_1fr]">
            <BookPage
              side="left"
              title={dict.nav.librairie}
              description={dict.home.librairieDoor}
              cta={dict.home.ctaLibrairie}
              href="/categorie/librairie-litterature"
              slides={LIBRAIRIE_SLIDES}
              shelves={librairie}
              moreLabel={dict.home.moreShelves}
            />
            {/* Spine: horizontal between stacked pages on phones, vertical
                between facing pages from `sm` up. */}
            <div aria-hidden className="relative h-3 bg-brand-navy sm:h-auto sm:w-4">
              <div className="absolute inset-x-6 top-1/2 border-t-2 border-dashed border-brand-gold/60 sm:inset-x-auto sm:inset-y-8 sm:left-1/2 sm:top-auto sm:border-l-2 sm:border-t-0" />
            </div>
            <BookPage
              side="right"
              title={dict.nav.papeterie}
              description={dict.home.papeterieDoor}
              cta={dict.home.ctaPapeterie}
              href="/categorie/papeterie-bureau"
              slides={PAPETERIE_SLIDES}
              shelves={papeterie}
              moreLabel={dict.home.moreShelves}
            />
          </div>
        </div>
      </section>

      {/* The 3 steps are a real sequence (browse → pay → pick up), so the
          numbers carry information here. */}
      <section className="bg-brand-navy">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:py-16">
          <h2 className="text-xs font-bold uppercase tracking-[0.4em] text-white/60">{dict.home.stepsEyebrow}</h2>
          <ol className="mt-8 grid gap-8 sm:grid-cols-3 sm:gap-6">
            {steps.map((step, index) => (
              <li key={step.title} className="relative flex gap-4 sm:flex-col">
                {index < steps.length - 1 && (
                  <span
                    aria-hidden
                    className="absolute left-[3.75rem] right-0 top-6 hidden border-t-2 border-dashed border-white/20 sm:block"
                  />
                )}
                <span className="label-plate relative shrink-0 self-start font-display text-3xl font-extrabold leading-tight">
                  {index + 1}
                </span>
                <div>
                  <p className="font-display text-2xl font-bold uppercase tracking-wide text-white">
                    {step.title.replace(/^\d+\.\s*/, "")}
                  </p>
                  <p className="mt-1 text-sm text-white/65">{step.description}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Full shelf list, laid out like a book's table of contents. */}
      <section id="rayons" className="mx-auto max-w-6xl scroll-mt-24 px-4 py-14 sm:py-20">
        <h2 className="font-display text-4xl font-extrabold uppercase text-brand-navy sm:text-5xl">
          {dict.home.indexHeading}
        </h2>
        <div className="mt-8 grid gap-10 md:grid-cols-2 md:gap-14">
          <ShelfIndex title={dict.home.librairieHeading} subtitle={dict.home.librairieSub} items={librairie} accent="green" />
          <ShelfIndex title={dict.home.papeterieHeading} subtitle={dict.home.papeterieSub} items={papeterie} accent="gold" />
        </div>
      </section>

      {askLink && (
        <section className="mx-auto max-w-6xl px-4 pb-16 sm:pb-20">
          <div className="flex flex-col items-start gap-5 rounded-3xl border-2 border-brand-navy/10 bg-brand-green/[0.06] p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
            <div>
              <p className="font-display text-3xl font-extrabold uppercase text-brand-navy">{dict.home.askTitle}</p>
              <p className="mt-1 max-w-xl text-sm text-black/60">{dict.home.askDesc}</p>
            </div>
            <a
              href={askLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex shrink-0 items-center gap-2 rounded-full bg-brand-green px-6 py-3 text-sm font-bold text-white transition hover:bg-brand-green-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-navy"
            >
              <MessageCircle size={18} />
              {dict.home.askCta}
            </a>
          </div>
        </section>
      )}
    </div>
  );
}

function BookPage({
  side,
  title,
  description,
  cta,
  href,
  slides,
  shelves,
  moreLabel,
}: {
  side: "left" | "right";
  title: string;
  description: string;
  cta: string;
  href: string;
  slides: Slide[];
  shelves: Category[];
  moreLabel: string;
}) {
  const isLeft = side === "left";
  const shown = shelves.slice(0, SHELVES_PER_PAGE);
  const remaining = shelves.length - shown.length;

  // The fanned page edges of the logo's book: two offset layers behind each
  // page, spreading outward from the spine.
  const pageStack = isLeft
    ? "shadow-[-8px_8px_0_0_var(--color-brand-green-dark),-16px_16px_0_0_rgba(0,191,99,0.25)]"
    : "shadow-[8px_8px_0_0_#e8c63e,16px_16px_0_0_rgba(255,222,89,0.4)]";

  return (
    <div
      className={`${isLeft ? "animate-page-left bg-brand-green text-white sm:rounded-l-[2rem]" : "animate-page-right bg-brand-gold text-brand-navy sm:rounded-r-[2rem]"} ${isLeft ? "rounded-t-[2rem] sm:rounded-tr-none" : "rounded-b-[2rem] sm:rounded-bl-none"} ${pageStack} flex flex-col p-6 sm:p-8`}
    >
      <div className={isLeft ? "text-white" : "text-brand-navy"}>
        <PhotoSlider slides={slides} startDelayMs={isLeft ? 0 : INTERVAL_OFFSET_MS} />
      </div>
      <Link
        href={href}
        className="group mt-4 block rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-navy"
      >
        <h2 className="font-display text-5xl font-extrabold uppercase leading-none tracking-wide sm:text-6xl">
          {title}
        </h2>
        <p className={`mt-2 text-sm font-medium ${isLeft ? "text-white/80" : "text-brand-navy/70"}`}>{description}</p>
        <span
          className={`mt-5 inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold transition ${isLeft ? "bg-white text-brand-navy group-hover:bg-brand-gold" : "bg-brand-navy text-white group-hover:bg-brand-green"}`}
        >
          {cta}
          <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
        </span>
      </Link>

      <ul className={`mt-6 flex flex-wrap gap-2 border-t pt-5 ${isLeft ? "border-white/25" : "border-brand-navy/15"}`}>
        {shown.map((shelf) => (
          <li key={shelf.slug}>
            <Link
              href={`/categorie/${shelf.slug}`}
              className={`block rounded-full px-3 py-1 text-xs font-semibold transition focus-visible:outline-2 focus-visible:outline-brand-navy ${isLeft ? "bg-white/15 hover:bg-white/30" : "bg-brand-navy/10 hover:bg-brand-navy/20"}`}
            >
              {shelf.name}
            </Link>
          </li>
        ))}
        {remaining > 0 && (
          <li>
            <a
              href="#rayons"
              className={`block rounded-full px-3 py-1 text-xs font-bold underline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-brand-navy ${isLeft ? "text-white" : "text-brand-navy"}`}
            >
              +{remaining} {moreLabel}
            </a>
          </li>
        )}
      </ul>
    </div>
  );
}

function ShelfIndex({
  title,
  subtitle,
  items,
  accent,
}: {
  title: string;
  subtitle: string;
  items: Category[];
  accent: "green" | "gold";
}) {
  const rule = accent === "green" ? "border-brand-green" : "border-brand-gold";
  const iconColor = accent === "green" ? "text-brand-green" : "text-brand-navy";
  const iconBg = accent === "green" ? "bg-brand-green/10" : "bg-brand-gold/30";

  return (
    <div className={`border-t-4 ${rule} pt-5`}>
      <h3 className="font-display text-3xl font-bold uppercase tracking-wide text-brand-navy">{title}</h3>
      <p className="text-sm text-black/50">{subtitle}</p>
      <ul className="mt-5">
        {items.map((category) => (
          <li key={category.slug}>
            <Link
              href={`/categorie/${category.slug}`}
              className="group flex items-center gap-3 rounded-lg py-2.5 focus-visible:outline-2 focus-visible:outline-brand-navy"
            >
              <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${iconBg} ${iconColor}`}>
                <CategoryIcon slug={category.slug} size={16} />
              </span>
              <span className="font-semibold text-brand-navy group-hover:text-brand-green">{category.name}</span>
              {/* Dotted leader, as between a chapter title and its page number. */}
              <span aria-hidden className="mx-1 h-0 flex-1 translate-y-1 border-b-2 border-dotted border-black/15" />
              <ArrowRight
                size={16}
                className="shrink-0 text-black/30 transition group-hover:translate-x-1 group-hover:text-brand-green"
              />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
