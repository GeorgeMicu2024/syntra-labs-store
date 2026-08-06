create extension if not exists "pgcrypto";

create table if not exists products (
  id text primary key,
  slug text unique not null,
  code text not null,
  name text not null,
  strength text not null,
  category text not null,
  price numeric(10,2) not null check (price >= 0),
  stock integer not null default 0 check (stock >= 0),
  image text not null,
  short text not null,
  description text not null,
  featured boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  stripe_session_id text unique,
  customer_email text,
  amount_total integer,
  currency text default 'gbp',
  status text default 'pending',
  created_at timestamptz not null default now()
);

create table if not exists order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references orders(id) on delete cascade,
  product_id text references products(id),
  quantity integer not null check (quantity > 0),
  unit_amount integer not null
);

alter table products enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;
