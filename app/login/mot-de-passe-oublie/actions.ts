"use server";

import { createClient } from "@/lib/supabase/server";

/**
 * Always returns the same generic success message regardless of whether the
 * email matches a real account — a different message for "not found" would
 * let anyone probe which emails have an account here.
 */
export async function requestPasswordReset(formData: FormData): Promise<{ ok: true } | { error: string }> {
  const email = String(formData.get("email") ?? "").trim();
  if (!email) return { error: "Entrez votre email." };

  const supabase = await createClient();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${siteUrl}/login/reinitialiser`,
  });

  return { ok: true };
}
