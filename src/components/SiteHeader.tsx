import Link from 'next/link';
import { CATEGORIES } from '@/lib/categories';

export default function SiteHeader() {
  return (
    <header className="site-header">
      <div className="wrap header-inner">
        <Link href="/" className="logo">
          <span className="logo-emoji" aria-hidden="true">
            🌿
          </span>
          <span className="logo-text">
            Greenest <span className="logo-hub">Hub</span>
          </span>
        </Link>
        <nav className="main-nav" aria-label="Categories">
          <Link href="/">Home</Link>
          {CATEGORIES.map((c) => (
            <Link key={c.slug} href={`/category/${c.slug}`}>
              {c.name}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
