import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/marketplace/supabase";
import { initializeTransaction } from "@/lib/marketplace/paystack";
import { randomUUID } from "crypto";

/**
 * POST /api/marketplace/checkout
 * Body: { listingId, qty, buyerName, buyerPhone, buyerEmail, buyerState }
 *
 * SECURITY: the browser only ever sends a listing id and a quantity.
 * The price is read from the DATABASE and the total is computed HERE on the
 * server. A tampered price or total sent by the client is ignored entirely.
 */
export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      listingId?: string;
      qty?: number;
      buyerName?: string;
      buyerPhone?: string;
      buyerEmail?: string;
      buyerState?: string;
    };

    const listingId = body.listingId?.trim();
    const qty = Math.floor(Number(body.qty) || 0);
    const buyerName = body.buyerName?.trim();
    const buyerPhone = body.buyerPhone?.trim();
    const buyerEmail = body.buyerEmail?.trim();
    const buyerState = body.buyerState?.trim();

    if (!listingId || qty < 1 || qty > 99) {
      return NextResponse.json({ error: "Invalid listing or quantity." }, { status: 400 });
    }
    if (!buyerName || !buyerPhone || !buyerEmail || !buyerState) {
      return NextResponse.json({ error: "Name, phone, email and state are all required." }, { status: 400 });
    }

    const sb = supabaseServer();
    if (!sb) {
      return NextResponse.json(
        { error: "Checkout is not configured yet. Connect Supabase and Paystack (see supabase/README.md)." },
        { status: 503 },
      );
    }

    // 1. Price + stock lookup from the database — never from the request.
    // The listing must belong to a registered farmer; anonymous/demo
    // listings can never be checked out.
    const { data: listing, error: listingError } = await sb
      .from("produce_listings")
      .select("id, title, price_kobo, unit, quantity_available, owner_id")
      .eq("id", listingId)
      .not("owner_id", "is", null)
      .maybeSingle();
    if (listingError) throw new Error(listingError.message);
    if (!listing) {
      return NextResponse.json({ error: "Listing not found." }, { status: 404 });
    }
    if (listing.quantity_available < qty) {
      return NextResponse.json({ error: "Not enough of this produce left for that quantity." }, { status: 400 });
    }

    // 2. Server-side total. price_kobo is an integer; total is in kobo.
    const totalKobo = listing.price_kobo * qty;

    // 3. Create the pending order (service-role client: trusted server work).
    const reference = `gnh_${Date.now()}_${randomUUID().slice(0, 8)}`;
    const { error: orderError } = await sb.from("marketplace_orders").insert({
      listing_id: listing.id,
      buyer_name: buyerName,
      buyer_phone: buyerPhone,
      buyer_email: buyerEmail,
      buyer_state: buyerState,
      items: [
        {
          listing_id: listing.id,
          name: `${listing.title} (${listing.unit})`,
          qty,
          price_kobo: listing.price_kobo,
        },
      ],
      total_kobo: totalKobo,
      status: "pending",
      paystack_reference: reference,
    });
    if (orderError) throw new Error(orderError.message);

    // 4. Initialise Paystack. Payment goes to the platform account; the
    // owner settles the farmer manually (see supabase/README.md).
    const appUrl = (process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000").replace(/\/$/, "");
    const init = await initializeTransaction({
      email: buyerEmail,
      amountKobo: totalKobo,
      reference,
      callbackUrl: `${appUrl}/marketplace/checkout/success?reference=${reference}`,
    });

    return NextResponse.json({
      authorization_url: init.authorization_url,
      reference,
      total_kobo: totalKobo,
    });
  } catch (err) {
    console.error("Marketplace checkout error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Checkout failed." },
      { status: 500 },
    );
  }
}
