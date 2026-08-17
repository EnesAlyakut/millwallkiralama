'use client';

import { useEffect } from 'react';

export default function ViewTracker({ id }: { id: string }) {
  useEffect(() => {
    const t = window.setTimeout(() => {
      fetch(`/api/vehicle-views/${id}`, { method: 'POST' }).catch(() => undefined);
    }, 1500);
    return () => window.clearTimeout(t);
  }, [id]);

  return null;
}
