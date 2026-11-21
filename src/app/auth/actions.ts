'use server';

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { supabaseAuthServer } from "@/lib/supabase/server";

export type AuthState = {
  ok: boolean;
  error?: string;
  /** Shown instead of the form (e.g. "check your email"). */
  message?: string;
};

function appUrl(): string {
  return (process.env.NEXT_PUBLIC_APP_URL ?? "https://www.greennesthub.com.ng").replace(
    /\/$/,
    "",
  );
}

function isEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

/**
 * Create an account with email + password. The display name and location
 * are saved as user metadata — the database trigger copies them into
 * the public.profiles row. Supabase sends a confirmation email when
 * email confirmation is on (the default); the link lands on
 * /auth/callback, which signs the user in.
 */
export async function signUpAction(
  _prevState: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const displayName = String(formData.get("displayName") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const location = String(formData.get("location") ?? "").trim();

  if (displayName.length < 2) {
    return { ok: false, error: "Please tell us your name (at least 2 characters)." };
  }
  if (!isEmail(email)) {
    return { ok: false, error: "Please enter a valid email address." };
  }
  if (password.length < 6) {
    return { ok: false, error: "Your password needs at least 6 characters." };
  }
  if (location.length < 2) {
    return { ok: false, error: "Please tell us where you farm (state or town)." };
  }

  const sb = await supabaseAuthServer();
  if (!sb) {
    return {
      ok: false,
      error:
        "Sign-up is not switched on yet — the site owner still needs to connect Supabase (see supabase/README.md).",
    };
  }

  const { data, error } = await sb.auth.signUp({
    email,
    password,
    options: {
      data: { display_name: displayName, location },
      emailRedirectTo: `${appUrl()}/auth/callback?next=/profile`,
    },
  });
  if (error) return { ok: false, error: error.message };

  // Email confirmation off in Supabase = session straight away.
  if (data.session) redirect("/profile");
  return {
    ok: true,
    message:
      "Account created — check your email and click the confirmation link to finish signing in. (Check spam too.)",
  };
}

/** Sign in with email + password. */
export async function signInPasswordAction(
  _prevState: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!isEmail(email)) {
    return { ok: false, error: "Please enter a valid email address." };
  }
  if (!password) {
    return { ok: false, error: "Please enter your password." };
  }

  const sb = await supabaseAuthServer();
  if (!sb) {
    return {
      ok: false,
      error:
        "Sign-in is not switched on yet — the site owner still needs to connect Supabase (see supabase/README.md).",
    };
  }

  const { error } = await sb.auth.signInWithPassword({ email, password });
  if (error) {
    // Wrong password and "user not found" both come back as invalid
    // credentials — say so plainly and point at the fix.
    return {
      ok: false,
      error:
        "That email or password did not match. If you signed up with a magic link before, use the magic link instead — or reset your password from the sign-in page.",
    };
  }
  redirect("/profile");
}

/**
 * Sign in with a magic link (no password). Supabase emails a link;
 * clicking it lands on /auth/callback, which signs the user in.
 * This is the easiest way in for farmers who do not want a password.
 */
export async function signInMagicLinkAction(
  _prevState: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();

  if (!isEmail(email)) {
    return { ok: false, error: "Please enter a valid email address." };
  }

  const sb = await supabaseAuthServer();
  if (!sb) {
    return {
      ok: false,
      error:
        "Sign-in is not switched on yet — the site owner still needs to connect Supabase (see supabase/README.md).",
    };
  }

  const { error } = await sb.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: `${appUrl()}/auth/callback?next=/profile` },
  });
  if (error) return { ok: false, error: error.message };
  return {
    ok: true,
    message:
      "Magic link sent — check your email and click the link to sign in. (Check spam too.) The link works once and expires after an hour.",
  };
}

/** Sign out (used by the header "Log out" link via /auth/logout). */
export async function signOutAction(): Promise<void> {
  const sb = await supabaseAuthServer();
  if (sb) await sb.auth.signOut();
  redirect("/");
}

/**
 * Edit the signed-in user's own profile (display name, bio, location).
 * RLS on public.profiles only allows a user to touch their own row.
 */
export async function updateProfileAction(
  _prevState: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const displayName = String(formData.get("displayName") ?? "").trim();
  const bio = String(formData.get("bio") ?? "").trim();
  const location = String(formData.get("location") ?? "").trim();

  if (displayName.length < 2) {
    return { ok: false, error: "Your name needs at least 2 characters." };
  }
  if (bio.length > 500) {
    return { ok: false, error: "Please keep your bio under 500 characters." };
  }
  if (location.length > 100) {
    return { ok: false, error: "Please keep your location under 100 characters." };
  }

  const sb = await supabaseAuthServer();
  if (!sb) {
    return { ok: false, error: "Profiles are not switched on yet — Supabase is not connected." };
  }
  const { data } = await sb.auth.getUser();
  if (!data.user) {
    return { ok: false, error: "Please sign in first." };
  }

  const { error } = await sb.from("profiles").upsert(
    {
      id: data.user.id,
      display_name: displayName,
      bio,
      location,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "id" },
  );
  if (error) return { ok: false, error: error.message };

  revalidatePath("/profile");
  return { ok: true, message: "Profile saved." };
}
