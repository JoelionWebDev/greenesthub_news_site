/**
 * Forum categories — kept in their own tiny module with NO node imports
 * so client components (e.g. the "new topic" form) can import it without
 * dragging node:fs into the browser bundle.
 */

export const FORUM_CATEGORIES = [
  'Crop Problems',
  'Livestock',
  'Pests & Diseases',
  'Market & Prices',
  'Farm Business',
  'General',
] as const;

export type ForumCategory = (typeof FORUM_CATEGORIES)[number];

export function isForumCategory(value: string): value is ForumCategory {
  return (FORUM_CATEGORIES as readonly string[]).includes(value);
}
