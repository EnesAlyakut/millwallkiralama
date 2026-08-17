import Link from 'next/link';
import MobileDrawer from './MobileDrawer';
import Icon from './Icon';
import { getSettings, normalizePhone, prettyPhone, whatsappUrl } from '@/lib/site';

const SERVICES = [
  ['/filo-kiralama', 'Filo Kiralama', 'Esnek dönem ve araç seçenekleri', 'car'],
  ['/filo-yonetimi', 'Filo Yönetimi', 'Operasyonunuzu tek noktadan yönetin', 'gauge'],
  ['/operasyonel-hizmetler', 'Operasyonel Hizmetler', 'Bakım, lastik ve süreç desteği', 'wrench'],
  ['/kurumsal', 'Kurumsal Çözümler', 'İşletmenize özel kiralama planı', 'building'],
];

const FLEET = [
  ['/araclar', 'Tüm Araçlar', 'Filoyu filtreleyerek karşılaştırın', 'car'],
  ['/kategori/araba', 'Binek Otomobil', 'Sedan, hatchback ve station wagon', 'seat'],
  ['/kategori/ticari', 'Ticari Araçlar', 'Kamyonet, panelvan ve transit', 'luggage'],
  ['/elektrikli-araclar', 'Elektrikli & Hibrit', 'Yeni nesil, sessiz ve verimli', 'leaf'],
  ['/markalar', 'Markalar', 'Markaya göre keşfedin', 'tag'],
  ['/kampanyalar', 'Kampanyalar', 'Dönemsel avantajlı teklifler', 'sparkle'],
];

const MOBILE_ITEMS = [
  { label: 'Ana Sayfa', href: '/', group: 'Keşfet' },
  { label: 'Tüm Araçlar', href: '/araclar', group: 'Keşfet' },
  { label: 'Markalar', href: '/markalar', group: 'Keşfet' },
  { label: 'Elektrikli & Hibrit', href: '/elektrikli-araclar', group: 'Keşfet' },
  { label: 'Kampanyalar', href: '/kampanyalar', group: 'Keşfet' },
  { label: 'Filo Kiralama', href: '/filo-kiralama', group: 'Hizmetler' },
  { label: 'Filo Yönetimi', href: '/filo-yonetimi', group: 'Hizmetler' },
  { label: 'Operasyonel Hizmetler', href: '/operasyonel-hizmetler', group: 'Hizmetler' },
  { label: 'Kurumsal', href: '/kurumsal', group: 'Millwal' },
  { label: 'Sürdürülebilirlik', href: '/surdurulebilirlik', group: 'Millwal' },
  { label: 'Hizmet Yaklaşımımız', href: '/referanslar', group: 'Millwal' },
  { label: 'Bilgi Merkezi', href: '/blog', group: 'Millwal' },
  { label: 'Sıkça Sorulan Sorular', href: '/sikca-sorulan-sorular', group: 'Destek' },
  { label: 'İletişim', href: '/iletisim', group: 'Destek' },
];

export default async function Header() {
  const s = await getSettings();
  const tel = `tel:${normalizePhone(s?.phone || '')}`;
  const wa = whatsappUrl(
    s?.whatsapp || '',
    'Merhaba, Millwal Kurumsal Kiralama hakkında bilgi ve teklif almak istiyorum.',
  );

  return (
    <>
      <div className="topbar">
        <div className="container">
          <div className="topbar-left">
            <span>Kurumsal kiralamada hızlı, şeffaf ve ulaşılabilir hizmet</span>
            {s?.workingHours && (
              <>
                <b>·</b>
                <b>{s.workingHours}</b>
              </>
            )}
          </div>
          <nav>
            <Link href="/kurumsal">Bizi Tanıyın</Link>
            <Link href="/blog">Bilgi Merkezi</Link>
            <Link href="/sikca-sorulan-sorular">SSS</Link>
            <Link href="/iletisim">İletişim</Link>
          </nav>
        </div>
      </div>

      <header className="site-header">
        <div className="container header-inner">
          <Link href="/" className="brand" aria-label="Millwal Kurumsal Kiralama ana sayfa">
            <span className="brand-mark">M</span>
            <span className="brand-text">
              <b>MILLWAL</b>
              <small>KURUMSAL KİRALAMA</small>
            </span>
          </Link>

          <nav className="main-nav" aria-label="Ana menü">
            <div className="nav-item">
              <button type="button">
                Hizmetler <i>▾</i>
              </button>
              <div className="nav-pop">
                {SERVICES.map(([href, title, desc, icon]) => (
                  <Link key={href} href={href}>
                    <i><Icon name={icon as any} size={20} /></i>
                    <span>
                      <b>{title}</b>
                      <small>{desc}</small>
                    </span>
                  </Link>
                ))}
                <div className="nav-pop-foot">
                  <span>
                    <b>Filonuz için özel teklif</b>
                    <small>İhtiyacınızı paylaşın, aynı gün dönüş yapalım.</small>
                  </span>
                  <a className="btn btn-accent btn-sm" href={wa} target="_blank" rel="noreferrer">
                    Teklif Al
                  </a>
                </div>
              </div>
            </div>

            <div className="nav-item">
              <button type="button">
                Araçlar <i>▾</i>
              </button>
              <div className="nav-pop">
                {FLEET.map(([href, title, desc, icon]) => (
                  <Link key={href} href={href}>
                    <i><Icon name={icon as any} size={20} /></i>
                    <span>
                      <b>{title}</b>
                      <small>{desc}</small>
                    </span>
                  </Link>
                ))}
              </div>
            </div>

            <Link href="/kurumsal">Kurumsal</Link>
            <Link href="/blog">Bilgi Merkezi</Link>
            <Link href="/iletisim">İletişim</Link>
          </nav>

          <div className="header-actions">
            <a className="btn btn-accent" href={wa} target="_blank" rel="noreferrer">
              Teklif Al
            </a>
            <a className="header-call" href={tel}>
              <i>
                <Icon name="phone" size={18} />
              </i>
              <span>
                <small>BİZE ULAŞIN</small>
                <b>{prettyPhone(s?.phone) || 'Hemen Ara'}</b>
              </span>
            </a>
            <MobileDrawer items={MOBILE_ITEMS} phone={normalizePhone(s?.phone || '')} whatsapp={wa} />
          </div>
        </div>
      </header>
    </>
  );
}
