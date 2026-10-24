import "server-only";

import { createClient } from "@/lib/supabase/server";

/**
 * Re-checks the caller is really an admin using their own session, never
 * trusting that only admins can reach a Server Action just because the page
 * that renders its form is gated — a Server Action is its own callable
 * endpoint. RLS (`is_admin()` policies) is the real enforcement boundary for
 * most admin writes in this app, but this is the redundant application-level
 * check for actions where that alone isn't enough to rely on — e.g. an
 * action that uses the service-role client (which bypasses RLS entirely).
 */
export async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (profile?.role !== "admin") return null;

  return user;
}
