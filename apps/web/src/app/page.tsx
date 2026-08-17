import Link from 'next/link';
import PublicChrome from '@/components/PublicChrome';
import VehicleCard from '@/components/VehicleCard';
import BrandLogo from '@/components/BrandLogo';
import Icon from '@/components/Icon';
import Reveal from '@/components/Reveal';
import { db } from '@/lib/db';
import { getSettings, money, normalizePhone, whatsappUrl } from '@/lib/site';
import { iconFor } from '@/lib/fleet';

export const dynamic = 'force-dynamic';

const BENEFITS: Array<[string, string, string]> = [
  ['01', 'Bütçenizi öngörülebilir tutun', 'Günlük, haftalık ve aylık fiyat seçenekleriyle maliyetinizi baştan planlayın; sürpriz kalemlerle karşılaşmayın.'],
  ['02', 'Operasyonu tek noktadan yönetin', 'Araç seçimi, teslim planı ve kiralama iletişimini tek ekipten yürütün; süreç takibi sizde kalmasın.'],
  ['03', 'Bakımlı ve güncel araçlar', 'Periyodik bakımları yapılmış, kilometresi takip edilen ve teslimat öncesi kontrolden geçen araçlar.'],
  ['04', 'Şeffaf kiralama koşulları', 'Depozito, kilometre limiti, sigorta kapsamı ve yakıt politikası araç sayfasında açıkça yazar.'],
  ['05', 'Hızlı geri dönüş', 'Araç sayfasından WhatsApp görüşmesine iki adımda geçin; talebiniz aynı gün yanıtlansın.'],
  ['06', 'Kısa ve uzun döneme esneklik', 'Bir günlük ihtiyaçtan çok yıllık filo planına kadar ölçeklenebilir kiralama kurguları.'],
];

const STEPS: Array<[string, string, string]> = [
  ['1', 'İhtiyacınızı belirleyelim', 'Araç sınıfı, kullanım süresi, günlük kilometre ve teslim noktanızı birlikte netleştirelim.'],
  ['2', 'Size uygun seçenekleri sunalım', 'Bütçenize ve kullanım senaryonuza uyan araçları, koşullarıyla birlikte şeffaf şekilde paylaşalım.'],
  ['3', 'Sözleşmeyi tamamlayın', 'Evrak ve ödeme adımlarını hızlıca tamamlayıp aracınızı belirlenen noktada teslim alalım.'],
  ['4', 'Yol boyunca yanınızdayız', 'Kiralama süresince bakım, arıza ve değişim ihtiyaçlarınızda tek numaradan destek alın.'],
];

const COMPARE: Array<[string, string, string]> = [
  ['Başlangıç maliyeti', 'Yüksek peşin yatırım', 'Döneme yayılan sabit gider'],
  ['Araç yenileme', 'Satış ve yeniden alım süreci', 'Dönem sonunda ihtiyaca göre değişim'],
  ['Bakım & operasyon', 'İşletme kendi yönetir', 'Planlı bakım desteği'],
  ['Değer kaybı riski', 'Tamamen işletmede', 'Kiralayan tarafta'],
  ['Bütçe öngörüsü', 'Değişken giderler', 'Baştan bilinen dönemsel maliyet'],
];

const ARTICLES: Array<[string, string, string]> = [
  ['Araç kiralarken doğru sınıfı nasıl seçersiniz?', 'Kullanım amacı, yolcu sayısı ve bagaj ihtiyacına göre doğru araç sınıfını belirlemenin pratik yolu.', '/blog#dogru-arac'],
  ['Kurumsal kiralamanın bütçe avantajları', 'Satın alma ile kiralama arasında karar verirken değerlendirmeniz gereken temel kalemler.', '/blog#kurumsal-kiralama'],
  ['Uzun yola çıkmadan önce kontrol listesi', 'Güvenli ve konforlu bir yolculuk için teslim aldığınız aracı gözden geçirme rehberi.', '/blog#uzun-yol'],
];

const QUOTES: Array<[string, string, string]> = [
  ['Saha ekibimiz için altı araçlık ihtiyacımızı iki gün içinde karşıladılar. Teslimatlar planladığımız şubelere zamanında yapıldı.', 'Kemal A.', 'Lojistik firması, operasyon müdürü'],
  ['Fiyatlandırma ve kilometre limiti baştan netti; ay sonunda beklemediğimiz bir kalemle karşılaşmadık.', 'Selin T.', 'Danışmanlık şirketi, finans sorumlusu'],
  ['Aracı teslim alırken kontrol listesini birlikte geçtik. İletişim boyunca aynı kişiyle görüştük, süreç çok rahattı.', 'Onur B.', 'Bireysel kiralama'],
];

export default async function HomePage() {
  const [categories, budget, featured, s, brandRows, totalVehicles] = await Promise.all([
    db.category.findMany({ where: { isActive: true }, orderBy: { sortOrder: 'asc' } }),
    db.vehicle.findMany({
      where: { deletedAt: null, status: 'AVAILABLE', budgetFriendly: true },
      include: { category: true },
      orderBy: [{ sortOrder: 'asc' }, { dailyPrice: 'asc' }],
      take: 6,
    }),
    db.vehicle.findMany({
      where: { deletedAt: null, status: 'AVAILABLE', featured: true },
      include: { category: true },
      orderBy: { sortOrder: 'asc' },
      take: 8,
    }),
    getSettings(),
    db.vehicle.groupBy({
      by: ['brand'],
      where: { deletedAt: null, status: { not: 'PASSIVE' } },
      _count: { brand: true },
      orderBy: { brand: 'asc' },
    }),
    db.vehicle.count({ where: { deletedAt: null, status: { not: 'PASSIVE' } } }),
  ]);

  const hero = featured[0] || budget[0];
  const phone = s?.phone || '';
  const tel = `tel:${normalizePhone(phone)}`;
  const wa = whatsappUrl(
    s?.whatsapp || '',
    'Merhaba, Millwal Kurumsal Kiralama araç seçenekleri hakkında bilgi almak istiyorum.',
  );
  const cheapest = budget.reduce<number | null>(
    (min, v) => (v.dailyPrice && (min === null || v.dailyPrice < min) ? v.dailyPrice : min),
    null,
  );

  /* Marka duvari: alfabetik ilk 15 marka, kalanlar "Tum markalar" sayfasinda. */
  const BRAND_LIMIT = 15;
  const visibleBrands = brandRows.slice(0, BRAND_LIMIT);
  const hiddenBrandCount = Math.max(0, brandRows.length - BRAND_LIMIT);
  const brandVehicleCount = brandRows.reduce((total, row) => total + row._count.brand, 0);

  return (
    <PublicChrome showCampaign>
      <main>
        {/* ---------------------------------------------------------- HERO */}
        <section className="hero">
          <div className="container">
            <div className="hero-grid">
              <div className="hero-copy">
                <span className="eyebrow">MİLLWAL KURUMSAL KİRALAMA</span>
                <h1>
                  İhtiyacınıza uygun aracı <em>kolayca kiralayın.</em>
                </h1>
                <p>
                  Otomobilden ticari araca, motosikletten tekne, jetski ve ATV&apos;ye kadar geniş kiralama
                  seçenekleri. Koşullar açık, iletişim hızlı, filo bakımlı.
                </p>
                <div className="btn-row">
                  <Link className="btn btn-accent btn-lg" href="/araclar">
                    Araçları İnceleyin <span aria-hidden="true">↗</span>
                  </Link>
                  <a className="btn btn-ghost btn-lg" href={tel}>
                    <Icon name="phone" size={19} /> Hemen Ara
                  </a>
                </div>
                <div className="hero-trust">
                  <span><i>✓</i> {totalVehicles}+ araç seçeneği</span>
                  <span><i>✓</i> Şeffaf kiralama koşulları</span>
                  <span><i>✓</i> Kurumsal faturalandırma</span>
                  <span><i>✓</i> 7/24 WhatsApp destek</span>
                </div>
              </div>

              <div className="hero-visual">
                <div className="hero-ring" aria-hidden="true" />
                {hero?.mainImage && <img src={hero.mainImage} alt={`Kiralık ${hero.name}`} />}
                {hero && (
                  <div className="hero-tag hero-tag-1">
                    <i className="dot" />
                    <span>
                      <small>HEMEN KİRALANABİLİR</small>
                      <strong>{hero.name}</strong>
                    </span>
                  </div>
                )}
                {cheapest && (
                  <div className="hero-tag hero-tag-2">
                    <span>
                      <small>GÜNLÜK BAŞLANGIÇ</small>
                      <strong>{money(cheapest)}</strong>
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Hızlı arama */}
            <form className="quick-search" action="/araclar">
              <label>
                <span>Kategori</span>
                <select name="kategori" defaultValue="">
                  <option value="">Tüm kategoriler</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.slug}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span>Vites</span>
                <select name="vites" defaultValue="">
                  <option value="">Farketmez</option>
                  <option>Otomatik</option>
                  <option>Manuel</option>
                </select>
              </label>
              <label>
                <span>Yakıt</span>
                <select name="yakit" defaultValue="">
                  <option value="">Farketmez</option>
                  <option>Benzin</option>
                  <option>Dizel</option>
                  <option>Hibrit</option>
                </select>
              </label>
              <label>
                <span>Anahtar kelime</span>
                <input type="text" name="ara" placeholder="Marka, model veya araç adı" />
              </label>
              <button className="btn btn-dark">Araç Ara</button>
            </form>
          </div>
        </section>

        {/* ---------------------------------------------------- KATEGORİLER */}
        <section className="section-sm section-line" id="kategoriler">
          <div className="container">
            <div className="sect-head">
              <div>
                <span className="eyebrow eyebrow-dark">KATEGORİLER</span>
                <h2>Ne kiralamak istersiniz?</h2>
              </div>
              <Link className="link-more" href="/araclar">
                Tüm filoyu gör <span aria-hidden="true">→</span>
              </Link>
            </div>
            <div className="cat-rail">
              {categories.map((c, i) => (
                <Reveal as="div" key={c.id} delay={i * 45}>
                  <Link className="cat-card" href={`/kategori/${c.slug}`}>
                    <i>{iconFor(c.slug, c.name)}</i>
                    <b>{c.shortName || c.name.replace(/^Ticari — /, '')}</b>
                    <small>{c.description?.slice(0, 42)}</small>
                  </Link>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ------------------------------------------------ UYGUN FİYATLILAR */}
        {budget.length > 0 && (
          <section className="section" id="uygun-fiyatli">
            <div className="container">
              <div className="sect-head">
                <div>
                  <span className="eyebrow eyebrow-dark">AVANTAJLI SEÇİMLER</span>
                  <h2>Uygun fiyatlı kiralık araçlar</h2>
                  <p className="lead">
                    Bütçenizi zorlamadan, bakımlı ve güncel araçlarla yola çıkın. Fiyatlar günlük kullanım
                    içindir; uzun dönemde ek avantajlar sunulur.
                  </p>
                </div>
                <Link className="link-more" href="/araclar?sirala=fiyat-artan">
                  Tümünü gör <span aria-hidden="true">→</span>
                </Link>
              </div>
              <div className="vehicle-grid">
                {budget.map((v, i) => (
                  <Reveal key={v.id} delay={i * 55}>
                    <VehicleCard v={v} phone={phone} whatsapp={s?.whatsapp || ''} />
                  </Reveal>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ---------------------------------------------------------- SÜREÇ */}
        <section className="section section-tint">
          <div className="container">
            <div className="sect-head">
              <div>
                <span className="eyebrow eyebrow-dark">4 ADIMDA KİRALAMA</span>
                <h2>Süreci sizin için sadeleştirdik.</h2>
              </div>
              <Link className="link-more" href="/filo-kiralama">
                Detaylı inceleyin <span aria-hidden="true">→</span>
              </Link>
            </div>
            <div className="steps">
              {STEPS.map(([n, title, text], i) => (
                <Reveal as="article" key={n} delay={i * 70}>
                  <b>{n}</b>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ---------------------------------------------------- KURUMSAL BANT */}
        <section className="band">
          <div className="container band-grid">
            <div>
              <span className="eyebrow">KURUMSAL ÇÖZÜMLER</span>
              <h2>Filo ihtiyacınız için tek noktadan destek.</h2>
              <p>
                İşletmenizin araç ihtiyacını, kiralama dönemini ve operasyon planını birlikte oluşturalım.
                Satın alma yükü ve değer kaybı riski olmadan, ölçeklenebilir bir filoya sahip olun.
              </p>
              <div className="btn-row">
                <Link className="btn btn-accent" href="/filo-kiralama">
                  Filo Kiralamayı Keşfedin
                </Link>
                <Link className="btn btn-ghost" href="/filo-yonetimi">
                  Filo Yönetimi
                </Link>
              </div>
            </div>
            <div className="band-metrics">
              <div>
                <strong>{categories.length}</strong>
                <span>araç kategorisi</span>
              </div>
              <div>
                <strong>{totalVehicles}+</strong>
                <span>kiralanabilir araç</span>
              </div>
              <div>
                <strong>3</strong>
                <span>esnek fiyat dönemi</span>
              </div>
              <div>
                <strong>7/24</strong>
                <span>WhatsApp iletişim</span>
              </div>
            </div>
          </div>
        </section>

        {/* -------------------------------------------------- ÖNE ÇIKANLAR */}
        {featured.length > 0 && (
          <section className="section">
            <div className="container">
              <div className="sect-head">
                <div>
                  <span className="eyebrow eyebrow-dark">ÖNE ÇIKANLAR</span>
                  <h2>Öne çıkan kiralık araçlar</h2>
                </div>
                <Link className="link-more" href="/araclar">
                  Tüm araçlar <span aria-hidden="true">→</span>
                </Link>
              </div>
              <div className="vehicle-grid vehicle-grid-4">
                {featured.map((v, i) => (
                  <Reveal key={v.id} delay={i * 45}>
                    <VehicleCard v={v} phone={phone} whatsapp={s?.whatsapp || ''} />
                  </Reveal>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* --------------------------------------------------------- AVANTAJ */}
        <section className="section dark-section">
          <div className="container">
            <div className="sect-head">
              <div>
                <span className="eyebrow">MILLWAL FARKI</span>
                <h2>Kurumsal kiralamanın avantajları.</h2>
              </div>
              <p className="lead" style={{ color: '#a8bccc' }}>
                İhtiyacınızı anlayan, kolay ulaşılabilir ve koşulları baştan paylaşan bir hizmet yaklaşımı.
              </p>
            </div>
            <div className="why-grid">
              {BENEFITS.map(([n, title, text]) => (
                <div key={n}>
                  <span>{n}</span>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ----------------------------------------------------- MARKA VITRINI */}
        {brandRows.length > 0 && (
          <section className="section-sm brand-showcase">
            <div className="container">
              <div className="brand-showcase-head">
                <div className="brand-showcase-copy">
                  <span className="eyebrow eyebrow-dark">MARKALAR</span>
                  <h2>Doğru araç, güçlü markalarla başlar.</h2>
                  <p className="lead">
                    Farklı kullanım ihtiyaçlarına uygun, özenle seçilmiş marka portföyümüzü inceleyin. Filomuzdaki
                    tüm araçlar bakımlı, sigortalı ve kullanıma hazır olarak teslim edilir.
                  </p>
                </div>

                <div className="brand-showcase-aside">
                  <div className="brand-overview" aria-label="Filo özeti">
                    <div>
                      <strong>{brandRows.length}</strong>
                      <span>Seçkin marka</span>
                    </div>
                    <div>
                      <strong>{brandVehicleCount}</strong>
                      <span>Aktif araç</span>
                    </div>
                  </div>
                  <Link className="brand-showcase-cta" href="/markalar">
                    Tüm markaları inceleyin <span aria-hidden="true">→</span>
                  </Link>
                </div>
              </div>

              <div className="brand-directory">
                {visibleBrands.map((row) => (
                  <Link key={row.brand} href={`/araclar?marka=${encodeURIComponent(row.brand)}`}>
                    <span className="brand-directory-mark">
                      <BrandLogo name={row.brand} size={26} />
                    </span>
                    <span className="brand-directory-body">
                      <strong>{row.brand}</strong>
                      <small>{row._count.brand} araç</small>
                    </span>
                    <span className="brand-directory-go" aria-hidden="true">↗</span>
                  </Link>
                ))}

                {hiddenBrandCount > 0 && (
                  <Link className="brand-directory-more" href="/markalar">
                    <span className="brand-directory-more-icon" aria-hidden="true">+</span>
                    <span className="brand-directory-body">
                      <strong>+{hiddenBrandCount} marka daha</strong>
                      <small>Portföyün tamamını görün</small>
                    </span>
                    <span className="brand-directory-go" aria-hidden="true">→</span>
                  </Link>
                )}
              </div>
            </div>
          </section>
        )}

        {/* --------------------------------------------------- KARŞILAŞTIRMA */}
        <section className="section section-tint">
          <div className="container">
            <div className="sect-head">
              <div>
                <span className="eyebrow eyebrow-dark">KARAR DESTEĞİ</span>
                <h2>Satın alma mı, kiralama mı?</h2>
              </div>
              <p className="lead">
                Kiralama; sermayeyi araca bağlamadan, ihtiyaca göre araç kullanmak isteyen işletmelere
                esneklik sağlar.
              </p>
            </div>
            <Reveal className="compare">
              <div className="compare-row compare-head">
                <span>Karşılaştırma</span>
                <span>Satın Alma</span>
                <span>Kurumsal Kiralama</span>
              </div>
              {COMPARE.map(([label, buy, rent]) => (
                <div className="compare-row" key={label}>
                  <span>{label}</span>
                  <span>{buy}</span>
                  <span>{rent}</span>
                </div>
              ))}
            </Reveal>
          </div>
        </section>

        {/* ------------------------------------------------------- REFERANS */}
        <section className="section">
          <div className="container">
            <div className="sect-head">
              <div>
                <span className="eyebrow eyebrow-dark">DENEYİMLER</span>
                <h2>Bizimle çalışanlar ne diyor?</h2>
              </div>
              <Link className="link-more" href="/referanslar">
                Hizmet yaklaşımımız <span aria-hidden="true">→</span>
              </Link>
            </div>
            <div className="quotes">
              {QUOTES.map(([quote, name, role], i) => (
                <Reveal as="figure" key={name} delay={i * 70}>
                  <div className="stars" aria-label="5 üzerinden 5">★★★★★</div>
                  <blockquote>“{quote}”</blockquote>
                  <figcaption>
                    <i>{name.slice(0, 1)}</i>
                    <span>
                      <b>{name}</b>
                      <small>{role}</small>
                    </span>
                  </figcaption>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ----------------------------------------------------------- BLOG */}
        <section className="section section-tint">
          <div className="container">
            <div className="sect-head">
              <div>
                <span className="eyebrow eyebrow-dark">BİLGİ MERKEZİ</span>
                <h2>Kiralama ve araç rehberleri</h2>
              </div>
              <Link className="link-more" href="/blog">
                Tüm yazılar <span aria-hidden="true">→</span>
              </Link>
            </div>
            <div className="article-grid">
              {ARTICLES.map(([title, text, href], i) => (
                <Reveal as="article" key={title} delay={i * 70}>
                  <span>REHBER · {String(i + 1).padStart(2, '0')}</span>
                  <h3>{title}</h3>
                  <p>{text}</p>
                  <Link className="link-more" href={href}>
                    Detaylı inceleyin <span aria-hidden="true">→</span>
                  </Link>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ------------------------------------------------------------ CTA */}
        <section className="section">
          <div className="container">
            <div className="cta-box">
              <div>
                <span className="eyebrow">BİRLİKTE BULALIM</span>
                <h2>Aradığınız aracı bulamadınız mı?</h2>
                <p>
                  İhtiyacınızı bize iletin; kullanım senaryonuza uygun aracı ve kiralama dönemini birlikte
                  belirleyelim.
                </p>
              </div>
              <div className="btn-row">
                <a className="btn btn-accent" href={tel}>
                  ☎ Bizi Arayın
                </a>
                <a className="btn btn-whatsapp" href={wa} target="_blank" rel="noreferrer">
                  WhatsApp&apos;tan Yazın
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>
    </PublicChrome>
  );
}
