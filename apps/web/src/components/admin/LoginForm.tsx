'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginForm() {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const data = Object.fromEntries(new FormData(e.currentTarget));
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const body = await res.json();

    if (!res.ok) {
      setError(body.error);
      setLoading(false);
      return;
    }
    router.push('/admin/dashboard');
    router.refresh();
  }

  return (
    <form onSubmit={submit}>
      <label className="field">
        <span>Kullanıcı adı veya e-posta</span>
        <input name="identity" autoComplete="username" required />
      </label>
      <label className="field">
        <span>Şifre</span>
        <input name="password" type="password" autoComplete="current-password" required />
      </label>
      {error && <p className="form-error">{error}</p>}
      <button className="btn btn-accent btn-block btn-lg" disabled={loading}>
        {loading ? 'Giriş yapılıyor…' : 'Giriş Yap'}
      </button>
    </form>
  );
}
