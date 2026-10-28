/**
 * Storefront page title, in the homepage's voice: a wide-tracked eyebrow
 * (the logo's "L I B R A I R I E") over a condensed display heading. `mark`
 * is the one word set in the logo's yellow plate — use it sparingly.
 */
export function PageHeading({
  eyebrow,
  title,
  mark,
  subtitle,
  align = "left",
  children,
}: {
  eyebrow?: string;
  title: string;
  mark?: string;
  subtitle?: React.ReactNode;
  align?: "left" | "center";
  children?: React.ReactNode;
}) {
  const centered = align === "center";

  return (
    <div className={centered ? "text-center" : ""}>
      {eyebrow && (
        <p className="text-xs font-bold uppercase tracking-[0.4em] text-brand-navy/55">{eyebrow}</p>
      )}
      <h1 className="mt-3 font-display text-4xl font-extrabold uppercase leading-[0.95] text-brand-navy sm:text-5xl">
        {title}
        {mark && (
          <>
            {" "}
            <span className="label-plate">{mark}</span>
          </>
        )}
      </h1>
      {subtitle && (
        <p className={`mt-3 text-sm text-black/55 sm:text-base ${centered ? "mx-auto max-w-xl" : "max-w-2xl"}`}>
          {subtitle}
        </p>
      )}
      {children}
    </div>
  );
}
