import 'server-only';

const OWNER = 'JoelionWebDev';
const REPO = 'greenesthub_news_site';
const BRANCH = 'main';
const SITE_URL = 'https://greennesthub.com.ng';

export type PublishResult =
  | { ok: true; slug: string; url: string }
  | { ok: false; error: string };

function githubHeaders(token: string): Record<string, string> {
  return {
    Authorization: `Bearer ${token}`,
    Accept: 'application/vnd.github+json',
    'User-Agent': 'greennesthub-admin',
    'X-GitHub-Api-Version': '2022-11-28',
  };
}

/**
 * Commit a new Markdown post file to the repo via the GitHub REST API
 * (PUT /repos/{owner}/{repo}/contents/{path}).
 *
 * Finds a free slug first: if content/posts/<slug>.md already exists on the
 * branch, tries <slug>-2, <slug>-3, ... up to 10 attempts.
 *
 * The token needs contents:write on this repo (fine-grained token).
 * Vercel redeploys automatically when the commit lands on main.
 */
export async function commitPostToGitHub(
  baseSlug: string,
  markdown: string,
  title: string,
): Promise<PublishResult> {
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    return {
      ok: false,
      error:
        'GITHUB_TOKEN is not set on the server. Add it in Vercel → Project → Settings → Environment Variables, then redeploy.',
    };
  }
  
  const headers = githubHeaders(token);
  let slug = baseSlug;
  
  for (let attempt = 0; attempt < 10; attempt++) {
    const trySlug = attempt === 0 ? baseSlug : `${baseSlug}-${attempt + 1}`;
    const path = `content/posts/${trySlug}.md`;
    const url = `https://api.github.com/repos/${OWNER}/${REPO}/contents/${encodeURIComponent(path)}`;
    
    const check = await fetch(`${url}?ref=${BRANCH}`, { headers });
    if (check.status === 404) {
      // Free slug — create the file.
      const put = await fetch(url, {
        method: 'PUT',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `Add post: ${title}`,
          content: Buffer.from(markdown, 'utf8').toString('base64'),
          branch: BRANCH,
        }),
      });
      if (!put.ok) {
        const detail = await put.text().catch(() => '');
        return {
          ok: false,
          error: `GitHub rejected the publish (HTTP ${put.status}). ${detail.slice(0, 300)}`,
        };
      }
      slug = trySlug;
      return { ok: true, slug, url: `${SITE_URL}/posts/${slug}` };
    }
    if (!check.ok) {
      const detail = await check.text().catch(() => '');
      return {
        ok: false,
        error: `GitHub check failed (HTTP ${check.status}). ${detail.slice(0, 300)}`,
      };
    }
    // File exists — try the next suffix.
  }
  
  return { ok: false, error: 'Could not find a free file name for this post. Try a different title.' };
}

/**
 * Commit a new community question file to the repo via the GitHub REST API
 * (PUT /repos/{owner}/{repo}/contents/{path}).
 *
 * Same pattern as commitPostToGitHub, but the file lands in
 * content/questions/ and starts with status "pending" — it only appears on
 * the Community page after someone reviews it and sets status "open" or
 * "answered". Vercel redeploys automatically when the commit lands on main.
 */
export async function commitQuestionToGitHub(
  baseSlug: string,
  markdown: string,
  title: string,
): Promise<PublishResult> {
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    return {
      ok: false,
      error:
        'GITHUB_TOKEN is not set on the server. Add it in Vercel → Project → Settings → Environment Variables, then redeploy.',
    };
  }

  const headers = githubHeaders(token);
  let slug = baseSlug;

  for (let attempt = 0; attempt < 10; attempt++) {
    const trySlug = attempt === 0 ? baseSlug : `${baseSlug}-${attempt + 1}`;
    const path = `content/questions/${trySlug}.md`;
    const url = `https://api.github.com/repos/${OWNER}/${REPO}/contents/${encodeURIComponent(path)}`;

    const check = await fetch(`${url}?ref=${BRANCH}`, { headers });
    if (check.status === 404) {
      const put = await fetch(url, {
        method: 'PUT',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `Add community question: ${title}`,
          content: Buffer.from(markdown, 'utf8').toString('base64'),
          branch: BRANCH,
        }),
      });
      if (!put.ok) {
        const detail = await put.text().catch(() => '');
        return {
          ok: false,
          error: `GitHub rejected the question (HTTP ${put.status}). ${detail.slice(0, 300)}`,
        };
      }
      slug = trySlug;
      return { ok: true, slug, url: `${SITE_URL}/community` };
    }
    if (!check.ok) {
      const detail = await check.text().catch(() => '');
      return {
        ok: false,
        error: `GitHub check failed (HTTP ${check.status}). ${detail.slice(0, 300)}`,
      };
    }
  }

  return { ok: false, error: 'Could not find a free file name for this question. Try a different title.' };
}
