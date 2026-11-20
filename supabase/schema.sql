-- Greennest Hub Marketplace — Supabase schema
-- Run in the Supabase SQL Editor (or `supabase db push`).
--
-- CORE RULE: a listing only exists when the farmer has an account.
--   * produce_listings.owner_id is NOT NULL and references auth.users(id).
--   * The public SELECT policy only returns rows with owner_id set.
--   * So: no account -> no listing -> nothing sold anywhere public.
-- Listings go live the moment the farmer creates the account + listing;
-- there is no manual approval step.
--
-- Payments go to the platform's Paystack account; the owner settles
-- farmers manually. (Farmer Paystack subaccounts are a later step.)

-- ---------------------------------------------------------------- listings
create table if not exists public.produce_listings (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  description text,
  category text not null check (category in (
    'grains', 'tubers', 'vegetables', 'fruits', 'livestock', 'poultry', 'processed'
  )),
  -- Price in kobo for ONE unit (see `unit` below).
  price_kobo integer not null check (price_kobo > 0),
  -- e.g. '50kg bag', 'tuber', 'big basket', 'kg', 'crate'.
  unit text not null,
  quantity_available integer not null default 0 check (quantity_available >= 0),
  state text not null,
  city text not null,
  farmer_name text not null,
  whatsapp_number text,
  image_url text,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------- orders
create table if not exists public.marketplace_orders (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.produce_listings (id) on delete cascade,
  buyer_name text not null,
  buyer_phone text not null,
  buyer_email text,
  buyer_state text not null,
  items jsonb not null default '[]'::jsonb,
  total_kobo integer not null check (total_kobo > 0),
  status text not null default 'pending'
    check (status in ('pending', 'paid', 'cancelled')),
  paystack_reference text,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------- indexes
-- Speed: listings are looked up by state, category and id; orders by
-- listing and by Paystack reference.
create index if not exists idx_listings_state on public.produce_listings (state);
create index if not exists idx_listings_category on public.produce_listings (category);
create index if not exists idx_listings_owner on public.produce_listings (owner_id);
create index if not exists idx_listings_created on public.produce_listings (created_at desc);
create index if not exists idx_mkt_orders_listing on public.marketplace_orders (listing_id);
create index if not exists idx_mkt_orders_reference on public.marketplace_orders (paystack_reference);

-- ---------------------------------------------------------------- RLS
alter table public.produce_listings enable row level security;
alter table public.marketplace_orders enable row level security;

-- LISTINGS: anyone may read listings that belong to a registered farmer.
-- (owner_id IS NOT NULL is always true in practice, but the policy makes
-- the rule explicit and keeps any future ownerless row invisible.)
create policy "Public can read listings of registered farmers"
  on public.produce_listings for select
  using (owner_id is not null);

-- LISTINGS: only the farmer can insert/update/delete their own listings.
create policy "Farmers can insert their own listings"
  on public.produce_listings for insert
  with check (auth.uid() = owner_id);
create policy "Farmers can update their own listings"
  on public.produce_listings for update
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);
create policy "Farmers can delete their own listings"
  on public.produce_listings for delete
  using (auth.uid() = owner_id);

-- ORDERS: the farmer who owns the listing can read its orders.
create policy "Farmers can read orders for their own listings"
  on public.marketplace_orders for select
  using (
    exists (
      select 1 from public.produce_listings l
      where l.id = marketplace_orders.listing_id and l.owner_id = auth.uid()
    )
  );
-- No public insert/update/delete policies on orders: writes happen only
-- from the server (checkout + webhook) with the service-role key.

-- ---------------------------------------------------------------- storage
-- Create the produce-images bucket in the dashboard (Storage -> New bucket,
-- name "produce-images", Public bucket ON), then set its policies under
-- Storage -> Policies. Minimum:
--   * SELECT (public): true — anyone can view listing photos
--   * INSERT/UPDATE/DELETE: only via the service-role key (the
--     /api/marketplace/upload route), never directly from the browser.
-- The upload route stores files under <farmer-user-id>/<uuid>.<ext>, so a
-- farmer can only ever upload into their own folder.
