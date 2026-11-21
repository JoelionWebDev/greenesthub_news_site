'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { postCommentAction, type ActionState } from '../actions';

const initialState: ActionState = { ok: false };

/**
 * Comment form under a forum topic. Only signed-in farmers see the
 * form — guests get a friendly sign-in prompt instead. The author's
 * name and location come from their profile, so there is nothing to
 * type but the opinion itself. Replies appear immediately.
 */
export default function CommentForm({
  topicSlug,
  isSignedIn,
}: {
  topicSlug: string;
  isSignedIn: boolean;
}) {
  const [state, formAction] = useActionState(postCommentAction, initialState);

  if (!isSignedIn) {
    return (
      <div className="forum-signin-prompt" role="note">
        <h3>💬 Add your opinion</h3>
        <p>
          Sign in to reply — your name and location come from your profile, so
          other farmers know who is talking.
        </p>
        <p>
          <Link href="/auth/login" className="btn btn-primary">
            Sign in →
          </Link>{" "}
          <Link href="/auth/signup" className="btn btn-secondary">
            Create an account →
          </Link>
        </p>
      </div>
    );
  }

  if (state.ok) {
    return (
      <div className="form-success" role="status">
        Thank you — your reply is live on this topic now.
      </div>
    );
  }

  return (
    <form action={formAction} className="calc-form forum-comment-form">
      <h3>Add your opinion</h3>
      {state.error && <p className="form-error">{state.error}</p>}
      <input type="hidden" name="topicSlug" value={topicSlug} />
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
        Your reply will be visible to everyone straight away, under the name
        on your profile. Do not put your phone number or home address in it.
      </p>
      <div className="form-actions">
        <button type="submit" className="btn btn-primary">
          Post my reply
        </button>
      </div>
    </form>
  );
}
