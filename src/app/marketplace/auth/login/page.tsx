"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { isConfigured, supabaseBrowser } from "@/lib/marketplace/supabase";

export default function MarketplaceLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);
    const sb = supabaseBrowser();
    if (!sb) {
      setError("Supabase is not connected yet. See supabase/README.md to connect it.");
      setBusy(false);
      return;
    }
    const { error: authError } = await sb.auth.signInWithPassword({ email, password });
    if (authError) {
      setError(authError.message);
      setBusy(false);
      return;
    }
    router.push("/marketplace/sell");
  }

  return (
    <div className="wrap">
      <section className="section" aria-labelledby="login-heading">
        <div className="section-head">
          <h1 id="login-heading">Log in to sell 🧺</h1>
          <p>
            No account yet?{" "}
            <Link href="/marketplace/sell" className="category-card-link">
              Create one — it&apos;s free
            </Link>
          </p>
        </div>
        <form onSubmit={submit} className="admin-form">
          {!isConfigured && (
            <p className="form-error">
              Demo mode: login needs Supabase. Follow supabase/README.md to
              connect it.
            </p>
          )}
          <label>
            Email
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>
          <label>
            Password
            <input
              required
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>
          {error && <p className="form-error">{error}</p>}
          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={busy}>
              {busy ? "Logging in…" : "Log in"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
