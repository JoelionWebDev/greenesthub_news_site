'use client';

import { useState } from 'react';

const PRESETS: Record<string, { npk: number; urea: number }> = {
  maize: { npk: 4, urea: 2 },
  rice: { npk: 4, urea: 2 },
  cassava: { npk: 2, urea: 0 },
  custom: { npk: 0, urea: 0 },
};

export default function FertilizerCalculatorPage() {
  const [crop, setCrop] = useState('maize');
  const [hectares, setHectares] = useState('1');
  const [npkRate, setNpkRate] = useState(String(PRESETS.maize.npk));
  const [ureaRate, setUreaRate] = useState(String(PRESETS.maize.urea));

  const ha = parseFloat(hectares) || 0;
  const npk = parseFloat(npkRate) || 0;
  const urea = parseFloat(ureaRate) || 0;
  const npkBags = ha * npk;
  const ureaBags = ha * urea;
  const showResult = ha > 0 && (npk > 0 || urea > 0);

  return (
    <div className="wrap">
      <header className="page-head">
        <h1>🧪 Fertilizer Calculator</h1>
        <p>
          Enter your crop and land size, and see how many bags of fertilizer you need. Rates
          shown are typical Nigerian recommendations — confirm with your local extension
          officer.
        </p>
      </header>
      <div className="calc-form">
        <label>
          Crop
          <select
            value={crop}
            onChange={(e) => {
              const next = e.target.value;
              setCrop(next);
              setNpkRate(String(PRESETS[next].npk));
              setUreaRate(String(PRESETS[next].urea));
            }}
          >
            <option value="maize">Maize</option>
            <option value="rice">Rice</option>
            <option value="cassava">Cassava</option>
            <option value="custom">Other crop (enter your own rates)</option>
          </select>
        </label>
        <label>
          Land size (hectares)
          <input
            type="number"
            min="0"
            step="0.1"
            value={hectares}
            onChange={(e) => setHectares(e.target.value)}
          />
        </label>
        <label>
          NPK bags per hectare
          <input
            type="number"
            min="0"
            step="0.5"
            value={npkRate}
            onChange={(e) => setNpkRate(e.target.value)}
          />
        </label>
        <label>
          Urea bags per hectare
          <input
            type="number"
            min="0"
            step="0.5"
            value={ureaRate}
            onChange={(e) => setUreaRate(e.target.value)}
          />
        </label>
      </div>
      {showResult && (
        <div className="calc-result">
          <h2>What you need</h2>
          <p className="result-line">
            <span>NPK (50kg bags)</span>
            <strong>{npkBags.toFixed(1)} bags</strong>
          </p>
          <p className="result-line">
            <span>Urea (50kg bags)</span>
            <strong>{ureaBags.toFixed(1)} bags</strong>
          </p>
          <p className="result-line">
            <span>Total</span>
            <strong>{(npkBags + ureaBags).toFixed(1)} bags</strong>
          </p>
          <p className="calc-note">
            For {ha} hectare{ha === 1 ? '' : 's'} of {crop}. Buy a little extra for spillage —
            and apply fertilizer when the soil is moist, not dry.
          </p>
        </div>
      )}
    </div>
  );
}
