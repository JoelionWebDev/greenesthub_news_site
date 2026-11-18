'use client';

import { useEffect, useRef, useState } from 'react';

/** Floating "Contact the developer" pill, shown on every page.
 *  Tap it to chat with the developer (Igono Joel) on WhatsApp.
 *  Drag it anywhere on the screen — the spot is remembered. */
const WHATSAPP_URL =
  'https://wa.me/2348167099131?text=Hello%20Joel%2C%20I%20have%20a%20question%20about%20Greennest%20Hub';
const STORAGE_KEY = 'greennest-contact-pos';

type Pos = { x: number; y: number };

export default function FloatingButtons() {
  const [showTop, setShowTop] = useState(false);
  const [pos, setPos] = useState<Pos | null>(null);
  const [dragging, setDragging] = useState(false);
  const pillRef = useRef<HTMLAnchorElement | null>(null);
  const dragRef = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    baseX: number;
    baseY: number;
    moved: boolean;
  } | null>(null);
  const lastPos = useRef<Pos | null>(null);
  const justDragged = useRef(false);

  // Restore the visitor's last position (kept inside the screen).
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as Pos;
        if (typeof parsed.x === 'number' && typeof parsed.y === 'number') {
          setPos({
            x: Math.min(Math.max(0, parsed.x), window.innerWidth - 200),
            y: Math.min(Math.max(0, parsed.y), window.innerHeight - 60),
          });
        }
      }
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 400);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const onPointerDown = (e: React.PointerEvent<HTMLAnchorElement>) => {
    const el = pillRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    dragRef.current = {
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      baseX: rect.left,
      baseY: rect.top,
      moved: false,
    };
    el.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLAnchorElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== e.pointerId) return;
    const dx = e.clientX - drag.startX;
    const dy = e.clientY - drag.startY;
    if (Math.abs(dx) + Math.abs(dy) > 6) drag.moved = true;
    if (!drag.moved) return;
    setDragging(true);
    const el = pillRef.current;
    const w = el ? el.offsetWidth : 220;
    const h = el ? el.offsetHeight : 56;
    const next = {
      x: Math.min(Math.max(0, drag.baseX + dx), window.innerWidth - w),
      y: Math.min(Math.max(0, drag.baseY + dy), window.innerHeight - h),
    };
    lastPos.current = next;
    setPos(next);
  };

  const endDrag = (e: React.PointerEvent<HTMLAnchorElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== e.pointerId) return;
    dragRef.current = null;
    setDragging(false);
    if (drag.moved) {
      justDragged.current = true;
      window.setTimeout(() => {
        justDragged.current = false;
      }, 50);
      if (lastPos.current) {
        try {
          window.localStorage.setItem(STORAGE_KEY, JSON.stringify(lastPos.current));
        } catch {
          /* ignore */
        }
      }
    }
  };

  const onClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // A drag is not a tap — don't open WhatsApp when the pill was moved.
    if (justDragged.current) {
      e.preventDefault();
      justDragged.current = false;
    }
  };

  return (
    <>
      <a
        ref={pillRef}
        href={WHATSAPP_URL}
        target="_blank"
        rel="noopener noreferrer"
        className={`float-contact${dragging ? ' dragging' : ''}`}
        style={pos ? { left: pos.x, top: pos.y, right: 'auto', bottom: 'auto' } : undefined}
        aria-label="Contact the developer on WhatsApp"
        title="Contact the developer — drag me anywhere"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onClick={onClick}
      >
        <span className="float-contact-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"
            />
          </svg>
        </span>
        <span className="float-contact-text">
          <strong>Contact the developer</strong>
          <small>Chat with Igono Joel on WhatsApp</small>
        </span>
      </a>

      {showTop && (
        <button
          type="button"
          className="float-top"
          aria-label="Scroll back to top"
          title="Back to top"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path fill="currentColor" d="M12 4 4 12h5v8h6v-8h5z" />
          </svg>
        </button>
      )}
    </>
  );
}
