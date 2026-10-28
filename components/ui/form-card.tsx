import type { LucideIcon } from "lucide-react";

import { ADMIN_CARD } from "@/lib/ui/table-styles";

/** Shared white card every admin form renders inside — see
 * lib/ui/form-styles.ts for the matching input/label/button classes.
 * (Storefront sign-in/sign-up use components/ui/auth-shell.tsx instead.) */
export function FormCard({
  icon: Icon,
  title,
  subtitle,
  maxWidth = "max-w-xl",
  children,
}: {
  icon: LucideIcon;
  title: string;
  subtitle?: string;
  maxWidth?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`mx-auto w-full ${maxWidth} animate-fade-in-up p-5 sm:p-7 ${ADMIN_CARD}`}>
      <div className="flex items-center gap-3 border-b border-brand-navy/[0.08] pb-5">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-navy/[0.06] text-brand-navy">
          <Icon size={19} />
        </span>
        <div className="min-w-0">
          <p className="text-base font-semibold text-brand-navy">{title}</p>
          {subtitle && <p className="mt-0.5 text-sm text-brand-navy/50">{subtitle}</p>}
        </div>
      </div>
      <div className="mt-6">{children}</div>
    </div>
  );
}
