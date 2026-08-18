'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

type Item = { label: string; href: string; group?: string };

export default function MobileDrawer({
  items,
  phone,
  whatsapp,
}: {
  items: Item[];
  phone: string;
  whatsapp: string;
}) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const path = usePathname();

  useEffect(() => setMounted(true), []);
  useEffect(() => setOpen(false), [path]);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  let lastGroup = '';

  return (
    <>
      <button
        className="burger"
        data-open={open}
        aria-label={open ? 'Menüyü kapat' : 'Menüyü aç'}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <span />
      </button>

      {mounted &&
        createPortal(
          <div
            className="drawer"
            data-open={open}
            role="presentation"
            onMouseDown={(e) => e.target === e.currentTarget && setOpen(false)}
          >
            <nav className="drawer-panel" aria-label="Mobil menü">
              <div className="drawer-head">
                <span className="brand">
                  <span className="brand-mark">M</span>
                  <span className="brand-text">
                    <b>MILLWAL</b>
                    <small>KURUMSAL KİRALAMA</small>
                  </span>
                </span>
                <button className="drawer-close" onClick={() => setOpen(false)} aria-label="Kapat">
                  ×
                </button>
              </div>

              {items.map((item) => {
                const header = item.group && item.group !== lastGroup ? item.group : null;
                lastGroup = item.group || lastGroup;
                return (
                  <div key={item.href}>
                    {header && <div className="drawer-group">{header}</div>}
                    <Link href={item.href}>
                      {item.label}
                      <span>→</span>
                    </Link>
                  </div>
                );
              })}

              <div className="drawer-cta">
                <a className="btn btn-accent btn-block" href={`tel:${phone}`}>
                  Hemen Ara
                </a>
                <a className="btn btn-whatsapp btn-block" href={whatsapp} target="_blank" rel="noreferrer">
                  WhatsApp&apos;tan Yaz
                </a>
              </div>
            </nav>
          </div>,
          document.body
        )}
    </>
  );
}
