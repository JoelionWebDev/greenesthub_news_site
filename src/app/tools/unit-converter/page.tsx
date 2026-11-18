'use client';

import { useState } from 'react';

type UnitGroup = {
  label: string;
  base: string;
  units: { label: string; factor: number }[];
};

const GROUPS: UnitGroup[] = [
  {
    label: 'Land',
    base: 'hectare',
    units: [
      { label: 'Hectare', factor: 1 },
      { label: 'Acre', factor: 0.404686 },
      { label: 'Plot (1/6 acre)', factor: 0.0674477 },
      { label: 'Square metre', factor: 0.0001 },
    ],
  },
  {
    label: 'Weight',
    base: 'kg',
    units: [
      { label: 'Kilogram (kg)', factor: 1 },
      { label: '50kg bag', factor: 50 },
      { label: '100kg bag', factor: 100 },
      { label: 'Tonne', factor: 1000 },
      { label: 'Pound (lb)', factor: 0.453592 },
    ],
  },
  {
    label: 'Volume',
    base: 'litre',
    units: [
      { label: 'Litre', factor: 1 },
      { label: 'Gallon', factor: 3.78541 },
      { label: 'Millilitre (ml)', factor: 0.001 },
      { label: '20L jerrycan', factor: 20 },
    ],
  },
];

export default function UnitConverterPage() {
  const [groupIdx, setGroupIdx] = useState(0);
  const [from, setFrom] = useState(GROUPS[0].units[0].label);
  const [to, setTo] = useState(GROUPS[0].units[1].label);
  const [value, setValue] = useState('1');

  const group = GROUPS[groupIdx];
  const fromUnit = group.units.find((u) => u.label === from) ?? group.units[0];
  const toUnit = group.units.find((u) => u.label === to) ?? group.units[1];
  const input = parseFloat(value) || 0;
  const result = (input * fromUnit.factor) / toUnit.factor;

  return (
    <div className="wrap">
      <header className="page-head">
        <h1>📏 Unit Converter</h1>
        <p>
          Hectares, acres, plots, bags and kilos — the conversions farmers actually argue
          about, in one place.
        </p>
      </header>
      <div className="calc-form">
        <label>
          What are you converting?
          <select
            value={groupIdx}
            onChange={(e) => {
              const next = Number(e.target.value);
              setGroupIdx(next);
              setFrom(GROUPS[next].units[0].label);
              setTo(GROUPS[next].units[1].label);
            }}
          >
            {GROUPS.map((g, i) => (
              <option key={g.label} value={i}>
                {g.label}
              </option>
            ))}
          </select>
        </label>
        <label>
          Amount
          <input type="number" min="0" step="any" value={value} onChange={(e) => setValue(e.target.value)} />
        </label>
        <label>
          From
          <select value={from} onChange={(e) => setFrom(e.target.value)}>
            {group.units.map((u) => (
              <option key={u.label} value={u.label}>
                {u.label}
              </option>
            ))}
          </select>
        </label>
        <label>
          To
          <select value={to} onChange={(e) => setTo(e.target.value)}>
            {group.units.map((u) => (
              <option key={u.label} value={u.label}>
                {u.label}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="calc-result">
        <h2>Result</h2>
        <p className="result-line">
          <span>
            {input} {fromUnit.label}
          </span>
          <strong>
            = {result.toLocaleString('en-NG', { maximumFractionDigits: 3 })} {toUnit.label}
          </strong>
        </p>
        <p className="calc-note">
          1 hectare = 2.47 acres = about 15 plots. 1 acre = 6 plots.
        </p>
      </div>
    </div>
  );
}
