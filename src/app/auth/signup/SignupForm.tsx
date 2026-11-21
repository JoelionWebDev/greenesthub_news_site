'use client';

import { useActionState } from "react";
import Link from "next/link";
import { signUpAction, type AuthState } from "../actions";
import { isAuthConfigured } from "@/lib/supabase/client";

const initialState: AuthState = { ok: false };

/** Create an account: name, email, password and where you farm. */
export default function SignupForm() {
  const [state, formAction] = useActionState(signUpAction, initialState);

  if (!isAuthConfigured) {
    return (
      <div className="wrap">
        <article className="article">
          <h1>Create an account</h1>
          <div className="article-body">
            <p>
              Sign-up is not switched on yet — the site owner still needs to
              connect Supabase (see <code>supabase/README.md</code>). Once it
              is connected, farmers can create an account here in a minute and
              start posting in the forum.
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

  if (state.ok && state.message) {
    return (
      <div className="wrap">
        <article className="article">
          <h1>Check your email 📬</h1>
          <div className="article-body">
            <p>{state.message}</p>
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
        <h1>🌱 Create your account</h1>
        <p>
          One account for the Farmers Forum and the Marketplace. No fees, no
          card — just your name, email and where you farm.
        </p>
      </header>
      <form action={formAction} className="calc-form">
        {state.error && <p className="form-error">{state.error}</p>}
        <label>
          Your name
          <input type="text" name="displayName" placeholder="e.g. Adaeze" required />
        </label>
        <label>
          Email
          <input type="email" name="email" placeholder="you@example.com" required />
        </label>
        <label>
          Password
          <input
            type="password"
            name="password"
            placeholder="At least 6 characters"
            required
          />
        </label>
        <label>
          Where do you farm? (state or town)
          <input type="text" name="location" placeholder="e.g. Enugu, Enugu State" required />
        </label>
        <p className="calc-note">
          Your name and location will show next to your topics and replies, so
          other farmers know who is talking. We never share your email with
          anyone.
        </p>
        <div className="form-actions">
          <button type="submit" className="btn btn-primary">
            Create my account
          </button>
        </div>
      </form>
      <p className="section-more">
        Already have an account?{" "}
        <Link href="/auth/login" className="category-card-link">
          Sign in →
        </Link>
      </p>
    </div>
  );
}
