-- upsert_imported_product: the only way the import script writes a product.
-- Supabase-js's plain `.upsert()` always overwrites every column on
-- conflict, which would silently erase any manual edit an admin made in the
-- dashboard (a richer description, a reassigned category, a hand-picked
-- image) the next time the client's Excel file is re-imported. This
-- function keeps catalog-sourced fields (name/price/category/type) in sync
-- from Excel ONLY while `manually_edited_at is null`; once a human has
-- touched the row, re-imports just bump `catalog_synced_at` and leave the
-- rest alone.
create or replace function upsert_imported_product(
  p_source_sheet text,
  p_source_code text,
  p_sku text,
  p_name text,
  p_slug text,
  p_category_id uuid,
  p_type_raw text,
  p_price integer,
  p_price_status price_status
)
returns table (id uuid, was_created boolean)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
  v_manually_edited_at timestamptz;
begin
  select products.id, products.manually_edited_at into v_id, v_manually_edited_at
    from products
    where source_sheet = p_source_sheet and source_code = p_source_code;

  if v_id is null then
    insert into products (
      source_sheet, source_code, sku, name, slug, category_id, type_raw,
      price, price_status, catalog_synced_at
    ) values (
      p_source_sheet, p_source_code, p_sku, p_name, p_slug, p_category_id, p_type_raw,
      p_price, p_price_status, now()
    )
    returning products.id into v_id;
    return query select v_id, true;
  end if;

  if v_manually_edited_at is null then
    update products set
      sku = p_sku,
      name = p_name,
      slug = p_slug,
      category_id = p_category_id,
      type_raw = p_type_raw,
      price = p_price,
      price_status = p_price_status,
      catalog_synced_at = now()
    where id = v_id;
  else
    update products set catalog_synced_at = now() where id = v_id;
  end if;

  return query select v_id, false;
end;
$$;

revoke execute on function upsert_imported_product(text, text, text, text, text, uuid, text, integer, price_status) from public;
grant execute on function upsert_imported_product(text, text, text, text, text, uuid, text, integer, price_status) to service_role;


-- upsert_category: same idempotent-by-slug pattern, used by the import
-- script to resolve/create each category before upserting its products.
create or replace function upsert_category(p_slug text, p_name text, p_parent_id uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
begin
  insert into categories (slug, name, parent_id)
  values (p_slug, p_name, p_parent_id)
  on conflict (slug) do update set name = excluded.name
  returning id into v_id;

  return v_id;
end;
$$;

revoke execute on function upsert_category(text, text, uuid) from public;
grant execute on function upsert_category(text, text, uuid) to service_role;
