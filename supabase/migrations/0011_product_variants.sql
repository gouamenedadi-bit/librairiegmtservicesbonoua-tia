-- Color/style variants: no reliable automatic way to detect that two
-- imported product rows are "the same item in a different color" (same
-- lesson as photo matching earlier in this project — the source data has no
-- such link), so this is a manual admin-curated grouping. Products sharing
-- the same non-null variant_group_id are siblings; variant_label is the
-- per-product name shown under its swatch (e.g. "Bleu", "Rouge").
alter table public.products
  add column variant_group_id uuid,
  add column variant_label text;

create index products_variant_group_id_idx
  on public.products (variant_group_id)
  where variant_group_id is not null;
