'use client';

import { useState } from 'react';

function naira(n: number): string {
  return `₦${Math.round(n).toLocaleString('en-NG')}`;
}

export default function ProfitCalculatorPage() {
  const [crop, setCrop] = useState('Maize');
  const [hectares, setHectares] = useState('1');
  const [yieldPerHa, setYieldPerHa] = useState('40');
  const [pricePerBag, setPricePerBag] = useState('55000');
  const [seed, setSeed] = useState('30000');
  const [fertilizer, setFertilizer] = useState('150000');
  const [labour, setLabour] = useState('80000');
  const [transport, setTransport] = useState('40000');
  const [other, setOther] = useState('20000');

  const ha = parseFloat(hectares) || 0;
  const yph = parseFloat(yieldPerHa) || 0;
  const price = parseFloat(pricePerBag) || 0;
  const totalCost =
    (parseFloat(seed) || 0) +
    (parseFloat(fertilizer) || 0) +
    (parseFloat(labour) || 0) +
    (parseFloat(transport) || 0) +
    (parseFloat(other) || 0);
  const totalYield = ha * yph;
  const revenue = totalYield * price;
  const profit = revenue - totalCost;
  const showResult = ha > 0 && yph > 0 && price > 0;

  return (
    <div className="wrap">
      <header className="page-head">
        <h1>💵 Profit Calculator</h1>
        <p>
          Will your harvest make money? Enter your expected yield, selling price and costs —
          and see your profit before you plant.
        </p>
      </header>
      <div className="calc-form">
        <label>
          Crop
          <input type="text" value={crop} onChange={(e) => setCrop(e.target.value)} />
        </label>
        <label>
          Land size (hectares)
          <input type="number" min="0" step="0.1" value={hectares} onChange={(e) => setHectares(e.target.value)} />
        </label>
        <label>
          Expected yield (50kg bags per hectare)
          <input type="number" min="0" step="1" value={yieldPerHa} onChange={(e) => setYieldPerHa(e.target.value)} />
        </label>
        <label>
          Selling price per 50kg bag (₦)
          <input type="number" min="0" step="500" value={pricePerBag} onChange={(e) => setPricePerBag(e.target.value)} />
        </label>
        <label>
          Seed cost (₦)
          <input type="number" min="0" step="1000" value={seed} onChange={(e) => setSeed(e.target.value)} />
        </label>
        <label>
          Fertilizer cost (₦)
          <input type="number" min="0" step="1000" value={fertilizer} onChange={(e) => setFertilizer(e.target.value)} />
        </label>
        <label>
          Labour cost (₦)
          <input type="number" min="0" step="1000" value={labour} onChange={(e) => setLabour(e.target.value)} />
        </label>
        <label>
          Transport cost (₦)
          <input type="number" min="0" step="1000" value={transport} onChange={(e) => setTransport(e.target.value)} />
        </label>
        <label>
          Other costs (₦)
          <input type="number" min="0" step="1000" value={other} onChange={(e) => setOther(e.target.value)} />
        </label>
      </div>
      {showResult && (
        <div className="calc-result">
          <h2>Your {crop} profit</h2>
          <p className="result-line">
            <span>Total harvest</span>
            <strong>{totalYield.toLocaleString('en-NG')} bags</strong>
          </p>
          <p className="result-line">
            <span>Revenue</span>
            <strong>{naira(revenue)}</strong>
          </p>
          <p className="result-line">
            <span>Total cost</span>
            <strong>{naira(totalCost)}</strong>
          </p>
          <p className={`result-line ${profit >= 0 ? 'result-good' : 'result-bad'}`}>
            <span>Profit</span>
            <strong>{naira(profit)}</strong>
          </p>
          <p className="result-line">
            <span>Profit per hectare</span>
            <strong>{naira(profit / ha)}</strong>
          </p>
          <p className="calc-note">
            {profit >= 0
              ? 'At these prices, the farm makes money. Remember: prices change — check the market before harvest.'
              : 'At these prices, the farm loses money. Consider cutting costs, or a crop with a better price.'}
          </p>
        </div>
      )}
    </div>
  );
}
