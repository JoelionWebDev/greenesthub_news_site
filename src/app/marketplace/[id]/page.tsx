import Link from "next/link";
import type { Metadata } from "next";
import { connection } from "next/server";
import { notFound } from "next/navigation";
import { getListingById, getListingsNearState } from "@/lib/marketplace/listings";
import { isConfigured } from "@/lib/marketplace/supabase";
import { isPaystackConfigured } from "@/lib/marketplace/paystack";
import { formatNaira, whatsappDigits } from "@/lib/marketplace/format";
import { produceCategoryName } from "@/lib/marketplace/types";
import { SITE_URL } from "@/lib/site";
import ListingCard from "@/components/marketplace/ListingCard";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const listing = await getListingById(id).catch(() => null);
  if (!listing) return { title: "Listing not found" };
  const title = listing.title;
  const description = `${listing.title} — ${formatNaira(listing.price_kobo)} per ${listing.unit}. ${listing.quantity_available} units available from ${listing.city}, ${listing.state}. Buy fresh produce on the Greennest Hub Marketplace.`;
  const url = `${SITE_URL}/marketplace/${listing.id}`;
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      siteName: "Greennest Hub",
      url,
      title,
      description,
      images: [
        {
          url: listing.image_url ?? "/images/farmer-market.jpg",
          width: 1920,
          height: 1280,
          alt: listing.title,
        },
      ],
    },
  };
}

export default async function ListingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await connection();
  const listing = await getListingById(id);
  if (!listing) notFound();

  const nearby = await getListingsNearState(listing.state, listing.id, 3).catch(() => []);
  const soldOut = listing.quantity_available <= 0;
  // Card payment is off until the owner's CAC registration is ready
  // (see isPaystackConfigured in lib/marketplace/paystack.ts).
  const paystackOn = isPaystackConfigured();
  const image = listing.image_url ?? "/images/farmer-market.jpg";

  const waNumber = listing.whatsapp_number ? whatsappDigits(listing.whatsapp_number) : "";
  const waText = encodeURIComponent(
    `Hello ${listing.farmer_name}, I want to buy ${listing.title} (${formatNaira(listing.price_kobo)} per ${listing.unit}) from the Greennest Hub Marketplace. Is it still available?`,
  );
  const waHref = waNumber ? `https://wa.me/${waNumber}?text=${waText}` : undefined;

  return (
    <div className="wrap">
      <p className="market-crumb">
        <Link href="/marketplace">← Marketplace</Link>
        {" · "}
        {produceCategoryName(listing.category)}
      </p>

      <section className="listing-detail" aria-labelledby="listing-heading">
        <div className="listing-gallery">
          {/* Plain <img>: listing photos can be remote Supabase Storage URLs,
              which next/image would need remotePatterns for. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={image} alt={listing.title} className="listing-gallery-img" />
          {listing.is_demo && <span className="demo-chip demo-chip-large">DEMO</span>}
        </div>

        <div className="listing-info">
          <h1 id="listing-heading">{listing.title}</h1>
          <p className="listing-price listing-price-large">
            {formatNaira(listing.price_kobo)}
            <span className="listing-unit"> per {listing.unit}</span>
          </p>
          <p className="listing-meta">
            📍 {listing.city}, {listing.state}
          </p>
          <p className="listing-meta">
            {soldOut ? (
              <strong>Sold out</strong>
            ) : (
              <>
                <strong>{listing.quantity_available}</strong>{" "}
                {listing.quantity_available === 1 ? "unit" : "units"} available
              </>
            )}
          </p>
          {listing.description && <p className="listing-desc">{listing.description}</p>}

          {listing.is_demo && (
            <p className="demo-note">
              <strong>Sample listing.</strong> This is a demo with prices from
              our verified market prices page — not a real seller yet. Real
              farmer listings appear here once farmers sign up.
            </p>
          )}

          <div className="listing-actions">
            {waHref && !soldOut && (
              <a
                href={waHref}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-whatsapp"
              >
                💬 Order on WhatsApp
              </a>
            )}
            {!soldOut && paystackOn && (
              <Link href={`/marketplace/checkout?listing=${listing.id}`} className="btn btn-primary">
                Buy now — pay with Paystack →
              </Link>
            )}
          </div>
          {!paystackOn && !soldOut && (
            <p className="listing-demo-hint">
              💵 Payment is arranged directly with the farmer on WhatsApp —
              bank transfer or cash. Agree it with the farmer before you pay.
            </p>
          )}
          {!isConfigured && (
            <p className="listing-demo-hint">
              Card payment is off in demo mode — order this sample on WhatsApp
              instead.
            </p>
          )}

          <div className="farmer-card">
            <h2>About the farmer</h2>
            <p>
              <strong>🧑‍🌾 {listing.farmer_name}</strong>
            </p>
            <p>
              📍 {listing.city}, {listing.state}
            </p>
            <p>
              🛒 Sells: {produceCategoryName(listing.category)}
            </p>
            <p className="farmer-tip">
              Tip: agree the delivery or pickup with the farmer on WhatsApp
              before you pay — and always check the produce when it arrives.
            </p>
          </div>
        </div>
      </section>

      {nearby.length > 0 && (
        <section className="section" aria-labelledby="nearby-heading">
          <div className="section-head">
            <h2 id="nearby-heading">More produce near you in {listing.state} 🌾</h2>
          </div>
          <div className="listing-grid">
            {nearby.map((l) => (
              <ListingCard key={l.id} listing={l} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
