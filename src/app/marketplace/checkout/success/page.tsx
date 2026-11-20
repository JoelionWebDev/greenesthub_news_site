import Link from "next/link";
import { connection } from "next/server";

export default async function MarketplaceCheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ reference?: string }>;
}) {
  const { reference } = await searchParams;
  await connection();

  return (
    <div className="wrap">
      <section className="section" style={{ textAlign: "center" }}>
        <p style={{ fontSize: "3rem" }} aria-hidden="true">
          ✅
        </p>
        <h1>Thank you — payment received</h1>
        <p className="lede" style={{ margin: "0.75rem auto", maxWidth: 560 }}>
          Your order has been placed and the farmer has been notified. They
          will contact you on WhatsApp to confirm delivery or pickup.
        </p>
        {reference && (
          <p className="form-success" style={{ maxWidth: 560, margin: "1rem auto" }}>
            Payment reference: <strong>{reference}</strong>
          </p>
        )}
        <p className="calc-note" style={{ maxWidth: 560, margin: "0 auto" }}>
          Your payment is confirmed by our server against Paystack before the
          order is marked paid — keep your reference safe.
        </p>
        <p className="section-more">
          <Link href="/marketplace" className="btn btn-primary">
            Continue shopping →
          </Link>
        </p>
      </section>
    </div>
  );
}
