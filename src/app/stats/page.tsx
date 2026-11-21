import Link from "next/link";
import type { Metadata } from "next";
import { connection } from "next/server";
import { getStats, isStatsRange, STATS_RANGES, type StatsRange } from "@/lib/stats";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Site Statistics",
  description:
    "How many people visit Greennest Hub — total visits and the most visited pages, for the last 24 hours, 48 hours, 7 days, 24 days, or since tracking started.",
  alternates: { canonical: `${SITE_URL}/stats` },
  openGraph: {
    type: "website",
    siteName: "Greennest Hub",
    url: `${SITE_URL}/stats`,
    title: "Site Statistics | Greennest Hub",
    description:
      "How many people visit Greennest Hub — total visits and the most visited pages.",
  },
};

function rangeHref(range: StatsRange) {
  return range === "24h" ? "/stats" : `/stats?range=${range}`;
}

export default async function StatsPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>;
}) {
  const params = await searchParams;
  // The range comes from the URL, so this page renders per request.
  await connection();
  const range: StatsRange = isStatsRange(params.range ?? "") ? (params.range as StatsRange) : "24h";
  const stats = await getStats(range).catch(() => null);
  const label = STATS_RANGES.find((r) => r.slug === range)?.label ?? "Last 24 hours";

  return (
    <div className="wrap">
      <header className="page-head">
        <h1>📊 Site Statistics</h1>
        <p>
          How many people visit Greennest Hub, and which pages they read. Only
          page views are counted — no personal data, no cookies, no tracking of
          who you are.
        </p>
      </header>

      <section className="section" aria-label="Visit statistics">
        <div className="blog-filters" role="navigation" aria-label="Filter visits by period">
          {STATS_RANGES.map((r) => (
            <Link
              key={r.slug}
              href={rangeHref(r.slug)}
              className={`filter-chip${range === r.slug ? " active" : ""}`}
            >
              {r.label}
            </Link>
          ))}
        </div>

        {!stats || !stats.configured ? (
          <div className="stats-empty">
            <p className="stats-total">
              <strong>0</strong> visits
            </p>
            <p>
              <strong>Tracking has not started yet — no visit data exists.</strong>{" "}
              Visit counting begins only once Supabase is connected and the{" "}
              <code>page_visits</code> table from <code>supabase/schema.sql</code>{" "}
              has been run (see <code>supabase/README.md</code>). There is no
              old visit data anywhere to show, so these numbers are real zeros,
              not estimates — and they will start counting from the day
              tracking is switched on.
            </p>
            <p>
              Once tracking is live, this page will show the total visits and
              the most visited pages for each period above.
            </p>
          </div>
        ) : (
          <>
            <p className="stats-total">
              <strong>{stats.total.toLocaleString()}</strong>{" "}
              {stats.total === 1 ? "visit" : "visits"} · {label}
            </p>
            {stats.countingSince ? (
              <p className="market-count">
                Counting since {stats.countingSince} — the day visit tracking was
                switched on. Visits before that day were never recorded.
              </p>
            ) : (
              <p className="market-count">
                No visits recorded yet in this period.
              </p>
            )}

            {stats.pages.length === 0 ? (
              <p className="empty-state">
                No page views recorded in this period yet. Come back after
                people have visited the site.
              </p>
            ) : (
              <table className="stats-table">
                <thead>
                  <tr>
                    <th>Page</th>
                    <th>Visits</th>
                    <th>Share</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.pages.map((p) => (
                    <tr key={p.path}>
                      <td>
                        <Link href={p.path} className="category-card-link">
                          {p.path}
                        </Link>
                      </td>
                      <td>{p.visits.toLocaleString()}</td>
                      <td>
                        {stats.total > 0
                          ? `${Math.round((p.visits / stats.total) * 100)}%`
                          : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </>
        )}

        <p className="section-more">
          Page-view tracking on this site is powered by our own visit counter
          (Supabase) and Vercel Analytics.{" "}
          <Link href="/" className="category-card-link">
            Back to the homepage →
          </Link>
        </p>
      </section>
    </div>
  );
}
