'use client';

import { useMemo, useState } from 'react';
import {
  AFRICA_PRICES,
  COMMODITY_PRICES,
  MARKET_PRICES_UPDATED,
  NATIONAL_AVERAGES,
} from '@/lib/market-prices';

/** Regional price explorer: pick a food or a region and compare prices. */
export default function PriceExplorer() {
  const [commodity, setCommodity] = useState('All foods');
  const [region, setRegion] = useState('All regions');

  const commodities = useMemo(() => COMMODITY_PRICES.map((c) => c.commodity), []);
  const regions = useMemo(() => {
    const all = COMMODITY_PRICES.flatMap((c) => c.regions.map((r) => r.region));
    return [...new Set(all)];
  }, []);

  const visible = COMMODITY_PRICES.filter(
    (c) => commodity === 'All foods' || c.commodity === commodity,
  ).map((c) => ({
    ...c,
    regions: c.regions.filter((r) => region === 'All regions' || r.region === region),
  })).filter((c) => c.regions.length > 0);

  return (
    <div>
      <div className="calc-form">
        <label>
          Food
          <select value={commodity} onChange={(e) => setCommodity(e.target.value)}>
            <option>All foods</option>
            {commodities.map((name) => (
              <option key={name}>{name}</option>
            ))}
          </select>
        </label>
        <label>
          Region
          <select value={region} onChange={(e) => setRegion(e.target.value)}>
            <option>All regions</option>
            {regions.map((name) => (
              <option key={name}>{name}</option>
            ))}
          </select>
        </label>
      </div>

      <p className="price-source">Updated: {MARKET_PRICES_UPDATED}.</p>

      {visible.length === 0 ? (
        <p className="empty-state">
          No published survey covers that combination yet. Try another food or region — or
          check back after the next weekly update.
        </p>
      ) : (
        visible.map((c) => (
          <section key={c.commodity}>
            <h2 className="table-title">
              {c.emoji} {c.commodity}
            </h2>
            <div className="table-scroll">
              <table className="price-table">
                <thead>
                  <tr>
                    <th>Region</th>
                    <th>Market</th>
                    <th>Price</th>
                    <th>Survey date</th>
                    <th>Source</th>
                  </tr>
                </thead>
                <tbody>
                  {c.regions.map((r, i) => (
                    <tr key={`${r.region}-${r.market}-${i}`}>
                      <td>{r.region}</td>
                      <td>{r.market}</td>
                      <td>
                        <strong>{r.price}</strong> {r.unit}
                      </td>
                      <td>{r.date}</td>
                      <td>{r.source}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        ))
      )}

      <h2 className="table-title">🇳🇬 National averages (NBS, May 2026)</h2>
      <div className="table-scroll">
        <table className="price-table">
          <thead>
            <tr>
              <th>Food</th>
              <th>Average price</th>
            </tr>
          </thead>
          <tbody>
            {NATIONAL_AVERAGES.map((n) => (
              <tr key={n.commodity}>
                <td>{n.commodity}</td>
                <td>
                  <strong>{n.price}</strong>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="price-source">
        National averages come from the NBS Selected Food Prices Watch (May 2026), collected
        across all 774 local government areas. They are older than the regional surveys above
        — the next NBS edition will replace them when it is published.
      </p>

      <h2 className="table-title">🌍 Africa in general</h2>
      <div className="table-scroll">
        <table className="price-table">
          <thead>
            <tr>
              <th>Country</th>
              <th>City</th>
              <th>Food</th>
              <th>Price</th>
              <th>Survey date</th>
              <th>Source</th>
            </tr>
          </thead>
          <tbody>
            {AFRICA_PRICES.map((p, i) => (
              <tr key={`${p.country}-${p.city}-${p.commodity}-${i}`}>
                <td>{p.country}</td>
                <td>{p.city}</td>
                <td>{p.commodity}</td>
                <td>
                  <strong>{p.price}</strong> {p.unit}
                </td>
                <td>{p.date}</td>
                <td>{p.source}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="price-source">
        Africa prices are crowd-sourced (Numbeo, CityCost) or reported by farmers, so treat
        them as a guide — they vary by market and by week.
      </p>
    </div>
  );
}
