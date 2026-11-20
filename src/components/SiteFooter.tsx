import Link from 'next/link';

const FOOTER_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/category/crops', label: 'Crops' },
  { href: '/category/livestock', label: 'Livestock' },
  { href: '/category/farm-business', label: 'Farm Business' },
  { href: '/category/student-research', label: 'Student Hub' },
  { href: '/tools', label: 'Farmer Tools' },
  { href: '/marketplace', label: 'Marketplace' },
  { href: '/community', label: 'Community' },
  { href: '/blog', label: 'All Blogs' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
  { href: '/privacy', label: 'Privacy' },
];

export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="wrap footer-inner">
        <div>
          <p className="footer-logo">🌿 Greennest Hub</p>
          <p className="footer-tag">
            Farming knowledge, tools and market prices for Nigeria and Africa.
          </p>
          <p className="footer-tag">Founded by Igono Joel — Built by Joetech360.</p>
          <p className="footer-tag">
            Chat with the developer on{' '}
            <a
              href="https://wa.me/2348167099131?text=Hello%20Joel%2C%20I%20have%20a%20question%20about%20Greennest%20Hub"
              target="_blank"
              rel="noopener noreferrer"
            >
              WhatsApp — 08167099131
            </a>
            .
          </p>
        </div>
        <nav className="footer-nav" aria-label="Footer">
          {FOOTER_LINKS.map((l) => (
            <Link key={l.href} href={l.href}>
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
      <p className="footer-copy">
        © 2026 Greennest Hub — farming knowledge for Nigeria and Africa.
      </p>
    </footer>
  );
}
