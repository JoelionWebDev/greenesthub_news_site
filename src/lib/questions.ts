import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';

export type QuestionStatus = 'pending' | 'open' | 'answered';

export type Question = {
  slug: string;
  title: string;
  name: string;
  location: string;
  topic: string;
  date: string;
  status: QuestionStatus;
  answeredBy: string;
  answer: string;
  body: string;
  fileSlug: string;
};

const QUESTIONS_DIR = path.join(process.cwd(), 'content', 'questions');

function readQuestionFile(fileName: string): Question | null {
  const fullPath = path.join(QUESTIONS_DIR, fileName);
  const raw = fs.readFileSync(fullPath, 'utf8');
  const { data, content } = matter(raw);
  const fileSlug = fileName.replace(/\.mdx?$/, '');
  const slug = typeof data.slug === 'string' && data.slug ? data.slug : fileSlug;
  if (typeof data.title !== 'string' || !data.title) return null;
  const status = data.status === 'open' || data.status === 'answered' ? data.status : 'pending';
  return {
    slug,
    title: data.title,
    name: typeof data.name === 'string' ? data.name : 'A farmer',
    location: typeof data.location === 'string' ? data.location : 'Nigeria',
    topic: typeof data.topic === 'string' ? data.topic : 'Other',
    date: typeof data.date === 'string' ? data.date : '2026-11-18',
    status,
    answeredBy: typeof data.answeredBy === 'string' ? data.answeredBy : '',
    answer: typeof data.answer === 'string' ? data.answer : '',
    body: content.trim(),
    fileSlug,
  };
}

/** All questions, newest first. */
export function getAllQuestions(): Question[] {
  if (!fs.existsSync(QUESTIONS_DIR)) return [];
  const files = fs.readdirSync(QUESTIONS_DIR).filter((f) => f.endsWith('.md') || f.endsWith('.mdx'));
  return files
    .map(readQuestionFile)
    .filter((q): q is Question => q !== null)
    .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : a.slug.localeCompare(b.slug)));
}

/** Only questions that have been reviewed and published (open or answered). */
export function getPublishedQuestions(): Question[] {
  return getAllQuestions().filter((q) => q.status === 'open' || q.status === 'answered');
}
