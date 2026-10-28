"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { Lock, Mail } from "lucide-react";

import { AuthShell } from "@/components/ui/auth-shell";
import { PasswordInput } from "@/components/ui/password-input";
import { FORM_BUTTON_PRIMARY, FORM_ERROR, FORM_INPUT, FORM_LABEL } from "@/lib/ui/form-styles";
import { signIn } from "./actions";

export default function LoginPage() {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await signIn(formData);
      if (result?.error) setError(result.error);
    });
  }

  return (
    <div className="flex min-h-screen items-center bg-gradient-to-b from-brand-green/[0.07] to-white px-4 py-10">
      <AuthShell
        eyebrow="Espace administration"
        headline="La librairie qui nourrit"
        mark="vos idées."
        title="Connexion"
        subtitle="Réservé à l'équipe TIA Librairie."
      >

        <form action={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="login-email" className={FORM_LABEL}>
              <Mail size={14} className="text-black/30" />
              Email
            </label>
            <input
              id="login-email"
              name="email"
              type="email"
              required
              autoComplete="username"
              className={`mt-2 ${FORM_INPUT}`}
            />
          </div>
          <div>
            <label htmlFor="login-password" className={FORM_LABEL}>
              <Lock size={14} className="text-black/30" />
              Mot de passe
            </label>
            <div className="mt-2">
              <PasswordInput id="login-password" name="password" required autoComplete="current-password" />
            </div>
          </div>

          {error && <p className={FORM_ERROR}>{error}</p>}

          <button type="submit" disabled={isPending} className={`w-full ${FORM_BUTTON_PRIMARY}`}>
            {isPending ? "Connexion…" : "Se connecter"}
          </button>
        </form>

        <Link
          href="/login/mot-de-passe-oublie"
          className="mt-5 block text-center text-xs font-semibold text-brand-navy/60 hover:text-brand-green"
        >
          Mot de passe oublié ?
        </Link>
      </AuthShell>
    </div>
  );
}
