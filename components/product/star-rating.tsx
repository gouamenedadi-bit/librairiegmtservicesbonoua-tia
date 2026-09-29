import { Star } from "lucide-react";

/**
 * Renders nothing when there are no reviews yet — this store never shows a
 * star count that isn't backed by real, verified-purchase reviews (see
 * supabase/migrations/0007_product_reviews.sql). A product with 0 reviews
 * has no rating to show, not a fabricated one.
 */
export function StarRating({
  ratings,
  size = 14,
  className = "",
}: {
  ratings: { rating: number }[] | null | undefined;
  size?: number;
  className?: string;
}) {
  if (!ratings || ratings.length === 0) return null;

  const count = ratings.length;
  const average = ratings.reduce((sum, r) => sum + r.rating, 0) / count;
  const rounded = Math.round(average); // nearest whole star for the fill

  return (
    <div
      className={`flex items-center gap-1 ${className}`}
      aria-label={`${average.toFixed(1)} / 5 (${count})`}
    >
      <div className="flex">
        {[1, 2, 3, 4, 5].map((n) => (
          <Star
            key={n}
            size={size}
            className={n <= rounded ? "fill-brand-gold text-brand-gold" : "fill-black/10 text-black/10"}
          />
        ))}
      </div>
      <span className="text-xs font-medium text-black/50">({count})</span>
    </div>
  );
}
