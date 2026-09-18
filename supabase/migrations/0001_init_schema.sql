-- Boutique en ligne TIA Librairie / GMT Services Bonoua
-- Schema: categories, products, images, profiles, orders, import tooling.

create extension if not exists pgcrypto;

create type price_status as enum ('priced', 'on_request');
create type payment_status as enum ('pending', 'processing', 'succeeded', 'failed', 'cancelled');
create type fulfillment_status as enum ('received', 'preparing', 'ready', 'delivered', 'cancelled');
create type profile_role as enum ('customer', 'admin');
create type image_source as enum ('auto_match', 'manual', 'placeholder');

-- ---------------------------------------------------------------------------
-- categories: feuille Excel = catégorie parente, valeur TYPE = sous-catégorie
-- ---------------------------------------------------------------------------
create table categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  parent_id uuid references categories (id) on delete cascade,
  created_at timestamptz not null default now()
);

create index categories_parent_id_idx on categories (parent_id);

-- ---------------------------------------------------------------------------
-- products
-- ---------------------------------------------------------------------------
create table products (
  id uuid primary key default gen_random_uuid(),

  -- clé naturelle issue du fichier Excel client, jamais supposée globalement
  -- unique tant que l'audit de collision ne l'a pas confirmé (voir script d'import)
  source_sheet text not null,
  source_code text not null,
  type_raw text,

  sku text not null unique,
  name text not null,
  slug text not null unique,
  description text,

  category_id uuid references categories (id),

  -- XOF n'a pas de subdivision décimale utilisée en pratique : entier, jamais numeric(.,2)
  price integer,
  price_status price_status not null default 'on_request',

  stock_quantity integer, -- NULL = non suivi, toujours disponible

  is_active boolean not null default true,

  catalog_synced_at timestamptz,
  manually_edited_at timestamptz,

  search_vector tsvector generated always as (
    to_tsvector('french', coalesce(name, '') || ' ' || coalesce(description, ''))
  ) stored,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint products_price_consistency check (
    (price_status = 'priced' and price is not null and price >= 0)
    or (price_status = 'on_request')
  ),
  constraint products_source_unique unique (source_sheet, source_code)
);

create index products_category_id_idx on products (category_id);
create index products_search_idx on products using gin (search_vector);
create index products_is_active_idx on products (is_active);

create function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger products_set_updated_at
  before update on products
  for each row
  execute function set_updated_at();

-- ---------------------------------------------------------------------------
-- product_images
-- ---------------------------------------------------------------------------
create table product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products (id) on delete cascade,
  storage_path text not null,
  position integer not null default 0,
  is_primary boolean not null default false,
  content_hash text not null,
  match_confidence numeric,
  source image_source not null default 'manual',
  alt_text text,
  created_at timestamptz not null default now()
);

create index product_images_product_id_idx on product_images (product_id);
create unique index product_images_content_hash_idx on product_images (product_id, content_hash);

-- ---------------------------------------------------------------------------
-- profiles (1:1 avec auth.users)
-- ---------------------------------------------------------------------------
create table profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  phone text,
  role profile_role not null default 'customer',
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- orders / order_items
-- ---------------------------------------------------------------------------
create sequence order_number_seq;

create table orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique default (
    'CMD-' || to_char(now(), 'YYYY') || '-' || lpad(nextval('order_number_seq')::text, 6, '0')
  ),

  customer_id uuid references profiles (id),
  guest_name text not null,
  guest_phone text not null,
  guest_address text not null,

  payment_method text not null default 'wave',
  payment_status payment_status not null default 'pending',
  fulfillment_status fulfillment_status not null default 'received',

  wave_checkout_session_id text unique,
  wave_transaction_id text,
  currency text not null default 'XOF',

  total_amount integer not null default 0,
  paid_at timestamptz,

  created_at timestamptz not null default now()
);

create index orders_customer_id_idx on orders (customer_id);
create index orders_payment_status_idx on orders (payment_status);

create table order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders (id) on delete cascade,
  product_id uuid references products (id) on delete set null,
  sku_snapshot text not null,
  name_snapshot text not null,
  unit_price_snapshot integer not null,
  quantity integer not null check (quantity > 0),
  subtotal integer not null
);

create index order_items_order_id_idx on order_items (order_id);

-- ---------------------------------------------------------------------------
-- outillage import / paiement
-- ---------------------------------------------------------------------------
create table import_runs (
  id uuid primary key default gen_random_uuid(),
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  sheet_name text not null,
  rows_seen integer not null default 0,
  rows_created integer not null default 0,
  rows_updated integer not null default 0,
  rows_price_known integer not null default 0,
  rows_price_on_request integer not null default 0,
  duplicates_found jsonb not null default '[]'::jsonb,
  notes text
);

create table processed_webhook_events (
  event_id text primary key,
  received_at timestamptz not null default now()
);
