"use client";

import { useState } from "react";
import { ChevronDown, Globe } from "lucide-react";

import { useLocale } from "@/lib/i18n/locale-provider";
import type { Locale } from "@/lib/i18n/dictionary";

const OPTIONS: { value: Locale; label: string }[] = [
  { value: "fr", label: "FR" },
  { value: "en", label: "EN" },
];

export function LanguageSwitcher() {
  const { locale, setLocale, dict } = useLocale();
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={dict.language.label}
        className="flex items-center gap-1 rounded-full px-2 py-2 text-xs font-bold text-brand-navy transition-colors hover:bg-brand-navy/5"
      >
        <Globe size={16} />
        {locale.toUpperCase()}
        <ChevronDown size={12} className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} aria-hidden="true" />
          <ul className="absolute right-0 z-20 mt-1 w-32 overflow-hidden rounded-xl border border-black/5 bg-white py-1 shadow-lg">
            {OPTIONS.map((option) => (
              <li key={option.value}>
                <button
                  type="button"
                  onClick={() => {
                    setLocale(option.value);
                    setOpen(false);
                  }}
                  className={`flex w-full items-center px-3 py-2 text-left text-xs transition-colors hover:bg-brand-green/10 ${
                    locale === option.value ? "font-bold text-brand-green" : "text-brand-navy"
                  }`}
                >
                  {option.value === "fr" ? dict.language.fr : dict.language.en}
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
