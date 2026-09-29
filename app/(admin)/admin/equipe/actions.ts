"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Re-checks the caller is really an admin using their own session, never
 * trusting that only admins can reach this action just because the page
 * that calls it is gated — a Server Action is its own callable endpoint,
 * same defense-in-depth pattern as every other admin write in this app.
 */
async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (profile?.role !== "admin") return null;

  return user;
}

export async function createAdminAccount(
  formData: FormData,
): Promise<{ error: string } | { ok: true }> {
  const caller = await requireAdmin();
  if (!caller) return { error: "Non autorisé." };

  const fullName = String(formData.get("fullName") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!fullName || !email) return { error: "Nom et email requis." };
  if (password.length < 6) return { error: "Le mot de passe doit contenir au moins 6 caractères." };

  const admin = createAdminClient();
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName },
  });

  if (error || !data.user) {
    return { error: "Impossible de créer ce compte (email déjà utilisé ?)." };
  }

  // The handle_new_user() trigger (migration 0006) already created a
  // 'customer' profile row for this new auth user — promote it here.
  const { error: profileError } = await admin
    .from("profiles")
    .update({ role: "admin", full_name: fullName })
    .eq("id", data.user.id);

  if (profileError) return { error: "Compte créé mais impossible de le passer administrateur." };

  revalidatePath("/admin/equipe");
  return { ok: true };
}

export async function changeMyPassword(
  formData: FormData,
): Promise<{ error: string } | { ok: true }> {
  const caller = await requireAdmin();
  if (!caller) return { error: "Non autorisé." };

  const password = String(formData.get("password") ?? "");
  if (password.length < 6) return { error: "Le mot de passe doit contenir au moins 6 caractères." };

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { error: "Impossible de changer le mot de passe." };

  return { ok: true };
}
