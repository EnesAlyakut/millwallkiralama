'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function CookieConsent() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      setOpen(!localStorage.getItem('millwal-cookie-choice'));
    } catch {
      setOpen(false);
    }
  }, []);

  function choose(value: string) {
    try {
      localStorage.setItem('millwal-cookie-choice', value);
    } catch {
      /* yok sayılır */
    }
    setOpen(false);
  }

  if (!open) return null;

  return (
    <aside className="cookie-card" aria-label="Çerez tercihleri">
      <strong>Çerez tercihleriniz</strong>
      <p>
        Site deneyimini geliştirmek ve temel trafik ölçümü için çerezlerden yararlanıyoruz. Ayrıntıları{' '}
        <Link href="/gizlilik">Gizlilik ve Çerez Politikası</Link> sayfasında inceleyebilirsiniz.
      </p>
      <div>
        <button onClick={() => choose('rejected')}>Tümünü Reddet</button>
        <button onClick={() => choose('accepted')}>Tümünü Kabul Et</button>
      </div>
    </aside>
  );
}
