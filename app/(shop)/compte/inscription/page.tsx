"use client";

import { useState, useTransition } from "react";
import { Lock, Mail, MapPin, Phone, UserPlus, UserRound } from "lucide-react";

import { useTranslations } from "@/lib/i18n/locale-provider";
import { FORM_BUTTON_PRIMARY, FORM_ERROR } from "@/lib/ui/form-styles";
import { AuthShell } from "@/components/ui/auth-shell";
import { LabeledField } from "@/components/ui/labeled-field";
import { signUpCustomer } from "./actions";

export default function SignUpPage() {
  const dict = useTranslations();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await signUpCustomer(formData);
      if ("error" in result) {
        setError(result.error === "mismatch" ? dict.auth.passwordMismatch : dict.auth.genericError);
        return;
      }
      setSuccess(true);
    });
  }

  if (success) {
    return (
      <div className="animate-fade-in-up mx-auto max-w-md px-4 py-20 text-center">
        <span className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-brand-green text-white">
          <UserPlus size={36} />
        </span>
        <p className="mt-6 font-display text-4xl font-extrabold uppercase text-brand-navy">{dict.auth.signupTitle}</p>
        <p className="mt-3 text-black/60">{dict.auth.success}</p>
      </div>
    );
  }

  return (
    <div className="px-4 py-8 sm:py-14">
      <form action={handleSubmit}>
        <AuthShell eyebrow={dict.nav.account} headline={dict.home.titleLead} mark={dict.home.titleMark} title={dict.auth.signupTitle} subtitle={dict.auth.signupSubtitle}>
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <LabeledField label={dict.auth.firstName} icon={UserRound} name="firstName" autoComplete="given-name" required />
              <LabeledField label={dict.auth.lastName} icon={UserRound} name="lastName" autoComplete="family-name" required />
            </div>
            <LabeledField label={dict.auth.email} icon={Mail} name="email" type="email" autoComplete="email" required />
            <LabeledField
              label={dict.auth.phone}
              icon={Phone}
              name="phone"
              type="tel"
              autoComplete="tel"
              placeholder="07 00 00 00 00"
              required
            />
            <LabeledField
              label={dict.auth.neighborhood}
              icon={MapPin}
              name="neighborhood"
              autoComplete="address-level2"
              required
            />
            <LabeledField
              label={dict.auth.password}
              icon={Lock}
              name="password"
              type="password"
              autoComplete="new-password"
              required
              minLength={6}
            />
            <LabeledField
              label={dict.auth.confirmPassword}
              icon={Lock}
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              required
              minLength={6}
            />
          </div>

          {error && <p className={`mt-6 ${FORM_ERROR}`}>{error}</p>}

          <button type="submit" disabled={isPending} className={`mt-8 w-full ${FORM_BUTTON_PRIMARY}`}>
            {isPending ? dict.auth.submitting : dict.auth.submit}
          </button>
        </AuthShell>
      </form>
    </div>
  );
}
