'use client';

import { useActionState, useRef, useState } from 'react';
import Link from 'next/link';
import { publishAction, logoutAction, type ActionState } from '@/app/admin/actions';
import { CATEGORIES } from '@/lib/categories';
import type { PostMeta } from '@/lib/posts';

const initialState: ActionState = { ok: false };

const COVER_PRESETS = [
  { label: '🦁 Lion', value: '/images/hero-lion.jpg' },
  { label: '🐘 Elephant', value: '/images/category-wild.jpg' },
  { label: '🐶 Dog', value: '/images/category-domestic.jpg' },
  { label: '🐴 Horse & child', value: '/images/category-humans.jpg' },
  { label: '🐱 Cat', value: '/images/cat.jpg' },
  { label: '🐝 Bees', value: '/images/bees.jpg' },
];

export default function AdminEditor({ posts }: { posts: PostMeta[] }) {
  const [state, formAction, isPending] = useActionState(publishAction, initialState);
  const [coverImage, setCoverImage] = useState('/images/hero-lion.jpg');
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <div className="admin-editor-wrap">
      <form ref={formRef} action={formAction} className="admin-form admin-publish-form">
        <label>
          Title
          <input name="title" type="text" placeholder="e.g. The Lion: King of the Savanna" required />
        </label>
        <label>
          Category
          <select name="category" defaultValue={CATEGORIES[0].slug}>
            {CATEGORIES.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Short summary (excerpt)
          <input
            name="excerpt"
            type="text"
            placeholder="One or two sentences that appear on the home page"
            maxLength={200}
          />
        </label>
        <fieldset className="cover-fieldset">
          <legend>Cover image</legend>
          <div className="cover-presets">
            {COVER_PRESETS.map((p) => (
              <button
                key={p.value}
                type="button"
                className={coverImage === p.value ? 'cover-preset active' : 'cover-preset'}
                onClick={() => setCoverImage(p.value)}
              >
                {p.label}
              </button>
            ))}
          </div>
          <input
            name="coverImage"
            type="text"
            value={coverImage}
            onChange={(e) => setCoverImage(e.target.value)}
            placeholder="/images/hero-lion.jpg or https://…"
          />
        </fieldset>
        <label>
          Story (Markdown — headings with ##, paragraphs, lists)
          <textarea
            name="body"
            rows={16}
            placeholder="Write the story here in Markdown…"
            required
          />
        </label>
        {state.error ? (
          <p className="form-error" role="alert">
            {state.error}
          </p>
        ) : null}
        {state.ok && state.url ? (
          <p className="form-success" role="status">
            Published! Your story will be live at{' '}
            <a href={state.url} target="_blank" rel="noopener noreferrer">
              {state.url}
            </a>{' '}
            once the site rebuilds (about a minute).
          </p>
        ) : null}
        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={isPending}>
            {isPending ? 'Publishing…' : 'Publish story'}
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => {
              formRef.current?.reset();
              setCoverImage('/images/hero-lion.jpg');
            }}
          >
            Clear form
          </button>
        </div>
      </form>

      <section className="admin-posts">
        <h2>Published stories ({posts.length})</h2>
        {posts.length === 0 ? (
          <p>No stories yet.</p>
        ) : (
          <ul className="admin-posts-list">
            {posts.map((p) => (
              <li key={p.slug}>
                <Link href={`/posts/${p.slug}`} target="_blank" rel="noopener noreferrer">
                  {p.title}
                </Link>
                <span className="admin-posts-date">{p.date}</span>
              </li>
            ))}
          </ul>
        )}
        <form action={logoutAction} className="logout-form">
          <button type="submit" className="btn btn-secondary">
            Log out
          </button>
        </form>
      </section>
    </div>
  );
}
