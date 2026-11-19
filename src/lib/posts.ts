import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';

export type PostFrontmatter = {
  title: string;
  slug: string;
  category: string;
  excerpt: string;
  coverImage: string;
  date: string;
  author: string;
};

export type PostMeta = PostFrontmatter & {
  /** File name without extension. */
  fileSlug: string;
};

export type Post = PostMeta & {
  content: string;
  contentHtml: string;
};

const POSTS_DIR = path.join(process.cwd(), 'content', 'posts');

function readPostFile(fileName: string): PostMeta | null {
  const fullPath = path.join(POSTS_DIR, fileName);
  const raw = fs.readFileSync(fullPath, 'utf8');
  const { data } = matter(raw);
  const fileSlug = fileName.replace(/\.mdx?$/, '');
  const slug = typeof data.slug === 'string' && data.slug ? data.slug : fileSlug;
  if (typeof data.title !== 'string' || !data.title) return null;
  if (typeof data.category !== 'string' || !data.category) return null;
  return {
    title: data.title,
    slug,
    category: data.category,
    excerpt: typeof data.excerpt === 'string' ? data.excerpt : '',
    coverImage: typeof data.coverImage === 'string' ? data.coverImage : '/images/hero-lion.jpg',
    date: typeof data.date === 'string' ? data.date : '2026-11-14',
    author: typeof data.author === 'string' ? data.author : 'Greennest Hub',
    fileSlug,
  };
}

/** All post metadata, newest first. */
export function getAllPosts(): PostMeta[] {
  if (!fs.existsSync(POSTS_DIR)) return [];
  const files = fs.readdirSync(POSTS_DIR).filter((f) => f.endsWith('.md') || f.endsWith('.mdx'));
  const posts = files
    .map(readPostFile)
    .filter((p): p is PostMeta => p !== null)
    .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : a.slug.localeCompare(b.slug)));
  return posts;
}

export function getPostsByCategory(categorySlug: string): PostMeta[] {
  return getAllPosts().filter((p) => p.category === categorySlug);
}

export function getPostSlugs(): string[] {
  return getAllPosts().map((p) => p.slug);
}

/** Full post with rendered HTML body, or null when the slug does not exist. */
export async function getPost(slug: string): Promise<Post | null> {
  const meta = getAllPosts().find((p) => p.slug === slug);
  if (!meta) return null;
  const fullPath = path.join(POSTS_DIR, `${meta.fileSlug}.md`);
  const altPath = path.join(POSTS_DIR, `${meta.fileSlug}.mdx`);
  const filePath = fs.existsSync(fullPath) ? fullPath : altPath;
  const raw = fs.readFileSync(filePath, 'utf8');
  const { content } = matter(raw);
  // Post pages already render the title as the page <h1>. A leading "# "
  // heading in the body would be a second H1, so drop it here — this also
  // guards posts written through /admin, which may repeat the title.
  const body = content.replace(/^\s*# [^\n]*\n?/, '');
  const processed = await remark().use(html).process(body);
  return { ...meta, content, contentHtml: processed.toString() };
}

/** Up to `limit` other posts from the same category, newest first. */
export function getRelatedPosts(post: PostMeta, limit = 3): PostMeta[] {
  return getAllPosts()
    .filter((p) => p.category === post.category && p.slug !== post.slug)
    .slice(0, limit);
}

/** Turn a title into a URL-safe slug. */
export function slugify(title: string): string {
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return slug || 'post';
}
