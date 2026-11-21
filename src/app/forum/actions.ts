'use server';

import { slugify } from '@/lib/posts';
import { isForumCategory } from '@/lib/forum';
import { commitCommentToGitHub, commitTopicToGitHub } from '@/lib/github';

export type ActionState = {
  ok: boolean;
  error?: string;
};

function escapeYaml(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

/**
 * A farmer starts a new forum topic: save it as a Markdown file in
 * content/forum/ via the GitHub API. It starts as "pending" — it only
 * appears on the Forum page after review. No login needed; the topic is
 * public once published, so the form warns against sharing phone numbers.
 */
export async function postTopicAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const title = String(formData.get('title') ?? '').trim();
  const name = String(formData.get('name') ?? '').trim();
  const location = String(formData.get('location') ?? '').trim();
  const category = String(formData.get('category') ?? '').trim();
  const body = String(formData.get('body') ?? '').trim();

  if (!title || title.length < 5) {
    return { ok: false, error: 'Please give your topic a short title (at least 5 characters).' };
  }
  if (!name || name.length < 2) {
    return { ok: false, error: 'Please tell us your name.' };
  }
  if (!location || location.length < 2) {
    return { ok: false, error: 'Please tell us where you farm (state or town).' };
  }
  if (!isForumCategory(category)) {
    return { ok: false, error: 'Please choose a category.' };
  }
  if (!body || body.length < 20) {
    return { ok: false, error: 'Please describe your problem or topic in at least 20 characters.' };
  }

  const date = new Date().toISOString().slice(0, 10);
  const baseSlug = slugify(title);
  const markdown = [
    '---',
    `title: "${escapeYaml(title)}"`,
    `slug: ${baseSlug}`,
    `category: "${escapeYaml(category)}"`,
    `author: "${escapeYaml(name)}"`,
    `location: "${escapeYaml(location)}"`,
    `date: ${date}`,
    'status: pending',
    '---',
    '',
    body,
    '',
  ].join('\n');

  const result = await commitTopicToGitHub(baseSlug, markdown, title);
  if (!result.ok) {
    return { ok: false, error: result.error };
  }
  return { ok: true };
}

/**
 * Anyone comments on a topic: save it as a Markdown file in
 * content/forum/comments/ via the GitHub API. It starts as "pending" —
 * it only appears under the topic after review.
 */
export async function postCommentAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const topicSlug = String(formData.get('topicSlug') ?? '').trim();
  const name = String(formData.get('name') ?? '').trim();
  const location = String(formData.get('location') ?? '').trim();
  const comment = String(formData.get('comment') ?? '').trim();

  if (!topicSlug) {
    return { ok: false, error: 'This comment has no topic to attach to. Please reload the page and try again.' };
  }
  if (!name || name.length < 2) {
    return { ok: false, error: 'Please tell us your name.' };
  }
  if (!location || location.length < 2) {
    return { ok: false, error: 'Please tell us where you are (state or town).' };
  }
  if (!comment || comment.length < 5) {
    return { ok: false, error: 'Please write your opinion or advice (at least 5 characters).' };
  }
  if (comment.length > 2000) {
    return { ok: false, error: 'Please keep your comment under 2,000 characters.' };
  }

  const date = new Date().toISOString().slice(0, 10);
  const markdown = [
    '---',
    `topic: ${topicSlug}`,
    `author: "${escapeYaml(name)}"`,
    `location: "${escapeYaml(location)}"`,
    `date: ${date}`,
    'status: pending',
    '---',
    '',
    comment,
    '',
  ].join('\n');

  const result = await commitCommentToGitHub(topicSlug, markdown);
  if (!result.ok) {
    return { ok: false, error: result.error };
  }
  return { ok: true };
}
