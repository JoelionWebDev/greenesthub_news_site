'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { postTopicAction, type ActionState } from '../actions';
import { FORUM_CATEGORIES } from '@/lib/forum-categories';

const initialState: ActionState = { ok: false };

/** The new-topic form. The author's name and location come from their profile. */
export default function NewTopicForm() {
  const [state, formAction] = useActionState(postTopicAction, initialState);

  return (
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
        Your topic will be visible to everyone straight away, under the name
        on your profile. Do not put your phone number or home address in it.
      </p>
      <div className="form-actions">
        <button type="submit" className="btn btn-primary">
          Post my topic
        </button>
      </div>
    </form>
  );
}
