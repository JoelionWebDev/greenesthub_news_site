import { NextResponse } from "next/server";
import { supabaseAuthServer } from "@/lib/supabase/server";

/**
 * GET /auth/callback — the landing page for Supabase email links
 * (confirmation + magic link). Handles both flows:
 *  - `?code=…` (PKCE flow): exchange the code for a session.
 *  - `?token_hash=…&type=…` (email link flow): verify the one-time token.
 * Then redirects to `?next=…` (default /profile).
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const next = searchParams.get("next") ?? "/profile";
  const safeNext = next.startsWith("/") ? next : "/profile";

  const sb = await supabaseAuthServer();
  if (!sb) {
    return NextResponse.redirect(`${origin}/auth/login?error=not-configured`);
  }

  const code = searchParams.get("code");
  if (code) {
    const { error } = await sb.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(`${origin}${safeNext}`);
  }

  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type");
  if (tokenHash && type) {
    const { error } = await sb.auth.verifyOtp({
      token_hash: tokenHash,
      type: type as "magiclink" | "signup" | "recovery" | "email_change",
    });
    if (!error) return NextResponse.redirect(`${origin}${safeNext}`);
  }

  return NextResponse.redirect(`${origin}/auth/login?error=link`);
}
