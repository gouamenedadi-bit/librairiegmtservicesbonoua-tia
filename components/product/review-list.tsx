import { Star } from "lucide-react";

import { getDictionary } from "@/lib/i18n/dictionary";
import { getLocale } from "@/lib/i18n/get-locale";

type Review = { id: string; rating: number; comment: string | null; created_at: string };

/** Real reviews only — see components/product/star-rating.tsx for the same rule. */
export async function ReviewList({ reviews }: { reviews: Review[] | null | undefined }) {
  if (!reviews || reviews.length === 0) return null;
  const dict = getDictionary(await getLocale());

  const sorted = [...reviews].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );

  return (
    <section className="mt-16 border-t border-black/10 pt-10">
      <h2 className="font-display text-3xl font-extrabold uppercase text-brand-navy">
        {dict.reviews.title} <span className="text-brand-navy/40">({reviews.length})</span>
      </h2>
      <ul className="mt-6 grid gap-4 md:grid-cols-2">
        {sorted.map((review) => (
          <li key={review.id} className="rounded-2xl border border-black/[0.07] bg-white p-5">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((n) => (
                <Star
                  key={n}
                  size={14}
                  className={n <= review.rating ? "fill-brand-gold text-brand-gold" : "fill-black/10 text-black/10"}
                />
              ))}
            </div>
            {review.comment && <p className="mt-2 text-sm text-black/70">{review.comment}</p>}
            <p className="mt-2 text-xs text-black/40">
              {new Date(review.created_at).toLocaleDateString("fr-FR", { year: "numeric", month: "long", day: "numeric" })}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
