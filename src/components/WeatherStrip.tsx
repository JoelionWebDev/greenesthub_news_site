'use client';

import { useEffect, useState } from 'react';

type City = { name: string; lat: number; lon: number };

const CITIES: City[] = [
  { name: 'Lagos', lat: 6.5244, lon: 3.3792 },
  { name: 'Ibadan', lat: 7.3775, lon: 3.947 },
  { name: 'Abuja', lat: 9.0579, lon: 7.4951 },
  { name: 'Kano', lat: 12.0022, lon: 8.592 },
  { name: 'Enugu', lat: 6.4584, lon: 7.5467 },
  { name: 'Port Harcourt', lat: 4.8156, lon: 7.0498 },
  { name: 'Onitsha', lat: 6.1667, lon: 6.7833 },
  { name: 'Jos', lat: 9.9281, lon: 8.8921 },
];

function describe(code: number): string {
  if (code === 0) return 'Clear sky';
  if (code === 1) return 'Mostly clear';
  if (code === 2) return 'Partly cloudy';
  if (code === 3) return 'Cloudy';
  if (code === 45 || code === 48) return 'Foggy';
  if (code >= 51 && code <= 57) return 'Drizzle';
  if (code >= 61 && code <= 67) return 'Rain';
  if (code >= 71 && code <= 77) return 'Snow';
  if (code >= 80 && code <= 82) return 'Rain showers';
  if (code === 85 || code === 86) return 'Snow showers';
  if (code === 95) return 'Thunderstorm';
  if (code === 96 || code === 99) return 'Thunderstorm with hail';
  return '—';
}

function dayName(dateStr: string): string {
  return new Date(`${dateStr}T12:00:00`).toLocaleDateString('en-GB', { weekday: 'short' });
}

type Forecast = {
  current: {
    temperature_2m: number;
    relative_humidity_2m: number;
    weather_code: number;
    wind_speed_10m: number;
  };
  daily: {
    time: string[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    precipitation_probability_max: number[];
    weather_code: number[];
  };
};

/** Live weather from Open-Meteo (free, no key needed). */
export default function WeatherStrip() {
  const [city, setCity] = useState<City>(CITIES[0]);
  const [data, setData] = useState<Forecast | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setData(null);
    setError(false);
    const url =
      `https://api.open-meteo.com/v1/forecast?latitude=${city.lat}&longitude=${city.lon}` +
      `&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m` +
      `&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max,weather_code` +
      `&timezone=Africa%2FLagos&forecast_days=5`;
    fetch(url)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error('bad response'))))
      .then((json: Forecast) => {
        if (!cancelled) setData(json);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      });
    return () => {
      cancelled = true;
    };
  }, [city]);

  return (
    <section className="weather-strip" aria-label="Weather forecast">
      <div className="wrap weather-strip-inner">
        <div className="weather-head">
          <h2>🌦️ Farm weather</h2>
          <label className="weather-city">
            <span>City:</span>{' '}
            <select
              value={city.name}
              onChange={(e) => {
                const next = CITIES.find((c) => c.name === e.target.value);
                if (next) setCity(next);
              }}
            >
              {CITIES.map((c) => (
                <option key={c.name} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
        </div>
        {error && (
          <p className="weather-error">
            Weather could not be loaded right now. Check your connection and try again.
          </p>
        )}
        {!error && !data && <p className="weather-loading">Loading weather…</p>}
        {data && (
          <div className="weather-now">
            <p className="weather-temp">{Math.round(data.current.temperature_2m)}°C</p>
            <div>
              <p className="weather-desc">{describe(data.current.weather_code)}</p>
              <p className="weather-meta">
                Humidity {data.current.relative_humidity_2m}% · Wind{' '}
                {Math.round(data.current.wind_speed_10m)} km/h
              </p>
            </div>
            <ul className="forecast-row">
              {data.daily.time.map((day, i) => (
                <li key={day} className="forecast-day">
                  <span>{i === 0 ? 'Today' : dayName(day)}</span>
                  <strong>
                    {Math.round(data.daily.temperature_2m_max[i])}° /{' '}
                    {Math.round(data.daily.temperature_2m_min[i])}°
                  </strong>
                  <span>{describe(data.daily.weather_code[i])}</span>
                  <span>Rain {data.daily.precipitation_probability_max[i] ?? 0}%</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        <p className="weather-note">Weather by Open-Meteo · Plan spraying and planting around the rain.</p>
      </div>
    </section>
  );
}
