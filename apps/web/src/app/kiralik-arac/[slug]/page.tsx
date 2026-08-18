import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import PublicChrome from '@/components/PublicChrome';
import VehicleCard from '@/components/VehicleCard';
import VehicleGallery from '@/components/VehicleGallery';
import RentalRequestForm from '@/components/RentalRequestForm';
import Reveal from '@/components/Reveal';
import Icon, { type IconName } from '@/components/Icon';
import { db } from '@/lib/db';
import {
  decimal, getSettings, money, normalizePhone, num,
  statusLabel, statusTone, toList, whatsappUrl,
} from '@/lib/site';

export const dynamic = 'force-dynamic';

async function getVehicle(slug: string) {
  return db.vehicle.findFirst({
    where: { slug, deletedAt: null, status: { not: 'PASSIVE' } },
    include: { category: true, images: { orderBy: { sortOrder: 'asc' } } },
  });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const v = await getVehicle(slug);
  if (!v) return {};

  const title = v.seoTitle || `Kiralık ${v.name}`;
  const description =
    v.seoDescription ||
    `${v.shortDescription || v.name} — ${[v.year, v.fuelType, v.transmission].filter(Boolean).join(', ')}. Kiralama koşulları, teknik özellikler ve fiyat bilgisi için Millwal ile iletişime geçin.`;
  const images = v.mainImage ? [{ url: v.mainImage }] : [];

  return {
    title,
    description,
    alternates: { canonical: `/kiralik-arac/${v.slug}` },
    openGraph: { title, description, images, type: 'website' },
    twitter: { card: 'summary_large_image', title, description, images: v.mainImage ? [v.mainImage] : [] },
  };
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const v = await getVehicle(slug);
  if (!v) notFound();

  const RELATED_COUNT = 4;

  const [s, sameCategory] = await Promise.all([
    getSettings(),
    db.vehicle.findMany({
      where: { categoryId: v.categoryId, id: { not: v.id }, deletedAt: null, status: 'AVAILABLE' },
      include: { category: true },
      orderBy: { sortOrder: 'asc' },
      take: RELATED_COUNT,
    }),
  ]);

  /* Ayni kategoriden yeterli arac yoksa filodaki diger araclarla tamamla. */
  const missing = RELATED_COUNT - sameCategory.length;
  const filler = missing > 0
    ? await db.vehicle.findMany({
        where: {
          id: { not: v.id, notIn: sameCategory.map((r) => r.id) },
          categoryId: { not: v.categoryId },
          deletedAt: null,
          status: 'AVAILABLE',
        },
        include: { category: true },
        orderBy: { sortOrder: 'asc' },
        take: missing,
      })
    : [];
  const related = [...sameCategory, ...filler];

  const message = `Merhaba, web sitenizdeki ${v.name} (${v.year || ''}) aracı için kiralama bilgisi ve fiyat teklifi almak istiyorum.`;
  const tel = `tel:${normalizePhone(s?.phone || '')}`;
  const wa = whatsappUrl(s?.whatsapp || '', message);

  /* Yonetim panelinde "Ic mekan" olarak isaretlenen gorseller. */
  const interiorUrls: string[] = (() => {
    try {
      const list = v.interiorImages ? JSON.parse(v.interiorImages) : [];
      return Array.isArray(list) ? list.filter((x): x is string => typeof x === 'string') : [];
    } catch {
      return [];
    }
  })();

  const isInterior = (url: string) => interiorUrls.includes(url);

  /* Galeride yalnizca dis gorseller listelenir; ic mekan kapilarin arkasinda gosterilir. */
  const photos = [
    ...(v.mainImage && !isInterior(v.mainImage) ? [{ url: v.mainImage, alt: `${v.name} ana görsel` }] : []),
    ...v.images
      .filter((i) => i.imageUrl !== v.mainImage && !isInterior(i.imageUrl))
      .map((i) => ({ url: i.imageUrl, alt: i.alt })),
  ];

  const interiorPhotos = interiorUrls.map((url) => ({
    url,
    alt: v.images.find((i) => i.imageUrl === url)?.alt || `${v.name} iç mekân`,
  }));

  /* ---------------------------------------------------- Özellik grupları */
  const engineSpecs: Array<[string, string | null]> = [
    ['Motor', v.engine],
    ['Motor hacmi', num(v.engineVolume, 'cc')],
    ['Motor gücü', num(v.enginePower, 'HP')],
    ['Tork', num(v.torque, 'Nm')],
    ['Yakıt türü', v.fuelType],
    ['Vites', [v.transmission, v.gearCount ? `${v.gearCount} ileri` : null].filter(Boolean).join(' · ') || null],
    ['Çekiş', v.driveType],
    ['0-100 km/s', decimal(v.acceleration, 'sn')],
    ['Azami hız', num(v.topSpeed, 'km/s')],
  ];

  const bodySpecs: Array<[string, string | null]> = [
    ['Kasa tipi', v.bodyType],
    ['Segment', v.segment],
    ['Model yılı', v.year ? String(v.year) : null],
    ['Renk', v.color],
    ['Koltuk sayısı', v.seatCount ? `${v.seatCount} kişi` : null],
    ['Kapı sayısı', v.doorCount ? `${v.doorCount} kapı` : null],
    ['Bagaj hacmi', v.trunkCapacity ? `${v.trunkCapacity} L` : v.luggageCapacity],
    ['Uzunluk', num(v.lengthMm, 'mm')],
    ['Genişlik', num(v.widthMm, 'mm')],
    ['Yükseklik', num(v.heightMm, 'mm')],
    ['Boş ağırlık', num(v.curbWeight, 'kg')],
  ];

  const consumptionSpecs: Array<[string, string | null]> = [
    ['Ortalama tüketim', decimal(v.fuelConsumption, 'lt/100 km')],
    ['Yakıt deposu', num(v.tankCapacity, 'lt')],
    ['Batarya kapasitesi', decimal(v.batteryCapacity, 'kWh')],
    ['Elektrikli menzil', num(v.electricRange, 'km')],
    ['Şarj süresi', v.chargeTime],
    ['Emisyon sınıfı', v.emissionClass],
    ['CO₂ salımı', num(v.co2Emission, 'g/km')],
  ];

  const comfortFlags: Array<[string, boolean]> = [
    ['Klima', v.hasAirConditioning],
    ['Navigasyon', v.hasNavigation],
    ['Bluetooth', v.hasBluetooth],
    ['Park sensörü', v.hasParkingSensor],
    ['Geri görüş kamerası', v.hasReverseCamera],
    ['Hız sabitleyici', v.hasCruiseControl],
    ['Sunroof', v.hasSunroof],
    ['Deri döşeme', v.hasLeatherSeats],
    ['ISOFIX bağlantı', v.hasIsofix],
  ];
  const activeComfort = comfortFlags.filter(([, on]) => on).map(([label]) => label);

  /**
   * Serbest metin donanım listesi ile işaretli donanım kutuları çakışabiliyor
   * (ör. "Park sensörü" hem yazılmış hem işaretlenmiş olabilir). Tekrarları temizler.
   */
  const uniqueList = (items: string[]) => {
    const seen = new Set<string>();
    return items
      .map((item) => item.trim())
      .filter((item) => {
        if (!item) return false;
        const key = item.toLocaleLowerCase('tr-TR');
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
  };

  const featureGroups = ([
    ['shield', 'Güvenlik donanımı', uniqueList(toList(v.safetyFeatures))],
    ['seat', 'Konfor donanımı', uniqueList([...toList(v.comfortFeatures), ...activeComfort])],
    ['device', 'Teknoloji & multimedya', uniqueList(toList(v.techFeatures))],
    ['sparkle', 'Dış donanım', uniqueList(toList(v.exteriorFeatures))],
  ] as Array<[IconName, string, string[]]>).filter(([, , items]) => items.length > 0);

  const prices: Array<[string, number | null, string]> = [
    ['Günlük', v.dailyPrice, 'gün'],
    ['Haftalık', v.weeklyPrice, 'hafta'],
    ['Aylık', v.monthlyPrice, 'ay'],
  ];
  const hasPriceTable = v.showPrice && prices.some(([, p]) => p);

  /* -------------------------------------------------- Panel: hızlı bilgi */
  const quickFacts = ([
    ['calendar', 'Model yılı', v.year ? String(v.year) : null],
    ['fuel', 'Yakıt', v.fuelType],
    ['gearbox', 'Vites', v.transmission],
    ['users', 'Koltuk', v.seatCount ? `${v.seatCount} kişi` : null],
  ] as Array<[IconName, string, string | null]>).filter(([, , value]) => value);

  /* --------------------------------------------- Panel: fiyat alt satırı */
  const priceFacts = ([
    ['receipt', v.vatIncluded ? 'KDV dahil' : 'KDV hariç'],
    ['road', v.dailyKmLimit ? `Günlük ${v.dailyKmLimit} km` : 'Esnek km paketi'],
    ['shield', 'Kasko ve trafik sigortası dahil'],
  ] as Array<[IconName, string]>);

  /* ------------------------------------------------- Panel: künye satırı */
  const metaRows: Array<[string, string]> = [
    ['Araç kodu', v.slug.toLocaleUpperCase('tr-TR')],
    ...(v.brand ? ([['Marka / model', [v.brand, v.model].filter(Boolean).join(' ')]] as Array<[string, string]>) : []),
    ...(v.enginePower ? ([['Motor gücü', `${v.enginePower} HP`]] as Array<[string, string]>) : []),
    ...(v.deposit ? ([['Depozito', money(v.deposit)]] as Array<[string, string]>) : []),
    ['Minimum kiralama', `${v.minimumRentalDays} gün`],
  ];

  /* ------------------------------------------- Sol kolon: ozet teknik kunye */
  const highlightSpecs = ([
    ['Motor gücü', num(v.enginePower, 'HP')],
    ['Tork', num(v.torque, 'Nm')],
    ['0-100 km/s', decimal(v.acceleration, 'sn')],
    ['Azami hız', num(v.topSpeed, 'km/s')],
    ['Ortalama tüketim', decimal(v.fuelConsumption, 'lt/100 km')],
    ['Bagaj hacmi', v.trunkCapacity ? `${v.trunkCapacity} L` : v.luggageCapacity],
    ['Kasa tipi', v.bodyType],
    ['Çekiş', v.driveType],
  ] as Array<[string, string | null]>)
    .filter(([, value]) => value)
    .slice(0, 6);

  const steps: Array<[string, string, string]> = [
    ['01', 'Talep', 'Formu doldurun, arayın ya da WhatsApp’tan yazın.'],
    ['02', 'Teyit', 'Müsaitlik, süre ve fiyatı birlikte netleştirelim.'],
    ['03', 'Sözleşme', 'Evraklar hazırlanır, kiralama sözleşmesi imzalanır.'],
    ['04', 'Teslim', 'Aracınız belirlediğiniz noktada teslim edilir.'],
  ];

  /* ------------------------------------------ Galeri: kabin (ic donanim) */
  const cabinFlags = ([
    ['snow', 'Klima', v.hasAirConditioning],
    ['navigation', 'Navigasyon', v.hasNavigation],
    ['bluetooth', 'Bluetooth', v.hasBluetooth],
    ['camera', 'Geri görüş kamerası', v.hasReverseCamera],
    ['sun', 'Sunroof', v.hasSunroof],
    ['seat', 'Deri döşeme', v.hasLeatherSeats],
    ['users', 'ISOFIX bağlantı', v.hasIsofix],
  ] as Array<[IconName, string, boolean]>).filter(([, , on]) => on);

  const cabinItems: Array<{ icon: IconName; label: string; value: string }> = [
    ...(v.seatCount ? [{ icon: 'users' as IconName, label: 'Koltuk', value: `${v.seatCount} kişi` }] : []),
    ...(v.doorCount ? [{ icon: 'door' as IconName, label: 'Kapı', value: `${v.doorCount} kapı` }] : []),
    ...(v.trunkCapacity || v.luggageCapacity
      ? [{
          icon: 'luggage' as IconName,
          label: 'Bagaj',
          value: v.trunkCapacity ? `${v.trunkCapacity} L` : (v.luggageCapacity as string),
        }]
      : []),
    ...(v.transmission ? [{ icon: 'gearbox' as IconName, label: 'Vites', value: v.transmission }] : []),
    ...cabinFlags.map(([icon, label]) => ({ icon, label: 'Donanım', value: label })),
  ].slice(0, 6);

  /* Eger ic mekan fotografi yoksa bile detaylari gostermek icin dis gorseli kullaniyoruz. */
  const cabin = {
    images: interiorPhotos.length > 0 ? interiorPhotos : (photos.length > 0 ? [photos[0]] : []),
    items: cabinItems,
    note: null,
  };

  const assurances = ([
    ['shield', 'Sigorta güvencesi', 'Kasko ve zorunlu trafik sigortası fiyata dahildir.'],
    ['wrench', 'Bakım ve servis', 'Periyodik bakım ile lastik giderleri bize aittir.'],
    ['support', '7/24 yol yardımı', 'Arıza durumunda ikame araç desteği sağlanır.'],
  ] as Array<[IconName, string, string]>);

  const terms = ([
    ['user', 'Sürücü koşulları', `En az ${v.minDriverAge} yaş ve ${v.minLicenseYears} yıllık ehliyet gereklidir.${v.additionalDriverAllowed ? ' Ek sürücü tanımlanabilir.' : ' Ek sürücü tanımlanmaz.'}`],
    ['road', 'Kilometre limiti', v.dailyKmLimit ? `Günlük ${v.dailyKmLimit} km dahildir.${v.extraKmPrice ? ` Aşım durumunda km başına ${money(v.extraKmPrice)} uygulanır.` : ''}${v.monthlyKmLimit ? ` Aylık kiralamalarda ${num(v.monthlyKmLimit, 'km')} limit geçerlidir.` : ''}` : 'Kilometre limiti kiralama dönemine göre belirlenir.'],
    ['card', 'Depozito', v.deposit ? `Kiralama başlangıcında ${money(v.deposit)} depozito alınır, iade sırasında geri ödenir.` : 'Depozito tutarı araç sınıfına ve kiralama dönemine göre belirlenir.'],
    ['shield', 'Sigorta kapsamı', v.insuranceInfo || 'Zorunlu trafik sigortası ve kasko kapsamı standart olarak sunulur; muafiyet detayları sözleşmede yer alır.'],
    ['fuel', 'Yakıt politikası', v.fuelPolicy || 'Araç size teslim edildiği yakıt seviyesiyle iade edilir.'],
    ['pin', 'Teslimat', v.deliveryInfo || (v.cityDeliveryFree ? 'Şehir içi belirlenen noktalara ücretsiz teslimat yapılır.' : 'Teslimat noktası ve ücreti görüşme sırasında netleştirilir.')],
    ['calendar', 'Minimum süre', `En az ${v.minimumRentalDays} gün kiralama yapılabilir.`],
    ['refresh', 'İptal & değişiklik', v.cancellationPolicy || 'Kiralama başlangıcından önce yapılan değişiklik ve iptal talepleri ücretsiz değerlendirilir.'],
  ] as Array<[IconName, string, string]>);

  const faqs: Array<[string, string]> = [
    [`${v.name} için rezervasyon nasıl yapılır?`, 'Sayfadaki talep formunu doldurabilir, telefonla arayabilir veya WhatsApp üzerinden yazabilirsiniz. Ekibimiz müsaitlik ve koşulları teyit ettikten sonra rezervasyonunuzu kesinleştirir.'],
    ['Kiralama için hangi belgeler gerekiyor?', `Geçerli sürücü belgesi, kimlik ve kiralayan adına kredi kartı gereklidir. Kurumsal kiralamalarda ayrıca vergi levhası ve imza sirküleri talep edilir. Sürücünün en az ${v.minDriverAge} yaşında ve ${v.minLicenseYears} yıllık ehliyet sahibi olması gerekir.`],
    ['Fiyatlara neler dahil?', `Belirtilen tutarlar${v.vatIncluded ? ' KDV dahil' : ' KDV hariç'} kiralama bedelidir; zorunlu sigorta ve periyodik bakım kapsam içindedir. Yakıt, köprü/otoyol geçişleri${v.hgsIncluded ? ' (HGS cihazı araçta mevcuttur)' : ''} ve trafik cezaları kiracıya aittir.`],
    ['Aracı şehir dışına çıkarabilir miyim?', 'Evet. Yurt içi kullanımda kısıtlama yoktur; yurt dışı çıkışları için önceden yazılı izin alınması gerekir. Uzun mesafeli kullanımlarda kilometre paketinizi baştan planlamanızı öneririz.'],
    ['Kiralama süresini uzatabilir miyim?', 'Süre bitiminden önce bize bildirmeniz halinde araç müsaitse uzatma yapılabilir. Uzatma talepleri en az 24 saat önce iletildiğinde daha hızlı sonuçlanır.'],
  ];

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: v.name,
    description: v.shortDescription || v.description || v.name,
    ...(v.mainImage ? { image: v.mainImage } : {}),
    brand: { '@type': 'Brand', name: v.brand },
    category: v.category.name,
    ...(v.showPrice && v.dailyPrice
      ? {
          offers: {
            '@type': 'Offer',
            price: v.dailyPrice,
            priceCurrency: 'TRY',
            availability:
              v.status === 'AVAILABLE'
                ? 'https://schema.org/InStock'
                : 'https://schema.org/OutOfStock',
          },
        }
      : {}),
  };

  const faqLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(([q, a]) => ({
      '@type': 'Question',
      name: q,
      acceptedAnswer: { '@type': 'Answer', text: a },
    })),
  };

  return (
    <PublicChrome>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />

      <main>
        <div className="container">
          <nav className="crumbs" aria-label="Sayfa yolu">
            <Link href="/">Ana Sayfa</Link>
            <span className="sep">/</span>
            <Link href="/araclar">Kiralık Araçlar</Link>
            <span className="sep">/</span>
            <Link href={`/kategori/${v.category.slug}`}>{v.category.name}</Link>
            <span className="sep">/</span>
            <strong>{v.name}</strong>
          </nav>
        </div>

        {/* ------------------------------------------------- ÜST: GALERİ + ÖZET */}
        <section className="container detail-top">
          <div className="detail-grid">
            <div className="detail-media">
              <VehicleGallery photos={photos} name={v.name} cabin={cabin} videoUrl={v.videoUrl} />
              {v.slug === 'honda-cbf-250' && (
                <p className="gallery-credit">
                  Gerçek araç fotoğrafları:{' '}
                  <a href="https://commons.wikimedia.org/wiki/Category:Honda_CBX_250" target="_blank" rel="noreferrer">
                    Joelkaula / Wikimedia Commons
                  </a>{' '}
                  · <a href="https://creativecommons.org/licenses/by-sa/4.0/" target="_blank" rel="noreferrer">CC BY-SA 4.0</a>
                </p>
              )}
            </div>

            <div className="detail-media-bottom">
              <ul className="detail-assurance">
                {assurances.map(([icon, title, text]) => (
                  <li key={title}>
                    <span className="da-icon">
                      <Icon name={icon} size={18} />
                    </span>
                    <div>
                      <b>{title}</b>
                      <small>{text}</small>
                    </div>
                  </li>
                ))}
              </ul>

              {(v.description || v.highlightText) && (
                <Reveal className="detail-about">
                  <span className="eyebrow eyebrow-dark">ARAÇ HAKKINDA</span>
                  <h2>
                    {[v.brand, v.model].filter(Boolean).join(' ')} neden tercih ediliyor?
                  </h2>
                  {v.description && <p>{v.description}</p>}
                  {v.highlightText && <p>{v.highlightText}</p>}
                </Reveal>
              )}

              {highlightSpecs.length > 0 && (
                <div className="detail-spec-strip">
                  <h3>
                    <Icon name="gauge" size={17} /> Öne çıkan teknik değerler
                  </h3>
                  <div>
                    {highlightSpecs.map(([label, value]) => (
                      <div key={label}>
                        <small>{label}</small>
                        <b>{value}</b>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="detail-steps">
                <h3>
                  <Icon name="checklist" size={17} /> Kiralama nasıl ilerliyor?
                </h3>
                <ol>
                  {steps.map(([no, title, text]) => (
                    <li key={no}>
                      <span>{no}</span>
                      <div>
                        <b>{title}</b>
                        <small>{text}</small>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            </div>

            <aside className="detail-summary" aria-label="Araç özeti ve iletişim">
              <div className="detail-flags">
                <span className="chip chip-accent">{v.category.name}</span>
                {v.badge && <span className="badge badge-accent">{v.badge}</span>}
                <span className="chip chip-line">
                  <i className={`dot dot-${statusTone(v.status)}`} /> {statusLabel(v.status)}
                </span>
              </div>

              <h1>{v.name}</h1>
              {v.shortDescription && <p className="detail-lede">{v.shortDescription}</p>}

              {quickFacts.length > 0 && (
                <dl className="detail-quick">
                  {quickFacts.map(([icon, label, value]) => (
                    <div key={label}>
                      <span className="dq-icon">
                        <Icon name={icon} size={18} />
                      </span>
                      <div>
                        <dt>{label}</dt>
                        <dd>{value}</dd>
                      </div>
                    </div>
                  ))}
                </dl>
              )}

              {v.showPrice && v.dailyPrice ? (
                <div className="price-box">
                  {v.mainImage && <img className="price-bg" src={v.mainImage} alt="" aria-hidden="true" />}
                  <div className="price-box-head">
                    <small>Günlük kiralama bedeli</small>
                    <span className="price-vat">{v.vatIncluded ? 'KDV DAHİL' : 'KDV HARİÇ'}</span>
                  </div>
                  <strong>
                    {money(v.dailyPrice)} <span>/ gün</span>
                  </strong>
                  <ul className="price-facts">
                    {priceFacts.map(([icon, text]) => (
                      <li key={text}>
                        <Icon name={icon} size={15} /> {text}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <div className="price-box price-box-call">
                  {v.mainImage && <img className="price-bg" src={v.mainImage} alt="" aria-hidden="true" />}
                  <div className="price-box-head">
                    <small>Fiyatlandırma</small>
                    <span className="price-vat">TEKLİFE ÖZEL</span>
                  </div>
                  <strong>Size özel teklif</strong>
                  <ul className="price-facts">
                    <li><Icon name="clock" size={15} /> Aynı gün dönüş</li>
                    <li><Icon name="document" size={15} /> Yazılı teklif</li>
                    <li><Icon name="shield" size={15} /> Sigorta dahil</li>
                  </ul>
                </div>
              )}

              <div className="detail-actions">
                <a className="btn btn-accent btn-block btn-lg detail-call" href={tel}>
                  <Icon name="phone" size={20} />
                  <span>
                    Hemen Ara
                    {s?.phone && <b>{s.phone}</b>}
                  </span>
                </a>
                <div className="detail-actions-row">
                  <a className="btn btn-whatsapp" href={wa} target="_blank" rel="noreferrer">
                    <Icon name="whatsapp" size={18} /> WhatsApp
                  </a>
                  <a className="btn btn-outline" href="#talep">
                    <Icon name="document" size={18} /> Teklif Formu
                  </a>
                </div>
              </div>

              <dl className="detail-meta">
                {metaRows.map(([label, value]) => (
                  <div key={label}>
                    <dt>{label}</dt>
                    <dd>{value}</dd>
                  </div>
                ))}
              </dl>

              <p className="detail-fineprint">
                Belirtilen tutarlar bilgilendirme amaçlıdır. Nihai fiyat; kiralama süresi, kilometre paketi ve
                teslim noktasına göre tarafınıza iletilecek yazılı teklifte netleşir.
              </p>
            </aside>
          </div>
        </section>

        {/* ---------------------------------------------------- TEKNİK BİLGİ */}
        <section className="section section-tint">
          <div className="container">
            <div className="sect-head">
              <div>
                <span className="eyebrow eyebrow-dark">TEKNİK ÖZELLİKLER</span>
                <h2>Aracın tüm detayları</h2>
                <p className="lead">
                  Aşağıdaki değerler üretici verilerine dayanır; donanım seviyesine göre küçük farklılıklar
                  gösterebilir.
                </p>
              </div>
            </div>

            <div className="spec-groups">
              {([
                ['gauge', 'Motor ve performans', engineSpecs],
                ['car', 'Gövde ve boyutlar', bodySpecs],
                ['leaf', 'Tüketim ve çevre', consumptionSpecs],
              ] as Array<[IconName, string, Array<[string, string | null]>]>)
                .map(([icon, title, rows]) => [icon, title, rows.filter(([, val]) => val)] as const)
                .filter(([, , rows]) => rows.length > 0)
                .map(([icon, title, rows]) => (
                  <Reveal className="spec-card" key={title}>
                    <h3>
                      <i><Icon name={icon} size={18} /></i> {title}
                    </h3>
                    <div className="spec-list">
                      {rows.map(([label, value]) => (
                        <div key={label}>
                          <small>{label}</small>
                          <b>{value}</b>
                        </div>
                      ))}
                    </div>
                  </Reveal>
                ))}

              {featureGroups.length > 0 && (
                <Reveal className="spec-card">
                  <h3>
                    <i><Icon name="checklist" size={18} /></i> Donanım listesi
                  </h3>
                  <div className="feature-cols">
                    {featureGroups.map(([icon, title, items]) => (
                      <div key={title}>
                        <h4>
                          <Icon name={icon} size={16} /> {title}
                        </h4>
                        <ul>
                          {items.map((item, i) => (
                            <li key={`${item}-${i}`}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </Reveal>
              )}
            </div>
          </div>
        </section>

        {/* ------------------------------------------------------ FİYATLANDIRMA */}
        {hasPriceTable && (
          <section className="section">
            <div className="container">
              <div className="sect-head">
                <div>
                  <span className="eyebrow eyebrow-dark">FİYATLANDIRMA</span>
                  <h2>Kiralama dönemine göre fiyatlar</h2>
                </div>
                <p className="lead">
                  Uzun dönem kiralamalarda günlük maliyet düşer. Kurumsal filo talepleriniz için özel teklif
                  hazırlanır.
                </p>
              </div>

              <Reveal className="price-table">
                {prices
                  .filter(([, price]) => price)
                  .map(([label, price, unit], i, arr) => {
                    const daily =
                      label === 'Günlük' ? price! : label === 'Haftalık' ? price! / 7 : price! / 30;
                    return (
                      <div key={label} className={i === arr.length - 1 ? 'is-best' : ''}>
                        <small>{label}</small>
                        <strong>{money(price)}</strong>
                        <span>
                          / {unit} · günlük {money(Math.round(daily))}
                        </span>
                      </div>
                    );
                  })}
              </Reveal>

              <div className="terms-grid" style={{ marginTop: 20 }}>
                {v.deposit && (
                  <div>
                    <i><Icon name="card" size={20} /></i>
                    <b>Depozito: {money(v.deposit)}</b>
                    <p>Kiralama sonunda hasarsız iade halinde iade edilir.</p>
                  </div>
                )}
                {v.extraKmPrice && (
                  <div>
                    <i><Icon name="road" size={20} /></i>
                    <b>Ek km: {money(v.extraKmPrice)}</b>
                    <p>Dahil kilometre aşımında her km için uygulanır.</p>
                  </div>
                )}
                <div>
                  <i><Icon name="receipt" size={20} /></i>
                  <b>{v.vatIncluded ? 'Fiyatlara KDV dahil' : 'Fiyatlara KDV dahil değil'}</b>
                  <p>Kurumsal kiralamalarda fatura şirket adına düzenlenir.</p>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ------------------------------------------------ KİRALAMA KOŞULLARI */}
        <section className="section section-tint">
          <div className="container">
            <div className="sect-head">
              <div>
                <span className="eyebrow eyebrow-dark">KİRALAMA KOŞULLARI</span>
                <h2>Bilmeniz gereken her şey</h2>
                <p className="lead">
                  Sürpriz kalem olmaması için tüm koşulları burada açıkça paylaşıyoruz.
                </p>
              </div>
            </div>
            <div className="terms-grid">
              {terms.map(([icon, title, text], i) => (
                <Reveal as="div" key={title} delay={i * 40}>
                  <i><Icon name={icon} size={20} /></i>
                  <b>{title}</b>
                  <p>{text}</p>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ------------------------------------------------------ TALEP FORMU */}
        <section className="section" id="talep">
          <div className="container">
            {v.status === 'RENTED' ? (
              <div className="empty" style={{ borderColor: 'rgba(185, 28, 28, 0.4)', background: '#fffafa' }}>
                <h3 style={{ color: 'var(--danger)' }}>Bu araç şu anda kiralandı</h3>
                <p>
                  Maalesef bu araç şu an başka bir müşterimizde kiradadır. Diğer alternatif araçlarımızı inceleyebilir
                  veya ileriki tarihler için müsaitlik durumu hakkında bilgi almak üzere bizimle iletişime geçebilirsiniz.
                </p>
                <div className="btn-row" style={{ marginTop: 24, justifyContent: 'center' }}>
                  <Link href="/araclar" className="btn btn-outline">
                    Diğer Araçlara Göz At
                  </Link>
                  <a className="btn btn-whatsapp" href={wa} target="_blank" rel="noreferrer">
                    <Icon name="whatsapp" size={18} /> Bilgi Al
                  </a>
                </div>
              </div>
            ) : (
              <div className="request-block">
                <div>
                  <span className="eyebrow">HIZLI TALEP</span>
                  <h2>{v.name} için teklif alın</h2>
                  <p>
                    Bilgilerinizi bırakın; müsaitlik, fiyat ve teslim planını netleştirmek için ekibimiz en kısa
                    sürede sizi arasın.
                  </p>
                  <div className="request-benefits">
                    <span><i><Icon name="check" size={14} /></i> Talebiniz mesai saatleri içinde yanıtlanır</span>
                    <span><i><Icon name="check" size={14} /></i> Ön ödeme veya kart bilgisi istenmez</span>
                    <span><i><Icon name="check" size={14} /></i> Kurumsal faturalandırma yapılabilir</span>
                    <span><i><Icon name="check" size={14} /></i> Uzun dönemde özel fiyat çalışılır</span>
                  </div>
                  <div className="btn-row" style={{ marginTop: 28 }}>
                    <a className="btn btn-ghost" href={tel}><Icon name="phone" size={18} /> Hemen Ara</a>
                    <a className="btn btn-whatsapp" href={wa} target="_blank" rel="noreferrer">
                      <Icon name="whatsapp" size={18} /> WhatsApp
                    </a>
                  </div>
                </div>
                <RentalRequestForm vehicleId={v.id} />
              </div>
            )}
          </div>
        </section>

        {/* -------------------------------------------------------------- SSS */}
        <section className="section section-tint">
          <div className="container container-narrow">
            <div className="sect-head sect-head-center">
              <div>
                <span className="eyebrow eyebrow-dark">SIKÇA SORULANLAR</span>
                <h2>{v.name} kiralama hakkında</h2>
              </div>
            </div>
            <div className="accordion">
              {faqs.map(([question, answer]) => (
                <details key={question}>
                  <summary>
                    {question} <i>+</i>
                  </summary>
                  <div>{answer}</div>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* ------------------------------------------------------ BENZERLERİ */}
        {related.length > 0 && (
          <section className="section">
            <div className="container">
              <div className="sect-head">
                <div>
                  <span className="eyebrow eyebrow-dark">ALTERNATİFLER</span>
                  <h2>Filodan diğer kiralık araçlar</h2>
                </div>
                <Link className="link-more" href={`/kategori/${v.category.slug}`}>
                  {v.category.name} kategorisi <span aria-hidden="true">→</span>
                </Link>
              </div>
              <div className="vehicle-grid vehicle-grid-4">
                {related.map((r) => (
                  <VehicleCard key={r.id} v={r} phone={s?.phone || ''} whatsapp={s?.whatsapp || ''} />
                ))}
              </div>
            </div>
          </section>
        )}
      </main>
    </PublicChrome>
  );
}
