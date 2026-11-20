import { connection } from "next/server";
import { isPaystackConfigured } from "@/lib/marketplace/paystack";
import CheckoutForm from "./CheckoutForm";

export default async function MarketplaceCheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ listing?: string }>;
}) {
  const { listing } = await searchParams;
  // Reads the listing id from the URL, so this page renders per request.
  await connection();
  // Card payment is off until the owner's CAC registration is ready —
  // the form shows the WhatsApp payment message instead.
  return <CheckoutForm listingId={listing ?? ""} paystackEnabled={isPaystackConfigured()} />;
}
