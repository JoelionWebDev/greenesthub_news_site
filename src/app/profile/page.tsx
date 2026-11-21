import Link from "next/link";
import type { Metadata } from "next";
import { connection } from "next/server";
import { getCurrentProfile, getCurrentUser } from "@/lib/supabase/server";
import { getAuthorStats, getTopicsByAuthor } from "@/lib/forum";
import { SITE_URL } from "@/lib/site";
import ProfileForm from "./ProfileForm";

export const metadata: Metadata = {
  title: "My profile",
  description: "Your Greennest Hub profile — your name, bio, location and your forum topics and replies.",
  alternates: { canonical: `${SITE_URL}/profile` },
  robots: { index: false, follow: false },
};

export default async function ProfilePage() {
  // Auth state is per request.
  await connection();
  const user = await getCurrentUser();

  if (!user) {
    return (
      <div className="wrap">
        <article className="article">
          <h1>👤 My profile</h1>
          <div className="article-body">
            <p>You need to sign in to see your profile.</p>
            <p>
              <Link href="/auth/login" className="btn btn-primary">
                Sign in →
              </Link>{" "}
              <Link href="/auth/signup" className="btn btn-secondary">
                Create an account →
              </Link>
            </p>
          </div>
        </article>
      </div>
    );
  }

  const current = await getCurrentProfile();
  const profile = current?.profile;
  if (!profile) {
    return (
      <div className="wrap">
        <article className="article">
          <h1>👤 My profile</h1>
          <div className="article-body">
            <p>We could not load your profile. Please try signing in again.</p>
          </div>
        </article>
      </div>
    );
  }

  const stats = await getAuthorStats(user.id);
  const myTopics = await getTopicsByAuthor(user.id);

  return (
    <div className="wrap">
      <header className="page-head">
        <h1>👤 {profile.display_name}</h1>
        <p>
          📍 {profile.location || "Location not set"} · ✉️ {user.email}
          {profile.is_admin ? " · ⭐ Admin" : ""}
        </p>
        {profile.bio ? <p>{profile.bio}</p> : null}
      </header>

      <section className="section" aria-label="Your forum activity">
        <h2>Your forum activity</h2>
        <p className="market-count">
          💬 {stats.topics} {stats.topics === 1 ? "topic" : "topics"} started ·{" "}
          {stats.replies} {stats.replies === 1 ? "reply" : "replies"} given
        </p>
        {myTopics.length === 0 ? (
          <p className="empty-state">
            You have not started a topic yet.{" "}
            <Link href="/forum/new" className="category-card-link">
              Start your first topic →
            </Link>
          </p>
        ) : (
          <div className="forum-list">
            {myTopics.map((t) => (
              <article key={t.slug} className="forum-card">
                <div className="forum-card-main">
                  <p className="forum-card-category">{t.category}</p>
                  <h2 className="forum-card-title">
                    <Link href={`/forum/${t.slug}`}>{t.title}</Link>
                  </h2>
                  <p className="post-card-meta">📍 {t.location} · {t.date}</p>
                </div>
                <div className="forum-card-side">
                  <Link href={`/forum/${t.slug}`} className="btn btn-secondary">
                    View →
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="section" aria-label="Edit profile">
        <ProfileForm profile={profile} />
        <p className="section-more">
          <Link href="/forum" className="category-card-link">
            Back to the forum →
          </Link>{" "}
          <Link href="/auth/logout" className="category-card-link">
            Log out
          </Link>
        </p>
      </section>
    </div>
  );
}
