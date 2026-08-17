'use client';

import { useState } from 'react';

const TABS = ['Genel', 'İletişim', 'Firma', 'Sosyal Medya', 'Harita', 'SEO', 'Kampanya'] as const;

export default function SettingsForm({ initial }: { initial: Record<string, unknown> }) {
  const [tab, setTab] = useState<string>('Genel');
  const [message, setMessage] = useState('');
  const [ok, setOk] = useState(true);

  const v = (key: string) => String(initial[key] ?? '');

  async function save(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const data = Object.fromEntries(fd) as Record<string, string>;
    data.campaignEnabled = String(fd.has('campaignEnabled'));

    const res = await fetch('/api/admin/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const body = await res.json();
    setOk(res.ok);
    setMessage(res.ok ? 'Ayarlar kaydedildi.' : body.error);
  }

  const field = (name: string, label: string, type: 'input' | 'textarea' = 'input') => (
    <label className="field" key={name}>
      <span>{label}</span>
      {type === 'input' ? (
        <input name={name} defaultValue={v(name)} />
      ) : (
        <textarea name={name} rows={4} defaultValue={v(name)} />
      )}
    </label>
  );

  const PANELS: Record<string, React.ReactNode> = {
    Genel: (
      <>
        {field('siteName', 'Site adı')}
        {field('companyLegalName', 'Firma resmi unvanı')}
        {field('logoUrl', 'Logo URL')}
        {field('faviconUrl', 'Favicon URL')}
        {field('footerDescription', 'Alt bilgi açıklaması', 'textarea')}
      </>
    ),
    'İletişim': (
      <>
        {field('phone', 'Telefon')}
        {field('phoneSecondary', 'İkinci telefon')}
        {field('whatsapp', 'WhatsApp numarası (905xxxxxxxxx)')}
        {field('email', 'E-posta')}
        {field('address', 'Adres', 'textarea')}
        {field('workingHours', 'Çalışma saatleri')}
        {field('workingHoursWeekend', 'Hafta sonu çalışma saatleri')}
      </>
    ),
    Firma: (
      <>
        {field('mersisNo', 'Mersis No')}
        {field('tradeRegistryNo', 'Ticaret Sicil No')}
        {field('tradeRegistryOffice', 'Ticaret Sicil Müdürlüğü')}
        {field('taxOffice', 'Vergi dairesi')}
        {field('taxNumber', 'Vergi numarası')}
      </>
    ),
    'Sosyal Medya': (
      <>
        {field('instagramUrl', 'Instagram')}
        {field('facebookUrl', 'Facebook')}
        {field('linkedinUrl', 'LinkedIn')}
        {field('youtubeUrl', 'YouTube')}
        {field('tiktokUrl', 'TikTok')}
      </>
    ),
    Harita: <>{field('googleMapsUrl', 'Google Maps URL')}</>,
    SEO: (
      <>
        {field('seoTitle', 'SEO başlığı')}
        {field('seoDescription', 'Site açıklaması', 'textarea')}
      </>
    ),
    Kampanya: (
      <>
        <label className="toggle">
          <input type="checkbox" name="campaignEnabled" defaultChecked={initial.campaignEnabled !== false} />
          Açılış kampanya penceresini göster
        </label>
        {field('campaignTitle', 'Kampanya başlığı')}
        {field('campaignText', 'Kampanya metni', 'textarea')}
        {field('campaignImageUrl', 'Görsel URL')}
        {field('campaignButtonText', 'Buton metni')}
      </>
    ),
  };

  return (
    <form className="admin-card" onSubmit={save}>
      <div className="filter-pills" style={{ marginBottom: 24 }}>
        {TABS.map((t) => (
          <label key={t} style={{ cursor: 'pointer' }}>
            <input type="radio" name="__tab" checked={tab === t} onChange={() => setTab(t)} />
            {t}
          </label>
        ))}
      </div>

      <div style={{ display: 'grid', gap: 16 }}>
        {TABS.map((t) => (
          <div key={t} style={{ display: tab === t ? 'grid' : 'none', gap: 16 }}>
            {PANELS[t]}
          </div>
        ))}
      </div>

      {message && <p className={ok ? 'form-success' : 'form-error'}>{message}</p>}
      <div className="form-actions" style={{ marginTop: 22 }}>
        <button className="btn btn-accent">Ayarları Kaydet</button>
      </div>
    </form>
  );
}
