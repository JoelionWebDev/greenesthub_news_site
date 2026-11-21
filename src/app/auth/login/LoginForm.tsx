'use client';

import { useActionState, useState } from "react";
import Link from "next/link";
import {
  signInMagicLinkAction,
  signInPasswordAction,
  type AuthState,
} from "../actions";
import { isAuthConfigured } from "@/lib/supabase/client";

const initialState: AuthState = { ok: false };

type Mode = "password" | "magic";

/**
 * Sign-in form: email + password, or a magic link by email (no
 * password). The magic link is the easiest way in for farmers who
 * do not want to remember a password.
 */
export default function LoginForm({ callbackError }: { callbackError?: string }) {
  const [mode, setMode] = useState<Mode>("password");
  const [passwordState, passwordAction] = useActionState(signInPasswordAction, initialState);
  const [magicState, magicAction] = useActionState(signInMagicLinkAction, initialState);
  const state = mode === "password" ? passwordState : magicState;

  if (!isAuthConfigured) {
    return (
      <div className="wrap">
        <article className="article">
          <h1>Sign in</h1>
          <div className="article-body">
            <p>
              Sign-in is not switched on yet — the site owner still needs to
              connect Supabase (see <code>supabase/README.md</code>). Once it
              is connected, this page lets farmers sign in with a password or
              a magic link sent to their email.
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
        <h1>👋 Sign in</h1>
        <p>
          Sign in to post topics and replies in the Farmers Forum, and to list
          produce in the Marketplace. Your name and location come from your
          profile.
        </p>
      </header>

      <div className="blog-filters" role="tablist" aria-label="Sign-in method">
        <button
          type="button"
          className={`filter-chip${mode === "password" ? " active" : ""}`}
          onClick={() => setMode("password")}
        >
          🔑 Password
        </button>
        <button
          type="button"
          className={`filter-chip${mode === "magic" ? " active" : ""}`}
          onClick={() => setMode("magic")}
        >
          ✉️ Magic link (no password)
        </button>
      </div>

      {mode === "password" ? (
        <form action={passwordAction} className="calc-form">
          {(state.error || callbackError) && (
            <p className="form-error">{state.error || callbackError}</p>
          )}
          <label>
            Email
            <input type="email" name="email" placeholder="you@example.com" required />
          </label>
          <label>
            Password
            <input type="password" name="password" placeholder="Your password" required />
          </label>
          <div className="form-actions">
            <button type="submit" className="btn btn-primary">
              Sign in
            </button>
          </div>
        </form>
      ) : (
        <form action={magicAction} className="calc-form">
          {state.error && <p className="form-error">{state.error}</p>}
          <label>
            Email
            <input type="email" name="email" placeholder="you@example.com" required />
          </label>
          <p className="calc-note">
            We will email you a sign-in link. Click it and you are in — no
            password to remember. The link works once and expires after an
            hour.
          </p>
          <div className="form-actions">
            <button type="submit" className="btn btn-primary">
              Email me a sign-in link
            </button>
          </div>
        </form>
      )}

      <p className="section-more">
        No account yet?{" "}
        <Link href="/auth/signup" className="category-card-link">
          Create one — it takes a minute →
        </Link>
      </p>
    </div>
  );
}
