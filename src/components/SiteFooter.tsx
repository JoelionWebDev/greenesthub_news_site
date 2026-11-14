import Link from 'next/link';
import { CATEGORIES } from '@/lib/categories';

export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="wrap footer-inner">
        <div>
          <p className="footer-logo">🌿 Greennest Hub</p>
          <p className="footer-tag">Where every animal has a story.</p>
        </div>
        <nav className="footer-nav" aria-label="Footer">
          <Link href="/">Home</Link>
          {CATEGORIES.map((c) => (
            <Link key={c.slug} href={`/category/${c.slug}`}>
              {c.name}
            </Link>
          ))}
        </nav>
      </div>
      <p className="footer-copy">© 2026 Greennest Hub — made with love for animals and curious kids.</p>
    </footer>
  );
}
