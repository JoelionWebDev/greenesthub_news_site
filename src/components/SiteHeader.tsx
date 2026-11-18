import Link from 'next/link';

const NAV_LINKS = [
  { href: '/category/crops', label: 'Crops' },
  { href: '/category/livestock', label: 'Livestock' },
  { href: '/category/farm-business', label: 'Farm Business' },
  { href: '/category/student-research', label: 'Student Hub' },
  { href: '/tools', label: 'Tools' },
  { href: '/community', label: 'Community' },
];

export default function SiteHeader() {
  return (
    <header className="site-header">
      <div className="wrap header-inner">
        <Link href="/" className="logo">
          <span className="logo-emoji" aria-hidden="true">
            🌿
          </span>
          <span className="logo-text">
            Greennest <span className="logo-hub">Hub</span>
          </span>
        </Link>
        <nav className="main-nav" aria-label="Main navigation">
          <Link href="/">Home</Link>
          {NAV_LINKS.map((l) => (
            <Link key={l.href} href={l.href}>
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
