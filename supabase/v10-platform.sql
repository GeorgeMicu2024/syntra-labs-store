-- Syntra Labs V10 customer platform migration
-- Run AFTER supabase/v9-customer-platform.sql in Supabase SQL Editor.
-- No COA / purity / laboratory-test claims are created by this migration.

create extension if not exists "pgcrypto";

-- Product merchandising fields used by the admin console.
alter table if exists public.products
  add column if not exists compare_at_price numeric(10,2),
  add column if not exists badge text,
  add column if not exists highlights jsonb not null default '[]'::jsonb;

-- Customer rewards and lifecycle state.
alter table public.customer_rewards
  add column if not exists lifetime_spend_pence integer not null default 0 check (lifetime_spend_pence >= 0),
  add column if not exists reward_points integer not null default 0 check (reward_points >= 0),
  add column if not exists tier text not null default 'Research Member',
  add column if not exists store_credit_pence integer not null default 0 check (store_credit_pence >= 0),
  add column if not exists referral_code text,
  add column if not exists referred_by uuid references auth.users(id) on delete set null,
  add column if not exists referral_rewarded boolean not null default false;

update public.customer_rewards
set referral_code = 'SL' || upper(substr(replace(user_id::text, '-', ''), 1, 10))
where referral_code is null or btrim(referral_code) = '';

create unique index if not exists customer_rewards_referral_code_uidx
  on public.customer_rewards(referral_code)
  where referral_code is not null;

-- Saved products and alert preferences.
create table if not exists public.wishlist (
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id text not null references public.products(id) on delete cascade,
  notify_restock boolean not null default false,
  notify_price_drop boolean not null default false,
  last_seen_price numeric(10,2),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, product_id)
);
create index if not exists wishlist_product_idx on public.wishlist(product_id);

-- In-app notifications.
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null default 'general',
  title text not null,
  body text not null,
  href text,
  read_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists notifications_user_created_idx on public.notifications(user_id, created_at desc);
create index if not exists notifications_unread_idx on public.notifications(user_id) where read_at is null;

-- Server-synchronised basket for signed-in customers.
create table if not exists public.saved_carts (
  user_id uuid primary key references auth.users(id) on delete cascade,
  items jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

-- Order status timeline. Tracking values are optional and only displayed when supplied by admin.
create table if not exists public.order_events (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  status text not null,
  title text not null,
  detail text,
  tracking_number text,
  tracking_url text,
  created_at timestamptz not null default now()
);
create index if not exists order_events_order_idx on public.order_events(order_id, created_at asc);
create index if not exists order_events_user_idx on public.order_events(user_id, created_at desc);

-- Transparent store-credit ledger for referrals/support adjustments.
create table if not exists public.credit_ledger (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  amount_pence integer not null,
  reason text not null,
  reference text,
  created_at timestamptz not null default now()
);
create index if not exists credit_ledger_user_idx on public.credit_ledger(user_id, created_at desc);

-- Optional marketing/offer rules. These are administrative records only; checkout continues
-- to calculate customer eligibility server-side.
create table if not exists public.offer_rules (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  code text unique,
  description text,
  discount_percent integer check (discount_percent between 1 and 100),
  audience text not null default 'all' check (audience in ('all','new','returning')),
  starts_at timestamptz,
  ends_at timestamptz,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Upgrade the Auth trigger so new accounts also receive a referral identity and can be
-- attributed to a referral code passed in user metadata.
create or replace function public.handle_new_customer()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  referrer_id uuid;
  supplied_ref text;
begin
  supplied_ref := upper(btrim(coalesce(new.raw_user_meta_data ->> 'referral_code', '')));

  if supplied_ref <> '' then
    select user_id into referrer_id
    from public.customer_rewards
    where upper(referral_code) = supplied_ref
    limit 1;
  end if;

  insert into public.profiles (id, email, first_name, last_name, marketing_opt_in)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'first_name', ''),
    coalesce(new.raw_user_meta_data ->> 'last_name', ''),
    coalesce((new.raw_user_meta_data ->> 'marketing_opt_in') = 'true', false)
  )
  on conflict (id) do nothing;

  insert into public.customer_rewards (user_id, referral_code, referred_by)
  values (
    new.id,
    'SL' || upper(substr(replace(new.id::text, '-', ''), 1, 10)),
    case when referrer_id = new.id then null else referrer_id end
  )
  on conflict (user_id) do update
    set referral_code = coalesce(public.customer_rewards.referral_code, excluded.referral_code),
        referred_by = coalesce(public.customer_rewards.referred_by, excluded.referred_by);

  return new;
end;
$$;

-- Backfill referral IDs for older accounts.
update public.customer_rewards
set referral_code = 'SL' || upper(substr(replace(user_id::text, '-', ''), 1, 10))
where referral_code is null;

-- V10 paid-order function. It is called once by the verified Stripe webhook.
-- It updates lifecycle metrics, creates timeline/notification records, and awards one
-- referral credit to the referrer after the referred customer's first paid order.
create or replace function public.syntra_mark_paid_order_v10(
  p_user_id uuid,
  p_order_id uuid,
  p_amount_paid integer
)
returns void
language plpgsql
security definer set search_path = public
as $$
declare
  previous_orders integer := 0;
  referrer_id uuid;
  already_rewarded boolean := false;
  new_spend integer := 0;
begin
  select paid_order_count, referred_by, referral_rewarded, lifetime_spend_pence + greatest(p_amount_paid, 0)
    into previous_orders, referrer_id, already_rewarded, new_spend
  from public.customer_rewards
  where user_id = p_user_id
  for update;

  update public.customer_rewards
  set paid_order_count = paid_order_count + 1,
      welcome_discount_used = true,
      lifetime_spend_pence = lifetime_spend_pence + greatest(p_amount_paid, 0),
      reward_points = reward_points + floor(greatest(p_amount_paid, 0) / 100.0)::integer,
      tier = case
        when new_spend >= 150000 or paid_order_count + 1 >= 12 then 'Platinum'
        when new_spend >= 75000 or paid_order_count + 1 >= 6 then 'Gold'
        when new_spend >= 30000 or paid_order_count + 1 >= 3 then 'Silver'
        else 'Research Member'
      end,
      updated_at = now()
  where user_id = p_user_id;

  insert into public.order_events (order_id, user_id, status, title, detail)
  values (p_order_id, p_user_id, 'paid', 'Payment confirmed', 'Payment was confirmed securely and the order entered processing.');

  insert into public.notifications (user_id, type, title, body, href)
  values (p_user_id, 'order', 'Order confirmed', 'Your payment was confirmed and your order is now being processed.', '/account?tab=orders');

  if previous_orders = 0 and referrer_id is not null and not already_rewarded then
    update public.customer_rewards
    set store_credit_pence = store_credit_pence + 1000,
        updated_at = now()
    where user_id = referrer_id;

    insert into public.credit_ledger (user_id, amount_pence, reason, reference)
    values (referrer_id, 1000, 'Referral reward', p_user_id::text);

    insert into public.notifications (user_id, type, title, body, href)
    values (referrer_id, 'reward', '£10 referral credit added', 'A referred member completed their first paid order. £10 Syntra credit has been added to your account.', '/account?tab=rewards');

    update public.customer_rewards
    set referral_rewarded = true,
        updated_at = now()
    where user_id = p_user_id;
  end if;
end;
$$;

revoke all on function public.syntra_mark_paid_order_v10(uuid, uuid, integer) from public, anon, authenticated;
grant execute on function public.syntra_mark_paid_order_v10(uuid, uuid, integer) to service_role;

-- RLS
alter table public.wishlist enable row level security;
alter table public.notifications enable row level security;
alter table public.saved_carts enable row level security;
alter table public.order_events enable row level security;
alter table public.credit_ledger enable row level security;
alter table public.offer_rules enable row level security;

-- Wishlist
drop policy if exists "wishlist_select_own" on public.wishlist;
create policy "wishlist_select_own" on public.wishlist for select to authenticated using (auth.uid() = user_id);
drop policy if exists "wishlist_insert_own" on public.wishlist;
create policy "wishlist_insert_own" on public.wishlist for insert to authenticated with check (auth.uid() = user_id);
drop policy if exists "wishlist_update_own" on public.wishlist;
create policy "wishlist_update_own" on public.wishlist for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "wishlist_delete_own" on public.wishlist;
create policy "wishlist_delete_own" on public.wishlist for delete to authenticated using (auth.uid() = user_id);

-- Notifications: customer may read and mark read only.
drop policy if exists "notifications_select_own" on public.notifications;
create policy "notifications_select_own" on public.notifications for select to authenticated using (auth.uid() = user_id);
drop policy if exists "notifications_update_own" on public.notifications;
create policy "notifications_update_own" on public.notifications for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Saved cart
drop policy if exists "saved_cart_select_own" on public.saved_carts;
create policy "saved_cart_select_own" on public.saved_carts for select to authenticated using (auth.uid() = user_id);
drop policy if exists "saved_cart_insert_own" on public.saved_carts;
create policy "saved_cart_insert_own" on public.saved_carts for insert to authenticated with check (auth.uid() = user_id);
drop policy if exists "saved_cart_update_own" on public.saved_carts;
create policy "saved_cart_update_own" on public.saved_carts for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "saved_cart_delete_own" on public.saved_carts;
create policy "saved_cart_delete_own" on public.saved_carts for delete to authenticated using (auth.uid() = user_id);

-- Order events / credit ledger: read-only for their owner.
drop policy if exists "order_events_select_own" on public.order_events;
create policy "order_events_select_own" on public.order_events for select to authenticated using (auth.uid() = user_id);
drop policy if exists "credit_ledger_select_own" on public.credit_ledger;
create policy "credit_ledger_select_own" on public.credit_ledger for select to authenticated using (auth.uid() = user_id);

-- No public/customer access to offer_rules. Admin uses service role.

-- Privileges
grant select, insert, update, delete on public.wishlist to authenticated;
grant select on public.notifications to authenticated;
grant update (read_at) on public.notifications to authenticated;
grant select, insert, update, delete on public.saved_carts to authenticated;
grant select on public.order_events, public.credit_ledger to authenticated;

-- Reward fields remain customer read-only.
revoke select on public.customer_rewards from authenticated;
grant select (
  user_id, paid_order_count, welcome_discount_used, lifetime_spend_pence,
  reward_points, tier, store_credit_pence, referral_code, referred_by, referral_rewarded
) on public.customer_rewards to authenticated;

-- Service-role operations remain unrestricted by RLS.

-- V10.1-style credit reservation layer (included in V10 package).
-- This prevents two concurrent checkouts from spending the same account credit.
alter table if exists public.orders
  add column if not exists credit_amount integer not null default 0;

create table if not exists public.credit_reservations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  amount_pence integer not null check (amount_pence > 0),
  status text not null default 'reserved' check (status in ('reserved','consumed','released')),
  stripe_session_id text unique,
  expires_at timestamptz not null default (now() + interval '90 minutes'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists credit_reservations_user_idx on public.credit_reservations(user_id, created_at desc);

create or replace function public.syntra_reserve_credit(p_user_id uuid, p_requested integer)
returns table(reservation_id uuid, amount_pence integer)
language plpgsql
security definer set search_path = public
as $$
declare
  available integer;
  taken integer;
  rid uuid;
begin
  select store_credit_pence into available
  from public.customer_rewards
  where user_id = p_user_id
  for update;

  taken := least(greatest(coalesce(available,0),0), greatest(coalesce(p_requested,0),0));
  if taken <= 0 then return; end if;

  update public.customer_rewards
  set store_credit_pence = store_credit_pence - taken,
      updated_at = now()
  where user_id = p_user_id;

  insert into public.credit_reservations(user_id, amount_pence)
  values (p_user_id, taken)
  returning id into rid;

  return query select rid, taken;
end;
$$;

create or replace function public.syntra_attach_credit_reservation(p_reservation_id uuid, p_session_id text)
returns void
language sql
security definer set search_path = public
as $$
  update public.credit_reservations
  set stripe_session_id = p_session_id, updated_at = now()
  where id = p_reservation_id and status = 'reserved';
$$;

create or replace function public.syntra_consume_credit_reservation(p_session_id text)
returns void
language plpgsql
security definer set search_path = public
as $$
declare
  r public.credit_reservations%rowtype;
begin
  select * into r from public.credit_reservations where stripe_session_id = p_session_id for update;
  if not found or r.status <> 'reserved' then return; end if;

  update public.credit_reservations set status = 'consumed', updated_at = now() where id = r.id;
  insert into public.credit_ledger(user_id, amount_pence, reason, reference)
  values (r.user_id, -r.amount_pence, 'Account credit used at checkout', p_session_id);
end;
$$;

create or replace function public.syntra_release_credit_reservation(p_session_id text)
returns void
language plpgsql
security definer set search_path = public
as $$
declare
  r public.credit_reservations%rowtype;
begin
  select * into r from public.credit_reservations where stripe_session_id = p_session_id for update;
  if not found or r.status <> 'reserved' then return; end if;

  update public.customer_rewards
  set store_credit_pence = store_credit_pence + r.amount_pence,
      updated_at = now()
  where user_id = r.user_id;

  update public.credit_reservations set status = 'released', updated_at = now() where id = r.id;
end;
$$;

create or replace function public.syntra_release_credit_reservation_by_id(p_reservation_id uuid)
returns void
language plpgsql
security definer set search_path = public
as $$
declare
  r public.credit_reservations%rowtype;
begin
  select * into r from public.credit_reservations where id = p_reservation_id for update;
  if not found or r.status <> 'reserved' then return; end if;

  update public.customer_rewards
  set store_credit_pence = store_credit_pence + r.amount_pence,
      updated_at = now()
  where user_id = r.user_id;

  update public.credit_reservations set status = 'released', updated_at = now() where id = r.id;
end;
$$;

revoke all on function public.syntra_reserve_credit(uuid, integer) from public, anon, authenticated;
revoke all on function public.syntra_attach_credit_reservation(uuid, text) from public, anon, authenticated;
revoke all on function public.syntra_consume_credit_reservation(text) from public, anon, authenticated;
revoke all on function public.syntra_release_credit_reservation(text) from public, anon, authenticated;
revoke all on function public.syntra_release_credit_reservation_by_id(uuid) from public, anon, authenticated;
grant execute on function public.syntra_reserve_credit(uuid, integer) to service_role;
grant execute on function public.syntra_attach_credit_reservation(uuid, text) to service_role;
grant execute on function public.syntra_consume_credit_reservation(text) to service_role;
grant execute on function public.syntra_release_credit_reservation(text) to service_role;
grant execute on function public.syntra_release_credit_reservation_by_id(uuid) to service_role;

alter table public.credit_reservations enable row level security;
drop policy if exists "credit_reservations_select_own" on public.credit_reservations;
create policy "credit_reservations_select_own" on public.credit_reservations for select to authenticated using (auth.uid() = user_id);
grant select on public.credit_reservations to authenticated;
