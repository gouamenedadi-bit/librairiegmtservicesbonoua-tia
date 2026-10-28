"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Lock } from "lucide-react";

import { createClient } from "@/lib/supabase/client";
import { AuthShell } from "@/components/ui/auth-shell";
import { PasswordInput } from "@/components/ui/password-input";
import { FORM_BUTTON_PRIMARY, FORM_ERROR, FORM_LABEL } from "@/lib/ui/form-styles";

/**
 * The password-reset email link lands here with a recovery token in the URL.
 * The Supabase browser client (created with default options, so
 * detectSessionInUrl stays on) picks that token up on its own as soon as
 * it's created below — no manual parsing needed — and fires a
 * PASSWORD_RECOVERY auth event once it has a real session from it.
 */
export default function ResetPasswordPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") setReady(true);
    });
    // Covers the case where the recovery session was already established by
    // the time this component mounted (event fired before the listener was attached).
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true);
    });
    return () => subscription.unsubscribe();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < 12) {
      setError("Le mot de passe doit contenir au moins 12 caractères.");
      return;
    }
    if (password !== confirm) {
      setError("Les deux mots de passe ne correspondent pas.");
      return;
    }

    setIsPending(true);
    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setIsPending(false);

    if (updateError) {
      setError("Impossible de changer le mot de passe. Renvoyez-vous un nouveau lien.");
      return;
    }

    setDone(true);
    setTimeout(() => router.push("/admin"), 1500);
  }

  return (
    <div className="flex min-h-screen items-center bg-gradient-to-b from-brand-green/[0.07] to-white px-4 py-10">
      <AuthShell
        eyebrow="Espace administration"
        headline="La librairie qui nourrit"
        mark="vos idées."
        title="Nouveau mot de passe"
        subtitle="Choisissez un mot de passe d'au moins 12 caractères."
      >

        {done ? (
          <p className="rounded-xl bg-brand-green/10 px-4 py-3 text-center text-sm font-medium text-brand-green">
            Mot de passe changé — redirection…
          </p>
        ) : !ready ? (
          <p className="text-sm text-black/50">
            Ouvrez cette page depuis le lien reçu par email pour continuer.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="new-password" className={FORM_LABEL}>
                <Lock size={14} className="text-black/30" />
                Nouveau mot de passe
              </label>
              <div className="mt-2">
                <PasswordInput
                  id="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                  required
                />
              </div>
            </div>
            <div>
              <label htmlFor="confirm-password" className={FORM_LABEL}>
                <Lock size={14} className="text-black/30" />
                Confirmer le mot de passe
              </label>
              <div className="mt-2">
                <PasswordInput
                  id="confirm-password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  autoComplete="new-password"
                  required
                />
              </div>
            </div>

            {error && <p className={FORM_ERROR}>{error}</p>}

            <button type="submit" disabled={isPending} className={`w-full ${FORM_BUTTON_PRIMARY}`}>
              {isPending ? "Enregistrement…" : "Changer le mot de passe"}
            </button>
          </form>
        )}
      </AuthShell>
    </div>
  );
}
