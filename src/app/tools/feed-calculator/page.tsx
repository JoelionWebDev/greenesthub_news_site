'use client';

import { useState } from 'react';

const ANIMALS: Record<string, { label: string; gramsPerDay: number }> = {
  layers: { label: 'Layers (laying hens)', gramsPerDay: 120 },
  broilers: { label: 'Broilers', gramsPerDay: 150 },
  goats: { label: 'Goats', gramsPerDay: 1000 },
};

export default function FeedCalculatorPage() {
  const [animal, setAnimal] = useState('layers');
  const [count, setCount] = useState('100');
  const [days, setDays] = useState('30');

  const n = parseFloat(count) || 0;
  const d = parseFloat(days) || 0;
  const grams = ANIMALS[animal].gramsPerDay;
  const totalKg = (n * grams * d) / 1000;
  const bags = totalKg / 25;
  const showResult = n > 0 && d > 0;

  return (
    <div className="wrap">
      <header className="page-head">
        <h1>🐔 Feed Calculator</h1>
        <p>
          How much feed your animals need. Enter the number of animals and days — and see the
          total feed and how many 25kg bags to buy.
        </p>
      </header>
      <div className="calc-form">
        <label>
          Animal
          <select value={animal} onChange={(e) => setAnimal(e.target.value)}>
            {Object.entries(ANIMALS).map(([key, a]) => (
              <option key={key} value={key}>
                {a.label} — {a.gramsPerDay}g per day
              </option>
            ))}
          </select>
        </label>
        <label>
          Number of animals
          <input type="number" min="0" step="1" value={count} onChange={(e) => setCount(e.target.value)} />
        </label>
        <label>
          Number of days
          <input type="number" min="0" step="1" value={days} onChange={(e) => setDays(e.target.value)} />
        </label>
      </div>
      {showResult && (
        <div className="calc-result">
          <h2>Feed needed</h2>
          <p className="result-line">
            <span>Feed per day</span>
            <strong>{((n * grams) / 1000).toFixed(1)} kg</strong>
          </p>
          <p className="result-line">
            <span>Total feed ({d} days)</span>
            <strong>{totalKg.toFixed(1)} kg</strong>
          </p>
          <p className="result-line">
            <span>25kg bags to buy</span>
            <strong>{bags.toFixed(1)} bags</strong>
          </p>
          <p className="calc-note">
            Daily amounts are typical averages — young animals eat less, big ones eat more.
            Always give clean water alongside feed.
          </p>
        </div>
      )}
    </div>
  );
}
