'use client';

import { useState } from 'react';

export default function FilterToggle({ children, count }: { children: React.ReactNode; count: number }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button className="mobile-filter-toggle" onClick={() => setOpen((v) => !v)} aria-expanded={open}>
        <span>Filtreler{count > 0 ? ` · ${count} aktif` : ''}</span>
        <span aria-hidden="true">{open ? '−' : '+'}</span>
      </button>
      <div data-collapsed={!open} className="filter-wrap">
        {children}
      </div>
    </>
  );
}
