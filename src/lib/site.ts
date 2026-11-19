/**
 * Canonical public URL of the live site.
 *
 * The live site is https://www.greennesthub.com.ng — the bare domain
 * (https://greennesthub.com.ng) 308-redirects to www, so every URL we emit
 * (sitemap, canonicals, Open Graph, admin return links) must use www here.
 * Using the bare domain made search engines see every sitemap URL as a
 * redirect and every og:image as a broken external link (Ahrefs + SEMrush
 * audits, 19 Nov 2026).
 */
export const SITE_URL = "https://www.greennesthub.com.ng";
