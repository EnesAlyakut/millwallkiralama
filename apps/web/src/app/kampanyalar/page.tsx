import Link from 'next/link';
import PublicChrome from '@/components/PublicChrome';
import VehicleCard from '@/components/VehicleCard';
import Reveal from '@/components/Reveal';
import { db } from '@/lib/db';
import { getSettings, whatsappUrl } from '@/lib/site';

export const dynamic = 'force-dynamic';
export const metadata = {
  title: 'Kiralama Kampanyaları',
  description: 'Dönemsel avantajlı kiralama teklifleri ve uzun dönem fırsatları.',
};

export default async function Page() {
  const [s, deals] = await Promise.all([
    getSettings(),
    db.vehicle.findMany({
      where: { deletedAt: null, status: 'AVAILABLE', budgetFriendly: true },
      include: { category: true },
      orderBy: { dailyPrice: 'asc' },
      take: 6,
    }),
  ]);

  const wa = whatsappUrl(s?.whatsapp || '', 'Merhaba, güncel kiralama kampanyaları hakkında bilgi almak istiyorum.');

  return (
    <PublicChrome>
      <main>
        <section className="page-hero">
          <div className="container">
            <nav className="crumbs">
              <Link href="/">Ana Sayfa</Link>
              <span className="sep">/</span>
              <strong>Kampanyalar</strong>
            </nav>
            <span className="eyebrow">MILLWAL FIRSATLARI</span>
            <h1>Kiralama kampanyaları</h1>
            <p>
              Dönemsel avantajlar ve ihtiyacınıza özel kiralama teklifleri için ekibimizle doğrudan iletişime
              geçin.
            </p>
          </div>
        </section>

        <section className="section">
          <div className="container campaign-list">
            <article>
              <img src={s?.campaignImageUrl || '/og.png'} alt="Kiralama kampanyası araç görseli" />
              <div>
                <span>ÖZEL TEKLİF</span>
                <h2>{s?.campaignTitle || 'İhtiyacınıza uygun aracı birlikte belirleyelim.'}</h2>
                <p>{s?.campaignText}</p>
                <a className="btn btn-whatsapp" href={wa} target="_blank" rel="noreferrer">
                  {s?.campaignButtonText || "WhatsApp'tan Bilgi Al"}
                </a>
              </div>
            </article>

            <article className="campaign-mini">
              <div>
                <span>UZUN DÖNEM</span>
                <h2>Kurumsal filo ihtiyacınız mı var?</h2>
                <p>
                  12 ay ve üzeri kiralamalarda araç sınıfına göre özel fiyatlandırma yapılır; bakım ve sigorta
                  paket içinde sunulur.
                </p>
                <Link className="btn btn-dark" href="/filo-kiralama">Filo kiralamayı keşfedin</Link>
              </div>
            </article>
          </div>
        </section>

        {deals.length > 0 && (
          <section className="section section-tint">
            <div className="container">
              <div className="sect-head">
                <div>
                  <span className="eyebrow eyebrow-dark">AVANTAJLI ARAÇLAR</span>
                  <h2>Bu dönemin uygun fiyatlı seçenekleri</h2>
                </div>
                <Link className="link-more" href="/araclar?sirala=fiyat-artan">
                  Tümünü gör <span aria-hidden="true">→</span>
                </Link>
              </div>
              <div className="vehicle-grid">
                {deals.map((v, i) => (
                  <Reveal key={v.id} delay={i * 40}>
                    <VehicleCard v={v} phone={s?.phone || ''} whatsapp={s?.whatsapp || ''} />
                  </Reveal>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>
    </PublicChrome>
  );
}
