"use server";

import { createClient } from "@/lib/supabase/server";

export type SignUpResult = { error: "mismatch" | "generic" } | { success: true };

/**
 * No RLS insert policy is needed on `profiles`: a database trigger
 * (`handle_new_user`, see supabase/migrations/0006_customer_signup.sql)
 * creates the row automatically from the metadata passed here.
 */
export async function signUpCustomer(formData: FormData): Promise<SignUpResult> {
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");
  if (password !== confirmPassword) return { error: "mismatch" };

  const firstName = String(formData.get("firstName") ?? "").trim();
  const lastName = String(formData.get("lastName") ?? "").trim();

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email: String(formData.get("email") ?? ""),
    password,
    options: {
      data: {
        full_name: `${firstName} ${lastName}`.trim(),
        phone: String(formData.get("phone") ?? "").trim(),
        neighborhood: String(formData.get("neighborhood") ?? "").trim(),
      },
    },
  });

  if (error) return { error: "generic" };
  return { success: true };
}
