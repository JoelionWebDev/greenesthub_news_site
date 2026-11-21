'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { postTopicAction, type ActionState } from '../actions';
import { FORUM_CATEGORIES } from '@/lib/forum-categories';

const initialState: ActionState = { ok: false };

export default function NewTopicPage() {
  const [state, formAction] = useActionState(postTopicAction, initialState);

  if (state.ok) {
    return (
      <div className="wrap">
        <article className="article">
          <h1>Thank you! 🙏</h1>
          <div className="article-body">
            <p>
              Your topic has been received. We review every topic before it appears, so it
              will show on the <Link href="/forum">Forum page</Link> once it is checked —
              usually within a day or two. Other farmers will then be able to add their
              opinions.
            </p>
            <p>
              <Link href="/forum" className="category-card-link">
                Back to the forum →
              </Link>
            </p>
          </div>
        </article>
      </div>
    );
  }

  return (
    <div className="wrap">
      <header className="page-head">
        <h1>✍️ Start a new topic</h1>
        <p>
          Describe your farming problem clearly — what is happening, when it started, and
          what you have tried so far. The more detail you give, the better the answers
          from other farmers will be.
        </p>
      </header>
      <form action={formAction} className="calc-form">
        {state.error && <p className="form-error">{state.error}</p>}
        <label>
          Short title for your topic
          <input
            type="text"
            name="title"
            placeholder="e.g. My cassava leaves are curling and turning yellow"
            required
          />
        </label>
        <label>
          Your name
          <input type="text" name="name" placeholder="e.g. Adaeze" required />
        </label>
        <label>
          Where do you farm? (state or town)
          <input type="text" name="location" placeholder="e.g. Enugu, Enugu State" required />
        </label>
        <label>
          Category
          <select name="category" defaultValue="Crop Problems">
            {FORUM_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
        <label>
          Your problem or topic
          <textarea
            name="body"
            rows={7}
            placeholder="Tell us what is happening on your farm. When did it start? What have you tried? What do you want to know?"
            required
          />
        </label>
        <p className="calc-note">
          Your topic will be visible to everyone once published. Do not put your phone
          number or home address in it.
        </p>
        <div className="form-actions">
          <button type="submit" className="btn btn-primary">
            Post my topic
          </button>
        </div>
      </form>
    </div>
  );
}
