"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useTransition } from "react";
import { Lock, Mail } from "lucide-react";

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
    <div className="flex min-h-screen items-center justify-center bg-brand-navy px-4">
      <div className="w-full max-w-sm animate-fade-in-up rounded-3xl border border-black/5 bg-white p-6 shadow-xl sm:p-8">
        <div className="flex flex-col items-center text-center">
          <Image src="/brand/logo.png" alt="TIA Librairie" width={56} height={56} />
          <h1 className="mt-3 text-lg font-bold text-brand-navy">Espace administration</h1>
          <p className="mt-1 text-xs text-black/40">Réservé à l&apos;équipe TIA Librairie.</p>
        </div>

        <form action={handleSubmit} className="mt-7 space-y-5">
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
      </div>
    </div>
  );
}
