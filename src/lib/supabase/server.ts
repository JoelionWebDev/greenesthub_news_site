import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { SupabaseClient, User } from "@supabase/supabase-js";

export const isAuthConfigured =
  Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL) &&
  Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

/**
 * Server client (anon key, cookie-based session). Use in Server
 * Components, Server Actions and Route Handlers. Returns null when
 * Supabase is not configured — callers must handle demo mode.
 */
export async function supabaseAuthServer(): Promise<SupabaseClient | null> {
  if (!isAuthConfigured) return null;
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL as string,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // setAll is called from a Server Component during render,
            // where setting cookies is not allowed — the proxy refreshes
            // the session instead, so this is safe to ignore.
          }
        },
      },
    },
  );
}

export type Profile = {
  id: string;
  display_name: string;
  bio: string;
  location: string;
  is_admin: boolean;
  created_at: string;
  updated_at: string;
};

/** The signed-in user, or null (including when auth is not configured). */
export async function getCurrentUser(): Promise<User | null> {
  const sb = await supabaseAuthServer();
  if (!sb) return null;
  const { data } = await sb.auth.getUser();
  return data.user ?? null;
}

/**
 * The signed-in user's profile row. Falls back to a profile built from
 * the auth user's metadata when no row exists yet (e.g. the trigger
 * has not run, or the account predates the profiles table).
 */
export async function getCurrentProfile(): Promise<{
  user: User;
  profile: Profile;
} | null> {
  const sb = await supabaseAuthServer();
  if (!sb) return null;
  const { data } = await sb.auth.getUser();
  const user = data.user;
  if (!user) return null;
  const { data: row } = await sb
    .from("profiles")
    .select("id, display_name, bio, location, is_admin, created_at, updated_at")
    .eq("id", user.id)
    .maybeSingle();
  if (row) return { user, profile: row as Profile };
  const meta = (user.user_metadata ?? {}) as Record<string, string>;
  return {
    user,
    profile: {
      id: user.id,
      display_name: meta.display_name || user.email?.split("@")[0] || "Farmer",
      bio: "",
      location: meta.location || "",
      is_admin: false,
      created_at: user.created_at,
      updated_at: user.created_at,
    },
  };
}
