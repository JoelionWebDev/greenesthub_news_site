import Link from 'next/link';
import type { Metadata } from 'next';
import { connection } from 'next/server';
import { getCurrentUser } from '@/lib/supabase/server';
import { SITE_URL } from '@/lib/site';
import NewTopicForm from './NewTopicForm';

export const metadata: Metadata = {
  title: 'Start a new topic',
  description:
    'Post your farming problem in the Greennest Hub Farmers Forum and get opinions from other farmers.',
  alternates: { canonical: `${SITE_URL}/forum/new` },
  robots: { index: false, follow: false },
};

export default async function NewTopicPage() {
  // Auth state is per request.
  await connection();
  const user = await getCurrentUser();

  if (!user) {
    return (
      <div className="wrap">
        <header className="page-head">
          <h1>✍️ Start a new topic</h1>
          <p>
            Describe your farming problem clearly — what is happening, when it
            started, and what you have tried so far. The more detail you give,
            the better the answers from other farmers will be.
          </p>
        </header>
        <div className="forum-signin-prompt" role="note">
          <h3>Please sign in first</h3>
          <p>
            You need an account to start a topic — your name and location come
            from your profile, so other farmers know who is asking.
          </p>
          <p>
            <Link href="/auth/login" className="btn btn-primary">
              Sign in →
            </Link>{' '}
            <Link href="/auth/signup" className="btn btn-secondary">
              Create an account →
            </Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="wrap">
      <header className="page-head">
        <h1>✍️ Start a new topic</h1>
        <p>
          Describe your farming problem clearly — what is happening, when it
          started, and what you have tried so far. The more detail you give,
          the better the answers from other farmers will be.
        </p>
      </header>
      <NewTopicForm />
    </div>
  );
}
