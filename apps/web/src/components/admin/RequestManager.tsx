'use client';

import { useState } from 'react';

type Item = {
  id: string;
  fullName: string;
  phone: string;
  email: string | null;
  company: string | null;
  startDate: string | null;
  endDate: string | null;
  pickupLocation: string | null;
  dropoffLocation: string | null;
  message: string | null;
  status: string;
  adminNote: string | null;
  createdAt: string;
  vehicle: { id: string; name: string; slug: string; status: string };
};

const LABELS: Record<string, string> = {
  NEW: 'Yeni',
  CALLED: 'Arandı',
  CONTACTING: 'Görüşülüyor',
  RESERVED: 'Rezervasyon Yapıldı',
  CANCELLED: 'İptal',
};

const d = (v: string | null) => (v ? new Date(v).toLocaleDateString('tr-TR') : '—');

export default function RequestManager({ initial, vehicles = [] }: { initial: Item[], vehicles?: { id: string; name: string; brand: string; model: string }[] }) {
  const [items, setItems] = useState(initial);
  const [open, setOpen] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function update(id: string, data: Partial<Item>) {
    setItems((v) => v.map((x) => (x.id === id ? { ...x, ...data } : x)));
  }

  async function save(item: Item) {
    setSaving(true);
    const res = await fetch(`/api/admin/rental-requests/${item.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: item.status, adminNote: item.adminNote, vehicleStatus: item.vehicle.status }),
    });
    setSaving(false);
    if (res.ok) setOpen(null);
  }

  const current = open ? items.find((x) => x.id === open) : null;

  return (
    <section className="admin-card">
      <div style={{ padding: '20px', borderBottom: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ margin: 0, fontSize: '1.2rem' }}>Kayıtlı Talepler</h3>
        <button className="btn btn-accent btn-sm" onClick={() => setOpen('NEW')}>+ Manuel Kiralama Ekle</button>
      </div>
      <div className="admin-table">
        <table>
          <thead>
            <tr>
              <th>Müşteri</th>
              <th>Telefon</th>
              <th>Araç</th>
              <th>Alış</th>
              <th>İade</th>
              <th>Teslim yeri</th>
              <th>Durum</th>
              <th>İşlem</th>
            </tr>
          </thead>
          <tbody>
            {items.map((i) => (
              <tr key={i.id}>
                <td>
                  <b>{i.fullName}</b>
                  <small>
                    {d(i.createdAt)}
                    {i.company ? ` · ${i.company}` : ''}
                  </small>
                </td>
                <td>
                  <a href={`tel:${i.phone}`}>{i.phone}</a>
                </td>
                <td>{i.vehicle.name}</td>
                <td>{d(i.startDate)}</td>
                <td>{d(i.endDate)}</td>
                <td>{i.pickupLocation || '—'}</td>
                <td>
                  <span className={`status ${i.status}`}>{LABELS[i.status]}</span>
                </td>
                <td>
                  <div className="table-actions">
                    <button onClick={() => setOpen(i.id)} style={{ borderColor: 'var(--line)' }}>
                      Detay
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {items.length === 0 && <p className="table-count">Henüz kiralama talebi bulunmuyor.</p>}

      {current && (
        <div
          className="campaign-backdrop"
          role="presentation"
          onMouseDown={(e) => e.target === e.currentTarget && setOpen(null)}
        >
          <div className="admin-card" style={{ width: 'min(640px, 100%)', maxHeight: '90vh', overflow: 'auto', position: 'relative' }}>
            <button className="campaign-close" onClick={() => setOpen(null)} aria-label="Kapat">
              ×
            </button>
            <span className="eyebrow eyebrow-dark">TALEP DETAYI</span>
            <h2 style={{ marginTop: 10 }}>
              {current.fullName} · {current.vehicle.name}
            </h2>

            <div className="btn-row" style={{ margin: '18px 0' }}>
              <a className="btn btn-dark btn-sm" href={`tel:${current.phone}`}>☎ Ara</a>
              <a
                className="btn btn-whatsapp btn-sm"
                href={`https://wa.me/${current.phone.replace(/\D/g, '')}`}
                target="_blank"
                rel="noreferrer"
              >
                WhatsApp
              </a>
              {current.email && (
                <a className="btn btn-outline btn-sm" href={`mailto:${current.email}`}>E-posta</a>
              )}
            </div>

            <dl className="registry-list">
              <div><dt>Telefon</dt><dd>{current.phone}</dd></div>
              {current.email && <div><dt>E-posta</dt><dd>{current.email}</dd></div>}
              {current.company && <div><dt>Firma</dt><dd>{current.company}</dd></div>}
              <div><dt>Tarih aralığı</dt><dd>{d(current.startDate)} — {d(current.endDate)}</dd></div>
              <div><dt>Teslim yeri</dt><dd>{current.pickupLocation || '—'}</dd></div>
              <div><dt>İade yeri</dt><dd>{current.dropoffLocation || '—'}</dd></div>
              <div><dt>Müşteri mesajı</dt><dd>{current.message || '—'}</dd></div>
            </dl>

            <div style={{ display: 'grid', gap: 14, marginTop: 20 }}>
              <label className="field">
                <span>Durum</span>
                <select value={current.status} onChange={(e) => update(current.id, { status: e.target.value })}>
                  {Object.entries(LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="field">
                <span>Araç Durumu (Sitedeki Durum)</span>
                <select 
                  value={current.vehicle.status} 
                  onChange={(e) => update(current.id, { vehicle: { ...current.vehicle, status: e.target.value } })}
                >
                  <option value="AVAILABLE">Hemen kiralanabilir (Yeşil)</option>
                  <option value="RENTED">Kiralandı (Kırmızı - Müsait Değil)</option>
                  <option value="RESERVED">Rezerve</option>
                  <option value="MAINTENANCE">Bakımda</option>
                </select>
              </label>
              <label className="field">
                <span>Yönetici notu</span>
                <textarea
                  rows={5}
                  value={current.adminNote || ''}
                  onChange={(e) => update(current.id, { adminNote: e.target.value })}
                />
              </label>
              <button className="btn btn-accent" onClick={() => save(current)} disabled={saving}>
                {saving ? 'Kaydediliyor…' : 'Kaydet'}
              </button>
            </div>
          </div>
        </div>
      )}

      {open === 'NEW' && (
        <div
          className="campaign-backdrop"
          role="presentation"
          onMouseDown={(e) => e.target === e.currentTarget && setOpen(null)}
        >
          <div className="admin-card" style={{ width: 'min(640px, 100%)', maxHeight: '90vh', overflow: 'auto', position: 'relative' }}>
            <button className="campaign-close" onClick={() => setOpen(null)} aria-label="Kapat">×</button>
            <span className="eyebrow eyebrow-dark">YENİ KİRALAMA</span>
            <h2 style={{ marginTop: 10 }}>Manuel Kiralama Ekle</h2>

            <form onSubmit={async (e) => {
              e.preventDefault();
              setSaving(true);
              const fd = new FormData(e.currentTarget);
              const data = Object.fromEntries(fd);
              
              const res = await fetch('/api/admin/rental-requests', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
              });
              
              setSaving(false);
              if (res.ok) {
                setOpen(null);
                window.location.reload();
              } else {
                alert('Kaydedilirken hata oluştu.');
              }
            }}>
              <div style={{ display: 'grid', gap: 14, marginTop: 20 }}>
                <label className="field">
                  <span>Müşteri Adı *</span>
                  <input name="fullName" required />
                </label>
                <label className="field">
                  <span>Telefon *</span>
                  <input name="phone" required />
                </label>
                <div style={{ display: 'flex', gap: 14 }}>
                  <label className="field" style={{ flex: 1 }}>
                    <span>E-posta</span>
                    <input name="email" type="email" />
                  </label>
                  <label className="field" style={{ flex: 1 }}>
                    <span>Firma</span>
                    <input name="company" />
                  </label>
                </div>
                <label className="field">
                  <span>Araç *</span>
                  <select name="vehicleId" required>
                    <option value="">Araç Seçin</option>
                    {vehicles.map(v => (
                      <option key={v.id} value={v.id}>{v.name} ({v.brand} {v.model})</option>
                    ))}
                  </select>
                </label>
                <div style={{ display: 'flex', gap: 14 }}>
                  <label className="field" style={{ flex: 1 }}>
                    <span>Alış Tarihi</span>
                    <input name="startDate" type="date" />
                  </label>
                  <label className="field" style={{ flex: 1 }}>
                    <span>İade Tarihi</span>
                    <input name="endDate" type="date" />
                  </label>
                </div>
                
                <hr style={{ border: 'none', borderTop: '1px solid var(--line)', margin: '10px 0' }} />
                
                <label className="field">
                  <span>Durum</span>
                  <select name="status" defaultValue="RESERVED">
                    {Object.entries(LABELS).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </label>
                <label className="field">
                  <span>Araç Durumu (Sitedeki Durum)</span>
                  <select name="vehicleStatus" defaultValue="RENTED">
                    <option value="AVAILABLE">Hemen kiralanabilir (Yeşil)</option>
                    <option value="RENTED">Kiralandı (Kırmızı - Müsait Değil)</option>
                    <option value="RESERVED">Rezerve</option>
                    <option value="MAINTENANCE">Bakımda</option>
                  </select>
                </label>
                <label className="field">
                  <span>Yönetici notu</span>
                  <textarea name="adminNote" rows={3}></textarea>
                </label>
                
                <button type="submit" className="btn btn-accent" disabled={saving}>
                  {saving ? 'Kaydediliyor…' : 'Oluştur ve Kaydet'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
