import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { supabaseAnonServer, supabaseServer } from "@/lib/marketplace/supabase";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_BYTES = 5 * 1024 * 1024; // 5 MB
const BUCKET = "produce-images";

/**
 * POST /api/marketplace/upload — multipart form: { file }
 *
 * SECURITY:
 * - Requires a logged-in farmer (Bearer access token verified with Supabase).
 * - Files are stored under <farmer-user-id>/<uuid>.<ext> — a farmer can only
 *   ever upload into their own folder, and the original filename is never
 *   used (no path tricks, no overwrites).
 * - Only JPEG/PNG/WebP, max 5 MB.
 * - Stored in the Supabase Storage bucket "produce-images" (CDN), never on
 *   Vercel. Returns the public URL, which the sell form attaches to the
 *   listing it then creates.
 */
export async function POST(req: NextRequest) {
  try {
    const anon = supabaseAnonServer();
    const server = supabaseServer();
    if (!anon || !server) {
      return NextResponse.json({ error: "Upload is not configured yet." }, { status: 503 });
    }

    const authHeader = req.headers.get("authorization") ?? "";
    const token = authHeader.replace(/^Bearer\s+/i, "");
    if (!token) {
      return NextResponse.json({ error: "You must be logged in to upload." }, { status: 401 });
    }
    const { data: userData, error: userError } = await anon.auth.getUser(token);
    if (userError || !userData.user) {
      return NextResponse.json({ error: "Invalid login session." }, { status: 401 });
    }
    const userId = userData.user.id;

    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file given." }, { status: 400 });
    }

    // Type + size validation.
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Only JPEG, PNG and WebP images are allowed." },
        { status: 400 },
      );
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: "Image must be 5 MB or smaller." }, { status: 400 });
    }

    const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
    const path = `${userId}/${randomUUID()}.${ext}`;
    const bytes = Buffer.from(await file.arrayBuffer());

    const { error: uploadError } = await server.storage
      .from(BUCKET)
      .upload(path, bytes, { contentType: file.type, upsert: false });
    if (uploadError) throw new Error(uploadError.message);

    const { data: publicData } = server.storage.from(BUCKET).getPublicUrl(path);
    return NextResponse.json({ url: publicData.publicUrl });
  } catch (err) {
    console.error("Marketplace upload error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Upload failed." },
      { status: 500 },
    );
  }
}
