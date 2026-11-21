'use client';

import { useState } from 'react';
import type { ActionState } from './actions';

/** Small delete button with a confirm step. Used by the admin (and a post's own author) on forum topics and replies. */
export default function DeleteButton({
  label,
  onDelete,
}: {
  label: string;
  onDelete: () => Promise<ActionState>;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function handle() {
    if (!window.confirm('Delete this? This cannot be undone.')) return;
    setBusy(true);
    const result = await onDelete();
    if (!result.ok) {
      setError(result.error ?? 'Could not delete.');
      setBusy(false);
    }
  }

  return (
    <span className="forum-delete">
      <button type="button" className="btn btn-secondary" onClick={handle} disabled={busy}>
        {busy ? 'Deleting…' : label}
      </button>
      {error && <span className="form-error">{error}</span>}
    </span>
  );
}
