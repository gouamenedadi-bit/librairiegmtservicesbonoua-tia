import Image from "next/image";
import Link from "next/link";

/**
 * Sign-in / sign-up / password pages: a navy brand panel (logo and the
 * headline in the logo's voice) beside the form.
 * The panel collapses to a slim header strip on phones so the form stays
 * above the fold.
 */
export function AuthShell({
  eyebrow,
  headline,
  mark,
  title,
  subtitle,
  children,
}: {
  eyebrow: string;
  headline: string;
  mark: string;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="animate-fade-in-up mx-auto grid w-full max-w-5xl overflow-hidden rounded-[2rem] bg-white shadow-[0_30px_60px_-25px_rgba(24,43,92,0.35)] lg:grid-cols-[5fr_6fr]">
      <div className="relative flex flex-col justify-start gap-10 overflow-hidden bg-brand-navy p-6 text-white sm:p-10">
        <Link href="/" className="flex items-center gap-3 self-start rounded-xl focus-visible:outline-2 focus-visible:outline-brand-gold">
          <span className="rounded-xl bg-white p-1.5">
            <Image src="/brand/logo.png" alt="" width={44} height={44} />
          </span>
          <span className="leading-tight">
            <span className="block text-sm font-bold">TIA LIBRAIRIE</span>
            <span className="block text-xs font-semibold text-brand-green">GMT SERVICES BONOUA</span>
          </span>
        </Link>

        <div className="hidden lg:block">
          <p className="text-xs font-bold uppercase tracking-[0.4em] text-white/55">{eyebrow}</p>
          <p className="mt-4 font-display text-5xl font-extrabold uppercase leading-[0.95]">
            {headline}
            <br />
            <span className="label-plate mt-2">{mark}</span>
          </p>
        </div>
      </div>

      <div className="p-6 sm:p-10">
        <h1 className="font-display text-4xl font-extrabold uppercase leading-none text-brand-navy">{title}</h1>
        {subtitle && <p className="mt-2 text-sm text-black/55">{subtitle}</p>}
        <div className="mt-8">{children}</div>
      </div>
    </div>
  );
}
