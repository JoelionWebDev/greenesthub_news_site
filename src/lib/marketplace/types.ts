/**
 * Types for the Greennest Hub produce marketplace.
 *
 * CORE RULE (same as the Joetech Shops storefront): a listing is visible to
 * buyers ONLY after the farmer creates an account. Enforced three ways:
 *   1. DB: produce_listings.owner_id is NOT NULL (supabase/schema.sql).
 *   2. RLS: the public SELECT policy only returns rows with owner_id set.
 *   3. App: every public query filters owner_id IS NOT NULL.
 * No account -> no listing -> nothing sold. There is no manual approval step.
 */

export type ProduceCategory =
  | "grains"
  | "tubers"
  | "vegetables"
  | "fruits"
  | "livestock"
  | "poultry"
  | "processed";

export const PRODUCE_CATEGORIES: { slug: ProduceCategory; name: string; emoji: string }[] = [
  { slug: "grains", name: "Grains", emoji: "🌾" },
  { slug: "tubers", name: "Tubers", emoji: "🍠" },
  { slug: "vegetables", name: "Vegetables", emoji: "🍅" },
  { slug: "fruits", name: "Fruits", emoji: "🍊" },
  { slug: "livestock", name: "Livestock", emoji: "🐄" },
  { slug: "poultry", name: "Poultry", emoji: "🐔" },
  { slug: "processed", name: "Processed Foods", emoji: "🥣" },
];

export function produceCategoryName(slug: string): string {
  return PRODUCE_CATEGORIES.find((c) => c.slug === slug)?.name ?? slug;
}

export function isProduceCategory(value: string): value is ProduceCategory {
  return PRODUCE_CATEGORIES.some((c) => c.slug === value);
}

export type ProduceListing = {
  id: string;
  owner_id: string | null;
  title: string;
  description: string | null;
  category: ProduceCategory;
  /** Price in kobo for ONE unit (see `unit`). */
  price_kobo: number;
  /** e.g. "50kg bag", "tuber", "big basket", "kg", "crate". */
  unit: string;
  /** How many units the farmer has available. */
  quantity_available: number;
  state: string;
  city: string;
  farmer_name: string;
  whatsapp_number: string | null;
  image_url: string | null;
  created_at: string;
  /** Demo listings are samples, not real sellers — always labelled DEMO. */
  is_demo?: boolean;
};

export type ProduceOrderItem = {
  listing_id: string;
  name: string;
  qty: number;
  price_kobo: number;
};

export type ProduceOrder = {
  id: string;
  listing_id: string;
  buyer_name: string;
  buyer_phone: string;
  buyer_email: string | null;
  buyer_state: string;
  items: ProduceOrderItem[];
  total_kobo: number;
  status: "pending" | "paid" | "cancelled";
  paystack_reference: string | null;
  created_at: string;
};
