'use client';

import { useActionState } from 'react';
import { postCommentAction, type ActionState } from '../actions';

const initialState: ActionState = { ok: false };

/**
 * Comment form under a forum topic. Submissions start as "pending" and
 * appear after review — the success message says so plainly.
 */
export default function CommentForm({ topicSlug }: { topicSlug: string }) {
  const [state, formAction] = useActionState(postCommentAction, initialState);

  if (state.ok) {
    return (
      <div className="form-success" role="status">
        Thank you — your reply has been received. We review every reply before
        it appears, so it will show here once it is checked, usually within a
        day or two.
      </div>
    );
  }

  return (
    <form action={formAction} className="calc-form forum-comment-form">
      <h3>Add your opinion</h3>
      {state.error && <p className="form-error">{state.error}</p>}
      <input type="hidden" name="topicSlug" value={topicSlug} />
      <label>
        Your name
        <input type="text" name="name" placeholder="e.g. Musa" required />
      </label>
      <label>
        Where are you? (state or town)
        <input type="text" name="location" placeholder="e.g. Kano, Kano State" required />
      </label>
      <label>
        Your opinion or advice
        <textarea
          name="comment"
          rows={4}
          placeholder="What do you think is happening? What worked for you? Share your experience."
          required
        />
      </label>
      <p className="calc-note">
        Your reply will be visible to everyone once published. Do not put your
        phone number or home address in it.
      </p>
      <div className="form-actions">
        <button type="submit" className="btn btn-primary">
          Post my reply
        </button>
      </div>
    </form>
  );
}
