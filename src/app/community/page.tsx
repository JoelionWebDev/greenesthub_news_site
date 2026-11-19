import type { Metadata } from "next";
import Link from "next/link";
import { getPublishedQuestions } from '@/lib/questions';
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: 'Community — Farmers’ Questions & Strange Experiences',
  description:
    'Ask a farming question or share a strange experience from your farm. Farmers and the Greennest Hub team answer — for farmers across Nigeria and Africa.',
  alternates: { canonical: `${SITE_URL}/community` },
};

export default function CommunityPage() {
  const questions = getPublishedQuestions();

  return (
    <div className="wrap">
      <header className="page-head">
        <h1>💬 Farmers&rsquo; questions &amp; strange experiences</h1>
        <p>
          A sick crop, a strange animal, a market problem — ask it here. Farmers and the
          Greennest Hub team answer, and your question may help another farmer too.
        </p>
        <Link href="/community/ask" className="btn btn-primary">
          Ask a question →
        </Link>
      </header>

      {questions.length === 0 ? (
        <p className="empty-state">
          No questions yet — be the first farmer to ask!
        </p>
      ) : (
        <div className="community-list">
          {questions.map((q) => (
            <article key={q.slug} className="question-card">
              <div className="question-meta">
                <span className="topic-tag">{q.topic}</span>
                <span className={`status-badge ${q.status === 'answered' ? 'status-answered' : ''}`}>
                  {q.status === 'answered' ? '✅ Answered' : '🕐 Waiting for an answer'}
                </span>
              </div>
              <h2>{q.title}</h2>
              <p className="question-asker">
                Asked by {q.name} · {q.location} ·{' '}
                {new Date(`${q.date}T00:00:00Z`).toLocaleDateString('en-GB', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </p>
              <p className="question-body">{q.body}</p>
              {q.status === 'answered' && q.answer && (
                <div className="question-answer">
                  <p className="answer-label">Answer{q.answeredBy ? ` — ${q.answeredBy}` : ''}</p>
                  <p>{q.answer}</p>
                </div>
              )}
            </article>
          ))}
        </div>
      )}

      <p className="tools-note">
        Questions are reviewed before they appear. We never share your phone number — please
        do not put it in your question.
      </p>
    </div>
  );
}
