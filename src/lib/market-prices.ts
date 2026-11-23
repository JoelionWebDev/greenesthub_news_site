/**
 * Market prices for key farm produce, by region — Nigeria in detail,
 * Africa in general.
 *
 * RULES (read before editing):
 * - Every price comes from a published survey or report. Never invent one.
 * - PRICES VERIFIED 23 November 2026: every row below was checked line
 *   by line against its cited source. Any price that cannot be re-confirmed
 *   against a published source must be REMOVED, not carried forward.
 * - WFP rows are averages across the Borno markets in that month's WFP
 *   market-monitoring release (HDX), converted from the release's
 *   per-mudu prices to per-kg using the release's own mudu weights.
 * - A region only appears when a fresh survey covers it. If a survey is
 *   older than ~6 weeks, it stays only if nothing newer exists — and its
 *   date must show.
 * - This file is updated every Monday by the market-prices cron, which
 *   checks the latest food-price news (Nairametrics Food Price Watch,
 *   BusinessDay market surveys, NBS Selected Food Prices Watch, WFP, Lagos
 *   State Ministry of Agriculture tracker; Numbeo/CityCost for Africa).
 * - When updating, change MARKET_PRICES_UPDATED to the new date.
 */

export const MARKET_PRICES_UPDATED = '23 November 2026';

export type RegionPrice = {
  /** e.g. "Lagos (South-West)" */
  region: string;
  /** e.g. "Mile 12, Daleko, Mushin, Oyingbo" */
  market: string;
  price: string;
  unit: string;
  /** e.g. "Oct 2026" — the survey date, not today. */
  date: string;
  source: string;
};

export type CommodityPrices = {
  commodity: string;
  emoji: string;
  regions: RegionPrice[];
};

/** Nigeria — prices by region. Same food, different price in each region. */
export const COMMODITY_PRICES: CommodityPrices[] = [
  {
    commodity: 'Rice',
    emoji: '🍚',
    regions: [
      {
        region: 'Lagos (South-West)',
        market: 'Mile 12, Daleko, Mushin, Oyingbo, Ile-Epo',
        price: '₦54,000 – ₦65,000',
        unit: 'per 50kg bag (Royal Stallion short-grain)',
        date: 'Nov 2026',
        source: 'Nairametrics market survey',
      },
      {
        region: 'Lagos (South-West)',
        market: 'Mile 12, Daleko, Mushin, Oyingbo, Ile-Epo',
        price: '₦84,000 – ₦95,000',
        unit: 'per 50kg bag (Mama’s Pride long-grain)',
        date: 'Nov 2026',
        source: 'Nairametrics market survey',
      },
      {
        region: 'Lagos (South-West)',
        market: 'Lagos markets',
        price: '₦51,000 – ₦53,000',
        unit: 'per 50kg bag (imported)',
        date: 'Oct 2026',
        source: 'Lagos State Ministry of Agriculture tracker',
      },
      {
        region: 'Enugu (South-East)',
        market: 'Ogbete',
        price: '₦85,000 – ₦90,000',
        unit: 'per 50kg bag',
        date: 'Oct 2026',
        source: 'BusinessDay market survey',
      },
      {
        region: 'Port Harcourt (South-South)',
        market: 'Mile 3',
        price: '₦85,000 – ₦90,000',
        unit: 'per 50kg bag',
        date: 'Oct 2026',
        source: 'BusinessDay market survey',
      },
      {
        region: 'Abuja (North-Central)',
        market: 'Abuja markets',
        price: '₦85,000 – ₦90,000',
        unit: 'per 50kg bag',
        date: 'Oct 2026',
        source: 'BusinessDay market survey',
      },
      {
        region: 'Kano (North-West)',
        market: 'Kano markets',
        price: '₦85,000 – ₦90,000',
        unit: 'per 50kg bag',
        date: 'Oct 2026',
        source: 'BusinessDay market survey',
      },
      {
        region: 'Katsina (North-West)',
        market: 'Katsina central market',
        price: '₦110,000 – ₦120,000',
        unit: 'per 100kg bag (locally milled)',
        date: 'Nov 2026',
        source: 'Daily Trust market survey',
      },
      {
        region: 'Benue (North-Central)',
        market: 'Makurdi markets (Wadata, Aliade, Gbajimgba, Otukpo)',
        price: '₦58,000',
        unit: 'per 50kg bag (local)',
        date: 'Nov 2026',
        source: 'Daily Trust market survey',
      },
      {
        region: 'Borno (North-East)',
        market: 'Borno markets',
        price: '₦1,616',
        unit: 'per kg (imported)',
        date: '15 Nov 2026',
        source: 'WFP market monitoring (HDX)',
      },
    ],
  },
  {
    commodity: 'Maize',
    emoji: '🌽',
    regions: [
      {
        region: 'Lagos (South-West)',
        market: 'Mile 12, Daleko, Mushin, Oyingbo, Ile-Epo',
        price: '₦50,000 – ₦60,000',
        unit: 'per 50kg bag',
        date: 'Nov 2026',
        source: 'Nairametrics market survey',
      },
      {
        region: 'Kano (North-West)',
        market: 'Dawanau',
        price: '₦44,500',
        unit: 'per 100kg bag',
        date: 'Nov 2026',
        source: 'Daily Trust market survey',
      },
      {
        region: 'Katsina (North-West)',
        market: 'Katsina central market',
        price: '₦50,000 – ₦52,000',
        unit: 'per 100kg bag',
        date: 'Nov 2026',
        source: 'Daily Trust market survey',
      },
      {
        region: 'Benue (North-Central)',
        market: 'Makurdi markets',
        price: '₦60,000',
        unit: 'per 50kg sack',
        date: 'Nov 2026',
        source: 'Daily Trust market survey',
      },
      {
        region: 'Borno (North-East)',
        market: 'Borno markets',
        price: '₦909',
        unit: 'per kg (maize flour)',
        date: '15 Nov 2026',
        source: 'WFP market monitoring (HDX)',
      },
    ],
  },
  {
    commodity: 'Garri',
    emoji: '🥣',
    regions: [
      {
        region: 'Lagos (South-West)',
        market: 'Mile 12, Daleko, Mushin, Oyingbo, Ile-Epo',
        price: '₦24,000 – ₦30,000',
        unit: 'per 50kg bag (white)',
        date: 'Nov 2026',
        source: 'Nairametrics market survey',
      },
      {
        region: 'Lagos (South-West)',
        market: 'Mile 12, Daleko, Mushin, Oyingbo, Ile-Epo',
        price: '₦21,000 – ₦26,000',
        unit: 'per 50kg bag (yellow)',
        date: 'Nov 2026',
        source: 'Nairametrics market survey',
      },
      {
        region: 'Abia (South-East)',
        market: 'Abia markets',
        price: '₦1,076',
        unit: 'per kg (white)',
        date: 'May 2026',
        source: 'NBS Selected Food Prices Watch',
      },
      {
        region: 'Plateau (North-Central)',
        market: 'Plateau markets',
        price: '₦521',
        unit: 'per kg (white)',
        date: 'May 2026',
        source: 'NBS Selected Food Prices Watch',
      },
    ],
  },
  {
    commodity: 'Beans',
    emoji: '🫘',
    regions: [
      {
        region: 'Lagos (South-West)',
        market: 'Mile 12, Daleko, Mushin, Oyingbo, Ile-Epo',
        price: '₦75,000 – ₦80,000',
        unit: 'per 50kg bag (brown)',
        date: 'Nov 2026',
        source: 'Nairametrics market survey',
      },
      {
        region: 'Lagos (South-West)',
        market: 'Mile 12, Daleko, Mushin, Oyingbo, Ile-Epo',
        price: '₦85,000 – ₦95,000',
        unit: 'per 50kg bag (oloyin)',
        date: 'Nov 2026',
        source: 'Nairametrics market survey',
      },
      {
        region: 'Oyo (South-West)',
        market: 'Oyo markets',
        price: '₦1,942',
        unit: 'per kg (brown)',
        date: 'May 2026',
        source: 'NBS Selected Food Prices Watch',
      },
      {
        region: 'Taraba (North-East)',
        market: 'Taraba markets',
        price: '₦760',
        unit: 'per kg (brown)',
        date: 'May 2026',
        source: 'NBS Selected Food Prices Watch',
      },
      {
        region: 'Kano (North-West)',
        market: 'Dawanau',
        price: '₦72,000 – ₦95,000',
        unit: 'per 100kg bag',
        date: 'Nov 2026',
        source: 'Daily Trust market survey',
      },
      {
        region: 'Katsina (North-West)',
        market: 'Katsina central market',
        price: '₦110,000',
        unit: 'per 100kg bag',
        date: 'Nov 2026',
        source: 'Daily Trust market survey',
      },
      {
        region: 'Borno (North-East)',
        market: 'Borno markets',
        price: '₦1,224',
        unit: 'per kg (red)',
        date: '15 Nov 2026',
        source: 'WFP market monitoring (HDX)',
      },
    ],
  },
  {
    commodity: 'Yam',
    emoji: '🍠',
    regions: [
      {
        region: 'Lagos (South-West)',
        market: 'Mile 12, Daleko, Mushin, Oyingbo',
        price: '₦2,500 – ₦4,000',
        unit: 'per tuber (medium)',
        date: 'Oct 2026',
        source: 'BusinessDay market survey',
      },
      {
        region: 'Borno (North-East)',
        market: 'Borno markets',
        price: '₦1,102',
        unit: 'per kg',
        date: '15 Nov 2026',
        source: 'WFP market monitoring (HDX)',
      },
    ],
  },
  {
    commodity: 'Tomatoes',
    emoji: '🍅',
    regions: [
      {
        region: 'Lagos (South-West)',
        market: 'Mile 12, Daleko, Mushin, Oyingbo, Ile-Epo',
        price: '₦40,000 – ₦70,000',
        unit: 'per big basket (round)',
        date: 'Nov 2026',
        source: 'Nairametrics market survey',
      },
      {
        region: 'Lagos (South-West)',
        market: 'Mile 12, Daleko, Mushin, Oyingbo, Ile-Epo',
        price: '₦35,000 – ₦42,000',
        unit: 'per big basket (oval)',
        date: 'Nov 2026',
        source: 'Nairametrics market survey',
      },
      {
        region: 'Lagos (South-West)',
        market: 'Lagos markets',
        price: '₦1,975',
        unit: 'per kg',
        date: 'May 2026',
        source: 'NBS Selected Food Prices Watch',
      },
      {
        region: 'Ekiti (South-West)',
        market: 'Ekiti markets',
        price: '₦1,017',
        unit: 'per kg',
        date: 'May 2026',
        source: 'NBS Selected Food Prices Watch',
      },
      {
        region: 'Borno (North-East)',
        market: 'Borno markets',
        price: '₦543',
        unit: 'per kg',
        date: '15 Nov 2026',
        source: 'WFP market monitoring (HDX)',
      },
    ],
  },
  {
    commodity: 'Millet',
    emoji: '🌾',
    regions: [
      {
        region: 'Kano (North-West)',
        market: 'Dawanau',
        price: '₦42,500',
        unit: 'per 100kg bag',
        date: 'Nov 2026',
        source: 'Daily Trust market survey',
      },
      {
        region: 'Benue (North-Central)',
        market: 'Makurdi markets',
        price: '₦65,000',
        unit: 'per 100kg bag',
        date: 'Nov 2026',
        source: 'Daily Trust market survey',
      },
    ],
  },
  {
    commodity: 'Sorghum',
    emoji: '🌱',
    regions: [
      {
        region: 'Kano (North-West)',
        market: 'Dawanau',
        price: '₦41,000',
        unit: 'per 100kg bag',
        date: 'Nov 2026',
        source: 'Daily Trust market survey',
      },
      {
        region: 'Katsina (North-West)',
        market: 'Katsina central market',
        price: '₦35,000',
        unit: 'per 100kg bag',
        date: 'Nov 2026',
        source: 'Daily Trust market survey',
      },
    ],
  },
];

/** National averages (NBS Selected Food Prices Watch, May 2026, per kg). */
export const NATIONAL_AVERAGES: { commodity: string; price: string }[] = [
  { commodity: 'Local rice (short-grain)', price: '₦1,905 per kg' },
  { commodity: 'Local rice (long-grain)', price: '₦2,246 per kg' },
  { commodity: 'White maize', price: '₦816 per kg' },
  { commodity: 'Garri (white)', price: '₦813 per kg' },
  { commodity: 'Garri (yellow)', price: '₦865 per kg' },
  { commodity: 'Beans (brown)', price: '₦1,345 per kg' },
  { commodity: 'Beans (white)', price: '₦1,297 per kg' },
  { commodity: 'Yam tuber', price: '₦2,347 per kg' },
];

/** Africa in general — crowd-sourced prices, treat as a guide. */
export type AfricaPrice = {
  country: string;
  city: string;
  commodity: string;
  price: string;
  unit: string;
  date: string;
  source: string;
};

export const AFRICA_PRICES: AfricaPrice[] = [
  {
    country: 'Kenya',
    city: 'Nairobi',
    commodity: 'White rice',
    price: 'KSh 259',
    unit: 'per kg',
    date: 'Nov 2026',
    source: 'Numbeo',
  },
  {
    country: 'Ghana',
    city: 'Accra',
    commodity: 'White rice',
    price: '₵37',
    unit: 'per kg',
    date: 'Nov 2026',
    source: 'Numbeo',
  },
  {
    country: 'Ghana',
    city: 'Kumasi',
    commodity: 'White rice',
    price: '₵20',
    unit: 'per kg',
    date: 'Nov 2026',
    source: 'CityCost',
  },
  {
    country: 'Kenya',
    city: 'National average',
    commodity: 'Maize (white)',
    price: 'KSh 4,719',
    unit: 'per 90kg sack',
    date: 'Nov 2026',
    source: 'WRSC weekly market analysis',
  },
  {
    country: 'Kenya',
    city: 'National average',
    commodity: 'Beans (Rosecoco)',
    price: 'KSh 13,928',
    unit: 'per 90kg sack',
    date: 'Nov 2026',
    source: 'WRSC weekly market analysis',
  },
  {
    country: 'Kenya',
    city: 'Nairobi',
    commodity: 'Tomatoes',
    price: 'KSh 146',
    unit: 'per kg',
    date: 'Nov 2026',
    source: 'Numbeo',
  },
  {
    country: 'Ghana',
    city: 'Accra',
    commodity: 'Tomatoes',
    price: '₵43',
    unit: 'per kg',
    date: 'Nov 2026',
    source: 'CityCost',
  },
  {
    country: 'Ghana',
    city: 'Kumasi',
    commodity: 'Tomatoes',
    price: '₵25',
    unit: 'per kg',
    date: 'Nov 2026',
    source: 'CityCost',
  },
];
