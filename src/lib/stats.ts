import { supabaseServer } from "./marketplace/supabase";

/**
 * Visit statistics for the /stats page.
 *
 * Data comes from the public.page_visits table (one row per page view:
 * page path + timestamp only, no personal data). The table only starts
 * filling once Supabase is connected AND the VisitLogger is live, so
 * there is NO historical data — counts before that day simply do not
 * exist and are never invented. When Supabase is not configured,
 * getStats() returns configured: false and the /stats page shows a
 * clear "no visit data yet" state with real zeros.
 */

export type StatsRange = "24h" | "48h" | "7d" | "24d" | "all";

export const STATS_RANGES: { slug: StatsRange; label: string; short: string }[] = [
  { slug: "24h", label: "Last 24 hours", short: "24h" },
  { slug: "48h", label: "Last 48 hours", short: "48h" },
  { slug: "7d", label: "Last 7 days", short: "7d" },
  { slug: "24d", label: "Last 24 days", short: "24d" },
  { slug: "all", label: "Since creation", short: "All time" },
];

export function isStatsRange(value: string): value is StatsRange {
  return STATS_RANGES.some((r) => r.slug === value);
}

function rangeStart(range: StatsRange): Date | null {
  const now = Date.now();
  const hours: Record<Exclude<StatsRange, "all">, number> = {
    "24h": 24,
    "48h": 48,
    "7d": 24 * 7,
    "24d": 24 * 24,
  };
  if (range === "all") return null;
  return new Date(now - hours[range] * 60 * 60 * 1000);
}

export type PageStat = { path: string; visits: number };

export type SiteStats = {
  configured: boolean;
  range: StatsRange;
  total: number;
  pages: PageStat[];
  /** Date of the very first logged visit, or null when nothing is logged yet. */
  countingSince: string | null;
};

/** Total visits + per-page breakdown for one range. */
export async function getStats(range: StatsRange): Promise<SiteStats> {
  const sb = supabaseServer();
  if (!sb) {
    return { configured: false, range, total: 0, pages: [], countingSince: null };
  }

  const start = rangeStart(range);

  // Total visits in range.
  let totalQuery = sb.from("page_visits").select("*", { count: "exact", head: true });
  if (start) totalQuery = totalQuery.gte("visited_at", start.toISOString());
  const { count: totalCount, error: totalError } = await totalQuery;
  if (totalError) throw new Error(totalError.message);

  // Per-page breakdown: fetch paths in range (capped at 5,000 rows) and
  // count in memory — simple and exact at this site's scale.
  let pageQuery = sb
    .from("page_visits")
    .select("path")
    .order("visited_at", { ascending: false })
    .limit(5000);
  if (start) pageQuery = pageQuery.gte("visited_at", start.toISOString());
  const { data: rows, error: rowsError } = await pageQuery;
  if (rowsError) throw new Error(rowsError.message);

  const byPath: Record<string, number> = {};
  for (const row of rows ?? []) {
    byPath[row.path] = (byPath[row.path] ?? 0) + 1;
  }
  const pages: PageStat[] = Object.entries(byPath)
    .map(([path, visits]) => ({ path, visits }))
    .sort((a, b) => b.visits - a.visits)
    .slice(0, 20);

  // When did counting start? The earliest visit ever logged.
  const { data: first, error: firstError } = await sb
    .from("page_visits")
    .select("visited_at")
    .order("visited_at", { ascending: true })
    .limit(1)
    .maybeSingle();
  if (firstError) throw new Error(firstError.message);

  return {
    configured: true,
    range,
    total: totalCount ?? 0,
    pages,
    countingSince: first ? String(first.visited_at).slice(0, 10) : null,
  };
}
