import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";

/** Runs before every matched request: refresh the Supabase session. */
export async function proxy(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except static files, image optimisation
     * and the favicon — the session refresh must never block those.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
