/**
 * Filo sabitleri — filtre seçenekleri, ikon eşleşmeleri ve kategori görselleri.
 * Hem genel site hem admin paneli bu listeleri kullanır.
 */

/**
 * Kampanya pop-up'ında otomatik geçişle gösterilen araç görselleri.
 * Yönetim panelinden gerçek bir kampanya görseli yüklenmediğinde bu liste kullanılır.
 */
export const CAMPAIGN_SLIDES = [
  { url: '/fleet/renault-clio.jpg', label: 'Renault Clio' },
  { url: '/fleet/fiat-egea.jpg', label: 'Fiat Egea' },
  { url: '/fleet/bmw-320i.jpg', label: 'BMW 320i' },
] as const;

export const FUEL_TYPES = ['Benzin', 'Dizel', 'Hibrit', 'LPG'] as const;
export const TRANSMISSIONS = ['Manuel', 'Otomatik', 'Yarı Otomatik'] as const;
export const DRIVE_TYPES = ['Önden Çekiş', 'Arkadan İtiş', '4x4', '4x2'] as const;
export const BODY_TYPES = [
  'Sedan', 'Hatchback', 'Station Wagon', 'SUV', 'Crossover',
  'Panelvan', 'Kamyonet', 'Pickup', 'Minibüs',
  'Motosiklet', 'Scooter', 'Tekne', 'Jetski', 'ATV',
] as const;
export const SEGMENTS = [
  'Ekonomik', 'Orta Sınıf', 'Üst Sınıf', 'Premium', 'VIP',
  'Ticari', 'Arazi', 'Deniz Aracı',
] as const;

export const SORT_OPTIONS = [
  { value: 'onerilen', label: 'Önerilen sıralama' },
  { value: 'fiyat-artan', label: 'Fiyat: Düşükten yükseğe' },
  { value: 'fiyat-azalan', label: 'Fiyat: Yüksekten düşüğe' },
  { value: 'yeni', label: 'En yeni eklenenler' },
  { value: 'populer', label: 'En çok incelenenler' },
  { value: 'model-yili', label: 'Model yılı (yeni → eski)' },
] as const;

/** Kategori slug'ına göre simge harfleri. */
export const CATEGORY_ICON: Record<string, string> = {
  araba: '🚗',
  motor: '🏍',
  tekne: '⛵',
  jetski: '🌊',
  atv: '⛰',
  'ticari-kamyonet': '🚐',
  'ticari-transit': '🚚',
};

export const iconFor = (slug: string, name: string) =>
  CATEGORY_ICON[slug] || name.slice(0, 2).toLocaleUpperCase('tr-TR');

/** Yakıt tipine göre kısa ikon. */
export const FUEL_ICON: Record<string, string> = {
  Benzin: '⛽',
  Dizel: '⛽',
  Hibrit: '🔋',
  Elektrik: '⚡',
  LPG: '⛽',
};

export const SPEC_ICON = {
  year: '📅',
  fuel: '⛽',
  transmission: '⚙',
  seats: '👥',
  power: '🏁',
  drive: '🧭',
  luggage: '🧳',
  km: '🛣',
} as const;
