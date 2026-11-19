import type { Metadata } from "next";
import Link from "next/link";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Farmer Tools — Free Calculators & Checkers",
  description:
    "Free farmer tools from Greennest Hub — fertilizer calculator, planting calendar, profit calculator, feed calculator, market prices, weather and unit converter. No account needed.",
  alternates: { canonical: `${SITE_URL}/tools` },
};

const TOOLS = [
  {
    href: '/tools/fertilizer-calculator',
    emoji: '🧪',
    name: 'Fertilizer Calculator',
    tagline: 'How many bags of fertilizer your land needs.',
  },
  {
    href: '/tools/planting-calendar',
    emoji: '📅',
    name: 'Planting Calendar',
    tagline: 'When to plant each crop, North and South.',
  },
  {
    href: '/tools/profit-calculator',
    emoji: '💵',
    name: 'Profit Calculator',
    tagline: 'Will your harvest make money? Find out first.',
  },
  {
    href: '/tools/feed-calculator',
    emoji: '🐔',
    name: 'Feed Calculator',
    tagline: 'How much feed your birds and goats need.',
  },
  {
    href: '/tools/market-prices',
    emoji: '📈',
    name: 'Market Prices',
    tagline: "Today's prices for rice, maize, garri and more.",
  },
  {
    href: '/tools/weather',
    emoji: '🌦️',
    name: 'Farm Weather',
    tagline: 'Rain, sun and wind for your area, 5 days ahead.',
  },
  {
    href: '/tools/unit-converter',
    emoji: '📏',
    name: 'Unit Converter',
    tagline: 'Hectares, acres, plots, bags and kilos — converted.',
  },
];

export default function ToolsPage() {
  return (
    <div className="wrap">
      <header className="page-head">
        <h1>🧰 Free farmer tools</h1>
        <p>
          Built for daily farm work — calculate fertilizer, check when to plant, work out your
          profit, check market prices and weather. Free to use, no account needed, and they work
          on a phone.
        </p>
      </header>
      <div className="tools-grid tools-page-grid">
        {TOOLS.map((t) => (
          <article key={t.href} className="tool-card">
            <Link href={t.href}>
              <span className="tool-card-emoji" aria-hidden="true">
                {t.emoji}
              </span>
              <h3>{t.name}</h3>
              <p>{t.tagline}</p>
              <span className="category-card-link">Open tool →</span>
            </Link>
          </article>
        ))}
      </div>
      <p className="tools-note">
        These tools give general guidance. For advice about your own farm, always confirm with
        your local agricultural extension officer or vet.
      </p>
    </div>
  );
}
