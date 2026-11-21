import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPublishedTopics, getTopic, getTopicComments } from "@/lib/forum";
import { SITE_URL } from "@/lib/site";
import CommentForm from "./CommentForm";

export async function generateStaticParams() {
  return getPublishedTopics().map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const topic = await getTopic(slug);
  if (!topic || topic.status !== "published") return { title: "Topic not found" };
  const description = `${topic.title} — ${topic.author} from ${topic.location}. Join the discussion on the Greennest Hub Farmers Forum.`;
  return {
    title: topic.title,
    description,
    alternates: { canonical: `${SITE_URL}/forum/${topic.slug}` },
    openGraph: {
      type: "website",
      siteName: "Greennest Hub",
      url: `${SITE_URL}/forum/${topic.slug}`,
      title: topic.title,
      description,
    },
  };
}

export default async function ForumTopicPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const topic = await getTopic(slug);
  if (!topic || topic.status !== "published") notFound();
  const comments = await getTopicComments(slug);

  return (
    <div className="wrap">
      <p className="market-crumb">
        <Link href="/forum">← Forum</Link>
        {" · "}
        {topic.category}
      </p>

      <article className="article forum-topic">
        <h1>{topic.title}</h1>
        <p className="article-meta">
          👤 {topic.author} · 📍 {topic.location} · {topic.date}
        </p>
        <div
          className="article-body"
          dangerouslySetInnerHTML={{ __html: topic.contentHtml }}
        />
      </article>

      <section className="section" aria-labelledby="replies-heading">
        <h2 id="replies-heading">
          💬 {comments.length} {comments.length === 1 ? "reply" : "replies"} from farmers
        </h2>

        {comments.length === 0 ? (
          <p className="empty-state">
            No replies yet — be the first to share your opinion below.
          </p>
        ) : (
          <ol className="forum-comments">
            {comments.map((c) => (
              <li key={c.id} className="forum-comment">
                <p className="forum-comment-meta">
                  <strong>👤 {c.author}</strong> · 📍 {c.location} · {c.date}
                </p>
                <div
                  className="forum-comment-body"
                  dangerouslySetInnerHTML={{ __html: c.contentHtml }}
                />
              </li>
            ))}
          </ol>
        )}

        <CommentForm topicSlug={topic.slug} />
      </section>

      <p className="section-more">
        <Link href="/forum" className="btn btn-secondary">
          ← Back to all topics
        </Link>{" "}
        <Link href="/forum/new" className="btn btn-primary">
          Start your own topic →
        </Link>
      </p>
    </div>
  );
}
