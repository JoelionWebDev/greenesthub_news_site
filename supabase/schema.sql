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

-- ---------------------------------------------------------------- page visits
-- Powers the /stats page: one row per page view (page path + timestamp
-- only — no IP address, no cookies, no personal data of any kind).
-- IMPORTANT: there is NO historical visit data. Counting starts the day
-- this table exists and the VisitLogger starts logging, so /stats shows
-- real zeros until then and "counting since" is the first logged visit.
create table if not exists public.page_visits (
  id uuid primary key default gen_random_uuid(),
  path text not null,
  visited_at timestamptz not null default now()
);

create index if not exists idx_page_visits_path on public.page_visits (path);
create index if not exists idx_page_visits_time on public.page_visits (visited_at desc);

alter table public.page_visits enable row level security;

-- Anyone may READ visit counts (the /stats page is public).
create policy "Public can read page visits"
  on public.page_visits for select
  using (true);
-- No public insert/update/delete policies: writes happen only from the
-- server (/api/stats/log route) with the service-role key.

-- ---------------------------------------------------------------- profiles
-- One row per signed-in user. Created automatically by the trigger
-- below when a user signs up (display name + location come from the
-- signup form). The forum and marketplace read the display name from
-- here; the /profile page lets the user edit it.
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null default 'Farmer',
  bio text not null default '',
  location text not null default '',
  is_admin boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Anyone may read profiles (names show next to forum topics/replies).
create policy "Public can read profiles"
  on public.profiles for select
  using (true);
-- A user may insert/update only their own row.
create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);
create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Fill is_admin for the site owner AFTER he creates his account:
--   update public.profiles set is_admin = true
--   where id = (select id from auth.users where email = 'info@joetech360.ng');

-- Create the profile row automatically on signup.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name, location)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data ->> 'location', '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------- forum
-- Farmers Forum: signed-in users post topics and replies. Guests can
-- read everything; posting needs an account (see the policies below).
-- Topics and replies appear immediately — there is no review queue.
-- The admin (is_admin in profiles) can delete any topic or reply.
--
-- author_name / author_location are snapshots of the author's profile
-- at posting time, so a topic still shows a name even if the author
-- later changes theirs. author_id is NULL only on the seeded demo
-- rows (supabase/seed-forum.sql), which have no real account behind
-- them — those can only be removed by the admin.

create table if not exists public.forum_topics (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  category text not null check (category in (
    'Crop Problems', 'Livestock', 'Pests & Diseases',
    'Market & Prices', 'Farm Business', 'General'
  )),
  body text not null,
  author_id uuid references auth.users (id) on delete set null,
  author_name text not null,
  author_location text not null default 'Nigeria',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.forum_replies (
  id uuid primary key default gen_random_uuid(),
  topic_id uuid not null references public.forum_topics (id) on delete cascade,
  body text not null,
  author_id uuid references auth.users (id) on delete set null,
  author_name text not null,
  author_location text not null default 'Nigeria',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_forum_topics_slug on public.forum_topics (slug);
create index if not exists idx_forum_topics_created on public.forum_topics (created_at desc);
create index if not exists idx_forum_topics_author on public.forum_topics (author_id);
create index if not exists idx_forum_replies_topic on public.forum_replies (topic_id);
create index if not exists idx_forum_replies_created on public.forum_replies (created_at);
create index if not exists idx_forum_replies_author on public.forum_replies (author_id);

alter table public.forum_topics enable row level security;
alter table public.forum_replies enable row level security;

-- Helper: true when the signed-in user is an admin.
create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and is_admin = true
  );
$$;

-- TOPICS: anyone may read. Only signed-in users may insert, and only
-- as themselves. Authors and the admin may update/delete.
create policy "Public can read forum topics"
  on public.forum_topics for select
  using (true);
create policy "Signed-in users can post topics"
  on public.forum_topics for insert
  with check (auth.uid() is not null and auth.uid() = author_id);
create policy "Authors and admin can update topics"
  on public.forum_topics for update
  using (auth.uid() = author_id or public.is_admin())
  with check (auth.uid() = author_id or public.is_admin());
create policy "Authors and admin can delete topics"
  on public.forum_topics for delete
  using (auth.uid() = author_id or public.is_admin());

-- REPLIES: same rules as topics.
create policy "Public can read forum replies"
  on public.forum_replies for select
  using (true);
create policy "Signed-in users can post replies"
  on public.forum_replies for insert
  with check (auth.uid() is not null and auth.uid() = author_id);
create policy "Authors and admin can update replies"
  on public.forum_replies for update
  using (auth.uid() = author_id or public.is_admin())
  with check (auth.uid() = author_id or public.is_admin());
create policy "Authors and admin can delete replies"
  on public.forum_replies for delete
  using (auth.uid() = author_id or public.is_admin());
