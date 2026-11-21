'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { slugify } from '@/lib/posts';
import { isForumCategory } from '@/lib/forum';
import { supabaseAuthServer } from '@/lib/supabase/server';

export type ActionState = {
  ok: boolean;
  error?: string;
};

/**
 * The signed-in user + their display name/location (from their profile,
 * falling back to the signup metadata). Posting is for signed-in users
 * only — guests see a sign-in prompt instead of the form.
 */
async function requireUser() {
  const sb = await supabaseAuthServer();
  if (!sb) {
    return { sb: null, user: null, name: '', location: '', error: 'Login is not switched on yet — Supabase is not connected.' };
  }
  const { data } = await sb.auth.getUser();
  if (!data.user) {
    return { sb, user: null, name: '', location: '', error: 'Please sign in to post.' };
  }
  const { data: profile } = await sb
    .from('profiles')
    .select('display_name, location')
    .eq('id', data.user.id)
    .maybeSingle();
  const meta = (data.user.user_metadata ?? {}) as Record<string, string>;
  return {
    sb,
    user: data.user,
    name: profile?.display_name || meta.display_name || data.user.email?.split('@')[0] || 'A farmer',
    location: profile?.location || meta.location || 'Nigeria',
    error: '',
  };
}

/** Find a free slug for a new topic title (appends -2, -3, …). */
async function freeSlug(
  sb: NonNullable<Awaited<ReturnType<typeof supabaseAuthServer>>>,
  baseSlug: string,
): Promise<string> {
  for (let attempt = 0; attempt < 10; attempt++) {
    const slug = attempt === 0 ? baseSlug : `${baseSlug}-${attempt + 1}`;
    const { data } = await sb.from('forum_topics').select('id').eq('slug', slug).maybeSingle();
    if (!data) return slug;
  }
  return `${baseSlug}-${Date.now().toString(36)}`;
}

/**
 * A signed-in farmer starts a new forum topic. It is saved straight
 * into Supabase and appears on the Forum page immediately — no review
 * queue, no GitHub commit. The admin can delete any topic.
 */
export async function postTopicAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const title = String(formData.get('title') ?? '').trim();
  const category = String(formData.get('category') ?? '').trim();
  const body = String(formData.get('body') ?? '').trim();

  if (!title || title.length < 5) {
    return { ok: false, error: 'Please give your topic a short title (at least 5 characters).' };
  }
  if (!isForumCategory(category)) {
    return { ok: false, error: 'Please choose a category.' };
  }
  if (!body || body.length < 20) {
    return { ok: false, error: 'Please describe your problem or topic in at least 20 characters.' };
  }
  if (body.length > 5000) {
    return { ok: false, error: 'Please keep your topic under 5,000 characters.' };
  }

  const { sb, user, name, location, error } = await requireUser();
  if (!sb || !user) return { ok: false, error: error || 'Please sign in to post.' };

  const slug = await freeSlug(sb, slugify(title));
  const { error: insertError } = await sb.from('forum_topics').insert({
    slug,
    title,
    category,
    body,
    author_id: user.id,
    author_name: name,
    author_location: location,
  });
  if (insertError) return { ok: false, error: insertError.message };

  revalidatePath('/forum');
  redirect(`/forum/${slug}`);
}

/**
 * A signed-in farmer replies to a topic. Saved straight into Supabase
 * and shown under the topic immediately.
 */
export async function postCommentAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const topicSlug = String(formData.get('topicSlug') ?? '').trim();
  const comment = String(formData.get('comment') ?? '').trim();

  if (!topicSlug) {
    return { ok: false, error: 'This comment has no topic to attach to. Please reload the page and try again.' };
  }
  if (!comment || comment.length < 5) {
    return { ok: false, error: 'Please write your opinion or advice (at least 5 characters).' };
  }
  if (comment.length > 2000) {
    return { ok: false, error: 'Please keep your comment under 2,000 characters.' };
  }

  const { sb, user, name, location, error } = await requireUser();
  if (!sb || !user) return { ok: false, error: error || 'Please sign in to reply.' };

  const { data: topic } = await sb
    .from('forum_topics')
    .select('id')
    .eq('slug', topicSlug)
    .maybeSingle();
  if (!topic) {
    return { ok: false, error: 'That topic no longer exists.' };
  }

  const { error: insertError } = await sb.from('forum_replies').insert({
    topic_id: (topic as { id: string }).id,
    body: comment,
    author_id: user.id,
    author_name: name,
    author_location: location,
  });
  if (insertError) return { ok: false, error: insertError.message };

  revalidatePath(`/forum/${topicSlug}`);
  return { ok: true };
}

/** The admin (or the topic's author) deletes a topic and its replies. */
export async function deleteTopicAction(topicSlug: string): Promise<ActionState> {
  const { sb, user, error } = await requireUser();
  if (!sb || !user) return { ok: false, error: error || 'Please sign in.' };
  const { error: deleteError } = await sb
    .from('forum_topics')
    .delete()
    .eq('slug', topicSlug);
  if (deleteError) return { ok: false, error: deleteError.message };
  revalidatePath('/forum');
  redirect('/forum');
}

/** The admin (or the reply's author) deletes one reply. */
export async function deleteReplyAction(
  replyId: string,
  topicSlug: string,
): Promise<ActionState> {
  const { sb, user, error } = await requireUser();
  if (!sb || !user) return { ok: false, error: error || 'Please sign in.' };
  const { error: deleteError } = await sb
    .from('forum_replies')
    .delete()
    .eq('id', replyId);
  if (deleteError) return { ok: false, error: deleteError.message };
  revalidatePath(`/forum/${topicSlug}`);
  return { ok: true };
}
