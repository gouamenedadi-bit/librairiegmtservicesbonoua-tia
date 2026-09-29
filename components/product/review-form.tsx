"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Star } from "lucide-react";

import { useTranslations } from "@/lib/i18n/locale-provider";
import { FORM_INPUT } from "@/lib/ui/form-styles";
import { submitReview } from "@/app/(shop)/compte/avis/actions";

export function ReviewForm({
  orderItemId,
  productId,
  productName,
  productSlug,
}: {
  orderItemId: string;
  productId: string;
  productName: string;
  productSlug: string;
}) {
  const dict = useTranslations();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isPending, startTransition] = useTransition();
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const displayRating = hoverRating || rating;

  function handleSubmit() {
    if (rating === 0) return;
    setError(null);
    startTransition(async () => {
      const result = await submitReview({ orderItemId, productId, rating, comment });
      if (result && "error" in result) setError(dict.reviews.genericError);
      else setDone(true);
    });
  }

  if (done) {
    return (
      <div>
        <p className="text-sm font-semibold text-brand-navy">{productName}</p>
        <p className="mt-1 text-sm font-semibold text-brand-green">{dict.reviews.success}</p>
      </div>
    );
  }

  return (
    <div>
      <Link href={`/produit/${productSlug}`} className="text-sm font-semibold text-brand-navy hover:text-brand-green">
        {productName}
      </Link>

      <p className="mt-3 text-xs font-semibold text-brand-navy/60">{dict.reviews.ratingLabel}</p>
      <div className="mt-1 flex gap-1" onMouseLeave={() => setHoverRating(0)}>
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            aria-label={`${n}/5`}
            onMouseEnter={() => setHoverRating(n)}
            onClick={() => setRating(n)}
            className="transition-transform hover:scale-110"
          >
            <Star size={24} className={n <= displayRating ? "fill-brand-gold text-brand-gold" : "fill-black/10 text-black/10"} />
          </button>
        ))}
      </div>

      <label className="mt-3 block">
        <span className="text-xs font-semibold text-brand-navy/60">{dict.reviews.commentLabel}</span>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder={dict.reviews.commentPlaceholder}
          rows={2}
          className={`mt-1.5 ${FORM_INPUT}`}
        />
      </label>

      {error && <p className="mt-2 text-xs font-medium text-red-600">{error}</p>}

      <button
        type="button"
        disabled={rating === 0 || isPending}
        onClick={handleSubmit}
        className="mt-3 rounded-full bg-brand-green px-5 py-2 text-xs font-bold text-white transition hover:bg-brand-green-dark disabled:pointer-events-none disabled:opacity-50"
      >
        {isPending ? dict.reviews.submitting : dict.reviews.submit}
      </button>
    </div>
  );
}
