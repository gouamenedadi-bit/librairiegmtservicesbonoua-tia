import Link from "next/link";

import { getDictionary } from "@/lib/i18n/dictionary";
import { getLocale } from "@/lib/i18n/get-locale";

export default async function ShopNotFound() {
  const dict = getDictionary(await getLocale());

  return (
    <div className="mx-auto max-w-xl px-4 py-20 text-center sm:py-28">
      <p className="font-display text-8xl font-extrabold leading-none text-brand-navy sm:text-9xl">
        4<span className="label-plate mx-1">0</span>4
      </p>
      <h1 className="mt-8 font-display text-4xl font-extrabold uppercase text-brand-navy">{dict.category.notFoundTitle}</h1>
      <p className="mt-3 text-black/60">{dict.category.notFoundDesc}</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link
          href="/"
          className="rounded-full bg-brand-green px-7 py-3 text-sm font-bold text-white transition hover:bg-brand-green-dark"
        >
          {dict.category.notFoundCta}
        </Link>
        <Link
          href="/recherche"
          className="rounded-full border-2 border-brand-navy/20 px-7 py-2.5 text-sm font-bold text-brand-navy transition hover:bg-brand-navy/5"
        >
          {dict.search.title}
        </Link>
      </div>
    </div>
  );
}
