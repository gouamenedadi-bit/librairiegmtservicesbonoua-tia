"use client";

import { useState, useTransition } from "react";
import { UserPlus } from "lucide-react";

import { FormCard } from "@/components/ui/form-card";
import { PasswordInput } from "@/components/ui/password-input";
import { FORM_BUTTON_PRIMARY, FORM_ERROR, FORM_INPUT, FORM_LABEL } from "@/lib/ui/form-styles";
import { createAdminAccount } from "@/app/(admin)/admin/equipe/actions";

export function CreateAdminForm() {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  function handleSubmit(formData: FormData) {
    setError(null);
    setSuccess(false);
    startTransition(async () => {
      const result = await createAdminAccount(formData);
      if ("error" in result) setError(result.error);
      else setSuccess(true);
    });
  }

  return (
    <FormCard icon={UserPlus} title="Ajouter un administrateur" subtitle="Donne accès à cette administration." maxWidth="max-w-none">
      <form action={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="new-admin-name" className={FORM_LABEL}>
            Nom complet
          </label>
          <input id="new-admin-name" name="fullName" required className={`mt-2 ${FORM_INPUT}`} />
        </div>
        <div>
          <label htmlFor="new-admin-email" className={FORM_LABEL}>
            Email
          </label>
          <input id="new-admin-email" name="email" type="email" required className={`mt-2 ${FORM_INPUT}`} />
        </div>
        <div>
          <label htmlFor="new-admin-password" className={FORM_LABEL}>
            Mot de passe
          </label>
          <div className="mt-2">
            <PasswordInput id="new-admin-password" name="password" required autoComplete="new-password" />
          </div>
        </div>

        {error && <p className={FORM_ERROR}>{error}</p>}
        {success && (
          <p className="rounded-xl bg-brand-green/10 px-4 py-3 text-sm font-medium text-brand-green">
            Compte créé — il peut se connecter dès maintenant.
          </p>
        )}

        <button type="submit" disabled={isPending} className={FORM_BUTTON_PRIMARY}>
          {isPending ? "Création…" : "Créer le compte"}
        </button>
      </form>
    </FormCard>
  );
}
