"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Mail, Lock } from "lucide-react";

import { useTranslations } from "@/lib/i18n/locale-provider";
import { FORM_BUTTON_PRIMARY, FORM_ERROR } from "@/lib/ui/form-styles";
import { AuthShell } from "@/components/ui/auth-shell";
import { LabeledField } from "@/components/ui/labeled-field";
import { signInCustomer } from "./actions";

export default function CustomerLoginPage() {
  const dict = useTranslations();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") ?? "/compte/avis";
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await signInCustomer(formData);
      if (result?.error) setError(dict.login.error);
    });
  }

  return (
    <div className="px-4 py-8 sm:py-14">
      <form action={handleSubmit}>
        <input type="hidden" name="redirectTo" value={redirectTo} />
        <AuthShell eyebrow={dict.nav.account} headline={dict.home.titleLead} mark={dict.home.titleMark} title={dict.login.title} subtitle={dict.login.subtitle}>
          <div className="space-y-5">
            <LabeledField label={dict.login.email} icon={Mail} name="email" type="email" autoComplete="email" required />
            <LabeledField
              label={dict.login.password}
              icon={Lock}
              name="password"
              type="password"
              autoComplete="current-password"
              required
            />
          </div>

          {error && <p className={`mt-6 ${FORM_ERROR}`}>{error}</p>}

          <button type="submit" disabled={isPending} className={`mt-8 w-full ${FORM_BUTTON_PRIMARY}`}>
            {isPending ? dict.login.submitting : dict.login.submit}
          </button>

          <p className="mt-5 text-center text-sm text-black/50">
            {dict.login.noAccount}{" "}
            <Link href="/compte/inscription" className="font-semibold text-brand-green hover:underline">
              {dict.login.createAccount}
            </Link>
          </p>
        </AuthShell>
      </form>
    </div>
  );
}
