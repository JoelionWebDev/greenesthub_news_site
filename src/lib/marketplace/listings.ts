import { supabaseServer } from "./supabase";
import { DEMO_LISTINGS } from "./demo-data";
import { isProduceCategory, type ProduceCategory, type ProduceListing } from "./types";

export const PAGE_SIZE = 12;

export type ListingFilters = {
  category?: string;
  state?: string;
  q?: string;
  page?: number;
};

/**
 * A listing only ever appears in public lists when it belongs to a
 * registered farmer (produce_listings.owner_id IS NOT NULL). Enforced three
 * ways: DB column NOT NULL, RLS public SELECT, and the `.not("owner_id",
 * "is", null)` filter on every public query below. Demo listings are
 * filtered the same way in memory.
 *
 * When `state` is given, listings from that state come FIRST ("Produce near
 * you"), then the rest — pagination stays correct across the two groups.
 */
export async function getListings(
  filters: ListingFilters,
): Promise<{ listings: ProduceListing[]; totalPages: number; total: number }> {
  const page = Math.max(1, filters.page ?? 1);
  const category = isProduceCategory(filters.category ?? "")
    ? (filters.category as ProduceCategory)
    : undefined;
  const state = filters.state?.trim() || undefined;
  const q = filters.q?.trim().toLowerCase() || undefined;

  const sb = supabaseServer();
  if (!sb) {
    // Demo mode: filter the in-memory demo listings the same way.
    let list = DEMO_LISTINGS;
    if (category) list = list.filter((l) => l.category === category);
    if (q) {
      list = list.filter(
        (l) =>
          l.title.toLowerCase().includes(q) ||
          (l.description ?? "").toLowerCase().includes(q) ||
          l.city.toLowerCase().includes(q) ||
          l.state.toLowerCase().includes(q),
      );
    }
    if (state) {
      const near = list.filter((l) => l.state === state);
      const rest = list.filter((l) => l.state !== state);
      list = [...near, ...rest];
    }
    const total = list.length;
    return {
      listings: list.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
      totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
      total,
    };
  }

  // Base query: only listings of registered farmers, newest first.
  // (select() can only be called once per chain, so the data query and the
  // head-count query each build their own select.)
  const base = () => {
    let query = sb
      .from("produce_listings")
      .select("*", { count: "exact" })
      .not("owner_id", "is", null)
      .order("created_at", { ascending: false });
    if (category) query = query.eq("category", category);
    if (q) query = query.or(`title.ilike.%${q}%,city.ilike.%${q}%`);
    return query;
  };
  const countBase = () => {
    let query = sb
      .from("produce_listings")
      .select("*", { count: "exact", head: true })
      .not("owner_id", "is", null);
    if (category) query = query.eq("category", category);
    if (q) query = query.or(`title.ilike.%${q}%,city.ilike.%${q}%`);
    return query;
  };

  if (!state) {
    const from = (page - 1) * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;
    const { data, count, error } = await base().range(from, to);
    if (error) throw new Error(error.message);
    const total = count ?? 0;
    return {
      listings: (data ?? []) as ProduceListing[],
      totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
      total,
    };
  }

  // State-first: matches from the buyer's state, then everyone else.
  const matchQuery = () => base().eq("state", state);
  const restQuery = () => base().neq("state", state);
  const [{ count: matchCount }, { count: restCount }] = await Promise.all([
    countBase().eq("state", state),
    countBase().neq("state", state),
  ]);
  const matches = matchCount ?? 0;
  const total = matches + (restCount ?? 0);
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  let listings: ProduceListing[] = [];
  if (from < matches) {
    const { data, error } = await matchQuery().range(from, Math.min(to, matches - 1));
    if (error) throw new Error(error.message);
    listings = [...((data ?? []) as ProduceListing[])];
  }
  if (listings.length < PAGE_SIZE) {
    const need = PAGE_SIZE - listings.length;
    const restFrom = Math.max(0, from - matches);
    const { data, error } = await restQuery().range(restFrom, restFrom + need - 1);
    if (error) throw new Error(error.message);
    listings = [...listings, ...((data ?? []) as ProduceListing[])];
  }
  return { listings, totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)), total };
}

export async function getListingById(id: string): Promise<ProduceListing | null> {
  const sb = supabaseServer();
  if (!sb) {
    return DEMO_LISTINGS.find((l) => l.id === id) ?? null;
  }
  const { data, error } = await sb
    .from("produce_listings")
    .select("*")
    .eq("id", id)
    .not("owner_id", "is", null)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return (data as ProduceListing | null) ?? null;
}

/** Listings from one state (for "More produce near you"), newest first. */
export async function getListingsNearState(
  state: string,
  excludeId: string,
  limit = 3,
): Promise<ProduceListing[]> {
  const sb = supabaseServer();
  if (!sb) {
    return DEMO_LISTINGS.filter((l) => l.state === state && l.id !== excludeId).slice(0, limit);
  }
  const { data, error } = await sb
    .from("produce_listings")
    .select("*")
    .eq("state", state)
    .neq("id", excludeId)
    .not("owner_id", "is", null)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw new Error(error.message);
  return (data ?? []) as ProduceListing[];
}

/** Exact per-category counts for the filter chips (7 small head queries). */
export async function getCategoryCounts(): Promise<Record<string, number>> {
  const sb = supabaseServer();
  if (!sb) {
    const counts: Record<string, number> = {};
    for (const l of DEMO_LISTINGS) counts[l.category] = (counts[l.category] ?? 0) + 1;
    return counts;
  }
  const { PRODUCE_CATEGORIES } = await import("./types");
  const entries = await Promise.all(
    PRODUCE_CATEGORIES.map(async (c) => {
      const { count, error } = await sb
        .from("produce_listings")
        .select("*", { count: "exact", head: true })
        .eq("category", c.slug)
        .not("owner_id", "is", null);
      if (error) throw new Error(error.message);
      return [c.slug, count ?? 0] as const;
    }),
  );
  return Object.fromEntries(entries);
}
