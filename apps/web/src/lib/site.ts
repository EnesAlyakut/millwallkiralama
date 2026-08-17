import { cache } from 'react';
import { db } from './db';

/* ---------------------------------------------------------------- Ayarlar */
export const getSettings = cache(async () => db.settings.findUnique({ where: { id: 1 } }));

/* ------------------------------------------------------------- İletişim */
export const normalizePhone = (v: string) => v.replace(/\D/g, '').replace(/^0/, '+90');

export const prettyPhone = (v?: string | null) => {
  if (!v) return '';
  const d = v.replace(/\D/g, '').replace(/^90/, '').replace(/^0/, '');
  if (d.length !== 10) return v;
  return `0${d.slice(0, 3)} ${d.slice(3, 6)} ${d.slice(6, 8)} ${d.slice(8)}`;
};

export const whatsappUrl = (number: string, message?: string) =>
  `https://wa.me/${number.replace(/\D/g, '')}${message ? `?text=${encodeURIComponent(message)}` : ''}`;

/* -------------------------------------------------------------- Biçimler */
const trNumber = new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 0 });

export const money = (value: number | null | undefined) =>
  value == null ? '' : `${trNumber.format(value)} ₺`;

export const moneyShort = (value: number | null | undefined) =>
  value == null ? '' : trNumber.format(value);

export const num = (value: number | null | undefined, unit = '') =>
  value == null ? null : `${trNumber.format(value)}${unit ? ` ${unit}` : ''}`;

export const decimal = (value: number | null | undefined, unit = '') =>
  value == null ? null : `${new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 1 }).format(value)}${unit ? ` ${unit}` : ''}`;

export const dateTR = (value: Date | string | null | undefined) =>
  value ? new Date(value).toLocaleDateString('tr-TR', { day: '2-digit', month: 'long', year: 'numeric' }) : '';

export const dateShort = (value: Date | string | null | undefined) =>
  value ? new Date(value).toLocaleDateString('tr-TR') : '';

/** Çok satırlı metni madde listesine çevirir. */
export const toList = (value: string | null | undefined) =>
  (value || '')
    .split(/\r?\n|;/)
    .map((x) => x.trim())
    .filter(Boolean);

export function slugify(value: string) {
  return value
    .toLocaleLowerCase('tr-TR')
    .replace(/ı/g, 'i').replace(/ş/g, 's').replace(/ğ/g, 'g')
    .replace(/ü/g, 'u').replace(/ö/g, 'o').replace(/ç/g, 'c')
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

/* ------------------------------------------------------------- Etiketler */
export const VEHICLE_STATUS: Record<string, { label: string; tone: string }> = {
  AVAILABLE: { label: 'Hemen kiralanabilir', tone: 'ok' },
  RENTED: { label: 'Kiralandı', tone: 'danger' },
  RESERVED: { label: 'Rezerve', tone: 'warn' },
  MAINTENANCE: { label: 'Bakımda', tone: 'danger' },
  PASSIVE: { label: 'Pasif', tone: 'muted' },
};

export const REQUEST_STATUS: Record<string, string> = {
  NEW: 'Yeni talep',
  CALLED: 'Arandı',
  CONTACTING: 'Görüşülüyor',
  RESERVED: 'Rezerve edildi',
  CANCELLED: 'İptal',
};

export const statusLabel = (s?: string | null) => (s && VEHICLE_STATUS[s]?.label) || '—';
export const statusTone = (s?: string | null) => (s && VEHICLE_STATUS[s]?.tone) || 'muted';
