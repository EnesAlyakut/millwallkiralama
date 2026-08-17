import Link from 'next/link';
import Icon, { type IconName } from '@/components/Icon';
import { money, normalizePhone, statusLabel, statusTone, whatsappUrl } from '@/lib/site';

export type CardVehicle = {
  id: string;
  slug: string;
  name: string;
  brand: string;
  model: string;
  year: number | null;
  badge?: string | null;
  fuelType: string | null;
  transmission: string | null;
  seatCount: number | null;
  enginePower?: number | null;
  dailyPrice: number | null;
  monthlyPrice?: number | null;
  showPrice: boolean;
  mainImage: string | null;
  status?: string;
  featured?: boolean;
  budgetFriendly?: boolean;
  category: { name: string };
};

export default function VehicleCard({
  v,
  phone,
  whatsapp,
}: {
  v: CardVehicle;
  phone: string;
  whatsapp?: string;
}) {
  const waHref = whatsapp
    ? whatsappUrl(
        whatsapp,
        `Merhaba, ${v.name} aracı için kiralama bilgisi ve fiyat almak istiyorum.`,
      )
    : null;

  const specs: Array<[IconName, string]> = [];
  if (v.year) specs.push(['calendar', String(v.year)]);
  if (v.transmission) specs.push(['gearbox', v.transmission]);
  if (v.fuelType) specs.push(['fuel', v.fuelType]);
  if (v.seatCount) specs.push(['users', `${v.seatCount} kişi`]);

  return (
    <article className="v-card">
      <div className="v-card-media">
        {v.mainImage ? (
          <img src={v.mainImage} alt={`Kiralık ${v.name}`} loading="lazy" />
        ) : (
          <span className="no-photo">GÖRSEL HAZIRLANIYOR</span>
        )}

        <div className="v-card-flags">
          {v.badge && <span className="badge badge-accent">{v.badge}</span>}
          {v.featured && !v.badge && <span className="badge badge-accent">ÖNE ÇIKAN</span>}
          {v.budgetFriendly && <span className="badge badge-dark">AVANTAJLI</span>}
        </div>

        {v.status && (
          <span className="v-card-status">
            <i className={`dot dot-${statusTone(v.status)}`} />
            {statusLabel(v.status)}
          </span>
        )}
      </div>

      <div className="v-card-body">
        <span className="v-card-cat">{v.category.name}</span>
        <h3>{v.name}</h3>
        <span className="v-card-sub">
          {[v.brand, v.model, v.enginePower ? `${v.enginePower} HP` : null].filter(Boolean).join(' · ')}
        </span>

        <div className="v-card-specs">
          {specs.map(([icon, label]) => (
            <div key={label}>
              <i>
                <Icon name={icon} size={17} />
              </i>
              <small>{label}</small>
            </div>
          ))}
        </div>

        <div className="v-card-foot">
          <div className="v-card-price">
            {v.showPrice && v.dailyPrice ? (
              <>
                <small>Günlük başlangıç</small>
                <strong>
                  {money(v.dailyPrice)} <span>/ gün</span>
                </strong>
              </>
            ) : (
              <>
                <small>Fiyatlandırma</small>
                <strong className="call-price">Teklif alın</strong>
              </>
            )}
          </div>

          <div className="v-card-actions">
            <a
              className="v-card-icon"
              href={`tel:${normalizePhone(phone)}`}
              aria-label={`${v.name} için ara`}
              style={{ position: 'relative', zIndex: 2 }}
            >
              <Icon name="phone" size={18} />
            </a>
            {waHref && (
              <a
                className="v-card-icon wa"
                href={waHref}
                target="_blank"
                rel="noreferrer"
                aria-label={`${v.name} için WhatsApp`}
                style={{ position: 'relative', zIndex: 2 }}
              >
                <Icon name="whatsapp" size={18} />
              </a>
            )}
            <Link className="btn btn-dark btn-sm" href={`/kiralik-arac/${v.slug}`} style={{ position: 'relative', zIndex: 2 }}>
              İncele
            </Link>
          </div>
        </div>
      </div>

      <Link className="v-card-link" href={`/kiralik-arac/${v.slug}`} aria-label={`${v.name} detayları`} />
    </article>
  );
}
