"use server";

import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

/**
 * Customer-facing sign-in — distinct from app/login (staff/admin only, and
 * always redirects to /admin). This one respects `redirectTo` so a customer
 * who clicked "Log in" from /compte/avis lands back there, not on the
 * homepage.
 */
export async function signInCustomer(
  formData: FormData,
): Promise<{ error: string } | never> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const redirectTo = String(formData.get("redirectTo") ?? "/compte/avis");

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) return { error: "invalid_credentials" };

  // `startsWith("/")` alone would also admit "//evil.com" — browsers treat a
  // leading "//" as protocol-relative, i.e. an external redirect. Requiring
  // a single "/" not followed by another "/" keeps this to a real internal path.
  const isSafeInternalPath = redirectTo.startsWith("/") && !redirectTo.startsWith("//");
  redirect(isSafeInternalPath ? redirectTo : "/compte/avis");
}
