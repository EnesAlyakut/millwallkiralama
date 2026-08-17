export const ROLES = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  BRANCH_MANAGER: 'BRANCH_MANAGER',
  STAFF: 'STAFF',
  CUSTOMER: 'CUSTOMER',
} as const;

export const RESERVATION_STATUSES = {
  DRAFT: 'DRAFT',
  OFFER_PENDING: 'OFFER_PENDING',
  APPROVAL_PENDING: 'APPROVAL_PENDING',
  APPROVED: 'APPROVED',
  PAYMENT_PENDING: 'PAYMENT_PENDING',
  PAID: 'PAID',
  READY_FOR_PICKUP: 'READY_FOR_PICKUP',
  DELIVERED: 'DELIVERED',
  ACTIVE: 'ACTIVE',
  RETURN_PENDING: 'RETURN_PENDING',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
  PROBLEMATIC: 'PROBLEMATIC',
} as const;

export const RESERVATION_STATUS_LABELS: Record<string, string> = {
  DRAFT: 'Taslak',
  OFFER_PENDING: 'Teklif Bekliyor',
  APPROVAL_PENDING: 'Onay Bekliyor',
  APPROVED: 'Onaylandı',
  PAYMENT_PENDING: 'Ödeme Bekliyor',
  PAID: 'Ödendi',
  READY_FOR_PICKUP: 'Teslime Hazır',
  DELIVERED: 'Teslim Edildi',
  ACTIVE: 'Aktif Kiralama',
  RETURN_PENDING: 'İade Bekliyor',
  COMPLETED: 'Tamamlandı',
  CANCELLED: 'İptal Edildi',
  PROBLEMATIC: 'Sorunlu',
};

export const PAYMENT_STATUS_LABELS: Record<string, string> = {
  PENDING: 'Bekliyor',
  COMPLETED: 'Tamamlandı',
  PARTIAL: 'Kısmi Ödeme',
  REFUNDED: 'İade Edildi',
  CANCELLED: 'İptal',
  FAILED: 'Başarısız',
};

export const PAYMENT_METHOD_LABELS: Record<string, string> = {
  CREDIT_CARD: 'Kredi Kartı',
  DEBIT_CARD: 'Banka Kartı',
  BANK_TRANSFER: 'Havale / EFT',
  CASH: 'Nakit',
  LINK: 'Link ile Ödeme',
};

export const DOCUMENT_STATUS_LABELS: Record<string, string> = {
  PENDING: 'İnceleniyor',
  APPROVED: 'Onaylandı',
  REJECTED: 'Reddedildi',
};

export const PRODUCT_STATUS_LABELS: Record<string, string> = {
  AVAILABLE: 'Müsait',
  RESERVED: 'Rezerve',
  RENTED: 'Kirada',
  MAINTENANCE: 'Bakımda',
  INACTIVE: 'Pasif',
};

export const DEPOSIT_STATUS_LABELS: Record<string, string> = {
  PENDING: 'Bekleniyor',
  RECEIVED: 'Alındı',
  RETURNED: 'İade Edildi',
  DEDUCTED: 'Kesinti Yapıldı',
};

export function generateReservationNo(): string {
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 999999).toString().padStart(6, '0');
  return `KRL-${year}-${random}`;
}

export function formatCurrency(amount: number, currency = 'TRY'): string {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's')
    .replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ç/g, 'c')
    .replace(/Ğ/g, 'g').replace(/Ü/g, 'u').replace(/Ş/g, 's')
    .replace(/İ/g, 'i').replace(/Ö/g, 'o').replace(/Ç/g, 'c')
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

export function calculateRentalDays(startDate: Date, endDate: Date): number {
  const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(diffDays, 1);
}
