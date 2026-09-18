-- Row Level Security. Principle: anon/authenticated NEVER get INSERT/UPDATE
-- on orders/order_items directly (see 0003_create_order_function.sql) — the
-- price and total must never come from the client.

alter table categories enable row level security;
alter table products enable row level security;
alter table product_images enable row level security;
alter table profiles enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;
alter table import_runs enable row level security;
alter table processed_webhook_events enable row level security;

create function is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- categories -----------------------------------------------------------------
create policy "categories_public_read" on categories
  for select using (true);

create policy "categories_admin_write" on categories
  for all using (is_admin()) with check (is_admin());

-- products ---------------------------------------------------------------
create policy "products_public_read_active" on products
  for select using (is_active = true or is_admin());

create policy "products_admin_write" on products
  for all using (is_admin()) with check (is_admin());

-- product_images -----------------------------------------------------------
create policy "product_images_public_read" on product_images
  for select using (
    exists (
      select 1 from products
      where products.id = product_images.product_id
        and (products.is_active = true or is_admin())
    )
  );

create policy "product_images_admin_write" on product_images
  for all using (is_admin()) with check (is_admin());

-- profiles -------------------------------------------------------------------
create policy "profiles_read_own_or_admin" on profiles
  for select using (id = auth.uid() or is_admin());

create policy "profiles_update_own" on profiles
  for update using (id = auth.uid()) with check (id = auth.uid());

-- orders / order_items ------------------------------------------------------
-- No insert/update/delete policy for anon/authenticated on purpose: writes
-- only ever happen through create_order() (SECURITY DEFINER) or the
-- service-role client used by admin server actions and the Wave webhook.

create policy "orders_read_own_or_admin" on orders
  for select using (customer_id = auth.uid() or is_admin());

create policy "orders_admin_update" on orders
  for update using (is_admin()) with check (is_admin());

create policy "order_items_read_own_or_admin" on order_items
  for select using (
    exists (
      select 1 from orders
      where orders.id = order_items.order_id
        and (orders.customer_id = auth.uid() or is_admin())
    )
  );

-- import_runs / processed_webhook_events -------------------------------------
create policy "import_runs_admin_only" on import_runs
  for select using (is_admin());

-- processed_webhook_events: no policy at all → only the service-role client
-- (which bypasses RLS) can read/write it, exactly as intended.
