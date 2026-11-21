'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabaseAuthBrowser } from "@/lib/supabase/client";

/**
 * Session-aware nav link for the header: "Sign in" when logged out,
 * the user's name (→ /profile) and "Log out" when logged in. Reads
 * the session in the browser so the (static) header never blocks on
 * auth, and updates live when the session changes. `onNavigate` runs
 * when a link is tapped (the mobile menu uses it to close itself).
 */
export default function AuthNav({ onNavigate }: { onNavigate?: () => void }) {
  const [email, setEmail] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const sb = supabaseAuthBrowser();
    if (!sb) {
      setChecked(true);
      return;
    }
    let alive = true;
    sb.auth.getSession().then(({ data }) => {
      if (!alive) return;
      const user = data.session?.user ?? null;
      setEmail(user?.email ?? null);
      setDisplayName(
        ((user?.user_metadata ?? {}) as Record<string, string>).display_name ?? null,
      );
      setChecked(true);
    });
    const { data: listener } = sb.auth.onAuthStateChange((_event, session) => {
      const user = session?.user ?? null;
      setEmail(user?.email ?? null);
      setDisplayName(
        ((user?.user_metadata ?? {}) as Record<string, string>).display_name ?? null,
      );
    });
    return () => {
      alive = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  if (!checked) return null;

  if (!email) {
    return (
      <Link href="/auth/login" onClick={onNavigate}>
        🔑 Sign in
      </Link>
    );
  }

  return (
    <>
      <Link href="/profile" onClick={onNavigate}>
        👤 {displayName || email.split("@")[0]}
      </Link>
      <Link href="/auth/logout" onClick={onNavigate}>
        Log out
      </Link>
    </>
  );
}
