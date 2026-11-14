# Deploying Greenest Hub to Vercel

## 1. Push the repo to GitHub

The repo is `JoelionWebDev/greenesthub_news_site` (branch `main`).
Push via the GitHub web UI upload (terminal `git push` over SSH does not
work from Muse's machine — the network blocks SSH). The Vercel dashboard
import flow also works once the code is on GitHub.

## 2. Import into Vercel

1. Go to https://vercel.com/new and import
   `JoelionWebDev/greenesthub_news_site`.
2. Framework is detected automatically (Next.js). Leave the build command
   (`next build`) and output settings as they are.
3. Before deploying, add the environment variables below
   (Project → Settings → Environment Variables, all environments).

## 3. Environment variables

| Variable               | Value                                                                 |
| ---------------------- | --------------------------------------------------------------------- |
| `ADMIN_PASSWORD`       | Choose a strong password for `/admin`. Only you know it. Never put it in code or in a commit. |
| `ADMIN_SESSION_SECRET` | A long random string (32+ characters) used to sign the admin session cookie. You can generate one with: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
| `GITHUB_TOKEN`         | A fine-grained GitHub personal access token for the **admin publish** feature. Create it at GitHub → Settings → Developer settings → Personal access tokens → Fine-grained tokens: resource owner `JoelionWebDev`, repository access **only** `greenesthub_news_site`, permission **Contents: Read and write**. Paste only the token value into Vercel — never into code. |

## 4. Connect the domain

In Vercel → Project → Settings → Domains, add `greenesthub.com.ng`
(and `www.greenesthub.com.ng` if wanted) and follow the DNS instructions
at your domain registrar. The site's metadata already points at
`https://greenesthub.com.ng`.

## 5. Check it works

- Open https://greenesthub.com.ng — the home page with the lion hero.
- Open https://greenesthub.com.ng/admin — the login page. Log in with
  username `admin` and the `ADMIN_PASSWORD` you set.
- Publish a test story from the editor. It commits
  `content/posts/<slug>.md` to GitHub; Vercel redeploys automatically and
  the story appears on the site in about a minute.

## Notes

- **Admin password:** set it yourself in Vercel. Muse never needs to see it.
- **Local development:** copy `.env.local.example` to `.env.local` and fill
  in throwaway test values. `.env.local` is gitignored and must never be
  committed. If `ADMIN_PASSWORD` is left unset locally, the dev-only
  password `admin123` works (development only — it never works in
  production).
- **GitHub token:** the admin publish feature needs it. Without it, the
  editor shows a plain error ("publishing is not configured") and nothing is
  lost — the story text stays in the form.
- The site is fully static except for `/admin`, which reads the session
  cookie on every request.
