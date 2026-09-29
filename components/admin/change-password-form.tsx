"use client";

import { useState, useTransition } from "react";
import { KeyRound } from "lucide-react";

import { FormCard } from "@/components/ui/form-card";
import { PasswordInput } from "@/components/ui/password-input";
import { FORM_BUTTON_PRIMARY, FORM_ERROR, FORM_LABEL } from "@/lib/ui/form-styles";
import { changeMyPassword } from "@/app/(admin)/admin/equipe/actions";

export function ChangePasswordForm() {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  function handleSubmit(formData: FormData) {
    setError(null);
    setSuccess(false);
    const password = String(formData.get("password") ?? "");
    const confirm = String(formData.get("confirm") ?? "");
    if (password !== confirm) {
      setError("Les deux mots de passe ne correspondent pas.");
      return;
    }
    startTransition(async () => {
      const result = await changeMyPassword(formData);
      if ("error" in result) setError(result.error);
      else setSuccess(true);
    });
  }

  return (
    <FormCard icon={KeyRound} title="Mon mot de passe" subtitle="Change le mot de passe de votre propre compte.">
      <form action={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="my-new-password" className={FORM_LABEL}>
            Nouveau mot de passe
          </label>
          <div className="mt-2">
            <PasswordInput id="my-new-password" name="password" required autoComplete="new-password" />
          </div>
        </div>
        <div>
          <label htmlFor="my-confirm-password" className={FORM_LABEL}>
            Confirmer
          </label>
          <div className="mt-2">
            <PasswordInput id="my-confirm-password" name="confirm" required autoComplete="new-password" />
          </div>
        </div>

        {error && <p className={FORM_ERROR}>{error}</p>}
        {success && (
          <p className="rounded-xl bg-brand-green/10 px-4 py-3 text-sm font-medium text-brand-green">
            Mot de passe changé.
          </p>
        )}

        <button type="submit" disabled={isPending} className={FORM_BUTTON_PRIMARY}>
          {isPending ? "Enregistrement…" : "Changer le mot de passe"}
        </button>
      </form>
    </FormCard>
  );
}
