import Link from "next/link";
import { ChevronLeft } from "lucide-react";

/**
 * Title row shared by every admin page: optional back link, condensed title,
 * one line of context, and the page's main actions on the right.
 *
 * `sticky` pins it (with the list filters passed as children) to the top of
 * long list pages — from `md` up only, since on a phone a pinned bar full of
 * filters would eat half the screen. The negative margins cancel <main>'s padding (see
 * app/(admin)/admin/layout.tsx) so the pinned bar spans the full content width.
 */
export function AdminPageHeader({
  title,
  description,
  back,
  actions,
  sticky = false,
  children,
}: {
  title: React.ReactNode;
  description?: React.ReactNode;
  back?: { href: string; label: string };
  actions?: React.ReactNode;
  sticky?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <div
      className={
        sticky
          ? "z-10 -mx-4 -mt-4 border-b border-brand-navy/[0.08] bg-[#f5f7fb]/95 px-4 pb-5 pt-4 backdrop-blur sm:-mx-6 sm:-mt-6 sm:px-6 sm:pt-6 md:sticky md:top-[60px] lg:top-0 lg:-mx-8 lg:-mt-8 lg:px-8 lg:pt-8"
          : ""
      }
    >
      {back && (
        <Link
          href={back.href}
          className="mb-3 inline-flex items-center gap-1 text-sm font-medium text-brand-navy/55 transition hover:text-brand-navy"
        >
          <ChevronLeft size={16} />
          {back.label}
        </Link>
      )}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <h1 className="font-display text-3xl font-bold uppercase leading-none tracking-wide text-brand-navy sm:text-4xl">
            {title}
          </h1>
          {description && <p className="mt-2 text-sm text-brand-navy/55">{description}</p>}
        </div>
        {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
      </div>
      {children}
    </div>
  );
}
