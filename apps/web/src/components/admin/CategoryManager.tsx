'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

type C = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  sortOrder: number;
  isActive: boolean;
  _count: { vehicles: number };
};

export default function CategoryManager({ items }: { items: C[] }) {
  const router = useRouter();
  const [error, setError] = useState('');

  async function add(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form)) as Record<string, unknown>;
    data.sortOrder = Number(data.sortOrder || 0);
    data.isActive = true;

    const res = await fetch('/api/admin/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const body = await res.json();
    if (!res.ok) setError(body.error);
    else {
      form.reset();
      setError('');
      router.refresh();
    }
  }

  async function edit(c: C) {
    const name = prompt('Kategori adı', c.name);
    if (!name) return;
    const slug = prompt('URL slug', c.slug);
    if (!slug) return;

    const res = await fetch(`/api/admin/categories/${c.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        slug,
        description: c.description || '',
        sortOrder: c.sortOrder,
        isActive: c.isActive,
      }),
    });
    const body = await res.json();
    if (!res.ok) setError(body.error);
    else router.refresh();
  }

  async function remove(c: C) {
    if (!confirm(`${c.name} kategorisini silmek istediğinize emin misiniz?`)) return;
    const res = await fetch(`/api/admin/categories/${c.id}`, { method: 'DELETE' });
    const body = await res.json();
    if (!res.ok) setError(body.error);
    else router.refresh();
  }

  return (
    <div className="admin-columns">
      <section className="admin-card">
        <h2>Tüm Kategoriler</h2>
        <div className="admin-table">
          <table>
            <thead>
              <tr>
                <th>Kategori</th>
                <th>Slug</th>
                <th>Araç</th>
                <th>Sıra</th>
                <th>İşlem</th>
              </tr>
            </thead>
            <tbody>
              {items.map((c) => (
                <tr key={c.id}>
                  <td>
                    <b>{c.name}</b>
                    <small>{c.description?.slice(0, 50)}</small>
                  </td>
                  <td>{c.slug}</td>
                  <td>{c._count.vehicles}</td>
                  <td>{c.sortOrder}</td>
                  <td>
                    <div className="table-actions">
                      <button onClick={() => edit(c)} style={{ borderColor: 'var(--line)' }}>
                        Düzenle
                      </button>
                      <button onClick={() => remove(c)}>Sil</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <form className="admin-card" onSubmit={add}>
        <h2>Yeni Kategori</h2>
        <div style={{ display: 'grid', gap: 14 }}>
          <label className="field">
            <span>Kategori adı</span>
            <input name="name" required />
          </label>
          <label className="field">
            <span>Slug</span>
            <input name="slug" placeholder="boş bırakılırsa otomatik oluşturulur" />
          </label>
          <label className="field">
            <span>Açıklama</span>
            <textarea name="description" rows={4} />
          </label>
          <label className="field">
            <span>Sıra</span>
            <input name="sortOrder" type="number" defaultValue="0" />
          </label>
          {error && <p className="form-error">{error}</p>}
          <button className="btn btn-accent btn-block">Kategori Ekle</button>
        </div>
      </form>
    </div>
  );
}
