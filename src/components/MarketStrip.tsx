import Link from 'next/link';
import { COMMODITY_PRICES, MARKET_PRICES_UPDATED } from '@/lib/market-prices';

/** Today's market prices strip for the homepage — Lagos prices for the
 *  three most-checked foods. Full regional prices live on /tools/market-prices. */
export default function MarketStrip() {
  const lagos = COMMODITY_PRICES.slice(0, 3).map((c) => ({
    commodity: c.commodity,
    row: c.regions.find((r) => r.region.startsWith('Lagos')),
  }));

  return (
    <section className="price-strip" aria-label="Today's market prices">
      <div className="wrap price-strip-inner">
        <p className="price-strip-title">
          📈 Market prices — Lagos <span>· updated {MARKET_PRICES_UPDATED}</span>
        </p>
        <ul className="price-strip-list">
          {lagos.map(
            (item) =>
              item.row && (
                <li key={item.commodity} className="price-strip-item">
                  <span className="price-strip-commodity">{item.commodity}</span>
                  <strong>{item.row.price}</strong>
                  <span>{item.row.unit}</span>
                </li>
              ),
          )}
        </ul>
        <p className="price-strip-note">
          <Link href="/tools/market-prices">See all regions →</Link>
        </p>
      </div>
    </section>
  );
}
