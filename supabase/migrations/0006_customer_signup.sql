-- Customer self-signup: adds the neighborhood field the signup form collects,
-- and auto-creates a `profiles` row when someone signs up via Supabase Auth.
--
-- There is deliberately no RLS INSERT policy on `profiles` for
-- anon/authenticated (see 0002_rls_policies.sql's pattern of gating writes
-- through functions, not open policies) — instead, a trigger on
-- `auth.users` creates the row automatically, using the metadata passed to
-- `supabase.auth.signUp({ options: { data: {...} } })`. This is the
-- standard, documented Supabase pattern for this.

alter table public.profiles add column if not exists neighborhood text;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, phone, neighborhood)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'phone',
    new.raw_user_meta_data->>'neighborhood'
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
