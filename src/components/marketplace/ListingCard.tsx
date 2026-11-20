import Link from "next/link";
import { formatNaira } from "@/lib/marketplace/format";
import { produceCategoryName, type ProduceListing } from "@/lib/marketplace/types";

/** One produce listing card for the browse grid and "near you" rows. */
export default function ListingCard({ listing }: { listing: ProduceListing }) {
  const image = listing.image_url ?? "/images/farmer-market.jpg";
  const soldOut = listing.quantity_available <= 0;
  return (
    <article className="listing-card">
      <Link href={`/marketplace/${listing.id}`} className="listing-card-image-link">
        {/* Plain <img>: listing photos can be remote Supabase Storage URLs,
            which next/image would need remotePatterns for. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={image} alt={listing.title} loading="lazy" className="listing-card-image" />
        {listing.is_demo && <span className="demo-chip">DEMO</span>}
        {soldOut && <span className="soldout-chip">Sold out</span>}
      </Link>
      <div className="listing-card-body">
        <p className="listing-card-category">
          {produceCategoryName(listing.category)}
        </p>
        <h3 className="listing-card-title">
          <Link href={`/marketplace/${listing.id}`}>{listing.title}</Link>
        </h3>
        <p className="listing-price">
          {formatNaira(listing.price_kobo)}
          <span className="listing-unit"> per {listing.unit}</span>
        </p>
        <p className="listing-meta">
          📍 {listing.city}, {listing.state} · {listing.quantity_available}{" "}
          {listing.quantity_available === 1 ? "unit" : "units"} left
        </p>
        <p className="listing-farmer">🧑‍🌾 {listing.farmer_name}</p>
        <Link href={`/marketplace/${listing.id}`} className="category-card-link">
          View &amp; buy →
        </Link>
      </div>
    </article>
  );
}
