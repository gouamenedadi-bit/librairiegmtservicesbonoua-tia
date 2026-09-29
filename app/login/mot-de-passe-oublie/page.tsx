"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useTransition } from "react";
import { ChevronLeft, Mail } from "lucide-react";

import { FORM_BUTTON_PRIMARY, FORM_ERROR, FORM_INPUT, FORM_LABEL } from "@/lib/ui/form-styles";
import { requestPasswordReset } from "./actions";

export default function ForgotPasswordPage() {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await requestPasswordReset(formData);
      if ("error" in result) setError(result.error);
      else setSent(true);
    });
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-brand-navy px-4">
      <div className="w-full max-w-sm animate-fade-in-up rounded-3xl border border-black/5 bg-white p-6 shadow-xl sm:p-8">
        <div className="flex flex-col items-center text-center">
          <Image src="/brand/logo.png" alt="TIA Librairie" width={56} height={56} />
          <h1 className="mt-3 text-lg font-bold text-brand-navy">Mot de passe oublié</h1>
          <p className="mt-1 text-xs text-black/40">
            Entrez votre email, on vous envoie un lien pour en choisir un nouveau.
          </p>
        </div>

        {sent ? (
          <p className="mt-7 rounded-xl bg-brand-green/10 px-4 py-3 text-center text-sm font-medium text-brand-green">
            Si cet email correspond à un compte, un lien de réinitialisation vient d&apos;être envoyé.
          </p>
        ) : (
          <form action={handleSubmit} className="mt-7 space-y-5">
            <div>
              <label htmlFor="reset-email" className={FORM_LABEL}>
                <Mail size={14} className="text-black/30" />
                Email
              </label>
              <input
                id="reset-email"
                name="email"
                type="email"
                required
                autoComplete="username"
                className={`mt-2 ${FORM_INPUT}`}
              />
            </div>

            {error && <p className={FORM_ERROR}>{error}</p>}

            <button type="submit" disabled={isPending} className={`w-full ${FORM_BUTTON_PRIMARY}`}>
              {isPending ? "Envoi…" : "Envoyer le lien"}
            </button>
          </form>
        )}

        <Link
          href="/login"
          className="mt-5 flex items-center justify-center gap-1 text-xs font-semibold text-brand-navy/60 hover:text-brand-green"
        >
          <ChevronLeft size={14} />
          Retour à la connexion
        </Link>
      </div>
    </div>
  );
}
