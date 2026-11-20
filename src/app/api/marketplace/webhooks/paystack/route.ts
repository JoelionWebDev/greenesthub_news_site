import { NextRequest, NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";
import { supabaseServer } from "@/lib/marketplace/supabase";
import { verifyTransaction } from "@/lib/marketplace/paystack";
import { sendProduceOrderEmails } from "@/lib/marketplace/email";
import type { ProduceOrderItem } from "@/lib/marketplace/types";

/**
 * POST /api/marketplace/webhooks/paystack
 *
 * Paystack sends this on every payment event. An order is marked PAID only
 * after TWO independent checks:
 *   1. The x-paystack-signature header is a valid HMAC-SHA512 of the raw
 *      request body, keyed with PAYSTACK_SECRET_KEY.
 *   2. The transaction is re-verified with Paystack's API
 *      (GET /transaction/verify/:reference) and the verified amount matches
 *      the order total stored in our database.
 * A forged or replayed webhook can pass neither check.
 */
export async function POST(req: NextRequest) {
  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret) {
    return NextResponse.json({ error: "Webhook not configured" }, { status: 503 });
  }

  // Raw body — required for the HMAC check (JSON parsing would change it).
  const rawBody = await req.text();
  const signature = req.headers.get("x-paystack-signature") ?? "";

  const expected = createHmac("sha512", secret).update(rawBody).digest("hex");
  let signatureOk = false;
  try {
    signatureOk =
      signature.length === expected.length &&
      timingSafeEqual(Buffer.from(signature, "utf8"), Buffer.from(expected, "utf8"));
  } catch {
    signatureOk = false;
  }
  if (!signatureOk) {
    console.warn("Paystack webhook: invalid signature");
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let event: { event?: string; data?: { reference?: string; status?: string } };
  try {
    event = JSON.parse(rawBody) as typeof event;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // Only successful charges can mark an order paid.
  if (event.event !== "charge.success" || !event.data?.reference) {
    return NextResponse.json({ received: true });
  }
  const reference = event.data.reference;

  try {
    // Re-verify with Paystack directly — never trust the webhook payload.
    const verified = await verifyTransaction(reference);
    if (verified.status !== "success") {
      console.warn(`Paystack webhook: ${reference} verified as ${verified.status}, not paid`);
      return NextResponse.json({ received: true });
    }

    const sb = supabaseServer();
    if (!sb) return NextResponse.json({ error: "Database not configured" }, { status: 503 });

    const { data: order, error: orderError } = await sb
      .from("marketplace_orders")
      .select("id, listing_id, total_kobo, status, buyer_name, buyer_email, buyer_phone, buyer_state, items")
      .eq("paystack_reference", reference)
      .maybeSingle();
    if (orderError) throw new Error(orderError.message);
    if (!order) {
      console.warn(`Paystack webhook: no order for reference ${reference}`);
      return NextResponse.json({ received: true });
    }
    // The verified amount must match the order total exactly.
    if (verified.amount !== order.total_kobo) {
      console.warn(
        `Paystack webhook: amount mismatch for ${reference} (verified ${verified.amount} vs order ${order.total_kobo})`,
      );
      return NextResponse.json({ received: true });
    }
    // Only the transition to paid triggers stock + emails — a retried
    // webhook for an already-paid order must never do them twice.
    let justPaid = false;
    if (order.status !== "paid") {
      const { error: updateError } = await sb
        .from("marketplace_orders")
        .update({ status: "paid" })
        .eq("id", order.id);
      if (updateError) throw new Error(updateError.message);
      justPaid = true;
    }

    if (justPaid) {
      const items = (order.items ?? []) as ProduceOrderItem[];
      const totalQty = items.reduce((sum, item) => sum + (item.qty || 0), 0);

      // Reduce the listing's available quantity (guarded so it can never
      // go below zero). A failure here is only logged — the order is paid
      // either way and the farmer can adjust the quantity by hand.
      try {
        const { data: listing } = await sb
          .from("produce_listings")
          .select("quantity_available")
          .eq("id", order.listing_id)
          .maybeSingle();
        if (listing && (listing.quantity_available as number) >= totalQty) {
          await sb
            .from("produce_listings")
            .update({ quantity_available: (listing.quantity_available as number) - totalQty })
            .eq("id", order.listing_id);
        }
      } catch (err) {
        console.error("Paystack webhook: quantity update failed:", err);
      }

      // Emails must NEVER break payment processing: any failure here is
      // logged inside sendProduceOrderEmails and the webhook still returns 200.
      try {
        const { data: listing } = await sb
          .from("produce_listings")
          .select("title, farmer_name, owner_id")
          .eq("id", order.listing_id)
          .maybeSingle();

        // Farmer email comes from the listing owner's auth account.
        let farmerEmail: string | null = null;
        if (listing?.owner_id) {
          try {
            const { data: owner } = await sb.auth.admin.getUserById(listing.owner_id as string);
            farmerEmail = owner.user?.email ?? null;
          } catch (err) {
            console.error("Paystack webhook: farmer email lookup failed:", err);
          }
        }

        await sendProduceOrderEmails({
          reference,
          listingTitle: (listing?.title as string | undefined) ?? "Produce",
          farmerName: (listing?.farmer_name as string | undefined) ?? "Greennest farmer",
          buyerName: order.buyer_name,
          buyerPhone: order.buyer_phone,
          buyerState: order.buyer_state,
          // Buyer email stored at checkout; fall back to the email Paystack
          // verified for this transaction (same address in practice).
          buyerEmail: order.buyer_email ?? verified.customer?.email ?? null,
          farmerEmail,
          items,
          totalKobo: order.total_kobo,
        });
      } catch (err) {
        console.error("Paystack webhook: order emails failed:", err);
      }
    }
    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("Paystack webhook error:", err);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
