'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { askQuestionAction, type ActionState } from '../actions';

const initialState: ActionState = { ok: false };

export default function AskPage() {
  const [state, formAction] = useActionState(askQuestionAction, initialState);

  if (state.ok) {
    return (
      <div className="wrap">
        <article className="article">
          <h1>Thank you! 🙏</h1>
          <div className="article-body">
            <p>
              Your question has been received. We review every question before it appears, so
              it will show on the <Link href="/community">Community page</Link> once it is
              checked — usually within a day or two.
            </p>
            <p>
              <Link href="/community" className="category-card-link">
                Back to the community →
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
        <h1>💬 Ask a question</h1>
        <p>
          Tell us what is happening on your farm — a sick crop, a strange animal, a market
          problem, or anything you have seen and cannot explain. Farmers and the Greennest
          team will answer.
        </p>
      </header>
      <form action={formAction} className="calc-form">
        {state.error && <p className="form-error">{state.error}</p>}
        <label>
          Short title for your question
          <input type="text" name="title" placeholder="e.g. Why are my maize leaves turning yellow?" required />
        </label>
        <label>
          Your name
          <input type="text" name="name" placeholder="e.g. Adaeze" required />
        </label>
        <label>
          Where do you farm? (state or town)
          <input type="text" name="location" placeholder="e.g. Ibadan, Oyo State" required />
        </label>
        <label>
          Topic
          <select name="topic" defaultValue="Crops">
            <option value="Crops">Crops</option>
            <option value="Livestock">Livestock</option>
            <option value="Farm Business & Sales">Farm Business &amp; Sales</option>
            <option value="Safe Crops">Safe Crops</option>
            <option value="Other">Other</option>
          </select>
        </label>
        <label>
          Your question or strange experience
          <textarea
            name="question"
            rows={6}
            placeholder="Describe what you saw, when it started, and what you have tried so far. The more detail, the better the answer."
            required
          />
        </label>
        <p className="calc-note">
          Your question will be visible to everyone once published. Do not put your phone
          number or home address in it.
        </p>
        <div className="form-actions">
          <button type="submit" className="btn btn-primary">
            Send my question
          </button>
        </div>
      </form>
    </div>
  );
}
