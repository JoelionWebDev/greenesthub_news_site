import type { Metadata } from "next";
import PriceExplorer from '@/components/PriceExplorer';

export const metadata: Metadata = {
  title: 'Market Prices — Same Food, Different Price in Every Region',
  description:
    'Current market prices for rice, maize, garri, beans, yam and tomatoes across Nigerian regions — Lagos, Enugu, Port Harcourt, Abuja, Kano, Borno and more — plus prices from Kenya and Ghana. Updated weekly from food-price news and surveys.',
};

export default function MarketPricesPage() {
  return (
    <div className="wrap">
      <header className="page-head">
        <h1>📈 Market prices — Nigeria &amp; Africa</h1>
        <p>
          The same food sells for a different price in every region. Compare prices across
          Nigerian markets — and see how they compare in Kenya and Ghana too.
        </p>
      </header>

      <div className="tools-note">
        <strong>How prices update:</strong> every Monday, Greennest Hub checks the latest
        food-price news and surveys — Nairametrics Food Price Watch, BusinessDay market
        surveys, NBS Selected Food Prices Watch, WFP, and the Lagos State agriculture
        tracker — and updates this page. A price only appears when a published survey backs
        it. We never guess a price. Prices change often, so confirm with your seller before
        you pay.
      </div>

      <PriceExplorer />
    </div>
  );
}
