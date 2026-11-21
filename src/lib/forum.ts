import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';
import { FORUM_CATEGORIES, isForumCategory, type ForumCategory } from './forum-categories';
import { supabaseAnonServer } from './marketplace/supabase';

export { FORUM_CATEGORIES, isForumCategory, type ForumCategory };

/**
 * Greennest Hub Forum — farmers post a farming problem or topic, and
 * signed-in farmers comment with their opinion.
 *
 * DATA: topics and replies live in Supabase (public.forum_topics /
 * public.forum_replies) when Supabase is configured — posting is
 * instant, no review queue. When Supabase is NOT configured the forum
 * falls back to the Markdown seeds in content/forum/ (topics) and
 * content/forum/comments/ (comments) — the same files that were the
 * forum before login existed. Guests can always read; only signed-in
 * users can post or reply (see src/app/forum/actions.ts).
 *
 * The Markdown files are the demo/seed content, not a second live
 * source: once Supabase is connected and supabase/seed-forum.sql has
 * been run, the database holds the same 7 topics + 17 replies and the
 * files are only a fallback for a misconfigured deploy.
 */

export type ForumTopic = {
  id: string;
  slug: string;
  title: string;
  category: ForumCategory;
  author: string;
  authorId: string | null;
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
  authorId: string | null;
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

/**
 * Plain-text bodies (written by users into Supabase) are rendered
 * safely: HTML is escaped first so nobody can inject markup, then
 * paragraphs and line breaks are restored.
 */
function textToHtml(body: string): string {
  const escaped = body
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
  return escaped
    .split(/\n\s*\n/)
    .map((para) => `<p>${para.replace(/\n/g, '<br>')}</p>`)
    .join('\n');
}

// ------------------------------------------------------------------ Markdown
// (demo fallback — the seeds that shipped with the forum)

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
    id: `md:${fileSlug}`,
    slug,
    title: data.title,
    category,
    author: typeof data.author === 'string' ? data.author : 'A farmer',
    authorId: null,
    location: typeof data.location === 'string' ? data.location : 'Nigeria',
    date: typeof data.date === 'string' ? data.date : '2026-11-21',
    status: data.status === 'published' ? 'published' : 'pending',
    body: content.trim(),
    fileSlug,
  };
}

function getAllTopicsFromFiles(): Omit<ForumTopic, 'contentHtml'>[] {
  if (!fs.existsSync(FORUM_DIR)) return [];
  const files = fs
    .readdirSync(FORUM_DIR)
    .filter((f) => (f.endsWith('.md') || f.endsWith('.mdx')) && !f.startsWith('.'));
  return files
    .map(readTopicFile)
    .filter((t): t is Omit<ForumTopic, 'contentHtml'> => t !== null)
    .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : a.slug.localeCompare(b.slug)));
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
    authorId: null,
    location: typeof data.location === 'string' ? data.location : 'Nigeria',
    date: typeof data.date === 'string' ? data.date : '2026-11-21',
    status: data.status === 'published' ? 'published' : 'pending',
    body: content.trim(),
  };
}

function getCommentsFromFiles(topicSlug: string): Omit<ForumComment, 'contentHtml'>[] {
  if (!fs.existsSync(COMMENTS_DIR)) return [];
  const files = fs
    .readdirSync(COMMENTS_DIR)
    .filter((f) => f.endsWith('.md') || f.endsWith('.mdx'));
  return files
    .map(readCommentFile)
    .filter(
      (c): c is Omit<ForumComment, 'contentHtml'> =>
        c !== null && c.topic === topicSlug && c.status === 'published',
    )
    .sort((a, b) => (a.date > b.date ? 1 : a.date < b.date ? -1 : a.id.localeCompare(b.id)));
}

function getCommentCountsFromFiles(): Record<string, number> {
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

// ------------------------------------------------------------------ Supabase
// (live data — used whenever Supabase is configured)

type DbTopicRow = {
  id: string;
  slug: string;
  title: string;
  category: string;
  body: string;
  author_id: string | null;
  author_name: string;
  author_location: string;
  created_at: string;
};

type DbReplyRow = {
  id: string;
  topic_id: string;
  body: string;
  author_id: string | null;
  author_name: string;
  author_location: string;
  created_at: string;
};

function dbTopicToForumTopic(row: DbTopicRow): Omit<ForumTopic, 'contentHtml'> {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    category: isForumCategory(row.category) ? row.category : 'General',
    author: row.author_name || 'A farmer',
    authorId: row.author_id,
    location: row.author_location || 'Nigeria',
    date: String(row.created_at).slice(0, 10),
    status: 'published',
    body: row.body,
    fileSlug: row.slug,
  };
}

async function getPublishedTopicsFromDb(): Promise<Omit<ForumTopic, 'contentHtml'>[] | null> {
  const sb = supabaseAnonServer();
  if (!sb) return null;
  const { data, error } = await sb
    .from('forum_topics')
    .select('id, slug, title, category, body, author_id, author_name, author_location, created_at')
    .order('created_at', { ascending: false });
  if (error) return null;
  return (data as DbTopicRow[]).map(dbTopicToForumTopic);
}

async function getTopicFromDb(slug: string): Promise<Omit<ForumTopic, 'contentHtml'> | null> {
  const sb = supabaseAnonServer();
  if (!sb) return null;
  const { data, error } = await sb
    .from('forum_topics')
    .select('id, slug, title, category, body, author_id, author_name, author_location, created_at')
    .eq('slug', slug)
    .maybeSingle();
  if (error || !data) return null;
  return dbTopicToForumTopic(data as DbTopicRow);
}

async function getTopicCommentsFromDb(
  topicSlug: string,
): Promise<Omit<ForumComment, 'contentHtml'>[] | null> {
  const sb = supabaseAnonServer();
  if (!sb) return null;
  const { data: topic, error: topicError } = await sb
    .from('forum_topics')
    .select('id')
    .eq('slug', topicSlug)
    .maybeSingle();
  if (topicError || !topic) return null;
  const { data, error } = await sb
    .from('forum_replies')
    .select('id, topic_id, body, author_id, author_name, author_location, created_at')
    .eq('topic_id', (topic as { id: string }).id)
    .order('created_at', { ascending: true });
  if (error) return null;
  return (data as DbReplyRow[]).map((r) => ({
    id: r.id,
    topic: topicSlug,
    author: r.author_name || 'A farmer',
    authorId: r.author_id,
    location: r.author_location || 'Nigeria',
    date: String(r.created_at).slice(0, 10),
    status: 'published' as const,
    body: r.body,
  }));
}

async function getCommentCountsFromDb(): Promise<Record<string, number> | null> {
  const sb = supabaseAnonServer();
  if (!sb) return null;
  const { data: topics, error: topicsError } = await sb
    .from('forum_topics')
    .select('id, slug');
  if (topicsError || !topics) return null;
  const idToSlug: Record<string, string> = {};
  for (const t of topics as { id: string; slug: string }[]) idToSlug[t.id] = t.slug;
  const { data: replies, error: repliesError } = await sb
    .from('forum_replies')
    .select('topic_id')
    .limit(5000);
  if (repliesError) return null;
  const counts: Record<string, number> = {};
  for (const r of replies as { topic_id: string }[]) {
    const slug = idToSlug[r.topic_id];
    if (slug) counts[slug] = (counts[slug] ?? 0) + 1;
  }
  return counts;
}

// ------------------------------------------------------------------ Public API
// Each reader tries Supabase first and falls back to the Markdown seeds
// when Supabase is not configured (or the query fails, e.g. the tables
// have not been created yet). The forum is never empty either way.

/** All published topics, newest first. */
export async function getPublishedTopics(): Promise<Omit<ForumTopic, 'contentHtml'>[]> {
  const fromDb = await getPublishedTopicsFromDb().catch(() => null);
  if (fromDb) return fromDb;
  return getAllTopicsFromFiles().filter((t) => t.status === 'published');
}

/** Full topic with rendered HTML body, or null when the slug does not exist. */
export async function getTopic(slug: string): Promise<ForumTopic | null> {
  const fromDb = await getTopicFromDb(slug).catch(() => null);
  if (fromDb) return { ...fromDb, contentHtml: textToHtml(fromDb.body) };
  const meta = getAllTopicsFromFiles().find((t) => t.slug === slug);
  if (!meta) return null;
  const contentHtml = await markdownToHtml(meta.body);
  return { ...meta, contentHtml };
}

/** Published comments for one topic, oldest first (a conversation). */
export async function getTopicComments(topicSlug: string): Promise<ForumComment[]> {
  const fromDb = await getTopicCommentsFromDb(topicSlug).catch(() => null);
  if (fromDb) {
    return fromDb.map((c) => ({ ...c, contentHtml: textToHtml(c.body) }));
  }
  const comments = getCommentsFromFiles(topicSlug);
  return Promise.all(
    comments.map(async (c) => ({ ...c, contentHtml: await markdownToHtml(c.body) })),
  );
}

/** Published comment counts per topic slug (for the topic list). */
export async function getCommentCounts(): Promise<Record<string, number>> {
  const fromDb = await getCommentCountsFromDb().catch(() => null);
  if (fromDb) return fromDb;
  return getCommentCountsFromFiles();
}

/** One user's forum activity (profile page). Zeroes in demo mode. */
export async function getAuthorStats(userId: string): Promise<{ topics: number; replies: number }> {
  const sb = supabaseAnonServer();
  if (!sb) return { topics: 0, replies: 0 };
  const [{ count: topics }, { count: replies }] = await Promise.all([
    sb.from('forum_topics').select('*', { count: 'exact', head: true }).eq('author_id', userId),
    sb.from('forum_replies').select('*', { count: 'exact', head: true }).eq('author_id', userId),
  ]);
  return { topics: topics ?? 0, replies: replies ?? 0 };
}

/** Topics started by one user, newest first (profile page). */
export async function getTopicsByAuthor(userId: string): Promise<Omit<ForumTopic, 'contentHtml'>[]> {
  const sb = supabaseAnonServer();
  if (!sb) return [];
  const { data, error } = await sb
    .from('forum_topics')
    .select('id, slug, title, category, body, author_id, author_name, author_location, created_at')
    .eq('author_id', userId)
    .order('created_at', { ascending: false });
  if (error || !data) return [];
  return (data as DbTopicRow[]).map(dbTopicToForumTopic);
}
