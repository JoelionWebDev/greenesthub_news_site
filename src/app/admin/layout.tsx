import type { ReactNode } from "react";

/**
 * The admin area reads the session cookie on every request, so it cannot be
 * prerendered into a static shell. Opting out of instant-navigation
 * validation lets these pages block on the server while the session is read
 * (see the Next.js "Authentication with Cache Components" guide).
 */
export const instant = false;

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
