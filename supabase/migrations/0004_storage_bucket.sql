-- Public bucket for product photos, uploaded by the import script and later
-- the admin panel — both write through the service-role client, which
-- bypasses these policies entirely. They matter if/when an authenticated
-- admin session ever uploads directly from the browser instead.

insert into storage.buckets (id, name, public)
values ('products', 'products', true)
on conflict (id) do nothing;

create policy "products_bucket_public_read" on storage.objects
  for select using (bucket_id = 'products');

create policy "products_bucket_admin_insert" on storage.objects
  for insert with check (bucket_id = 'products' and public.is_admin());

create policy "products_bucket_admin_update" on storage.objects
  for update using (bucket_id = 'products' and public.is_admin())
  with check (bucket_id = 'products' and public.is_admin());

create policy "products_bucket_admin_delete" on storage.objects
  for delete using (bucket_id = 'products' and public.is_admin());
