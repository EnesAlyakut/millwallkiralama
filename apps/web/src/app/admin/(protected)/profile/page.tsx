import { getSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { dateShort } from '@/lib/site';

export const dynamic = 'force-dynamic';

export default async function Page() {
  const session = await getSession();
  const admin = session ? await db.admin.findUnique({ where: { id: session.id } }) : null;

  return (
    <div className="admin-page">
      <div className="admin-title">
        <div>
          <span>HESAP</span>
          <h1>Profil</h1>
        </div>
      </div>

      <section className="admin-card">
        <h2>Hesap bilgileri</h2>
        <dl className="registry-list">
          <div><dt>Ad Soyad</dt><dd>{admin?.name}</dd></div>
          <div><dt>Kullanıcı adı</dt><dd>{admin?.username}</dd></div>
          <div><dt>E-posta</dt><dd>{admin?.email}</dd></div>
          <div><dt>Rol</dt><dd>{admin?.role === 'SUPER_ADMIN' ? 'Süper Yönetici' : 'Yönetici'}</dd></div>
          <div><dt>Son giriş</dt><dd>{admin?.lastLoginAt ? dateShort(admin.lastLoginAt) : '—'}</dd></div>
        </dl>
        <p className="form-note" style={{ marginTop: 18 }}>
          Şifre değişikliği için sistem yöneticinizle iletişime geçin.
        </p>
      </section>
    </div>
  );
}
