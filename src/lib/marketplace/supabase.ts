import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// True only when the public Supabase credentials are present. The public
// marketplace pages fall back to demo listings when false; checkout, sell
// and upload refuse to run.
export const isConfigured =
  Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL) &&
  Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

let browserClient: SupabaseClient | null = null;

/** Browser client (anon key). Safe to use in client components. */
export function supabaseBrowser(): SupabaseClient | null {
  if (!isConfigured) return null;
  if (!browserClient) {
    browserClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL as string,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string,
    );
  }
  return browserClient;
}

/**
 * Server-side client with the SERVICE ROLE key. Bypasses RLS, so it is used
 * ONLY inside API routes for trusted server work (checkout order creation,
 * webhook order updates). Never import this into a client component and never
 * expose SUPABASE_SERVICE_ROLE_KEY to the browser.
 */
export function supabaseServer(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) return null;
  return createClient(url, serviceKey, { auth: { persistSession: false } });
}

/** Anon-key server client, used to verify a user's access token (getUser). */
export function supabaseAnonServer(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) return null;
  return createClient(url, anon, { auth: { persistSession: false } });
}
