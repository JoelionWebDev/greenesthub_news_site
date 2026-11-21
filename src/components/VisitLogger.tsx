'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

/**
 * Logs one page view per navigation (fire-and-forget). Sends only the
 * page path — no personal data. Skips /stats and /admin so the
 * statistics page never counts its own views. When Supabase is not
 * connected the /api/stats/log route simply does nothing.
 */
export default function VisitLogger() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname) return;
    if (pathname === '/stats' || pathname.startsWith('/admin')) return;
    fetch('/api/stats/log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path: pathname }),
      keepalive: true,
    }).catch(() => {
      // Logging must never break the page.
    });
  }, [pathname]);

  return null;
}
