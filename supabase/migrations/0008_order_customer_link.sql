-- Two additions in service of real (non-guest-only) reviews:
--
-- 1) create_order() now stamps customer_id = auth.uid() when the buyer is
--    signed in at checkout time (still null for anonymous/guest checkout —
--    that path is untouched). Purely additive: no pricing/stock/payment
--    logic changes, same guarded flow as before, just one more column
--    value captured. This also happens to make the pre-existing
--    "orders_read_own_or_admin" RLS policy (0002_rls_policies.sql) actually
--    reachable — it already checked customer_id = auth.uid(), but nothing
--    ever set that column before now.
--
-- 2) get_my_reviewable_purchases(): the signed-in customer's own delivered,
--    not-yet-reviewed order lines, for the "leave a review" page. SECURITY
--    DEFINER because the RLS policy on orders/order_items only recognizes
--    customer_id = auth.uid() — it has no equivalent of product_reviews'
--    phone-match fallback, so a customer whose historical guest orders
--    predate this migration couldn't see them via a plain SELECT. This
--    function re-derives eligibility the same way 0007's INSERT policy
--    does, and returns only the display fields the page needs.

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
begin
  if jsonb_array_length(coalesce(payload->'items', '[]'::jsonb)) = 0 then
    raise exception 'empty_cart';
  end if;

  insert into public.orders (customer_id, guest_name, guest_phone, guest_address, payment_method, payment_status, fulfillment_status, total_amount)
  values (
    auth.uid(),
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
      or (pr.phone is not null and regexp_replace(o.guest_phone, '\D', '', 'g') = regexp_replace(pr.phone, '\D', '', 'g'))
    )
    and not exists (
      select 1 from public.product_reviews r where r.order_item_id = oi.id
    )
  order by o.created_at desc;
$$;

grant execute on function public.get_my_reviewable_purchases() to authenticated;
