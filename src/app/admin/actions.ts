'use server';

import { redirect } from "next/navigation";
import { CATEGORIES } from "@/lib/categories";
import { slugify } from "@/lib/posts";
import { commitPostToGitHub } from "@/lib/github";
import {
  getAdminPassword,
  isLoggedIn,
  setSessionCookie,
  clearSessionCookie,
} from "@/lib/session";

export type ActionState = {
  ok: boolean;
  error?: string;
  url?: string;
  slug?: string;
};

/** Log in: username must be "admin", password checked against ADMIN_PASSWORD. */
export async function loginAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const username = String(formData.get("username") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const expected = getAdminPassword();

  if (!expected) {
    return {
      ok: false,
      error:
        "The admin password is not set on the server yet. Set ADMIN_PASSWORD in Vercel → Project → Settings → Environment Variables.",
    };
  }
  if (username !== "admin" || password !== expected) {
    return { ok: false, error: "Wrong username or password. Please try again." };
  }
  const cookieSet = await setSessionCookie();
  if (!cookieSet) {
    return {
      ok: false,
      error:
        "The server is missing ADMIN_SESSION_SECRET, so a login session cannot be created. Set it in Vercel → Project → Settings → Environment Variables.",
    };
  }
  redirect("/admin");
}

/** Log out: clear the session cookie. */
export async function logoutAction(): Promise<void> {
  await clearSessionCookie();
  redirect("/admin");
}

function escapeYaml(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

/**
 * Publish a story: re-checks the session (never trusts the client),
 * builds the Markdown file, and commits it to the GitHub repo.
 * Vercel redeploys on push, so the story goes live about a minute later.
 */
export async function publishAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  if (!(await isLoggedIn())) {
    return { ok: false, error: "You are not logged in. Please log in again." };
  }

  const title = String(formData.get("title") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim();
  const excerpt = String(formData.get("excerpt") ?? "").trim();
  const coverImage = String(formData.get("coverImage") ?? "").trim() || "/images/hero-lion.jpg";
  const body = String(formData.get("body") ?? "").trim();

  if (!title || !body) {
    return { ok: false, error: "Title and story body are required." };
  }
  if (!CATEGORIES.some((c) => c.slug === category)) {
    return { ok: false, error: "Please choose a valid category." };
  }

  const date = new Date().toISOString().slice(0, 10);
  const baseSlug = slugify(title);
  const markdown = [
    "---",
    `title: "${escapeYaml(title)}"`,
    `slug: ${baseSlug}`,
    `category: ${category}`,
    `excerpt: "${escapeYaml(excerpt)}"`,
    `coverImage: ${coverImage}`,
    `date: ${date}`,
    'author: "Greenest Hub"',
    "---",
    "",
    body,
    "",
  ].join("\n");

  const result = await commitPostToGitHub(baseSlug, markdown, title);
  if (!result.ok) {
    return { ok: false, error: result.error };
  }
  return { ok: true, slug: result.slug, url: result.url };
}
