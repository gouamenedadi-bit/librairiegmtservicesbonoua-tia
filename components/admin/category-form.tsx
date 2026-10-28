"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { BookOpen, Check, FolderPlus, Link2, PenLine, Type } from "lucide-react";

import { slugify } from "@/lib/utils/slugify";
import { FORM_BUTTON_PRIMARY, FORM_BUTTON_SECONDARY, FORM_ERROR, FORM_HINT, FORM_LABEL } from "@/lib/ui/form-styles";
import { FormCard } from "@/components/ui/form-card";

type CategoryFormAction = (formData: FormData) => Promise<{ error: string } | { id: string }>;

const SECTIONS = [
  { value: "librairie", label: "Librairie", icon: BookOpen },
  { value: "papeterie", label: "Papeterie", icon: PenLine },
] as const;

export function CategoryForm({
  category,
  action,
}: {
  category?: { id: string; name: string; slug: string };
  action: CategoryFormAction;
}) {
  const router = useRouter();
  const [group, setGroup] = useState<"librairie" | "papeterie">(
    category?.slug.startsWith("librairie-") ? "librairie" : "papeterie",
  );
  const [name, setName] = useState(category?.name ?? "");
  const [slug, setSlug] = useState(category?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(category));
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function recomputeSlug(nextName: string, nextGroup: "librairie" | "papeterie") {
    const base = slugify(nextName);
    setSlug(base ? `${nextGroup}-${base}` : "");
  }

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await action(formData);
      if ("error" in result) {
        setError(result.error);
        return;
      }
      router.push("/admin/categories");
      router.refresh();
    });
  }

  return (
    <form action={handleSubmit}>
      <FormCard
        icon={FolderPlus}
        title="Informations de la catégorie"
        subtitle="Visible immédiatement sur le site une fois enregistrée."
        maxWidth="max-w-none"
      >
        <div className="space-y-6">
          <div>
            <span className={FORM_LABEL}>Section</span>
            <div className="mt-2 grid grid-cols-2 gap-3">
              {SECTIONS.map(({ value, label, icon: Icon }) => {
                const selected = group === value;
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => {
                      setGroup(value);
                      if (!slugTouched) recomputeSlug(name, value);
                    }}
                    className={`flex items-center justify-center gap-2 rounded-2xl border-2 px-4 py-3.5 text-sm font-bold transition-all duration-200 ${
                      selected
                        ? "border-brand-green bg-brand-green/[0.07] text-brand-green shadow-sm"
                        : "border-black/10 text-black/40 hover:border-black/20 hover:text-black/60"
                    }`}
                  >
                    <Icon size={17} strokeWidth={selected ? 2.5 : 2} />
                    {label}
                    {selected && <Check size={15} className="ml-0.5" />}
                  </button>
                );
              })}
            </div>
            <p className={FORM_HINT}>Où la catégorie apparaît sur le site : page d&apos;accueil et menu latéral.</p>
          </div>

          <div>
            <label htmlFor="category-name" className={FORM_LABEL}>
              <Type size={14} className="text-black/30" />
              Nom de la catégorie
            </label>
            <input
              id="category-name"
              name="name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (!slugTouched) recomputeSlug(e.target.value, group);
              }}
              placeholder="Ex. Romans jeunesse"
              required
              className="mt-2 w-full rounded-xl border border-black/10 bg-black/[0.015] px-4 py-3 text-[15px] text-brand-navy outline-none transition-colors placeholder:text-black/30 focus:border-brand-green focus:bg-white focus:ring-2 focus:ring-brand-green/20"
            />
          </div>

          <div>
            <label htmlFor="category-slug" className={FORM_LABEL}>
              <Link2 size={14} className="text-black/30" />
              Adresse web
            </label>
            <div className="mt-2 flex items-stretch overflow-hidden rounded-xl border border-black/10 bg-black/[0.015] transition-colors focus-within:border-brand-green focus-within:bg-white focus-within:ring-2 focus-within:ring-brand-green/20">
              <span className="flex items-center whitespace-nowrap border-r border-black/10 bg-black/[0.03] px-3 font-mono text-[13px] text-black/35">
                tialibrairie.com/categorie/
              </span>
              <input
                id="category-slug"
                name="slug"
                value={slug}
                onChange={(e) => {
                  setSlugTouched(true);
                  setSlug(e.target.value);
                }}
                required
                className="min-w-0 flex-1 bg-transparent px-3 py-3 font-mono text-[13px] text-brand-navy outline-none"
              />
            </div>
            <p className={FORM_HINT}>Généré depuis le nom — modifiable si vous préférez autre chose.</p>
          </div>
        </div>

        {error && <p className={`mt-6 ${FORM_ERROR}`}>{error}</p>}

        <div className="mt-8 flex items-center gap-3">
          <button type="submit" disabled={isPending} className={FORM_BUTTON_PRIMARY}>
            <Check size={16} strokeWidth={3} />
            {isPending ? "Enregistrement…" : "Enregistrer"}
          </button>
          <button type="button" onClick={() => router.push("/admin/categories")} className={FORM_BUTTON_SECONDARY}>
            Annuler
          </button>
        </div>
      </FormCard>
    </form>
  );
}
