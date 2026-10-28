-- Security hardening from the 2026-10 audit. Three independent fixes:
--
-- 1) Stock could be held hostage by unpaid orders. create_order() reserves
--    (decrements) stock the moment an order is created — which is right, it
--    prevents overselling between checkout and payment — but nothing ever
--    gave that stock back when the buyer never paid. create_order is callable
--    by anyone holding the public anon key, so a script could create
--    hundreds of orders it never pays and leave every tracked product "out of
--    stock" for real customers. Fix: unpaid orders now expire after 45
--    minutes (well past a Wave checkout session's own lifetime) and their
--    stock is restored. The cleanup runs lazily at the start of every
--    create_order() call, so it needs no scheduler (pg_cron) to work.
--
-- 2) create_order() trusted its payload beyond prices: no cap on line count,
--    per-line quantity, field lengths, or how many unpaid orders one phone
--    number can stack up. The app's own form validates some of this (zod,
--    lib/validations/checkout.ts), but the RPC is reachable directly, so the
--    limits have to live here too.
--
-- 3) Review eligibility had a phone-number fallback (0007/0009/0010): a
--    signed-in customer was matched to *guest* orders whose guest_phone
--    looked like their own profiles.phone. That phone is self-declared at
--    signup and never verified, so anyone could sign up with someone else's
--    number to see that person's purchase history (get_my_reviewable_purchases)
--    and post reviews as them. Comparing only the last 8 digits (0009) also
--    made two *different* real customers collide — Ivorian numbers differ by
--    their 2-digit operator prefix (07…, 05…, 01…), which that comparison
--    dropped. Fix: eligibility is now strictly customer_id = auth.uid(), i.e.
--    only orders placed while signed in to that very account. Without a
--    verified phone number there is no safe way to keep the fallback.

-- ---------------------------------------------------------------------------
-- 1) Expiring unpaid orders
-- ---------------------------------------------------------------------------

-- Cancels one still-unpaid order and gives its reserved stock back. Shared by
-- the expiry sweep below and by the checkout Server Action when Wave fails to
-- open a payment session (app/(shop)/commande/actions.ts). A no-op for any
-- order that isn't 'pending' anymore, so a late call can never cancel a
-- paid order.
create or replace function public.cancel_unpaid_order(p_order_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.orders
    set payment_status = 'cancelled',
        fulfillment_status = 'cancelled'
    where id = p_order_id
      and payment_status = 'pending';

  if not found then
    return false;
  end if;

  -- Only products that track stock were decremented by create_order().
  update public.products p
    set stock_quantity = p.stock_quantity + s.quantity
    from (
      select product_id, sum(quantity)::integer as quantity
      from public.order_items
      where order_id = p_order_id and product_id is not null
      group by product_id
    ) s
    where p.id = s.product_id
      and p.stock_quantity is not null;

  return true;
end;
$$;

revoke execute on function public.cancel_unpaid_order(uuid) from public;
grant execute on function public.cancel_unpaid_order(uuid) to service_role;

create or replace function public.release_expired_orders()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order_id uuid;
  v_released integer := 0;
begin
  -- skip locked: two checkouts running the sweep at the same moment must not
  -- both restore the same order's stock.
  for v_order_id in
    select id from public.orders
    where payment_status = 'pending'
      and created_at < now() - interval '45 minutes'
    for update skip locked
  loop
    if public.cancel_unpaid_order(v_order_id) then
      v_released := v_released + 1;
    end if;
  end loop;

  return v_released;
end;
$$;

revoke execute on function public.release_expired_orders() from public;
grant execute on function public.release_expired_orders() to service_role;

-- A Wave payment that completes after its order already expired must still
-- count: the customer paid. Re-take the stock (floored at 0 — it may have
-- been sold to someone else meanwhile, which the shop then handles by hand)
-- and put the order back into the normal fulfillment flow.
create or replace function public.mark_order_paid(
  p_wave_checkout_session_id text,
  p_wave_transaction_id text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order public.orders%rowtype;
begin
  select * into v_order
    from public.orders
    where wave_checkout_session_id = p_wave_checkout_session_id
    for update;

  if not found then
    return;
  end if;

  if v_order.payment_status = 'cancelled' then
    update public.products p
      set stock_quantity = greatest(0, p.stock_quantity - s.quantity)
      from (
        select product_id, sum(quantity)::integer as quantity
        from public.order_items
        where order_id = v_order.id and product_id is not null
        group by product_id
      ) s
      where p.id = s.product_id
        and p.stock_quantity is not null;

    update public.orders
      set fulfillment_status = 'received'
      where id = v_order.id and fulfillment_status = 'cancelled';
  end if;

  update public.orders
    set payment_status = 'succeeded',
        wave_transaction_id = p_wave_transaction_id,
        paid_at = now()
    where id = v_order.id;
end;
$$;

revoke execute on function public.mark_order_paid(text, text) from public;
grant execute on function public.mark_order_paid(text, text) to service_role;

-- ---------------------------------------------------------------------------
-- 2) create_order with input limits + expiry sweep
-- ---------------------------------------------------------------------------
create or replace function public.create_order(payload jsonb)
returns table (order_id uuid, order_number text, total_amount integer)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order_id uuid;
  v_order_number text;
  v_item jsonb;
  v_product public.products%rowtype;
  v_quantity integer;
  v_subtotal integer;
  v_total integer := 0;
  v_guest_name text := btrim(coalesce(payload->>'guest_name', ''));
  v_guest_phone text := btrim(coalesce(payload->>'guest_phone', ''));
  v_guest_address text := btrim(coalesce(payload->>'guest_address', ''));
  v_phone_digits text;
begin
  perform public.release_expired_orders();

  if jsonb_typeof(payload->'items') is distinct from 'array'
     or jsonb_array_length(payload->'items') = 0 then
    raise exception 'empty_cart';
  end if;

  if jsonb_array_length(payload->'items') > 50 then
    raise exception 'too_many_items';
  end if;

  v_phone_digits := regexp_replace(v_guest_phone, '\D', '', 'g');

  if char_length(v_guest_name) not between 2 and 120
     or char_length(v_guest_address) not between 5 and 300
     or char_length(v_guest_phone) > 30
     or char_length(v_phone_digits) < 8 then
    raise exception 'invalid_customer_details';
  end if;

  -- At most 3 unpaid orders at once per phone number: a real customer who
  -- abandoned a Wave payment can retry, a script can't stack up hundreds.
  if (
    select count(*) from public.orders
    where payment_status = 'pending'
      and regexp_replace(guest_phone, '\D', '', 'g') = v_phone_digits
  ) >= 3 then
    raise exception 'too_many_pending_orders';
  end if;

  insert into public.orders (customer_id, guest_name, guest_phone, guest_address, payment_method, payment_status, fulfillment_status, total_amount)
  values (
    auth.uid(),
    v_guest_name,
    v_guest_phone,
    v_guest_address,
    'wave',
    'pending',
    'received',
    0
  )
  returning id, orders.order_number into v_order_id, v_order_number;

  for v_item in select * from jsonb_array_elements(payload->'items')
  loop
    v_quantity := (v_item->>'quantity')::integer;

    if v_quantity is null or v_quantity <= 0 or v_quantity > 100 then
      raise exception 'invalid_quantity';
    end if;

    select * into v_product from public.products
      where id = (v_item->>'product_id')::uuid
        and is_active = true
        and price_status = 'priced';

    if not found then
      raise exception 'invalid_or_unpriced_product: %', v_item->>'product_id';
    end if;

    if v_product.stock_quantity is not null then
      update public.products
        set stock_quantity = stock_quantity - v_quantity
        where id = v_product.id and stock_quantity >= v_quantity;

      if not found then
        raise exception 'out_of_stock: %', v_product.sku;
      end if;
    end if;

    v_subtotal := v_product.price * v_quantity;

    insert into public.order_items (order_id, product_id, sku_snapshot, name_snapshot, unit_price_snapshot, quantity, subtotal)
    values (v_order_id, v_product.id, v_product.sku, v_product.name, v_product.price, v_quantity, v_subtotal);

    v_total := v_total + v_subtotal;
  end loop;

  update public.orders set total_amount = v_total where id = v_order_id;

  return query select v_order_id, v_order_number, v_total;
end;
$$;

grant execute on function public.create_order(jsonb) to anon, authenticated;

-- ---------------------------------------------------------------------------
-- 3) Review eligibility: own signed-in orders only
-- ---------------------------------------------------------------------------
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
    where oi.id = p_order_item_id
      and oi.product_id = p_product_id
      and o.fulfillment_status = 'delivered'
      and o.customer_id = auth.uid()
  );
$$;

grant execute on function public.can_review_order_item(uuid, uuid) to authenticated;

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
  where o.fulfillment_status = 'delivered'
    and oi.product_id is not null
    and o.customer_id = auth.uid()
    and not exists (
      select 1 from public.product_reviews r where r.order_item_id = oi.id
    )
  order by o.created_at desc;
$$;

grant execute on function public.get_my_reviewable_purchases() to authenticated;
