'use client';

import { useActionState } from 'react';
import { loginAction, type ActionState } from '@/app/admin/actions';

const initialState: ActionState = { ok: false };

export default function LoginForm() {
  const [state, formAction, isPending] = useActionState(loginAction, initialState);

  return (
    <form action={formAction} className="admin-form">
      <label>
        Username
        <input name="username" type="text" autoComplete="username" placeholder="admin" required />
      </label>
      <label>
        Password
        <input name="password" type="password" autoComplete="current-password" placeholder="Your admin password" required />
      </label>
      {state.error ? (
        <p className="form-error" role="alert">
          {state.error}
        </p>
      ) : null}
      <button type="submit" className="btn btn-primary" disabled={isPending}>
        {isPending ? 'Logging in…' : 'Log in'}
      </button>
    </form>
  );
}
