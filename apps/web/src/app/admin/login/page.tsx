import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import LoginForm from '@/components/admin/LoginForm';

export const metadata = { title: 'Yönetici Girişi', robots: { index: false, follow: false } };

export default async function Page() {
  if (await getSession()) redirect('/admin/dashboard');

  return (
    <main className="login-page">
      <section>
        <div className="brand">
          <span className="brand-mark">M</span>
          <span className="brand-text">
            <b>MILLWAL</b>
            <small>KURUMSAL KİRALAMA</small>
          </span>
        </div>
        <span className="eyebrow eyebrow-dark">YÖNETİCİ GİRİŞİ</span>
        <h1>Tekrar hoş geldiniz.</h1>
        <p>Araçları, kiralama taleplerini ve site ayarlarını buradan yönetin.</p>
        <LoginForm />
      </section>
      <aside>
        <span>MILLWAL OPERASYON MERKEZİ</span>
        <h2>Filonuz ve müşteri talepleriniz tek ekranda.</h2>
        <p>Araç yayınlama, talep takibi ve site içeriği yönetimi için tasarlanmış panel.</p>
        <ul>
          <li><i>✓</i> Detaylı araç kartları ve donanım listeleri</li>
          <li><i>✓</i> Kiralama taleplerinin durum takibi</li>
          <li><i>✓</i> Site ayarları ve kampanya yönetimi</li>
        </ul>
      </aside>
    </main>
  );
}
