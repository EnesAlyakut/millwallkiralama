import type { Metadata } from 'next';
import Link from 'next/link';
import PublicChrome from '@/components/PublicChrome';
import Reveal from '@/components/Reveal';
import { db } from '@/lib/db';
import { getSettings } from '@/lib/site';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Kurumsal',
  description: 'Millwal Kurumsal Kiralama şirket profili, çalışma ilkeleri ve resmi ticaret bilgileri.',
};

const VALUES: Array<[string, string, string]> = [
  ['01', 'Şeffaflık', 'Fiyat, kilometre limiti, sigorta kapsamı ve depozito gibi tüm kalemleri sözleşme öncesinde yazılı olarak paylaşırız.'],
  ['02', 'Ulaşılabilirlik', 'Kiralama süresince muhatabınız değişmez; tek numaradan hızlı geri dönüş alırsınız.'],
  ['03', 'Bakımlı filo', 'Araçlarımızın periyodik bakımları takip edilir, teslimat öncesi kontrol listesi birlikte gözden geçirilir.'],
  ['04', 'Esneklik', 'Bir günlük ihtiyaçtan uzun dönem filo planına kadar ölçeklenebilir çözümler kurgularız.'],
  ['05', 'Kurumsal uyum', 'Faturalandırma, sözleşme ve raporlama süreçleri şirket muhasebenizin ihtiyaçlarına göre yürütülür.'],
  ['06', 'Sorumluluk', 'Araç, sürücü ve veri güvenliği konularında yasal yükümlülüklere tam uyum sağlarız.'],
];

export default async function Page() {
  const [s, vehicleCount, categoryCount] = await Promise.all([
    getSettings(),
    db.vehicle.count({ where: { deletedAt: null, status: { not: 'PASSIVE' } } }),
    db.category.count({ where: { isActive: true } }),
  ]);

  return (
    <PublicChrome>
      <main>
        <section className="page-hero">
          <div className="container">
            <nav className="crumbs">
              <Link href="/">Ana Sayfa</Link>
              <span className="sep">/</span>
              <strong>Kurumsal</strong>
            </nav>
            <span className="eyebrow">KURUMSAL</span>
            <h1>{s?.siteName}</h1>
            <p>
              Bireysel ve kurumsal ihtiyaçlara uygun geniş araç seçeneklerini, kolay iletişim ve şeffaf
              koşullarla sunan bir kiralama yaklaşımı.
            </p>
            <div className="page-hero-stats">
              <div>
                <strong>{vehicleCount}+</strong>
                <span>kiralanabilir araç</span>
              </div>
              <div>
                <strong>{categoryCount}</strong>
                <span>araç kategorisi</span>
              </div>
              <div>
                <strong>3</strong>
                <span>kiralama dönemi</span>
              </div>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="container corporate-grid">
            <div>
              <span className="eyebrow eyebrow-dark">ŞİRKET PROFİLİ</span>
              <h2>{s?.companyLegalName}</h2>
              <div className="prose" style={{ marginTop: 20 }}>
                <p>
                  Millwal Kurumsal Kiralama; otomobil, ticari araç, motosiklet ve deniz araçlarını kapsayan
                  geniş bir filo ile bireysel kullanıcılara ve işletmelere kiralama hizmeti sunar.
                </p>
                <p>
                  Yaklaşımımızın merkezinde iki ilke vardır: koşulların baştan net olması ve iletişimin
                  hızlı yürümesi. Araç sayfalarımızda teknik özelliklerden kilometre limitine, sigorta
                  kapsamından depozitoya kadar tüm bilgileri açıkça paylaşırız.
                </p>
                <p>
                  Kurumsal müşterilerimiz için filo büyüklüğü, kullanım yoğunluğu ve bütçe planına göre
                  özelleştirilmiş kiralama kurguları hazırlar; sözleşme ve faturalandırma süreçlerini
                  muhasebe ekiplerinizin ihtiyaçlarına uygun şekilde yürütürüz.
                </p>
              </div>
            </div>
            <dl className="registry-list">
              <div><dt>Ticaret Unvanı</dt><dd>{s?.companyLegalName}</dd></div>
              <div><dt>Mersis No</dt><dd>{s?.mersisNo}</dd></div>
              <div><dt>Ticaret Sicil No</dt><dd>{s?.tradeRegistryNo}</dd></div>
              <div><dt>Ticaret Sicil Müdürlüğü</dt><dd>{s?.tradeRegistryOffice}</dd></div>
              <div><dt>Adres</dt><dd>{s?.address}</dd></div>
              <div><dt>Telefon</dt><dd>{s?.phone}</dd></div>
              <div><dt>E-posta</dt><dd>{s?.email}</dd></div>
              <div><dt>Çalışma Saatleri</dt><dd>{s?.workingHours}</dd></div>
            </dl>
          </div>
        </section>

        <section className="section section-tint">
          <div className="container">
            <div className="sect-head">
              <div>
                <span className="eyebrow eyebrow-dark">ÇALIŞMA İLKELERİMİZ</span>
                <h2>Nasıl çalışıyoruz?</h2>
              </div>
            </div>
            <div className="info-cards">
              {VALUES.map(([n, title, text], i) => (
                <Reveal as="article" key={n} delay={i * 50}>
                  <b>{n}</b>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section className="section">
          <div className="container">
            <div className="cta-box">
              <div>
                <span className="eyebrow">KURUMSAL TEKLİF</span>
                <h2>Filonuz için özel çalışma yapalım</h2>
                <p>İhtiyaç analizinden teslimat planına kadar tüm süreci birlikte kurgulayalım.</p>
              </div>
              <div className="btn-row">
                <Link className="btn btn-accent" href="/iletisim">Teklif İsteyin</Link>
                <Link className="btn btn-ghost" href="/filo-kiralama">Filo Kiralama</Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    </PublicChrome>
  );
}
