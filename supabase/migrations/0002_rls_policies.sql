-- Row Level Security. Principle: anon/authenticated NEVER get INSERT/UPDATE
-- on orders/order_items directly (see 0003_create_order_function.sql) — the
-- price and total must never come from the client.
--
-- Every table/function is schema-qualified with `public.` throughout this
-- file (not just inside function bodies): unqualified names depend on the
-- executing session's `search_path`, which isn't guaranteed to include
-- `public` in every SQL Editor session/role — qualifying removes that
-- entire class of "relation does not exist" surprises.

alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_images enable row level security;
alter table public.profiles enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.import_runs enable row level security;
alter table public.processed_webhook_events enable row level security;

create function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- categories -----------------------------------------------------------------
create policy "categories_public_read" on public.categories
  for select using (true);

create policy "categories_admin_write" on public.categories
  for all using (public.is_admin()) with check (public.is_admin());

-- products ---------------------------------------------------------------
create policy "products_public_read_active" on public.products
  for select using (is_active = true or public.is_admin());

create policy "products_admin_write" on public.products
  for all using (public.is_admin()) with check (public.is_admin());

-- product_images -----------------------------------------------------------
create policy "product_images_public_read" on public.product_images
  for select using (
    exists (
      select 1 from public.products
      where products.id = product_images.product_id
        and (products.is_active = true or public.is_admin())
    )
  );

create policy "product_images_admin_write" on public.product_images
  for all using (public.is_admin()) with check (public.is_admin());

-- profiles -------------------------------------------------------------------
create policy "profiles_read_own_or_admin" on public.profiles
  for select using (id = auth.uid() or public.is_admin());

create policy "profiles_update_own" on public.profiles
  for update using (id = auth.uid()) with check (id = auth.uid());

-- orders / order_items ------------------------------------------------------
-- No insert/update/delete policy for anon/authenticated on purpose: writes
-- only ever happen through create_order() (SECURITY DEFINER) or the
-- service-role client used by admin server actions and the Wave webhook.

create policy "orders_read_own_or_admin" on public.orders
  for select using (customer_id = auth.uid() or public.is_admin());

create policy "orders_admin_update" on public.orders
  for update using (public.is_admin()) with check (public.is_admin());

create policy "order_items_read_own_or_admin" on public.order_items
  for select using (
    exists (
      select 1 from public.orders
      where orders.id = order_items.order_id
        and (orders.customer_id = auth.uid() or public.is_admin())
    )
  );

-- import_runs / processed_webhook_events -------------------------------------
create policy "import_runs_admin_only" on public.import_runs
  for select using (public.is_admin());

-- processed_webhook_events: no policy at all → only the service-role client
-- (which bypasses RLS) can read/write it, exactly as intended.
