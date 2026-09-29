import { redirect } from "next/navigation";
import { Star } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { getDictionary } from "@/lib/i18n/dictionary";
import { getLocale } from "@/lib/i18n/get-locale";
import { ReviewForm } from "@/components/product/review-form";

export default async function MyReviewsPage() {
  const dict = getDictionary(await getLocale());
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/compte/connexion?redirect=/compte/avis");

  const [{ data: reviewable }, { data: myReviews }] = await Promise.all([
    supabase.rpc("get_my_reviewable_purchases"),
    supabase
      .from("product_reviews")
      .select("id, rating, comment, created_at, products(name, slug)")
      .eq("profile_id", user.id)
      .order("created_at", { ascending: false }),
  ]);

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-2xl font-bold text-brand-navy">{dict.reviews.pageTitle}</h1>
      <p className="mt-2 text-sm text-black/60">{dict.reviews.pageSubtitle}</p>

      <section className="mt-8">
        <h2 className="text-lg font-bold text-brand-navy">{dict.reviews.toReviewTitle}</h2>
        {!reviewable || reviewable.length === 0 ? (
          <p className="mt-3 text-sm text-black/50">{dict.reviews.toReviewEmpty}</p>
        ) : (
          <ul className="mt-4 space-y-4">
            {reviewable.map((item) => (
              <li key={item.order_item_id} className="rounded-2xl border border-black/5 p-4">
                <ReviewForm
                  orderItemId={item.order_item_id}
                  productId={item.product_id}
                  productName={item.product_name}
                  productSlug={item.product_slug}
                />
              </li>
            ))}
          </ul>
        )}
      </section>

      {myReviews && myReviews.length > 0 && (
        <section className="mt-10">
          <h2 className="text-lg font-bold text-brand-navy">{dict.reviews.myReviewsTitle}</h2>
          <ul className="mt-4 space-y-3">
            {myReviews.map((review) => (
              <li key={review.id} className="rounded-2xl border border-black/5 p-4">
                <p className="text-sm font-semibold text-brand-navy">{review.products?.name}</p>
                <div className="mt-1 flex">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <Star
                      key={n}
                      size={14}
                      className={n <= review.rating ? "fill-brand-gold text-brand-gold" : "fill-black/10 text-black/10"}
                    />
                  ))}
                </div>
                {review.comment && <p className="mt-1 text-sm text-black/60">{review.comment}</p>}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
