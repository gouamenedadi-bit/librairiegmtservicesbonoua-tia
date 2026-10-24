import { Users } from "lucide-react";

import { getAdminAccounts } from "@/lib/admin/queries";
import { createClient } from "@/lib/supabase/server";
import { FormCard } from "@/components/ui/form-card";
import { CreateAdminForm } from "@/components/admin/create-admin-form";
import { ChangePasswordForm } from "@/components/admin/change-password-form";

function initials(name: string | null, email: string | null) {
  const source = name?.trim() || email || "?";
  const parts = source.split(/\s+/).filter(Boolean);
  const letters = parts.length > 1 ? parts[0][0] + parts[1][0] : source.slice(0, 2);
  return letters.toUpperCase();
}

export default async function TeamPage() {
  const supabase = await createClient();
  const [{ data: { user } }, admins] = await Promise.all([supabase.auth.getUser(), getAdminAccounts()]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-navy">Équipe</h1>
      <p className="mt-1 text-sm text-black/60">Comptes ayant accès à cette administration.</p>

      <div className="mt-6 grid gap-6 lg:grid-cols-2 lg:items-start">
        <FormCard icon={Users} title="Comptes administrateurs" subtitle={`${admins.length} compte(s)`}>
          <ul className="divide-y divide-black/5">
            {admins.map((admin) => (
              <li key={admin.id} className="flex items-center gap-3 py-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-navy text-sm font-bold text-brand-gold">
                  {initials(admin.full_name, admin.email)}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-brand-navy">{admin.full_name ?? "Sans nom"}</p>
                  <p className="truncate text-sm text-black/50">{admin.email}</p>
                </div>
                {admin.id === user?.id && (
                  <span className="shrink-0 rounded-full bg-brand-green/10 px-2.5 py-1 text-xs font-bold text-brand-green">
                    Vous
                  </span>
                )}
              </li>
            ))}
          </ul>
        </FormCard>

        <div className="space-y-6">
          <CreateAdminForm />
          <ChangePasswordForm />
        </div>
      </div>
    </div>
  );
}
