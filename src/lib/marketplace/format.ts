/** Prices are stored as integer kobo in the DB; format them as naira. */
export function formatNaira(kobo: number): string {
  return `₦${(kobo / 100).toLocaleString("en-NG", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
}

/** Turn a title into a URL slug. */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/** Keep only digits from a phone number (for wa.me links). */
export function digitsOnly(value: string | null | undefined): string {
  return (value ?? "").replace(/\D/g, "");
}

/**
 * Normalise a Nigerian WhatsApp number to international format for wa.me.
 * "0803..." -> "234803..."; "+234..." -> "234..."; "234..." stays.
 */
export function whatsappDigits(value: string | null | undefined): string {
  const digits = digitsOnly(value);
  if (digits.startsWith("234")) return digits;
  if (digits.startsWith("0")) return `234${digits.slice(1)}`;
  return digits;
}
