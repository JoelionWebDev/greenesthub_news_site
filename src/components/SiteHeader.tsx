'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { CATEGORIES } from '@/lib/categories';

const FARMING = CATEGORIES.filter((c) => c.group === 'farming');
const ANIMALS = CATEGORIES.filter((c) => c.group === 'animals');

type Drop = 'farming' | 'animals' | null;

export default function SiteHeader() {
  const [drop, setDrop] = useState<Drop>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  // Close any open dropdown when the user clicks outside it or presses Escape.
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest('.nav-drop')) setDrop(null);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setDrop(null);
        setMenuOpen(false);
      }
    };
    document.addEventListener('click', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('click', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  const toggleDrop = (name: Drop) => setDrop((d) => (d === name ? null : name));

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

        <button
          type="button"
          className="menu-toggle"
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((o) => !o)}
        >
          {menuOpen ? '✕' : '☰'}
        </button>

        <nav className="main-nav" aria-label="Main navigation">
          <Link href="/">Home</Link>

          <div className={`nav-drop${drop === 'farming' ? ' open' : ''}`}>
            <button
              type="button"
              aria-expanded={drop === 'farming'}
              aria-haspopup="true"
              onClick={() => toggleDrop('farming')}
            >
              Farming <span aria-hidden="true">▾</span>
            </button>
            <div className="nav-drop-menu">
              {FARMING.map((c) => (
                <Link key={c.slug} href={`/category/${c.slug}`} onClick={() => setDrop(null)}>
                  <span aria-hidden="true">{c.emoji} </span>
                  {c.name}
                </Link>
              ))}
            </div>
          </div>

          <div className={`nav-drop${drop === 'animals' ? ' open' : ''}`}>
            <button
              type="button"
              aria-expanded={drop === 'animals'}
              aria-haspopup="true"
              onClick={() => toggleDrop('animals')}
            >
              Animals <span aria-hidden="true">▾</span>
            </button>
            <div className="nav-drop-menu">
              {ANIMALS.map((c) => (
                <Link key={c.slug} href={`/category/${c.slug}`} onClick={() => setDrop(null)}>
                  <span aria-hidden="true">{c.emoji} </span>
                  {c.name}
                </Link>
              ))}
            </div>
          </div>

          <Link href="/tools">Tools</Link>
          <Link href="/marketplace">Marketplace</Link>
          <Link href="/community">Community</Link>
          <Link href="/blog">All Blogs</Link>
          <Link href="/contact">Contact</Link>
        </nav>
      </div>

      {menuOpen && (
        <nav className="mobile-menu" aria-label="Mobile navigation">
          <Link href="/" onClick={() => setMenuOpen(false)}>
            🏠 Home
          </Link>
          <p className="mobile-menu-heading">Farming</p>
          {FARMING.map((c) => (
            <Link key={c.slug} href={`/category/${c.slug}`} onClick={() => setMenuOpen(false)}>
              <span aria-hidden="true">{c.emoji} </span>
              {c.name}
            </Link>
          ))}
          <p className="mobile-menu-heading">Animals</p>
          {ANIMALS.map((c) => (
            <Link key={c.slug} href={`/category/${c.slug}`} onClick={() => setMenuOpen(false)}>
              <span aria-hidden="true">{c.emoji} </span>
              {c.name}
            </Link>
          ))}
          <p className="mobile-menu-heading">More</p>
          <Link href="/tools" onClick={() => setMenuOpen(false)}>
            🛠️ Farmer Tools
          </Link>
          <Link href="/marketplace" onClick={() => setMenuOpen(false)}>
            🧺 Marketplace
          </Link>
          <Link href="/community" onClick={() => setMenuOpen(false)}>
            💬 Community
          </Link>
          <Link href="/blog" onClick={() => setMenuOpen(false)}>
            📖 All Blogs
          </Link>
          <Link href="/contact" onClick={() => setMenuOpen(false)}>
            ✉️ Contact
          </Link>
        </nav>
      )}
    </header>
  );
}
