import Link from "next/link";
import type { Metadata } from "next";
import { connection } from "next/server";
import { notFound } from "next/navigation";
import { getPublishedTopics, getTopic, getTopicComments } from "@/lib/forum";
import { getCurrentProfile } from "@/lib/supabase/server";
import { SITE_URL } from "@/lib/site";
import CommentForm from "./CommentForm";
import DeleteButton from "../DeleteButton";
import { deleteReplyAction, deleteTopicAction } from "../actions";

export async function generateStaticParams() {
  const topics = await getPublishedTopics();
  return topics.map((t) => ({ slug: t.slug }));
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
  // Topics and replies change as farmers post — render per request.
  await connection();
  const { slug } = await params;
  const topic = await getTopic(slug);
  if (!topic || topic.status !== "published") notFound();
  const comments = await getTopicComments(slug);
  const current = await getCurrentProfile();
  const userId = current?.user.id ?? null;
  const isAdmin = current?.profile.is_admin ?? false;
  const canDeleteTopic = isAdmin || (userId !== null && topic.authorId === userId);

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
        {canDeleteTopic && (
          <p>
            <DeleteButton
              label="🗑️ Delete this topic"
              onDelete={deleteTopicAction.bind(null, topic.slug)}
            />
          </p>
        )}
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
            {comments.map((c) => {
              const canDeleteReply =
                isAdmin || (userId !== null && c.authorId === userId);
              return (
                <li key={c.id} className="forum-comment">
                  <p className="forum-comment-meta">
                    <strong>👤 {c.author}</strong> · 📍 {c.location} · {c.date}
                    {canDeleteReply && (
                      <>
                        {" · "}
                        <DeleteButton
                          label="Delete"
                          onDelete={deleteReplyAction.bind(null, c.id, topic.slug)}
                        />
                      </>
                    )}
                  </p>
                  <div
                    className="forum-comment-body"
                    dangerouslySetInnerHTML={{ __html: c.contentHtml }}
                  />
                </li>
              );
            })}
          </ol>
        )}

        <CommentForm topicSlug={topic.slug} isSignedIn={userId !== null} />
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
