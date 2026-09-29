import type { LucideIcon } from "lucide-react";

/** Shared centered white card every form in the app renders inside — see
 * lib/ui/form-styles.ts for the matching input/label/button classes. */
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
    <div
      className={`mx-auto w-full ${maxWidth} animate-fade-in-up rounded-3xl border border-black/5 bg-white p-6 shadow-sm sm:p-8`}
    >
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-brand-green/10 text-brand-green">
          <Icon size={20} />
        </span>
        <div>
          <p className="font-bold text-brand-navy">{title}</p>
          {subtitle && <p className="text-xs text-black/40">{subtitle}</p>}
        </div>
      </div>
      <div className="mt-7">{children}</div>
    </div>
  );
}
