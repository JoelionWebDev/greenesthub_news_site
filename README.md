# Greenest Hub — greenesthub.com.ng

A bright, child-friendly animal blog: wild animals, domestic animals, and
animals & humans. Built with Next.js 16, React 19 and TypeScript (App Router).
Posts are Markdown files in `content/posts/` and the site includes its own
tiny CMS at `/admin` — no database.

## Run locally

```bash
npm install
npm run dev        # http://localhost:3000
```

## Build

```bash
npm run build      # production build
npm run lint       # ESLint
```

## How posts work

Posts are Markdown files in `content/posts/` with frontmatter:

```yaml
---
title: "The Lion: King of the Savanna"
slug: the-lion-king-of-the-savanna
category: wild-animals        # wild-animals | domestic-animals | animals-and-humans
excerpt: "One or two sentences shown on cards."
coverImage: /images/hero-lion.jpg
date: 2026-11-14
author: "Greenest Hub"
---
```

The body is Markdown, rendered to HTML server-side
(`gray-matter` + `remark` + `remark-html`). Cover images live in
`public/images/`. Adding a file to `content/posts/` and pushing to `main`
publishes it after the Vercel redeploy.

Categories are defined in `src/lib/categories.ts`.

## Admin CMS (`/admin`)

- **Login:** username `admin` + the password in the `ADMIN_PASSWORD`
  environment variable. The password is checked server-side, never in code.
  On success the server sets an HTTP-only cookie signed with HMAC-SHA256
  using `ADMIN_SESSION_SECRET` (7-day expiry). The signature is verified on
  every admin request.
- **Dev-only fallback:** when `NODE_ENV` is `development` **and**
  `ADMIN_PASSWORD` is unset, the password `admin123` works locally. This
  fallback never applies in production (Vercel sets `NODE_ENV=production`),
  and login fails cleanly on a server where `ADMIN_PASSWORD` is not set.
- **Editor:** title, category dropdown, excerpt, cover image (preset buttons
  from `public/images/` or any path/URL), Markdown body, Publish, Logout.
  Publish commits `content/posts/<slug>.md` to the GitHub repo via the
  GitHub REST API (`GITHUB_TOKEN`, contents:write for this repo). If the slug
  already exists it appends `-2`, `-3`, etc. Vercel redeploys on push, so the
  story goes live about a minute later.
- **Posts list:** the admin page also lists every published story with its
  date, so you can see what is live.

## Environment variables (Vercel → Project → Settings → Environment Variables)

| Variable              | What it is                                                                 |
| --------------------- | -------------------------------------------------------------------------- |
| `ADMIN_PASSWORD`      | The admin password. You choose it — keep it secret, never commit it.       |
| `ADMIN_SESSION_SECRET`| A long random string used to sign the admin session cookie (e.g. 32+ chars).|
| `GITHUB_TOKEN`        | A fine-grained GitHub token with `contents:write` on `JoelionWebDev/greenesthub_news_site` only. |

No other secrets are needed. See `DEPLOY.md` for the full deployment steps.

## Project structure

```
src/
  app/
    page.tsx                 Home: hero, category cards, latest posts
    layout.tsx               Metadata, Open Graph, header + footer
    globals.css              Jungle theme (green/cream/sun-yellow)
    sitemap.ts / robots.ts   SEO
    category/[slug]/page.tsx Category listing pages
    posts/[slug]/page.tsx    Post pages + related posts
    admin/
      layout.tsx             instant = false (session cookie read blocks)
      page.tsx               Login form or editor (server-side session check)
      actions.ts             login / logout / publish server actions
  components/
    SiteHeader, SiteFooter, PostCard, LoginForm, AdminEditor
  lib/
    categories.ts            The 3 categories
    posts.ts                 Markdown loading + HTML rendering + slugify
    session.ts               HMAC-signed session cookie
    github.ts                GitHub Contents API commit helper
content/posts/               Seed posts (2 per category)
public/images/               Hero + category + post images
```
