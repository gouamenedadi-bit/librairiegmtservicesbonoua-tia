-- Fixes a deeper bug than 0009: the product_reviews INSERT policy's WITH
-- CHECK joined directly against orders/order_items — but a plain RLS
-- policy runs with the CALLING role's own RLS-filtered view of those
-- tables, and orders_read_own_or_admin / order_items_read_own_or_admin
-- (0002_rls_policies.sql) only let a customer see rows where
-- customer_id = auth.uid(). For a guest order (customer_id is null by
-- definition), the customer has ZERO visibility into it via ordinary RLS —
-- so the join returned nothing and the phone-match branch could never
-- fire, regardless of whether the phone numbers actually matched. Confirmed
-- by instrumenting a real request-scoped debug function: guest_phone came
-- back null for a guest order the customer should have been eligible to
-- review by phone match.
--
-- Fix: move the eligibility check into its own SECURITY DEFINER function
-- (same technique as get_my_reviewable_purchases in 0008) so it can see the
-- guest order data needed to prove the match, without granting the
-- customer general read access to *all* orders/order_items. The RLS
-- policy's WITH CHECK now just calls this function instead of joining the
-- tables itself.

create or replace function public.can_review_order_item(p_order_item_id uuid, p_product_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.order_items oi
    join public.orders o on o.id = oi.order_id
    join public.profiles p on p.id = auth.uid()
    where oi.id = p_order_item_id
      and oi.product_id = p_product_id
      and o.fulfillment_status = 'delivered'
      and (
        o.customer_id = auth.uid()
        or (
          p.phone is not null
          and right(regexp_replace(o.guest_phone, '\D', '', 'g'), 8)
            = right(regexp_replace(p.phone, '\D', '', 'g'), 8)
        )
      )
  );
$$;

grant execute on function public.can_review_order_item(uuid, uuid) to authenticated;

drop policy if exists "customers can review their own delivered purchases" on public.product_reviews;

create policy "customers can review their own delivered purchases"
  on public.product_reviews for insert
  to authenticated
  with check (
    profile_id = auth.uid()
    and public.can_review_order_item(order_item_id, product_id)
  );
