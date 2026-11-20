import Link from "next/link";
import type { Metadata } from "next";
import { connection } from "next/server";
import { Suspense } from "react";
import { getCategoryCounts, getListings } from "@/lib/marketplace/listings";
import { isConfigured } from "@/lib/marketplace/supabase";
import { isPaystackConfigured } from "@/lib/marketplace/paystack";
import { PRODUCE_CATEGORIES, produceCategoryName } from "@/lib/marketplace/types";
import { SITE_URL } from "@/lib/site";
import ListingCard from "@/components/marketplace/ListingCard";
import StatePicker from "@/components/marketplace/StatePicker";

export const metadata: Metadata = {
  title: "Produce Marketplace",
  description:
    "Buy fresh produce straight from Nigerian farmers — rice, maize, garri, beans, yam, tomatoes and more. Listings from your state come first.",
  alternates: { canonical: `${SITE_URL}/marketplace` },
  openGraph: {
    type: "website",
    siteName: "Greennest Hub",
    url: `${SITE_URL}/marketplace`,
    title: "Produce Marketplace",
    description:
      "Buy fresh produce straight from Nigerian farmers — rice, maize, garri, beans, yam, tomatoes and more.",
    images: [{ url: "/images/farmer-market.jpg", width: 1920, height: 1280, alt: "A farmer at a produce stall" }],
  },
};

function pageHref(params: { category?: string; state?: string; q?: string; page?: number }) {
  const query = new URLSearchParams();
  if (params.category) query.set("category", params.category);
  if (params.state) query.set("state", params.state);
  if (params.q) query.set("q", params.q);
  if (params.page && params.page > 1) query.set("page", String(params.page));
  const s = query.toString();
  return s ? `/marketplace?${s}` : "/marketplace";
}

export default async function MarketplacePage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; state?: string; q?: string; page?: string }>;
}) {
  const params = await searchParams;
  // Filters come from the URL, so this page renders per request.
  await connection();
  const category = params.category ?? "";
  const state = params.state ?? "";
  const q = params.q ?? "";
  const requestedPage = Math.max(1, parseInt(params.page ?? "1", 10) || 1);

  const [{ listings, totalPages, total }, counts] = await Promise.all([
    getListings({ category, state, q, page: requestedPage }),
    getCategoryCounts(),
  ]);
  const page = Math.min(requestedPage, totalPages);

  return (
    <div className="wrap">
      <section className="market-hero" aria-labelledby="market-heading">
        <div>
          <h1 id="market-heading">🧺 Produce Marketplace</h1>
          <p>
            Buy fresh produce straight from Nigerian farmers — rice, maize,
            garri, beans, yam, tomatoes and more. Pick your state and the
            produce nearest you comes first.
          </p>
        </div>
        <Link href="/marketplace/sell" className="btn btn-primary">
          Sell your produce →
        </Link>
      </section>

      {!isConfigured && (
        <p className="demo-banner">
          <strong>Demo mode — sample listings.</strong> These are samples with
          prices from our verified market prices page, not real sellers yet.
          Connect Supabase (see <code>supabase/README.md</code>) and real
          farmer listings will appear here.
        </p>
      )}

      {/* Card payment is off until the owner's CAC registration is ready —
          buyers pay the farmer directly on WhatsApp (bank transfer or cash).
          This note disappears on its own once Paystack keys are added. */}
      {!isPaystackConfigured() && (
        <p className="demo-banner">
          💵 <strong>Pay the farmer directly.</strong> Payment is arranged
          with the farmer on WhatsApp — bank transfer or cash. No online
          card payment yet.
        </p>
      )}

      {state && (
        <p className="near-you-banner">
          📍 Showing produce from <strong>{state}</strong> first — nearest you.
        </p>
      )}

      <section className="section" aria-label="Browse produce">
        <form
          className="market-filters"
          method="get"
          action="/marketplace"
          role="search"
          aria-label="Search and filter produce"
        >
          <input
            type="search"
            name="q"
            defaultValue={q}
            placeholder="Search rice, yam, tomatoes…"
            aria-label="Search produce"
            className="market-search"
          />
          {category && <input type="hidden" name="category" value={category} />}
          {state && <input type="hidden" name="state" value={state} />}
          <button type="submit" className="btn btn-primary">
            Search
          </button>
          <Suspense>
            <StatePicker current={state} />
          </Suspense>
        </form>

        <div className="blog-filters" role="navigation" aria-label="Filter produce by category">
          <Link
            href={pageHref({ state, q })}
            className={`filter-chip${!category ? " active" : ""}`}
          >
            All ({total})
          </Link>
          {PRODUCE_CATEGORIES.map((c) => (
            <Link
              key={c.slug}
              href={pageHref({ category: c.slug, state, q })}
              className={`filter-chip${category === c.slug ? " active" : ""}`}
            >
              {c.emoji} {c.name} ({counts[c.slug] ?? 0})
            </Link>
          ))}
        </div>

        <p className="market-count">
          {total} {total === 1 ? "listing" : "listings"}
          {category ? ` in ${produceCategoryName(category)}` : ""}
          {state ? ` · ${state} first` : ""}
          {q ? ` · matching “${q}”` : ""}
        </p>

        {listings.length === 0 ? (
          <p className="empty-state">
            No produce here yet.{" "}
            {category || state || q ? (
              <>
                Try another category or state — or{" "}
                <Link href="/marketplace" className="category-card-link">
                  see everything
                </Link>
                .
              </>
            ) : (
              <>
                Be the first farmer to list —{" "}
                <Link href="/marketplace/sell" className="category-card-link">
                  sell your produce
                </Link>
                .
              </>
            )}
          </p>
        ) : (
          <div className="listing-grid">
            {listings.map((l) => (
              <ListingCard key={l.id} listing={l} />
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <nav className="pagination" aria-label="Marketplace pages">
            {page > 1 && (
              <Link className="btn btn-primary" href={pageHref({ category, state, q, page: page - 1 })}>
                ← Newer
              </Link>
            )}
            <span className="page-info">
              Page {page} of {totalPages}
            </span>
            {page < totalPages && (
              <Link className="btn btn-primary" href={pageHref({ category, state, q, page: page + 1 })}>
                Older →
              </Link>
            )}
          </nav>
        )}
        <p className="section-more">
          <Link className="btn btn-secondary" href="/tools/market-prices">
            Check today&apos;s market prices →
          </Link>
        </p>
      </section>
    </div>
  );
}
