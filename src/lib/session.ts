import 'server-only';
import { createHmac, timingSafeEqual } from 'node:crypto';
import { cookies } from 'next/headers';

const COOKIE_NAME = 'gh_admin_session';
const SESSION_TTL_SECONDS = 7 * 24 * 60 * 60; // 7 days

/**
 * The admin password.
 *
 * - Production: set the ADMIN_PASSWORD env var in Vercel. Never commit a password.
 * - Development only: when ADMIN_PASSWORD is unset AND NODE_ENV is "development",
 *   the fallback password is "admin123" so the login can be tested locally.
 *   This fallback NEVER applies in production.
 * - Returns null when no password is configured (login always fails).
 */
export function getAdminPassword(): string | null {
  const configured = process.env.ADMIN_PASSWORD;
  if (configured) return configured;
  if (process.env.NODE_ENV === 'development') return 'admin123';
  return null;
}

function getSessionSecret(): string | null {
  return process.env.ADMIN_SESSION_SECRET ?? null;
}

function sign(expiry: number, secret: string): string {
  return createHmac('sha256', secret).update(`admin:${expiry}`).digest('hex');
}

export async function createSessionToken(): Promise<string | null> {
  const secret = getSessionSecret();
  if (!secret) return null;
  const expiry = Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS;
  return `${expiry}.${sign(expiry, secret)}`;
}

export async function isLoggedIn(): Promise<boolean> {
  const secret = getSessionSecret();
  if (!secret) return false;
  const cookieStore = await cookies();
  const value = cookieStore.get(COOKIE_NAME)?.value;
  if (!value) return false;
  const [expiryStr, sig] = value.split('.');
  const expiry = Number(expiryStr);
  if (!expiryStr || !sig || Number.isNaN(expiry)) return false;
  if (expiry < Math.floor(Date.now() / 1000)) return false;
  const expected = sign(expiry, secret);
  if (sig.length !== expected.length) return false;
  try {
    return timingSafeEqual(Buffer.from(sig, 'hex'), Buffer.from(expected, 'hex'));
  } catch {
    return false;
  }
}

export async function setSessionCookie(): Promise<boolean> {
  const token = await createSessionToken();
  if (!token) return false;
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    path: '/',
    maxAge: SESSION_TTL_SECONDS,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  });
  return true;
}

export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}
