import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';
import { FORUM_CATEGORIES, isForumCategory, type ForumCategory } from './forum-categories';

export { FORUM_CATEGORIES, isForumCategory, type ForumCategory };

/**
 * Greennest Hub Forum — farmers post a farming problem or topic, and
 * anyone can comment with their opinion. Topics and comments live as
 * Markdown files in content/forum/ (topics) and content/forum/comments/
 * (comments), the same file-based pattern as blog posts and community
 * questions. New topics/comments are committed through the GitHub API
 * (see commitTopicToGitHub / commitCommentToGitHub in ./github) and
 * start as "pending" — they only appear after review. Vercel redeploys
 * automatically when a commit lands on main.
 */

export type ForumTopic = {
  slug: string;
  title: string;
  category: ForumCategory;
  author: string;
  location: string;
  date: string;
  status: 'pending' | 'published';
  body: string;
  contentHtml: string;
  fileSlug: string;
};

export type ForumComment = {
  id: string;
  topic: string;
  author: string;
  location: string;
  date: string;
  status: 'pending' | 'published';
  body: string;
  contentHtml: string;
};

const FORUM_DIR = path.join(process.cwd(), 'content', 'forum');
const COMMENTS_DIR = path.join(FORUM_DIR, 'comments');

async function markdownToHtml(body: string): Promise<string> {
  const processed = await remark().use(html).process(body);
  return processed.toString();
}

function readTopicFile(fileName: string): Omit<ForumTopic, 'contentHtml'> | null {
  const fullPath = path.join(FORUM_DIR, fileName);
  const raw = fs.readFileSync(fullPath, 'utf8');
  const { data, content } = matter(raw);
  const fileSlug = fileName.replace(/\.mdx?$/, '');
  const slug = typeof data.slug === 'string' && data.slug ? data.slug : fileSlug;
  if (typeof data.title !== 'string' || !data.title) return null;
  const category =
    typeof data.category === 'string' && isForumCategory(data.category)
      ? data.category
      : 'General';
  return {
    slug,
    title: data.title,
    category,
    author: typeof data.author === 'string' ? data.author : 'A farmer',
    location: typeof data.location === 'string' ? data.location : 'Nigeria',
    date: typeof data.date === 'string' ? data.date : '2026-11-21',
    status: data.status === 'published' ? 'published' : 'pending',
    body: content.trim(),
    fileSlug,
  };
}

/** All topic metadata, newest first. */
export function getAllTopics(): Omit<ForumTopic, 'contentHtml'>[] {
  if (!fs.existsSync(FORUM_DIR)) return [];
  const files = fs
    .readdirSync(FORUM_DIR)
    .filter((f) => (f.endsWith('.md') || f.endsWith('.mdx')) && !f.startsWith('.'));
  return files
    .map(readTopicFile)
    .filter((t): t is Omit<ForumTopic, 'contentHtml'> => t !== null)
    .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : a.slug.localeCompare(b.slug)));
}

/** Only topics that have been reviewed and published. */
export function getPublishedTopics(): Omit<ForumTopic, 'contentHtml'>[] {
  return getAllTopics().filter((t) => t.status === 'published');
}

/** Full topic with rendered HTML body, or null when the slug does not exist. */
export async function getTopic(slug: string): Promise<ForumTopic | null> {
  const meta = getAllTopics().find((t) => t.slug === slug);
  if (!meta) return null;
  const contentHtml = await markdownToHtml(meta.body);
  return { ...meta, contentHtml };
}

function readCommentFile(fileName: string): Omit<ForumComment, 'contentHtml'> | null {
  const fullPath = path.join(COMMENTS_DIR, fileName);
  const raw = fs.readFileSync(fullPath, 'utf8');
  const { data, content } = matter(raw);
  if (typeof data.topic !== 'string' || !data.topic) return null;
  return {
    id: fileName.replace(/\.mdx?$/, ''),
    topic: data.topic,
    author: typeof data.author === 'string' ? data.author : 'A farmer',
    location: typeof data.location === 'string' ? data.location : 'Nigeria',
    date: typeof data.date === 'string' ? data.date : '2026-11-21',
    status: data.status === 'published' ? 'published' : 'pending',
    body: content.trim(),
  };
}

/** Published comments for one topic, oldest first (a conversation). */
export async function getTopicComments(topicSlug: string): Promise<ForumComment[]> {
  if (!fs.existsSync(COMMENTS_DIR)) return [];
  const files = fs
    .readdirSync(COMMENTS_DIR)
    .filter((f) => f.endsWith('.md') || f.endsWith('.mdx'));
  const comments = files
    .map(readCommentFile)
    .filter(
      (c): c is Omit<ForumComment, 'contentHtml'> =>
        c !== null && c.topic === topicSlug && c.status === 'published',
    )
    .sort((a, b) => (a.date > b.date ? 1 : a.date < b.date ? -1 : a.id.localeCompare(b.id)));
  return Promise.all(
    comments.map(async (c) => ({ ...c, contentHtml: await markdownToHtml(c.body) })),
  );
}

/** Published comment counts per topic slug (for the topic list). */
export function getCommentCounts(): Record<string, number> {
  if (!fs.existsSync(COMMENTS_DIR)) return {};
  const files = fs
    .readdirSync(COMMENTS_DIR)
    .filter((f) => f.endsWith('.md') || f.endsWith('.mdx'));
  const counts: Record<string, number> = {};
  for (const f of files) {
    const c = readCommentFile(f);
    if (c && c.status === 'published') {
      counts[c.topic] = (counts[c.topic] ?? 0) + 1;
    }
  }
  return counts;
}
