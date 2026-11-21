# Greennest Hub Marketplace — setup

The marketplace lives inside the Greennest Hub site (`/marketplace`). It
needs a Supabase project and Paystack keys before real farmers can list and
real buyers can pay. Without them the site still builds and runs — the
marketplace shows clearly-labelled **demo listings** instead.

## 1. Create a Supabase project

1. Create a project at supabase.com (or add one through Vercel's Supabase
   integration, the way the Joetech Shops storefront did it).
2. In the Supabase dashboard, open the **SQL Editor** and run
   `supabase/schema.sql` in full. That creates the `produce_listings`,
   `marketplace_orders` and `page_visits` tables, indexes and Row Level
   Security policies.
3. (Optional) Seed sample rows with `supabase/seed.sql` — it needs a real
   farmer user id first; the file explains how.
4. Create the Storage bucket: **Storage → New bucket**, name
   `produce-images`, **Public bucket ON**. The upload route stores files
   under `<farmer-user-id>/<uuid>.<ext>`; the bucket's own policies live
   under Storage → Policies (public SELECT; writes only via the
   service-role key).

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

## 6. Visit statistics (/stats) and forum posting

- **/stats** counts page views from the `page_visits` table (created by
  `schema.sql`, step 1 above). No extra setup: once the Supabase env vars
  are in Vercel, every page view is logged (page path + timestamp only —
  no personal data) and the counts appear on `/stats` for the last 24
  hours, 48 hours, 7 days, 24 days, or since tracking started. There is
  no historical data: counting starts the day the table and env vars are
  in place. `@vercel/analytics` is also installed, so Vercel's own
  Analytics dashboard shows page views too.
- **Forum posting** (`/forum/new` and the reply form under each topic)
  saves topics and comments as Markdown files in the repo through the
  GitHub API — the same pattern as the Community ask form. It needs
  `GITHUB_TOKEN` in Vercel (Project → Settings → Environment Variables),
  a fine-grained token with contents:write on this repo. Until that is
  set, the forms show an error and nothing is saved. New topics and
  replies start as `pending` and appear only after review.
