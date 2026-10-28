"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { ChevronLeft, Mail } from "lucide-react";

import { AuthShell } from "@/components/ui/auth-shell";
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
    <div className="flex min-h-screen items-center bg-gradient-to-b from-brand-green/[0.07] to-white px-4 py-10">
      <AuthShell
        eyebrow="Espace administration"
        headline="La librairie qui nourrit"
        mark="vos idées."
        title="Mot de passe oublié"
        subtitle="Entrez votre email, on vous envoie un lien pour en choisir un nouveau."
      >

        {sent ? (
          <p className="rounded-xl bg-brand-green/10 px-4 py-3 text-center text-sm font-medium text-brand-green">
            Si cet email correspond à un compte, un lien de réinitialisation vient d&apos;être envoyé.
          </p>
        ) : (
          <form action={handleSubmit} className="space-y-5">
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
      </AuthShell>
    </div>
  );
}
