import type { ProduceListing } from "./types";

/**
 * Demo listings — shown ONLY when Supabase is not connected (see
 * isConfigured in ./supabase). Every price below is consistent with the
 * site's verified market prices in src/lib/market-prices.ts (verified
 * 18 November 2026):
 *   - Rice ₦48,000 / 50kg bag, Lagos — Nairametrics market survey, Oct 2026.
 *   - Maize ₦55,000 / 50kg bag, Lagos — Nairametrics market survey, Oct 2026.
 *   - Garri white ₦21,000 / yellow ₦23,000 per 50kg bag, Lagos — Nairametrics.
 *   - Beans brown ₦110,000 / oloyin ₦70,000 per 50kg bag, Lagos — Nairametrics.
 *   - Yam ₦3,000 per tuber — inside the verified ₦2,500–₦4,000 range
 *     (BusinessDay market survey, Oct 2026).
 *   - Tomatoes ₦50,000 per big basket — inside the verified
 *     ₦35,000–₦70,000 range (Nairametrics market survey, Oct 2026).
 * No price here was invented outside a verified figure or range.
 *
 * Demo "farmers" are SAMPLES, not real sellers: farmer_name is always
 * "Sample farmer", every listing carries is_demo: true, and the cards and
 * detail pages show a DEMO badge. The WhatsApp number is the developer's
 * public contact number already published in the site footer — demo
 * enquiries go to the developer, never to an invented person.
 */

const DEMO_WHATSAPP = "2348167099131";

export const DEMO_LISTINGS: ProduceListing[] = [
  {
    id: "demo-rice-lagos",
    owner_id: null,
    title: "Royal Stallion Rice — 50kg bag",
    description:
      "Clean short-grain rice, well dried and stone-free. Sold per 50kg bag, ready for pickup or delivery within Lagos.",
    category: "grains",
    price_kobo: 4800000,
    unit: "50kg bag",
    quantity_available: 40,
    state: "Lagos",
    city: "Mile 12",
    farmer_name: "Sample farmer",
    whatsapp_number: DEMO_WHATSAPP,
    image_url: "/images/market-grains.jpg",
    created_at: "2026-11-20T00:00:00Z",
    is_demo: true,
  },
  {
    id: "demo-maize-lagos",
    owner_id: null,
    title: "White Maize — 50kg bag",
    description:
      "Dry white maize from the new harvest. Good for pap, tuwo and animal feed. Sold per 50kg bag.",
    category: "grains",
    price_kobo: 5500000,
    unit: "50kg bag",
    quantity_available: 60,
    state: "Lagos",
    city: "Mile 12",
    farmer_name: "Sample farmer",
    whatsapp_number: DEMO_WHATSAPP,
    image_url: "/images/hero-farm.jpg",
    created_at: "2026-11-20T00:00:00Z",
    is_demo: true,
  },
  {
    id: "demo-garri-white-ogun",
    owner_id: null,
    title: "White Garri — 50kg bag",
    description:
      "Fine white garri, well fried and crunchy. Sold per 50kg bag.",
    category: "processed",
    price_kobo: 2100000,
    unit: "50kg bag",
    quantity_available: 30,
    state: "Ogun",
    city: "Abeokuta",
    farmer_name: "Sample farmer",
    whatsapp_number: DEMO_WHATSAPP,
    image_url: "/images/market-garri.jpg",
    created_at: "2026-11-20T00:00:00Z",
    is_demo: true,
  },
  {
    id: "demo-garri-yellow-oyo",
    owner_id: null,
    title: "Yellow Garri — 50kg bag",
    description:
      "Yellow garri fried with palm oil, sour enough for eba. Sold per 50kg bag.",
    category: "processed",
    price_kobo: 2300000,
    unit: "50kg bag",
    quantity_available: 25,
    state: "Oyo",
    city: "Ibadan",
    farmer_name: "Sample farmer",
    whatsapp_number: DEMO_WHATSAPP,
    image_url: "/images/market-garri.jpg",
    created_at: "2026-11-20T00:00:00Z",
    is_demo: true,
  },
  {
    id: "demo-beans-brown-niger",
    owner_id: null,
    title: "Brown Beans — 50kg bag",
    description:
      "Clean brown beans, no stones, cooks soft. Sold per 50kg bag.",
    category: "grains",
    price_kobo: 11000000,
    unit: "50kg bag",
    quantity_available: 20,
    state: "Niger",
    city: "Minna",
    farmer_name: "Sample farmer",
    whatsapp_number: DEMO_WHATSAPP,
    image_url: "/images/market-grains.jpg",
    created_at: "2026-11-20T00:00:00Z",
    is_demo: true,
  },
  {
    id: "demo-beans-oloyin-kwara",
    owner_id: null,
    title: "Oloyin Beans — 50kg bag",
    description:
      "Sweet oloyin beans, the honey beans. Sold per 50kg bag.",
    category: "grains",
    price_kobo: 7000000,
    unit: "50kg bag",
    quantity_available: 15,
    state: "Kwara",
    city: "Ilorin",
    farmer_name: "Sample farmer",
    whatsapp_number: DEMO_WHATSAPP,
    image_url: "/images/market-grains.jpg",
    created_at: "2026-11-20T00:00:00Z",
    is_demo: true,
  },
  {
    id: "demo-yam-benue",
    owner_id: null,
    title: "Yam Tubers — medium",
    description:
      "Fresh yam tubers from Benue, good for pounded yam and porridge. Sold per tuber.",
    category: "tubers",
    price_kobo: 300000,
    unit: "tuber",
    quantity_available: 100,
    state: "Benue",
    city: "Makurdi",
    farmer_name: "Sample farmer",
    whatsapp_number: DEMO_WHATSAPP,
    image_url: "/images/market-yam-tomatoes.jpg",
    created_at: "2026-11-20T00:00:00Z",
    is_demo: true,
  },
  {
    id: "demo-tomatoes-plateau",
    owner_id: null,
    title: "Fresh Tomatoes — big basket",
    description:
      "Firm red tomatoes from Jos, freshly harvested. Sold per big basket.",
    category: "vegetables",
    price_kobo: 5000000,
    unit: "big basket",
    quantity_available: 12,
    state: "Plateau",
    city: "Jos",
    farmer_name: "Sample farmer",
    whatsapp_number: DEMO_WHATSAPP,
    image_url: "/images/market-yam-tomatoes.jpg",
    created_at: "2026-11-20T00:00:00Z",
    is_demo: true,
  },
];
