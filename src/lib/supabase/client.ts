import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

// True only when the public Supabase credentials are present. Auth pages
// and the header show a "not switched on yet" state when false — the
// site still builds and runs, and the forum falls back to its demo
// (Markdown seed) content.
export const isAuthConfigured =
  Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL) &&
  Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

let browserClient: SupabaseClient | null = null;

/**
 * Browser client (anon key). Safe to use in client components.
 * Shares the same localStorage session as the marketplace's plain
 * supabase-js client, so signing in once signs the farmer in
 * everywhere on the site (forum + marketplace sell flow).
 */
export function supabaseAuthBrowser(): SupabaseClient | null {
  if (!isAuthConfigured) return null;
  if (!browserClient) {
    browserClient = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL as string,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string,
    );
  }
  return browserClient;
}
