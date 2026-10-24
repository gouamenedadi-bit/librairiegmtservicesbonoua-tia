-- `profiles_update_own` (0002) restricts WHICH ROW a signed-in user can
-- update (`id = auth.uid()`), but RLS alone can't restrict WHICH COLUMN —
-- nothing in that policy stops an authenticated customer from calling
-- `supabase.from('profiles').update({ role: 'admin' }).eq('id', myId)`
-- directly from the browser and passing the row check. No part of this app's
-- own UI does that, but the gap is in the data layer, not the UI, so it
-- needs a data-layer fix: a trigger that rejects any role change unless the
-- CALLER is already an admin.
--
-- `auth.uid() is not null` guards the one legitimate exception: the
-- service-role client (used by create_admin_account in
-- app/(admin)/admin/equipe/actions.ts to promote a brand-new account to
-- admin) has no JWT/user context, so auth.uid() is null there. Service role
-- already bypasses RLS entirely and is trusted with full DB access by
-- definition, so it's intentionally exempted rather than blocked.
create or replace function public.prevent_role_self_escalation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.role is distinct from old.role
     and auth.uid() is not null
     and not public.is_admin() then
    raise exception 'Seul un administrateur peut modifier le rôle d''un compte.';
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_prevent_role_self_escalation on public.profiles;

create trigger profiles_prevent_role_self_escalation
  before update on public.profiles
  for each row
  execute function public.prevent_role_self_escalation();
