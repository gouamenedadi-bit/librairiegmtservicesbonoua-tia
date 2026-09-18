-- create_order(payload): the ONLY way to create an order. Runs as
-- SECURITY DEFINER so it can write to orders/order_items despite RLS
-- blocking direct inserts from anon/authenticated — but it recomputes every
-- price itself from `products`, so a tampered client payload can never
-- change what gets charged.
--
-- payload shape:
-- {
--   "guest_name": "...", "guest_phone": "...", "guest_address": "...",
--   "items": [ { "product_id": "<uuid>", "quantity": 2 }, ... ]
-- }

create or replace function create_order(payload jsonb)
returns table (order_id uuid, order_number text, total_amount integer)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order_id uuid;
  v_order_number text;
  v_item jsonb;
  v_product products%rowtype;
  v_quantity integer;
  v_subtotal integer;
  v_total integer := 0;
begin
  if jsonb_array_length(coalesce(payload->'items', '[]'::jsonb)) = 0 then
    raise exception 'empty_cart';
  end if;

  insert into orders (guest_name, guest_phone, guest_address, payment_method, payment_status, fulfillment_status, total_amount)
  values (
    payload->>'guest_name',
    payload->>'guest_phone',
    payload->>'guest_address',
    coalesce(payload->>'payment_method', 'wave'),
    'pending',
    'received',
    0
  )
  returning id, orders.order_number into v_order_id, v_order_number;

  for v_item in select * from jsonb_array_elements(payload->'items')
  loop
    v_quantity := (v_item->>'quantity')::integer;

    if v_quantity is null or v_quantity <= 0 then
      raise exception 'invalid_quantity';
    end if;

    select * into v_product from products
      where id = (v_item->>'product_id')::uuid
        and is_active = true
        and price_status = 'priced';

    if not found then
      raise exception 'invalid_or_unpriced_product: %', v_item->>'product_id';
    end if;

    if v_product.stock_quantity is not null then
      update products
        set stock_quantity = stock_quantity - v_quantity
        where id = v_product.id and stock_quantity >= v_quantity;

      if not found then
        raise exception 'out_of_stock: %', v_product.sku;
      end if;
    end if;

    v_subtotal := v_product.price * v_quantity;

    insert into order_items (order_id, product_id, sku_snapshot, name_snapshot, unit_price_snapshot, quantity, subtotal)
    values (v_order_id, v_product.id, v_product.sku, v_product.name, v_product.price, v_quantity, v_subtotal);

    v_total := v_total + v_subtotal;
  end loop;

  update orders set total_amount = v_total where id = v_order_id;

  return query select v_order_id, v_order_number, v_total;
end;
$$;

grant execute on function create_order(jsonb) to anon, authenticated;

-- mark_order_paid: called only by the service-role client from the Wave
-- webhook handler, never exposed to anon/authenticated.
create or replace function mark_order_paid(
  p_wave_checkout_session_id text,
  p_wave_transaction_id text
)
returns void
language sql
security definer
set search_path = public
as $$
  update orders
    set payment_status = 'succeeded',
        wave_transaction_id = p_wave_transaction_id,
        paid_at = now()
    where wave_checkout_session_id = p_wave_checkout_session_id;
$$;

-- Postgres grants EXECUTE to PUBLIC by default: lock this down so only the
-- service-role client (used exclusively by the Wave webhook route) can call it.
revoke execute on function mark_order_paid(text, text) from public;
grant execute on function mark_order_paid(text, text) to service_role;

-- get_order_status: powers the guest order confirmation/failure pages.
-- Guest orders have no customer_id, so the RLS "read your own order" policy
-- doesn't apply to them — but a blanket "customer_id is null" SELECT policy
-- would let anyone with the (public) anon key list every guest order ever
-- placed. This function takes an exact order id (the one Wave/our own
-- redirect just gave the browser) and returns only non-sensitive status
-- fields, so it can't be used to enumerate orders.
create or replace function get_order_status(p_order_id uuid)
returns table (
  order_number text,
  payment_status payment_status,
  fulfillment_status fulfillment_status,
  total_amount integer
)
language sql
security definer
set search_path = public
stable
as $$
  select order_number, payment_status, fulfillment_status, total_amount
  from orders
  where id = p_order_id;
$$;

grant execute on function get_order_status(uuid) to anon, authenticated;
