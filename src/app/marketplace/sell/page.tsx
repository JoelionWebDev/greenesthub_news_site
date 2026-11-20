import type { Metadata } from "next";
import { SITE_URL } from "@/lib/site";
import SellForm from "./SellForm";

export const metadata: Metadata = {
  title: "Sell Your Produce",
  description:
    "Farmers: create a free account and list your produce on the Greennest Hub Marketplace. Buyers across Nigeria will see it — listings from their state come first.",
  alternates: { canonical: `${SITE_URL}/marketplace/sell` },
  openGraph: {
    type: "website",
    siteName: "Greennest Hub",
    url: `${SITE_URL}/marketplace/sell`,
    title: "Sell Your Produce",
    description:
      "Farmers: create a free account and list your produce on the Greennest Hub Marketplace.",
    images: [{ url: "/images/farmer-market.jpg", width: 1920, height: 1280, alt: "A farmer at a produce stall" }],
  },
};

export default function SellPage() {
  return (
    <div className="wrap">
      <section className="section" aria-labelledby="sell-heading">
        <div className="section-head">
          <h1 id="sell-heading">🧺 Sell your produce</h1>
          <p>
            Create a free account, then list what you harvest. Your produce
            only appears to buyers after your account exists — that is how
            buyers know every seller here is a real, registered farmer.
          </p>
        </div>
        <SellForm />
      </section>
    </div>
  );
}
