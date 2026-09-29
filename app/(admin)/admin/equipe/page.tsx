import { Users } from "lucide-react";

import { getAdminAccounts } from "@/lib/admin/queries";
import { FormCard } from "@/components/ui/form-card";
import { CreateAdminForm } from "@/components/admin/create-admin-form";
import { ChangePasswordForm } from "@/components/admin/change-password-form";

export default async function TeamPage() {
  const admins = await getAdminAccounts();

  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-navy">Équipe</h1>
      <p className="mt-1 text-sm text-black/60">Comptes ayant accès à cette administration.</p>

      <div className="mt-6 grid gap-6 lg:grid-cols-2 lg:items-start">
        <FormCard icon={Users} title="Comptes administrateurs" subtitle={`${admins.length} compte(s)`}>
          <ul className="divide-y divide-black/5">
            {admins.map((admin) => (
              <li key={admin.id} className="py-3">
                <p className="font-semibold text-brand-navy">{admin.full_name ?? "Sans nom"}</p>
                <p className="text-sm text-black/50">{admin.email}</p>
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
