-- Syntra Labs V9 customer platform migration
-- Run once in Supabase SQL Editor.

create extension if not exists "pgcrypto";

-- 1) Customer profile (editable, non-sensitive fields only)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  first_name text,
  last_name text,
  phone text,
  marketing_opt_in boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2) Reward state is separate so customers cannot alter discount eligibility.
create table if not exists public.customer_rewards (
  user_id uuid primary key references auth.users(id) on delete cascade,
  stripe_customer_id text unique,
  paid_order_count integer not null default 0 check (paid_order_count >= 0),
  welcome_discount_used boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 3) Saved shipping addresses
create table if not exists public.addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  label text not null default 'Primary',
  full_name text not null,
  line1 text not null,
  line2 text,
  city text not null,
  county text,
  postcode text not null,
  country text not null default 'GB',
  phone text,
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists addresses_user_id_idx on public.addresses(user_id);
create unique index if not exists addresses_one_default_per_user
  on public.addresses(user_id)
  where is_default = true;

-- 4) Extend existing orders for customer history + verified member discount metadata.
alter table if exists public.orders
  add column if not exists user_id uuid references auth.users(id) on delete set null,
  add column if not exists subtotal_amount integer,
  add column if not exists discount_amount integer not null default 0,
  add column if not exists discount_percent integer not null default 0,
  add column if not exists discount_type text,
  add column if not exists shipping_amount integer not null default 0,
  add column if not exists dispatch_window text,
  add column if not exists shipping_address jsonb;

create index if not exists orders_user_id_idx on public.orders(user_id);

alter table if exists public.order_items
  add column if not exists base_unit_amount integer;

-- 5) Automatically create customer records when Supabase Auth creates a user.
create or replace function public.handle_new_customer()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, first_name, last_name, marketing_opt_in)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'first_name', ''),
    coalesce(new.raw_user_meta_data ->> 'last_name', ''),
    coalesce((new.raw_user_meta_data ->> 'marketing_opt_in') = 'true', false)
  )
  on conflict (id) do nothing;

  insert into public.customer_rewards (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created_syntra on auth.users;
create trigger on_auth_user_created_syntra
  after insert on auth.users
  for each row execute procedure public.handle_new_customer();

-- Backfill profiles/rewards for any Auth users created before V9.
insert into public.profiles (id, email, first_name, last_name, marketing_opt_in)
select
  u.id,
  u.email,
  coalesce(u.raw_user_meta_data ->> 'first_name', ''),
  coalesce(u.raw_user_meta_data ->> 'last_name', ''),
  coalesce((u.raw_user_meta_data ->> 'marketing_opt_in') = 'true', false)
from auth.users u
on conflict (id) do nothing;

insert into public.customer_rewards (user_id)
select id from auth.users
on conflict (user_id) do nothing;


-- Atomic reward update used only by the server-side Stripe webhook.
create or replace function public.syntra_mark_paid_order(p_user_id uuid)
returns void
language sql
security definer set search_path = public
as $$
  update public.customer_rewards
  set paid_order_count = paid_order_count + 1,
      welcome_discount_used = true,
      updated_at = now()
  where user_id = p_user_id;
$$;

revoke all on function public.syntra_mark_paid_order(uuid) from public, anon, authenticated;
grant execute on function public.syntra_mark_paid_order(uuid) to service_role;

-- 6) Row-level security
alter table public.profiles enable row level security;
alter table public.customer_rewards enable row level security;
alter table public.addresses enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles
  for select to authenticated
  using (auth.uid() = id);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own" on public.profiles
  for insert to authenticated
  with check (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

drop policy if exists "rewards_select_own" on public.customer_rewards;
create policy "rewards_select_own" on public.customer_rewards
  for select to authenticated
  using (auth.uid() = user_id);

drop policy if exists "addresses_select_own" on public.addresses;
create policy "addresses_select_own" on public.addresses
  for select to authenticated
  using (auth.uid() = user_id);

drop policy if exists "addresses_insert_own" on public.addresses;
create policy "addresses_insert_own" on public.addresses
  for insert to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "addresses_update_own" on public.addresses;
create policy "addresses_update_own" on public.addresses
  for update to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "addresses_delete_own" on public.addresses;
create policy "addresses_delete_own" on public.addresses
  for delete to authenticated
  using (auth.uid() = user_id);

drop policy if exists "orders_select_own" on public.orders;
create policy "orders_select_own" on public.orders
  for select to authenticated
  using (auth.uid() = user_id);

drop policy if exists "order_items_select_own" on public.order_items;
create policy "order_items_select_own" on public.order_items
  for select to authenticated
  using (
    exists (
      select 1 from public.orders o
      where o.id = order_items.order_id
      and o.user_id = auth.uid()
    )
  );

-- 7) Explicit table/column privileges. Reward fields stay read-only to customers.
grant usage on schema public to authenticated;
grant select on public.profiles, public.addresses, public.orders, public.order_items to authenticated;
revoke select on public.customer_rewards from authenticated;
grant select (user_id, paid_order_count, welcome_discount_used) on public.customer_rewards to authenticated;
grant insert on public.profiles, public.addresses to authenticated;
grant delete on public.addresses to authenticated;

revoke update on public.profiles from authenticated;
grant update (first_name, last_name, phone, marketing_opt_in, updated_at) on public.profiles to authenticated;

grant update on public.addresses to authenticated;
revoke insert, update, delete on public.customer_rewards from authenticated;
revoke insert, update, delete on public.orders from authenticated;
revoke insert, update, delete on public.order_items from authenticated;

-- Service-role access is automatically unrestricted by RLS.
