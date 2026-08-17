'use client';

import Link from 'next/link';
import { useState } from 'react';

type State = { loading?: boolean; ok?: boolean; message?: string };

export default function RentalRequestForm({ vehicleId }: { vehicleId: string }) {
  const [state, setState] = useState<State>({});

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (state.loading) return;

    const form = e.currentTarget;
    setState({ loading: true });

    try {
      const body = Object.fromEntries(new FormData(form));
      const res = await fetch('/api/rental-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...body, vehicleId }),
      });
      const data = await res.json();
      setState({ ok: res.ok, message: data.message || data.error });
      if (res.ok) form.reset();
    } catch {
      setState({ ok: false, message: 'Bağlantı kurulamadı. Lütfen telefon veya WhatsApp ile ulaşın.' });
    }
  }

  const today = new Date().toISOString().slice(0, 10);

  return (
    <form className="request-form" onSubmit={submit}>
      <input name="website" className="honeypot" tabIndex={-1} autoComplete="off" aria-hidden="true" />

      <div className="form-grid">
        <label className="field">
          <span>Ad Soyad</span>
          <input name="fullName" required minLength={3} autoComplete="name" placeholder="Adınız ve soyadınız" />
        </label>
        <label className="field">
          <span>Telefon</span>
          <input name="phone" required inputMode="tel" autoComplete="tel" placeholder="05xx xxx xx xx" />
        </label>
        <label className="field">
          <span>E-posta</span>
          <input name="email" type="email" autoComplete="email" placeholder="ornek@sirket.com" />
        </label>
        <label className="field">
          <span>Firma (opsiyonel)</span>
          <input name="company" placeholder="Şirket adı" />
        </label>
        <label className="field">
          <span>Alış Tarihi</span>
          <input type="date" name="startDate" min={today} />
        </label>
        <label className="field">
          <span>İade Tarihi</span>
          <input type="date" name="endDate" min={today} />
        </label>
        <label className="field">
          <span>Teslim Alma Yeri</span>
          <input name="pickupLocation" placeholder="Örn. Tuzla ofis / Sabiha Gökçen" />
        </label>
        <label className="field">
          <span>İade Yeri</span>
          <input name="dropoffLocation" placeholder="Aynı nokta veya farklı adres" />
        </label>
        <label className="field field-full">
          <span>Notunuz</span>
          <textarea name="message" rows={4} placeholder="Kullanım süresi, ek talepleriniz veya sorularınız" />
        </label>
      </div>

      <label className="check" style={{ marginTop: 18 }}>
        <input type="checkbox" name="kvkk" required />
        <span>
          <Link href="/kvkk" target="_blank" style={{ textDecoration: 'underline' }}>
            KVKK Aydınlatma Metni
          </Link>
          &apos;ni okudum, iletişim kurulmasını onaylıyorum.
        </span>
      </label>

      <button className="btn btn-accent btn-block" disabled={state.loading}>
        {state.loading ? 'Gönderiliyor…' : 'Talebi Gönder'}
      </button>

      <p className="form-note" style={{ marginTop: 12 }}>
        Bu form bir ön talep oluşturur; rezervasyon anlamına gelmez. Ekibimiz müsaitlik ve koşulları teyit
        etmek için sizinle iletişime geçer.
      </p>

      {state.message && (
        <p className={state.ok ? 'form-success' : 'form-error'} role="status">
          {state.message}
        </p>
      )}
    </form>
  );
}
