-- Fixes a real bug found by testing 0007/0008's phone-matching fallback:
-- comparing full digits-only strings fails whenever one phone number
-- includes the "+225" country code and the other doesn't (e.g. profile
-- phone "+225 07 00 11 22 33" vs guest_phone "0700112233" — both are
-- obviously the same number, but "2250700112233" != "0700112233" as
-- strings). Neither signup form enforces a format (both just hint
-- "07 00 00 00 00" as a placeholder), so this mismatch is a realistic,
-- not hypothetical, case.
--
-- Fix: compare only the last 8 digits of each digits-only number instead of
-- the whole string. Ivorian mobile numbers are long enough that this can't
-- realistically collide between two different real customers, and it's
-- robust to country-code and trunk-prefix ("0") differences either way,
-- without needing to hard-code a specific numbering-plan assumption.

drop policy if exists "customers can review their own delivered purchases" on public.product_reviews;

create policy "customers can review their own delivered purchases"
  on public.product_reviews for insert
  to authenticated
  with check (
    profile_id = auth.uid()
    and exists (
      select 1
      from public.order_items oi
      join public.orders o on o.id = oi.order_id
      join public.profiles p on p.id = auth.uid()
      where oi.id = product_reviews.order_item_id
        and oi.product_id = product_reviews.product_id
        and o.fulfillment_status = 'delivered'
        and (
          o.customer_id = auth.uid()
          or (
            p.phone is not null
            and right(regexp_replace(o.guest_phone, '\D', '', 'g'), 8)
              = right(regexp_replace(p.phone, '\D', '', 'g'), 8)
          )
        )
    )
  );

create or replace function public.get_my_reviewable_purchases()
returns table (
  order_item_id uuid,
  product_id uuid,
  product_name text,
  product_slug text,
  ordered_at timestamptz
)
language sql
security definer
set search_path = public
stable
as $$
  select oi.id, oi.product_id, p.name, p.slug, o.created_at
  from public.order_items oi
  join public.orders o on o.id = oi.order_id
  join public.products p on p.id = oi.product_id
  join public.profiles pr on pr.id = auth.uid()
  where o.fulfillment_status = 'delivered'
    and oi.product_id is not null
    and (
      o.customer_id = auth.uid()
      or (
        pr.phone is not null
        and right(regexp_replace(o.guest_phone, '\D', '', 'g'), 8)
          = right(regexp_replace(pr.phone, '\D', '', 'g'), 8)
      )
    )
    and not exists (
      select 1 from public.product_reviews r where r.order_item_id = oi.id
    )
  order by o.created_at desc;
$$;

grant execute on function public.get_my_reviewable_purchases() to authenticated;
