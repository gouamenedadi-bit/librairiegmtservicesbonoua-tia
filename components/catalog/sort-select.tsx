"use client";

import { useRouter, useSearchParams } from "next/navigation";

import { useTranslations } from "@/lib/i18n/locale-provider";

export function SortSelect() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dict = useTranslations();
  const current = searchParams.get("tri") ?? "nom";

  const options = [
    { value: "nom", label: dict.category.sortName },
    { value: "prix-asc", label: dict.category.sortPriceAsc },
    { value: "prix-desc", label: dict.category.sortPriceDesc },
  ];

  return (
    <select
      value={current}
      onChange={(event) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("tri", event.target.value);
        router.push(`?${params.toString()}`, { scroll: false });
      }}
      className="rounded-full border border-black/10 bg-white px-4 py-2 text-xs font-medium text-brand-navy outline-none transition-colors focus:border-brand-green"
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {dict.category.sortPrefix}
          {option.label}
        </option>
      ))}
    </select>
  );
}
