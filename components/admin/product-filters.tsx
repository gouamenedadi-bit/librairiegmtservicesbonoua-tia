"use client";

import { Search } from "lucide-react";

const FILTER_SELECT =
  "w-full rounded-lg border border-brand-navy/15 bg-white px-3.5 py-2.5 text-sm text-brand-navy outline-none transition-colors focus:border-brand-navy focus:ring-2 focus:ring-brand-navy/10";

const FILTER_LABEL = "mb-1 block text-xs font-medium text-brand-navy/55";

/**
 * Category/price/photo are <select>s — changing one submits the form
 * immediately (no separate "Filtrer" button to click first). Free-text
 * search stays submit-on-Enter/click (auto-submitting on every keystroke
 * would refetch on each letter typed), so the search icon doubles as the
 * form's one real submit button — needed for implicit Enter-to-submit to
 * keep working now that there's no other submit control on the form.
 *
 * Layout: search on its own full-width row on phones, then the three
 * selects side by side; everything on one row from `lg` up.
 */
export function ProductFilters({
  categories,
  search,
  categoryId,
  priceStatus,
  hasPhoto,
}: {
  categories: { id: string; name: string }[];
  search: string;
  categoryId: string;
  priceStatus: string;
  hasPhoto: string;
}) {
  function submitForm(e: React.ChangeEvent<HTMLSelectElement>) {
    e.currentTarget.form?.requestSubmit();
  }

  return (
    <form className="mt-5 grid grid-cols-3 gap-3 lg:grid-cols-[minmax(0,2fr)_repeat(3,minmax(0,1fr))]">
      <div className="relative col-span-3 lg:col-span-1">
        <label htmlFor="filter-q" className={FILTER_LABEL}>
          Recherche
        </label>
        <button
          type="submit"
          aria-label="Rechercher"
          className="absolute bottom-[11px] left-3 text-brand-navy/35 hover:text-brand-green"
        >
          <Search size={16} />
        </button>
        <input
          id="filter-q"
          type="search"
          name="q"
          defaultValue={search}
          placeholder="Nom du produit…"
          className={`pl-9 ${FILTER_SELECT}`}
        />
      </div>

      <div className="min-w-0">
        <label htmlFor="filter-categorie" className={FILTER_LABEL}>
          Catégorie
        </label>
        <select id="filter-categorie" name="categorie" defaultValue={categoryId} onChange={submitForm} className={FILTER_SELECT}>
          <option value="">Toutes</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <div className="min-w-0">
        <label htmlFor="filter-prix" className={FILTER_LABEL}>
          Prix
        </label>
        <select id="filter-prix" name="prix" defaultValue={priceStatus} onChange={submitForm} className={FILTER_SELECT}>
          <option value="">Tous</option>
          <option value="on_request">Sur demande (à fixer)</option>
          <option value="priced">Prix fixé</option>
        </select>
      </div>

      <div className="min-w-0">
        <label htmlFor="filter-photo" className={FILTER_LABEL}>
          Photo
        </label>
        <select id="filter-photo" name="photo" defaultValue={hasPhoto} onChange={submitForm} className={FILTER_SELECT}>
          <option value="">Toutes</option>
          <option value="with">Avec photo</option>
          <option value="without">Sans photo</option>
        </select>
      </div>
    </form>
  );
}
