import Link from 'next/link';
import { getSettings, normalizePhone, prettyPhone, whatsappUrl } from '@/lib/site';

const COLUMNS: Array<[string, Array<[string, string]>]> = [
  ['Hizmetler', [
    ['Filo Kiralama', '/filo-kiralama'],
    ['Filo Yönetimi', '/filo-yonetimi'],
    ['Operasyonel Hizmetler', '/operasyonel-hizmetler'],
    ['Kampanyalar', '/kampanyalar'],
  ]],
  ['Araçlar', [
    ['Tüm Araçlar', '/araclar'],
    ['Markalar', '/markalar'],
    ['Elektrikli & Hibrit', '/elektrikli-araclar'],
    ['Binek Otomobil', '/kategori/araba'],
    ['Ticari Araçlar', '/kategori/ticari-kamyonet'],
  ]],
  ['Millwal', [
    ['Şirket Profili', '/kurumsal'],
    ['Sürdürülebilirlik', '/surdurulebilirlik'],
    ['Hizmet Yaklaşımımız', '/referanslar'],
    ['Bilgi Merkezi', '/blog'],
    ['Sıkça Sorulanlar', '/sikca-sorulan-sorular'],
  ]],
];

export default async function Footer() {
  const s = await getSettings();
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="container footer-top">
        <div>
          <Link href="/" className="brand footer-brand">
            <span className="brand-mark">M</span>
            <span className="brand-text">
              <b>MILLWAL</b>
              <small>KURUMSAL KİRALAMA</small>
            </span>
          </Link>
          <p className="footer-about">{s?.footerDescription}</p>
          <div className="footer-badges">
            <span>✓ Bakımlı araç filosu</span>
            <span>✓ Şeffaf kiralama koşulları</span>
            <span>✓ Kurumsal fatura</span>
          </div>
        </div>

        {COLUMNS.map(([title, links]) => (
          <div key={title}>
            <h4>{title}</h4>
            {links.map(([label, href]) => (
              <Link key={href} href={href}>
                {label}
              </Link>
            ))}
          </div>
        ))}

        <div className="footer-contact">
          <h4>İletişim</h4>
          <a href={`tel:${normalizePhone(s?.phone || '')}`}>
            <strong>{prettyPhone(s?.phone)}</strong>
          </a>
          <a href={whatsappUrl(s?.whatsapp || '')} target="_blank" rel="noreferrer">
            WhatsApp destek hattı
          </a>
          <a href={`mailto:${s?.email}`}>{s?.email}</a>
          <p>{s?.address}</p>
          {s?.workingHours && <p>{s.workingHours}</p>}
        </div>
      </div>

      <div className="container footer-legal">
        <div className="footer-registry">
          <span>© {year} {s?.companyLegalName}</span>
          <span>Mersis: {s?.mersisNo}</span>
          <span>Ticaret Sicil No: {s?.tradeRegistryNo}</span>
        </div>
        <nav>
          <Link href="/kvkk">KVKK Aydınlatma Metni</Link>
          <Link href="/gizlilik">Gizlilik &amp; Çerez Politikası</Link>
          <Link href="/iletisim">İletişim</Link>
        </nav>
      </div>
    </footer>
  );
}
