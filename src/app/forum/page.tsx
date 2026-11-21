import Link from "next/link";
import type { Metadata } from "next";
import { connection } from "next/server";
import {
  FORUM_CATEGORIES,
  getCommentCounts,
  getPublishedTopics,
  isForumCategory,
} from "@/lib/forum";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Farmers Forum",
  description:
    "Post your farming problem and get opinions from other farmers — crops, livestock, pests, market prices and farm business. Ask, answer, learn.",
  alternates: { canonical: `${SITE_URL}/forum` },
  openGraph: {
    type: "website",
    siteName: "Greennest Hub",
    url: `${SITE_URL}/forum`,
    title: "Farmers Forum | Greennest Hub",
    description:
      "Post your farming problem and get opinions from other farmers — crops, livestock, pests, market prices and farm business.",
    images: [{ url: "/images/hero-farm.jpg", width: 1920, height: 1280, alt: "A Nigerian farmer standing in a maize field at sunrise" }],
  },
};

const CATEGORY_EMOJI: Record<string, string> = {
  "Crop Problems": "🌱",
  Livestock: "🐄",
  "Pests & Diseases": "🐛",
  "Market & Prices": "💰",
  "Farm Business": "📈",
  General: "💬",
};

function pageHref(params: { category?: string; q?: string }) {
  const query = new URLSearchParams();
  if (params.category) query.set("category", params.category);
  if (params.q) query.set("q", params.q);
  const s = query.toString();
  return s ? `/forum?${s}` : "/forum";
}

export default async function ForumPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; q?: string }>;
}) {
  const params = await searchParams;
  // Filters come from the URL, so this page renders per request.
  await connection();
  const category = isForumCategory(params.category ?? "") ? params.category : "";
  const q = (params.q ?? "").trim();

  const topics = getPublishedTopics();
  const counts = getCommentCounts();
  const categoryCounts: Record<string, number> = {};
  for (const t of topics) categoryCounts[t.category] = (categoryCounts[t.category] ?? 0) + 1;

  const filtered = topics.filter((t) => {
    if (category && t.category !== category) return false;
    if (q) {
      const hay = `${t.title} ${t.body} ${t.author} ${t.location}`.toLowerCase();
      if (!hay.includes(q.toLowerCase())) return false;
    }
    return true;
  });

  return (
    <div className="wrap">
      <header className="page-head">
        <h1>💬 Farmers Forum</h1>
        <p>
          Got a problem on your farm? Post it here and other farmers will share
          what worked for them. Or read a topic and add your own opinion —
          somebody&apos;s question today is your answer tomorrow.
        </p>
        <p>
          <Link href="/forum/new" className="btn btn-primary">
            ✍️ Start a new topic
          </Link>
        </p>
      </header>

      <section className="section" aria-label="Browse forum topics">
        <form
          className="market-filters"
          method="get"
          action="/forum"
          role="search"
          aria-label="Search forum topics"
        >
          <input
            type="search"
            name="q"
            defaultValue={q}
            placeholder="Search cassava, layers, armyworm…"
            aria-label="Search forum topics"
            className="market-search"
          />
          {category && <input type="hidden" name="category" value={category} />}
          <button type="submit" className="btn btn-primary">
            Search
          </button>
        </form>

        <div className="blog-filters" role="navigation" aria-label="Filter topics by category">
          <Link href={pageHref({ q })} className={`filter-chip${!category ? " active" : ""}`}>
            All topics ({topics.length})
          </Link>
          {FORUM_CATEGORIES.map((c) => (
            <Link
              key={c}
              href={pageHref({ category: c, q })}
              className={`filter-chip${category === c ? " active" : ""}`}
            >
              {CATEGORY_EMOJI[c] ?? "💬"} {c} ({categoryCounts[c] ?? 0})
            </Link>
          ))}
        </div>

        <p className="market-count">
          {filtered.length} {filtered.length === 1 ? "topic" : "topics"}
          {category ? ` in ${category}` : ""}
          {q ? ` matching “${q}”` : ""}
        </p>

        {filtered.length === 0 ? (
          <p className="empty-state">
            No topics here yet.{" "}
            {category || q ? (
              <>
                Try another category or search — or{" "}
                <Link href="/forum" className="category-card-link">
                  see all topics
                </Link>
                .
              </>
            ) : (
              <>
                Be the first to ask —{" "}
                <Link href="/forum/new" className="category-card-link">
                  start a topic
                </Link>
                .
              </>
            )}
          </p>
        ) : (
          <div className="forum-list">
            {filtered.map((t) => {
              const n = counts[t.slug] ?? 0;
              return (
                <article key={t.slug} className="forum-card">
                  <div className="forum-card-main">
                    <p className="forum-card-category">
                      {CATEGORY_EMOJI[t.category] ?? "💬"} {t.category}
                    </p>
                    <h2 className="forum-card-title">
                      <Link href={`/forum/${t.slug}`}>{t.title}</Link>
                    </h2>
                    <p className="forum-card-excerpt">
                      {t.body.length > 180 ? `${t.body.slice(0, 180).trim()}…` : t.body}
                    </p>
                    <p className="post-card-meta">
                      👤 {t.author} · 📍 {t.location} · {t.date}
                    </p>
                  </div>
                  <div className="forum-card-side">
                    <span className="forum-replies" aria-label={`${n} replies`}>
                      💬 {n} {n === 1 ? "reply" : "replies"}
                    </span>
                    <Link href={`/forum/${t.slug}`} className="btn btn-secondary">
                      Join the talk →
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        <p className="section-more">
          Every topic and reply is reviewed before it appears, so the forum
          stays helpful and respectful.{" "}
          <Link href="/community" className="category-card-link">
            Prefer a direct answer from our team? Ask in the Community →
          </Link>
        </p>
      </section>
    </div>
  );
}
