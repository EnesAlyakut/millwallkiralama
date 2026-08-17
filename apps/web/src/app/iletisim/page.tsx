import type { Metadata } from 'next';
import Link from 'next/link';
import PublicChrome from '@/components/PublicChrome';
import Reveal from '@/components/Reveal';
import Icon, { type IconName } from '@/components/Icon';
import { getSettings, normalizePhone, prettyPhone, whatsappUrl } from '@/lib/site';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'İletişim',
  description: 'Millwal Kurumsal Kiralama telefon, WhatsApp, e-posta ve adres bilgileri.',
};

export default async function Page() {
  const s = await getSettings();
  const wa = whatsappUrl(s?.whatsapp || '', 'Merhaba, kiralama hakkında bilgi almak istiyorum.');
  const tel = `tel:${normalizePhone(s?.phone || '')}`;

  /* Birincil iletisim kanallari */
  const channels: Array<{
    icon: IconName;
    label: string;
    value: string;
    note: string;
    action: string;
    href: string | null;
    external?: boolean;
  }> = [
    {
      icon: 'phone',
      label: 'Telefon',
      value: prettyPhone(s?.phone) || '—',
      note: 'Mesai saatleri içinde doğrudan operasyon ekibine bağlanırsınız.',
      action: 'Hemen ara',
      href: s?.phone ? tel : null,
    },
    {
      icon: 'whatsapp',
      label: 'WhatsApp',
      value: 'Yazılı bilgi ve teklif',
      note: 'Araç müsaitliği ve fiyat bilgisini yazılı olarak iletelim.',
      action: 'Mesaj gönder',
      href: s?.whatsapp ? wa : null,
      external: true,
    },
    {
      icon: 'mail',
      label: 'E-posta',
      value: s?.email || '—',
      note: 'Kurumsal filo talepleri ve sözleşme süreçleri için uygundur.',
      action: 'E-posta gönder',
      href: s?.email ? `mailto:${s.email}` : null,
    },
  ];

  /* Ofis kunyesi */
  const officeFacts: Array<[IconName, string, string]> = [
    ['pin', 'Adres', s?.address || '—'],
    ['clock', 'Çalışma saatleri', s?.workingHours || '—'],
    ['building', 'Firma unvanı', s?.companyLegalName || '—'],
    ['mail', 'E-posta', s?.email || '—'],
  ];

  const registryRows: Array<[string, string | null | undefined]> = [
    ['Mersis No', s?.mersisNo],
    ['Ticaret Sicil No', s?.tradeRegistryNo],
    ['Ticaret Sicil Müdürlüğü', s?.tradeRegistryOffice],
    ['Adres', s?.address],
  ];

  const mapSrc = s?.address
    ? `https://www.google.com/maps?q=${encodeURIComponent(s.address)}&hl=tr&z=16&output=embed`
    : null;

  return (
    <PublicChrome>
      <main>
        <section className="page-hero">
          <div className="container">
            <nav className="crumbs" aria-label="Sayfa yolu">
              <Link href="/">Ana Sayfa</Link>
              <span className="sep">/</span>
              <strong>İletişim</strong>
            </nav>
            <span className="eyebrow">İLETİŞİM</span>
            <h1>Size nasıl yardımcı olabiliriz?</h1>
            <p>
              Araç müsaitliği, fiyat ve kiralama koşulları için bizi arayın ya da WhatsApp üzerinden yazın.
              Kurumsal filo talepleriniz için ayrı bir ekip çalışıyor.
            </p>

            <div className="hero-actions">
              <a className="btn btn-accent btn-lg" href={tel}>
                <Icon name="phone" size={19} /> {prettyPhone(s?.phone) || 'Hemen Ara'}
              </a>
              <a className="btn btn-ghost btn-lg" href={wa} target="_blank" rel="noreferrer">
                <Icon name="whatsapp" size={19} /> WhatsApp&apos;tan yazın
              </a>
            </div>

            {s?.workingHours && (
              <p className="hero-hours">
                <Icon name="clock" size={16} /> {s.workingHours}
              </p>
            )}
          </div>
        </section>

        {/* ------------------------------------------------ İLETİŞİM KANALLARI */}
        <section className="section">
          <div className="container">
            <div className="sect-head">
              <div>
                <span className="eyebrow eyebrow-dark">İLETİŞİM KANALLARI</span>
                <h2>Bize doğrudan ulaşın</h2>
                <p className="lead">
                  Talebinize en uygun kanalı seçin; her üç kanalda da aynı ekip yanıt verir ve talebiniz
                  kayıt altına alınır.
                </p>
              </div>
            </div>

            <div className="contact-grid">
              {channels.map((c, i) => {
                const body = (
                  <>
                    <span className="cc-icon">
                      <Icon name={c.icon} size={20} />
                    </span>
                    <small>{c.label}</small>
                    <strong>{c.value}</strong>
                    <p>{c.note}</p>
                    {c.href && (
                      <span className="cc-action">
                        {c.action} <Icon name="arrow-right" size={16} />
                      </span>
                    )}
                  </>
                );

                return (
                  <Reveal as="div" key={c.label} delay={i * 60}>
                    {c.href ? (
                      <a
                        className="contact-card"
                        href={c.href}
                        target={c.external ? '_blank' : undefined}
                        rel={c.external ? 'noreferrer' : undefined}
                      >
                        {body}
                      </a>
                    ) : (
                      <div className="contact-card">{body}</div>
                    )}
                  </Reveal>
                );
              })}
            </div>
          </div>
        </section>

        {/* --------------------------------------------------------- OFİS & HARİTA */}
        <section className="section section-tint">
          <div className="container">
            <div className="sect-head">
              <div>
                <span className="eyebrow eyebrow-dark">OFİS</span>
                <h2>Merkez ofisimiz</h2>
              </div>
              {s?.googleMapsUrl && (
                <a className="link-more" href={s.googleMapsUrl} target="_blank" rel="noreferrer">
                  Yol tarifi al <span aria-hidden="true">→</span>
                </a>
              )}
            </div>

            <div className="office-layout">
              <div className="office-facts">
                <dl>
                  {officeFacts.map(([icon, label, value]) => (
                    <div key={label}>
                      <span className="of-icon">
                        <Icon name={icon} size={17} />
                      </span>
                      <div>
                        <dt>{label}</dt>
                        <dd>{value}</dd>
                      </div>
                    </div>
                  ))}
                </dl>

                <div className="office-cta">
                  <a className="btn btn-dark" href={tel}>
                    <Icon name="phone" size={18} /> Hemen Ara
                  </a>
                  {s?.googleMapsUrl && (
                    <a className="btn btn-light" href={s.googleMapsUrl} target="_blank" rel="noreferrer">
                      <Icon name="pin" size={18} /> Haritada Aç
                    </a>
                  )}
                </div>
              </div>

              {mapSrc ? (
                <div className="map-frame">
                  <iframe
                    src={mapSrc}
                    title="Millwal merkez ofis konumu"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    allowFullScreen
                  />
                </div>
              ) : (
                <div className="map-frame map-frame-empty">
                  <span>
                    <Icon name="pin" size={26} />
                    Konum bilgisi yakında eklenecek
                  </span>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ------------------------------------------------------ RESMİ BİLGİLER */}
        <section className="section">
          <div className="container">
            <div className="corporate-grid">
              <div>
                <span className="eyebrow eyebrow-dark">RESMİ BİLGİLER</span>
                <h2>{s?.companyLegalName}</h2>
                <p className="lead" style={{ marginTop: 16 }}>
                  Tüm kiralama süreçleri yazılı sözleşme ile yürütülür; faturalandırma şirket bilgileriniz
                  üzerinden yapılır.
                </p>
                <p className="form-note" style={{ marginTop: 18 }}>
                  Ticari kayıt bilgilerimiz aşağıda yer alır. Sözleşme ve fatura süreçlerinde bu bilgileri
                  esas alabilirsiniz.
                </p>
              </div>

              <dl className="registry-list">
                {registryRows
                  .filter(([, value]) => value)
                  .map(([label, value]) => (
                    <div key={label}>
                      <dt>{label}</dt>
                      <dd>{value}</dd>
                    </div>
                  ))}
              </dl>
            </div>
          </div>
        </section>
      </main>
    </PublicChrome>
  );
}
