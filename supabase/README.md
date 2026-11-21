# Greennest Hub — Supabase setup (one project for everything)

The site's server features all share **one Supabase project**: the
marketplace (`/marketplace`), the visit statistics (`/stats`), and the
Farmers Forum login (`/forum`, `/auth/*`, `/profile`). It needs a
Supabase project before real farmers can sign up, list and post.
Without one the site still builds and runs — the marketplace and the
forum show clearly-labelled **demo content** instead, and the auth
pages explain the setup step. Paystack keys are only needed for card
payments in the marketplace.

## 1. Create a Supabase project

1. Create a project at supabase.com (or add one through Vercel's Supabase
   integration, the way the Joetech Shops storefront did it).
2. In the Supabase dashboard, open the **SQL Editor** and run
   `supabase/schema.sql` in full. That creates the `produce_listings`,
   `marketplace_orders`, `page_visits`, `profiles`, `forum_topics` and
   `forum_replies` tables, indexes and Row Level Security policies.
3. (Optional) Seed sample rows:
   - Marketplace: `supabase/seed.sql` — it needs a real farmer user id
     first; the file explains how.
   - Forum: `supabase/seed-forum.sql` — loads the same 7 topics + 17
     replies that shipped with the forum. Safe to run more than once.
4. Create the Storage bucket: **Storage → New bucket**, name
   `produce-images`, **Public bucket ON**. The upload route stores files
   under `<farmer-user-id>/<uuid>.<ext>`; the bucket's own policies live
   under Storage → Policies (public SELECT; writes only via the
   service-role key).
5. Make Joel the forum admin **after** he creates his account (sign up
   at `/auth/signup` on the live site), by running this in the SQL
   Editor:

```sql
update public.profiles set is_admin = true
where id = (select id from auth.users where email = 'info@joetech360.ng');
```

The admin can delete any forum topic or reply; authors can delete
their own.

## 2. Environment variables (Vercel → Project → Settings → Environment Variables)

Copy these from the Supabase project (**Settings → API**) and Paystack
dashboard. Use **TEST** Paystack keys first (`pk_test_…` / `sk_test_…`).

```text
NEXT_PUBLIC_SUPABASE_URL=https://<ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon public key>
SUPABASE_SERVICE_ROLE_KEY=<service_role key — SECRET, server only>
PAYSTACK_SECRET_KEY=<Paystack secret key>
NEXT_PUBLIC_APP_URL=https://www.greennesthub.com.ng
RESEND_API_KEY=<Resend API key — optional; without it, order emails are skipped>
EMAIL_FROM=Greennest Hub <orders@joetech360.ng>
```

`EMAIL_FROM` must be an address on a domain verified in Resend, or Resend
rejects the send (the failure is only logged — it can never break an order).

## 3. Paystack webhook

In the Paystack dashboard (**Settings → API Keys & Webhooks**), add a
webhook URL:

```text
https://www.greennesthub.com.ng/api/marketplace/webhooks/paystack
```

The webhook verifies the `x-paystack-signature` HMAC-SHA512 header, then
re-verifies the transaction with Paystack's API and checks the verified
amount matches the order total before marking anything paid. A forged or
replayed webhook passes neither check.

## 4. How it works

- **Farmers** sign up at `/marketplace/sell` (Supabase Auth email signup),
  then list produce. A listing is visible to buyers **only** after the
  farmer has an account — enforced in the schema (`owner_id NOT NULL`),
  in RLS (public SELECT only where `owner_id IS NOT NULL`) and in every
  public query. No manual approval step.
- **Buyers** browse `/marketplace` (filter by category, state and keyword;
  listings from their state come first), open a listing, order on WhatsApp
  (prefilled message) or pay with Paystack ("Buy now"). The price is read
  from the database on the server — a tampered price sent by the browser
  is ignored.
- **After payment**, the webhook marks the order paid, reduces the
  listing's available quantity, and emails the buyer (confirmation) and
  the farmer (new paid order) via Resend.
- **Demo mode**: with no Supabase env vars, the marketplace renders 8
  sample listings. Their prices match the site's verified market prices
  (`src/lib/market-prices.ts`); the farmers are labelled "Sample farmer"
  and every card carries a DEMO badge. Checkout is disabled in demo mode.

## 5. Going live with payments

Paystack needs the business verified before live payments — complete the
CAC registration for Joetech first (same rule as the Joetech Shops
storefront), then switch the Paystack keys from test to live.

## 6. Visit statistics (/stats) and forum login

- **/stats** counts page views from the `page_visits` table (created by
  `schema.sql`, step 1 above). No extra setup: once the Supabase env vars
  are in Vercel, every page view is logged (page path + timestamp only —
  no personal data) and the counts appear on `/stats` for the last 24
  hours, 48 hours, 7 days, 24 days, or since tracking started. There is
  no historical data: counting starts the day the table and env vars are
  in place. `@vercel/analytics` is also installed, so Vercel's own
  Analytics dashboard shows page views too.
- **Forum login** (`/auth/signup`, `/auth/login`, `/profile`, posting in
  `/forum`) is Supabase Auth — the same project as the marketplace and
  stats, no second project. Once `schema.sql` has run and the env vars
  are in Vercel:
  - Farmers sign up at `/auth/signup` (name, email, password, location)
    or sign in at `/auth/login` with a password **or a magic link**
    emailed to them (no password to remember).
  - Supabase sends a confirmation email on signup when email
    confirmation is on (the default in Supabase → Authentication →
    Providers → Email). The link lands on `/auth/callback`, which signs
    the user in. If signups should work without the email step, turn
    "Confirm email" off there — but keep it on if spam accounts become a
    problem.
  - A profile row is created automatically on signup (trigger in
    `schema.sql`); the user edits name, bio and location at `/profile`,
    which also shows their topics and replies.
  - Signed-in farmers post topics and replies straight into the
    database — they appear immediately, no review queue. Guests can read
    everything but see a sign-in prompt instead of the forms.
  - Until Supabase is connected, the forum shows its Markdown seed
    topics and the auth pages say plainly that login is not switched on
    yet. **The old GitHub-commit posting path for the forum has been
    removed** — the Community ask form (`/community/ask`) still uses the
    GitHub pattern and still needs `GITHUB_TOKEN`.
