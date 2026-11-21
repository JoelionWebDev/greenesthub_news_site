import { NextResponse } from "next/server";
import { supabaseAuthServer } from "@/lib/supabase/server";

/** GET /auth/logout — sign out and go home. Used by the header link. */
export async function GET(request: Request) {
  const sb = await supabaseAuthServer();
  if (sb) await sb.auth.signOut();
  return NextResponse.redirect(new URL("/", request.url));
}
