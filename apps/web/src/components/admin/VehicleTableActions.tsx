'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function VehicleTableActions({
  id,
  slug,
  name,
  status,
}: {
  id: string;
  slug: string;
  name: string;
  status: string;
}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  async function remove() {
    if (!confirm(`${name} aracını silmek istediğinize emin misiniz?`)) return;
    await fetch(`/api/admin/vehicles/${id}`, { method: 'DELETE' });
    router.refresh();
  }

  async function toggleStatus() {
    const newStatus = status === 'RENTED' ? 'AVAILABLE' : 'RENTED';
    const actionName = status === 'RENTED' ? 'Teslim Almak' : 'Kiraya Vermek';
    if (!confirm(`${name} aracını ${actionName} istediğinize emin misiniz?`)) return;
    
    setIsLoading(true);
    try {
      await fetch(`/api/admin/vehicles/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      router.refresh();
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="table-actions">
      {status === 'AVAILABLE' && (
        <button onClick={toggleStatus} disabled={isLoading} style={{ borderColor: 'var(--info)', color: 'var(--info)' }}>
          Kiraya Ver
        </button>
      )}
      {status === 'RENTED' && (
        <button onClick={toggleStatus} disabled={isLoading} style={{ borderColor: 'var(--ok)', color: 'var(--ok)' }}>
          Teslim Al
        </button>
      )}
      <Link href={`/kiralik-arac/${slug}`} target="_blank">
        Gör
      </Link>
      <Link href={`/admin/vehicles/${id}/edit`}>Düzenle</Link>
      <button onClick={remove}>Sil</button>
    </div>
  );
}
