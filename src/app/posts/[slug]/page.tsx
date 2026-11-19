import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getAllPosts, getPost, getRelatedPosts } from "@/lib/posts";
import { getCategoryName } from "@/lib/categories";
import { SITE_URL } from "@/lib/site";
import PostCard from "@/components/PostCard";

export async function generateStaticParams() {
  return getAllPosts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return {};
  const url = `${SITE_URL}/posts/${slug}`;
  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      siteName: "Greennest Hub",
      url,
      title: post.title,
      description: post.excerpt,
      images: [{ url: post.coverImage, width: 1920, height: 1280, alt: post.title }],
    },
  };
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();
  const related = getRelatedPosts(post, 3);
  const dateLabel = new Date(`${post.date}T00:00:00Z`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="wrap">
      <article className="article">
        <Image
          src={post.coverImage}
          alt={post.title}
          width={1200}
          height={700}
          priority
          className="article-cover"
        />
        <p className="post-card-category">
          <Link href={`/category/${post.category}`}>{getCategoryName(post.category)}</Link>
        </p>
        <h1>{post.title}</h1>
        <p className="article-meta">
          By {post.author} · {dateLabel}
        </p>
        <div
          className="article-body"
          dangerouslySetInnerHTML={{ __html: post.contentHtml }}
        />
      </article>

      {related.length > 0 ? (
        <section className="related" aria-labelledby="related-heading">
          <div className="section-head">
            <h2 id="related-heading">More stories you will love 📖</h2>
          </div>
          <div className="post-grid">
            {related.map((p) => (
              <PostCard key={p.slug} post={p} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
