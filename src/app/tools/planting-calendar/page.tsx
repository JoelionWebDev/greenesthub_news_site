'use client';

import { useEffect, useState } from 'react';
import { MONTH_NAMES, PLANTING_DATA, type Region } from '@/lib/planting-data';

const SHORT_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function formatMonths(months: number[]): string {
  if (months.length === 0) return '—';
  const ranges: string[] = [];
  let start = months[0];
  let prev = months[0];
  for (let i = 1; i <= months.length; i++) {
    if (months[i] === prev + 1) {
      prev = months[i];
    } else {
      ranges.push(start === prev ? SHORT_MONTHS[start - 1] : `${SHORT_MONTHS[start - 1]}–${SHORT_MONTHS[prev - 1]}`);
      start = months[i];
      prev = months[i];
    }
  }
  return ranges.join(', ');
}

export default function PlantingCalendarPage() {
  // Default to January on first render; the real current month is set on
  // the client so the page can be statically prerendered.
  const [month, setMonth] = useState(1);
  const [region, setRegion] = useState<Region>('South');

  useEffect(() => {
    setMonth(new Date().getMonth() + 1);
  }, []);

  const inSeason = PLANTING_DATA.filter((c) =>
    region === 'South' ? c.monthsSouth.includes(month) : c.monthsNorth.includes(month),
  );

  return (
    <div className="wrap">
      <header className="page-head">
        <h1>📅 Planting Calendar</h1>
        <p>
          When to plant each crop in Nigeria — South and North. Pick a month and a region to
          see what to plant now. These are typical windows; the rains vary, so confirm with
          your local extension officer.
        </p>
      </header>

      <div className="calc-form">
        <label>
          Month
          <select value={month} onChange={(e) => setMonth(Number(e.target.value))}>
            {MONTH_NAMES.map((m, i) => (
              <option key={m} value={i + 1}>
                {m}
              </option>
            ))}
          </select>
        </label>
        <label>
          Region
          <select value={region} onChange={(e) => setRegion(e.target.value as Region)}>
            <option value="South">South</option>
            <option value="North">North</option>
          </select>
        </label>
      </div>

      <div className="calc-result">
        <h2>
          Plant in {MONTH_NAMES[month - 1]} ({region})
        </h2>
        {inSeason.length === 0 ? (
          <p className="calc-note">
            No main crop is planted in {MONTH_NAMES[month - 1]} in the {region}. Use this time
            to prepare the land, buy inputs, or harvest what is ready.
          </p>
        ) : (
          <ul className="plant-list">
            {inSeason.map((c) => (
              <li key={c.crop}>
                <strong>
                  {c.emoji} {c.crop}
                </strong>
                <span>Harvest: {c.harvest}</span>
                <span>{c.tip}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <h2 className="table-title">Full calendar</h2>
      <div className="table-scroll">
        <table className="price-table">
          <thead>
            <tr>
              <th>Crop</th>
              <th>South — plant</th>
              <th>North — plant</th>
              <th>Harvest</th>
            </tr>
          </thead>
          <tbody>
            {PLANTING_DATA.map((c) => (
              <tr key={c.crop}>
                <td>
                  {c.emoji} {c.crop}
                </td>
                <td>{formatMonths(c.monthsSouth)}</td>
                <td>{formatMonths(c.monthsNorth)}</td>
                <td>{c.harvest}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
