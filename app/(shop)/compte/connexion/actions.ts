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

  redirect(redirectTo.startsWith("/") ? redirectTo : "/compte/avis");
}
