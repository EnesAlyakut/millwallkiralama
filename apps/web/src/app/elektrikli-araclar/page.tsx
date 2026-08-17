import Link from 'next/link';
import PublicChrome from '@/components/PublicChrome';
import VehicleCard from '@/components/VehicleCard';
import Reveal from '@/components/Reveal';
import { db } from '@/lib/db';
import { getSettings } from '@/lib/site';

export const dynamic = 'force-dynamic';
export const metadata = {
  title: 'Elektrikli ve Hibrit Kiralık Araçlar',
  description: 'Daha sessiz, verimli ve düşük emisyonlu elektrikli ve hibrit kiralık araç seçenekleri.',
};

const POINTS: Array<[string, string, string]> = [
  ['⚡', 'Düşük kullanım maliyeti', 'Elektrikli araçlarda km başına enerji maliyeti, benzinli eşdeğerlerine göre belirgin şekilde düşüktür.'],
  ['🌱', 'Daha az emisyon', 'Şehir içi kullanımda karbon salımını azaltarak sürdürülebilirlik hedeflerinize katkı sağlar.'],
  ['🔇', 'Sessiz sürüş', 'Titreşim ve motor sesinin azalması, uzun sürüşlerde konforu belirgin şekilde artırır.'],
  ['🔌', 'Şarj planı desteği', 'Rotanıza uygun şarj noktalarını ve günlük menzil planınızı birlikte belirleyelim.'],
];

export default async function Page() {
  const [vehicles, s] = await Promise.all([
    db.vehicle.findMany({
      where: {
        deletedAt: null,
        status: { not: 'PASSIVE' },
        OR: [{ fuelType: { contains: 'Elektrik' } }, { fuelType: { contains: 'Hibrit' } }],
      },
      include: { category: true },
      orderBy: [{ featured: 'desc' }, { sortOrder: 'asc' }],
    }),
    getSettings(),
  ]);

  return (
    <PublicChrome>
      <main>
        <section className="page-hero">
          <div className="container">
            <nav className="crumbs">
              <Link href="/">Ana Sayfa</Link>
              <span className="sep">/</span>
              <strong>Elektrikli &amp; Hibrit</strong>
            </nav>
            <span className="eyebrow">YENİ NESİL ULAŞIM</span>
            <h1>Elektrikli ve hibrit araçlar</h1>
            <p>
              Daha sessiz, daha verimli ve düşük emisyonlu sürüş seçeneklerini filomuzun ayrı bir
              koleksiyonunda keşfedin.
            </p>
            <div className="page-hero-stats">
              <div>
                <strong>{vehicles.length}</strong>
                <span>elektrikli / hibrit araç</span>
              </div>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="container">
            {vehicles.length ? (
              <div className="vehicle-grid">
                {vehicles.map((v, i) => (
                  <Reveal key={v.id} delay={i * 40}>
                    <VehicleCard v={v} phone={s?.phone || ''} whatsapp={s?.whatsapp || ''} />
                  </Reveal>
                ))}
              </div>
            ) : (
              <div className="empty">
                <h3>Yeni nesil araçlarımız hazırlanıyor.</h3>
                <p>Elektrikli veya hibrit araç talebinizi bize iletin; uygun seçeneği birlikte bulalım.</p>
                <Link className="btn btn-dark" href="/iletisim">Bize ulaşın</Link>
              </div>
            )}
          </div>
        </section>

        <section className="section section-tint">
          <div className="container">
            <div className="sect-head">
              <div>
                <span className="eyebrow eyebrow-dark">NEDEN ELEKTRİKLİ?</span>
                <h2>Geçiş yapmadan önce bilinmesi gerekenler</h2>
              </div>
            </div>
            <div className="terms-grid">
              {POINTS.map(([icon, title, text], i) => (
                <Reveal as="div" key={title} delay={i * 50}>
                  <i>{icon}</i>
                  <b>{title}</b>
                  <p>{text}</p>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      </main>
    </PublicChrome>
  );
}
