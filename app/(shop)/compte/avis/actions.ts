"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

export type SubmitReviewResult = { error: "not_authenticated" | "invalid_rating" | "generic" } | { success: true };

/**
 * The client only supplies orderItemId/productId/rating/comment — eligibility
 * (real, delivered purchase) is re-checked by the RLS INSERT policy itself
 * (see supabase/migrations/0007_product_reviews.sql), the same
 * trust-nothing-from-the-client pattern as create_order(). A tampered
 * orderItemId for a purchase that isn't the caller's, or isn't delivered
 * yet, is rejected at the database, not just hidden in the UI.
 */
export async function submitReview({
  orderItemId,
  productId,
  rating,
  comment,
}: {
  orderItemId: string;
  productId: string;
  rating: number;
  comment: string;
}): Promise<SubmitReviewResult> {
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) return { error: "invalid_rating" };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "not_authenticated" };

  const { error } = await supabase.from("product_reviews").insert({
    product_id: productId,
    profile_id: user.id,
    order_item_id: orderItemId,
    rating,
    comment: comment.trim() || null,
  });

  if (error) return { error: "generic" };

  revalidatePath("/compte/avis");
  return { success: true };
}
