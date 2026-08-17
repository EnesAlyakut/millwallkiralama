import Header from './Header';
import Footer from './Footer';
import CampaignPopup from './CampaignPopup';
import CookieConsent from './CookieConsent';
import Icon from './Icon';
import { getSettings, normalizePhone, whatsappUrl } from '@/lib/site';
import { CAMPAIGN_SLIDES } from '@/lib/fleet';

/** Yönetim panelinden yüklenen görsel gerçek bir fotoğrafsa onu, değilse filo slaytlarını kullan. */
function campaignSlides(imageUrl?: string | null) {
  const custom = (imageUrl || '').trim();
  const isPhoto = custom && !/\.svg$/i.test(custom) && !custom.endsWith('/og.png');
  return isPhoto ? [{ url: custom }] : CAMPAIGN_SLIDES.map((s) => ({ ...s }));
}

export default async function PublicChrome({
  children,
  showCampaign = false,
}: {
  children: React.ReactNode;
  showCampaign?: boolean;
}) {
  const s = await getSettings();
  const message =
    'Merhaba, Millwal Kurumsal Kiralama araç kiralama çözümleri hakkında bilgi ve teklif almak istiyorum.';
  const wa = whatsappUrl(s?.whatsapp || '', message);

  return (
    <>
      <Header />
      {children}
      <Footer />

      <div className="mobile-bar">
        <a href={`tel:${normalizePhone(s?.phone || '')}`}>
          <Icon name="phone" size={17} /> Hemen Ara
        </a>
        <a href={wa} target="_blank" rel="noreferrer">
          <Icon name="whatsapp" size={17} /> WhatsApp
        </a>
      </div>

      {showCampaign && (
        <CampaignPopup
          enabled={s?.campaignEnabled !== false}
          title={s?.campaignTitle || 'Kurumsal kiralamada size özel çözümler'}
          text={s?.campaignText || 'İhtiyacınıza uygun aracı birlikte belirleyelim.'}
          slides={campaignSlides(s?.campaignImageUrl)}
          buttonText={s?.campaignButtonText || "WhatsApp'tan Teklif Al"}
          whatsappHref={wa}
        />
      )}
      <CookieConsent />
    </>
  );
}
