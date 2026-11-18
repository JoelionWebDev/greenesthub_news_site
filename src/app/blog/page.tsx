import Link from 'next/link';
import type { Metadata } from 'next';
import { connection } from 'next/server';
import { getAllPosts, getPostsByCategory } from '@/lib/posts';
import { CATEGORIES, getCategoryName } from '@/lib/categories';
import PostCard from '@/components/PostCard';

export const metadata: Metadata = {
  title: 'All Blogs — Greennest Hub',
  description:
    'Every article on Greennest Hub — farming, crops, livestock, animals and more, newest first.',
};

const PER_PAGE = 30;

function pageHref(category: string, page: number) {
  const params = new URLSearchParams();
  if (category) params.set('category', category);
  if (page > 1) params.set('page', String(page));
  const query = params.toString();
  return query ? `/blog?${query}` : '/blog';
}

export default async function AllBlogsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; page?: string }>;
}) {
  const params = await searchParams;
  // Filter + pagination come from the URL, so this page renders per request.
  await connection();
  const category = params.category ?? '';
  const requestedPage = Math.max(1, parseInt(params.page ?? '1', 10) || 1);

  const allPosts = getAllPosts();
  const posts = category ? getPostsByCategory(category) : allPosts;
  const total = posts.length;
  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));
  const page = Math.min(requestedPage, totalPages);
  const pagePosts = posts.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const counts = CATEGORIES.map((c) => ({
    ...c,
    count: allPosts.filter((p) => p.category === c.slug).length,
  }));

  return (
    <div className="wrap">
      <section className="section" aria-labelledby="all-blogs-heading">
        <div className="section-head">
          <h1 id="all-blogs-heading">All blogs 📖</h1>
          <p>
            {total} {total === 1 ? 'article' : 'articles'}
            {category ? ` in ${getCategoryName(category)}` : ' — farming, animals and everything in between'}
            , newest first.
          </p>
        </div>

        <div className="blog-filters" role="navigation" aria-label="Filter blogs by section">
          <Link href="/blog" className={`filter-chip${!category ? ' active' : ''}`}>
            All ({allPosts.length})
          </Link>
          {counts.map((c) => (
            <Link
              key={c.slug}
              href={pageHref(c.slug, 1)}
              className={`filter-chip${category === c.slug ? ' active' : ''}`}
            >
              {c.emoji} {c.name} ({c.count})
            </Link>
          ))}
        </div>

        {pagePosts.length === 0 ? (
          <p className="empty-state">No articles in this section yet — check back soon!</p>
        ) : (
          <div className="post-grid">
            {pagePosts.map((post) => (
              <PostCard key={post.slug} post={post} />
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <nav className="pagination" aria-label="Blog pages">
            {page > 1 && (
              <Link className="btn btn-primary" href={pageHref(category, page - 1)}>
                ← Newer
              </Link>
            )}
            <span className="page-info">
              Page {page} of {totalPages}
            </span>
            {page < totalPages && (
              <Link className="btn btn-primary" href={pageHref(category, page + 1)}>
                Older →
              </Link>
            )}
          </nav>
        )}
      </section>
    </div>
  );
}
