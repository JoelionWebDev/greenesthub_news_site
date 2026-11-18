import type { MetadataRoute } from "next";
import { CATEGORIES } from "@/lib/categories";
import { getAllPosts } from "@/lib/posts";

const SITE_URL = "https://greennesthub.com.ng";

export default function sitemap(): MetadataRoute.Sitemap {
  const posts = getAllPosts();
  const staticPages = [
    '/about',
    '/contact',
    '/privacy',
    '/tools',
    '/tools/fertilizer-calculator',
    '/tools/planting-calendar',
    '/tools/profit-calculator',
    '/tools/feed-calculator',
    '/tools/unit-converter',
    '/tools/market-prices',
    '/tools/weather',
    '/community',
    '/community/ask',
  ];
  return [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    ...staticPages.map((page) => ({
      url: `${SITE_URL}${page}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...CATEGORIES.map((c) => ({
      url: `${SITE_URL}/category/${c.slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...posts.map((p) => ({
      url: `${SITE_URL}/posts/${p.slug}`,
      lastModified: new Date(`${p.date}T00:00:00Z`),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];
}
