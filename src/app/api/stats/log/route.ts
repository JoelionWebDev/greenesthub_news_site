import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/marketplace/supabase";

/**
 * POST /api/stats/log
 * Body: { path: "/marketplace" }
 *
 * Logs one page view: page path + timestamp only. No IP address, no
 * user agent, no cookies, no personal data of any kind. Fire-and-forget:
 * always answers 204 so a logging failure can never break the page.
 * The /stats and /admin pages are never logged (the VisitLogger skips
 * them before calling here).
 */
export async function POST(req: NextRequest) {
  try {
    const body = (await req.json().catch(() => null)) as { path?: unknown } | null;
    const path = typeof body?.path === "string" ? body.path.trim() : "";
    // Only real site paths, no query strings, no outside URLs.
    if (!path.startsWith("/") || path.length > 200 || path.includes("?")) {
      return new NextResponse(null, { status: 204 });
    }
    if (path === "/stats" || path.startsWith("/admin")) {
      return new NextResponse(null, { status: 204 });
    }
    const sb = supabaseServer();
    if (!sb) return new NextResponse(null, { status: 204 });
    await sb.from("page_visits").insert({ path });
    return new NextResponse(null, { status: 204 });
  } catch {
    return new NextResponse(null, { status: 204 });
  }
}
