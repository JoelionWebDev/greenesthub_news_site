import { Suspense } from "react";
import { isLoggedIn } from "@/lib/session";
import { getAllPosts } from "@/lib/posts";
import LoginForm from "@/components/LoginForm";
import AdminEditor from "@/components/AdminEditor";

export const metadata = {
  title: "Admin | Greennest Hub",
  robots: { index: false, follow: false },
};

/**
 * The session read (cookies()) must sit behind a <Suspense> boundary.
 * With Cache Components, anything outside the boundary prerenders into the
 * static shell; only the section behind the boundary waits for the request
 * and reads the session cookie per visitor. Reading cookies() at the top
 * level of the page would bake the logged-out view into the static shell
 * and a logged-in admin would keep seeing the login form.
 * (Next.js guide: "Authentication with Cache Components", Step 2.)
 */
async function AdminContent() {
  const loggedIn = await isLoggedIn();
  if (!loggedIn) {
    return (
      <>
        <h1>🔐 Admin Login</h1>
        <p className="lede">
          This area is for the Greennest Hub owner only. Log in to write and publish new stories.
        </p>
        <LoginForm />
      </>
    );
  }
  const posts = getAllPosts();
  return (
    <>
      <h1>✍️ Write a New Story</h1>
      <p className="lede">
        Fill in the story below and press Publish. It is saved to the Greennest Hub
        repository and goes live on the site after the next deploy (about a minute).
      </p>
      <AdminEditor posts={posts} />
    </>
  );
}

export default function AdminPage() {
  return (
    <div className="wrap admin-page">
      <Suspense fallback={<p>Loading…</p>}>
        <AdminContent />
      </Suspense>
    </div>
  );
}
