-- Real customer reviews, tied to an actual delivered purchase — never
-- fabricated/seeded data. A customer can only review a product they
-- genuinely bought and received.
--
-- Checkout was guest-only until 0008_order_customer_link.sql (which makes
-- create_order() stamp customer_id = auth.uid() when the buyer happens to be
-- signed in); every order before that migration has customer_id = null.
-- Eligibility here therefore checks *either* customer_id = auth.uid() *or*
-- a phone match against the reviewer's own profiles.phone, digits-only so
-- formatting differences ("07 00 00 00 00" vs "+2250700000000") don't cause
-- false negatives — the fallback that covers every pre-existing guest order
-- and anyone who still checks out without being logged in. This is why
-- reviews only make sense once fulfillment_status moves to 'delivered' —
-- the admin sets that by hand in /admin/commandes.

create table public.product_reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  profile_id uuid not null references public.profiles (id) on delete cascade,
  order_item_id uuid not null references public.order_items (id) on delete cascade,
  rating smallint not null check (rating between 1 and 5),
  comment text,
  created_at timestamptz not null default now(),

  -- One review per purchased line item (not per product): buying the same
  -- book again in a later order allows a fresh review of that experience.
  unique (order_item_id)
);

create index product_reviews_product_id_idx on public.product_reviews (product_id);
create index product_reviews_profile_id_idx on public.product_reviews (profile_id);

alter table public.product_reviews enable row level security;

-- Reviews are the storefront's social proof — everyone (including guests
-- browsing without an account) needs to read them to see star ratings.
create policy "product_reviews are publicly readable"
  on public.product_reviews for select
  to anon, authenticated
  using (true);

-- INSERT is the security-sensitive part: nothing here trusts the client
-- beyond `profile_id = auth.uid()` (can't write a review as someone else) —
-- the rest re-derives eligibility from real order data.
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
          or (p.phone is not null and regexp_replace(o.guest_phone, '\D', '', 'g') = regexp_replace(p.phone, '\D', '', 'g'))
        )
    )
  );

-- No UPDATE/DELETE policy for anon/authenticated: reviews are immutable
-- once posted (keeps this simple — admins can still delete via the
-- service-role client if something needs removing).
