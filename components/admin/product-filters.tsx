"use client";

import { Search } from "lucide-react";

const FILTER_SELECT =
  "rounded-full border border-black/10 bg-white px-4 py-2.5 text-sm text-brand-navy outline-none transition-colors focus:border-brand-green focus:ring-2 focus:ring-brand-green/20";

/**
 * Category/price/photo are <select>s — changing one submits the form
 * immediately (no separate "Filtrer" button to click first). Free-text
 * search stays submit-on-Enter/click (auto-submitting on every keystroke
 * would refetch on each letter typed), so the search icon doubles as the
 * form's one real submit button — needed for implicit Enter-to-submit to
 * keep working now that there's no other submit control on the form.
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
    <form className="mt-6 flex flex-wrap items-end gap-3">
      <div className="relative">
        <label className="mb-1 block text-xs font-medium text-black/50">Recherche</label>
        <button
          type="submit"
          aria-label="Rechercher"
          className="absolute left-3 top-[38px] -translate-y-1/2 text-black/30 hover:text-brand-green"
        >
          <Search size={16} />
        </button>
        <input
          type="search"
          name="q"
          defaultValue={search}
          placeholder="Nom du produit…"
          className={`w-56 py-2.5 pl-9 pr-4 ${FILTER_SELECT}`}
        />
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-black/50">Catégorie</label>
        <select name="categorie" defaultValue={categoryId} onChange={submitForm} className={FILTER_SELECT}>
          <option value="">Toutes</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-black/50">Prix</label>
        <select name="prix" defaultValue={priceStatus} onChange={submitForm} className={FILTER_SELECT}>
          <option value="">Tous</option>
          <option value="on_request">Sur demande (à fixer)</option>
          <option value="priced">Prix fixé</option>
        </select>
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-black/50">Photo</label>
        <select name="photo" defaultValue={hasPhoto} onChange={submitForm} className={FILTER_SELECT}>
          <option value="">Toutes</option>
          <option value="with">Avec photo</option>
          <option value="without">Sans photo</option>
        </select>
      </div>
    </form>
  );
}
