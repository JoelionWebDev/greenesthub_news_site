'use server';

import { slugify } from '@/lib/posts';
import { commitQuestionToGitHub } from '@/lib/github';

export type ActionState = {
  ok: boolean;
  error?: string;
};

const TOPICS = ['Crops', 'Livestock', 'Farm Business & Sales', 'Safe Crops', 'Other'];

function escapeYaml(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

/**
 * A farmer asks a question: save it as a Markdown file in
 * content/questions/ via the GitHub API. It starts as "pending" — it only
 * appears on the Community page after review. No login needed; the question
 * is public once published, so the form warns against sharing phone numbers.
 */
export async function askQuestionAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const title = String(formData.get('title') ?? '').trim();
  const name = String(formData.get('name') ?? '').trim();
  const location = String(formData.get('location') ?? '').trim();
  const topic = String(formData.get('topic') ?? '').trim();
  const question = String(formData.get('question') ?? '').trim();

  if (!title || title.length < 5) {
    return { ok: false, error: 'Please give your question a short title (at least 5 characters).' };
  }
  if (!name || name.length < 2) {
    return { ok: false, error: 'Please tell us your name.' };
  }
  if (!location || location.length < 2) {
    return { ok: false, error: 'Please tell us where you farm (state or town).' };
  }
  if (!TOPICS.includes(topic)) {
    return { ok: false, error: 'Please choose a topic.' };
  }
  if (!question || question.length < 20) {
    return { ok: false, error: 'Please describe your question or experience in at least 20 characters.' };
  }

  const date = new Date().toISOString().slice(0, 10);
  const baseSlug = slugify(title);
  const markdown = [
    '---',
    `title: "${escapeYaml(title)}"`,
    `slug: ${baseSlug}`,
    `name: "${escapeYaml(name)}"`,
    `location: "${escapeYaml(location)}"`,
    `topic: "${escapeYaml(topic)}"`,
    `date: ${date}`,
    'status: pending',
    'answeredBy: ""',
    'answer: ""',
    '---',
    '',
    question,
    '',
  ].join('\n');

  const result = await commitQuestionToGitHub(baseSlug, markdown, title);
  if (!result.ok) {
    return { ok: false, error: result.error };
  }
  return { ok: true };
}
