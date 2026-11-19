import type { Metadata } from "next";
import WeatherStrip from '@/components/WeatherStrip';
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: 'Farm Weather — 5-Day Forecast for Nigerian Cities',
  description:
    'Farm weather forecast for Lagos, Ibadan, Abuja, Kano, Enugu, Port Harcourt, Onitsha and Jos — temperature, rain chances and wind for the next 5 days.',
  alternates: { canonical: `${SITE_URL}/tools/weather` },
};

export default function WeatherPage() {
  return (
    <div className="wrap">
      <header className="page-head">
        <h1>🌦️ Farm weather</h1>
        <p>
          Rain, sun and wind for the next 5 days. Plan spraying, planting and harvesting
          around the rain — never spray just before a heavy rain.
        </p>
      </header>
      <WeatherStrip />
      <p className="price-source">
        Weather by Open-Meteo. Forecasts are a guide — local weather can change quickly.
      </p>
    </div>
  );
}
