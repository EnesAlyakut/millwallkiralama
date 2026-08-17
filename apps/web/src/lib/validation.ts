import { z } from 'zod';

/* -------------------------------------------------- Kiralama talep formu */
export const rentalRequestSchema = z
  .object({
    vehicleId: z.string().min(1),
    fullName: z.string().trim().min(3, 'Ad soyad en az 3 karakter olmalıdır.').max(100),
    phone: z.string().trim().min(10, 'Geçerli bir telefon numarası girin.').max(20),
    email: z.string().trim().email('Geçerli bir e-posta girin.').max(120).optional().or(z.literal('')),
    company: z.string().trim().max(120).optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    pickupLocation: z.string().max(200).optional(),
    dropoffLocation: z.string().max(200).optional(),
    message: z.string().max(1000).optional(),
    kvkk: z.union([z.boolean(), z.string()]).optional(),
    website: z.string().max(0).optional(),
  })
  .refine(
    (v) => !v.startDate || !v.endDate || new Date(v.endDate) >= new Date(v.startDate),
    { message: 'Bitiş tarihi başlangıç tarihinden önce olamaz.', path: ['endDate'] },
  );

/* --------------------------------------------------------- Yönetici giriş */
export const loginSchema = z.object({
  identity: z.string().min(3),
  password: z.string().min(8),
});

/* -------------------------------------------------------------- Kategori */
export const categorySchema = z.object({
  name: z.string().min(2),
  shortName: z.string().optional(),
  slug: z.string().min(2),
  description: z.string().optional(),
  longDescription: z.string().optional(),
  image: z.string().optional(),
  heroImage: z.string().optional(),
  icon: z.string().optional(),
  sortOrder: z.coerce.number().int().default(0),
  isActive: z.coerce.boolean().default(true),
});

/* ------------------------------------------------------------------ Araç */
const optText = z.string().optional().nullable();
const optInt = z.coerce.number().int().optional().nullable();
const optNum = z.coerce.number().optional().nullable();
const flag = z.union([z.boolean(), z.string()]).transform((v) => v === true || v === 'true' || v === 'on');

export const vehicleSchema = z.object({
  // Kimlik
  categoryId: z.string().min(1, 'Kategori seçilmelidir.'),
  name: z.string().min(2, 'Araç adı en az 2 karakter olmalıdır.'),
  slug: z.string().min(2),
  brand: z.string().min(1, 'Marka zorunludur.'),
  model: z.string().min(1, 'Model zorunludur.'),
  version: optText,
  year: z.coerce.number().int().min(1900).max(2100).optional().nullable(),
  badge: optText,
  shortDescription: optText,
  description: optText,
  highlightText: optText,

  // Sınıf & gövde
  segment: optText,
  bodyType: optText,
  color: optText,
  colorHex: optText,
  seatCount: optInt,
  doorCount: optInt,
  luggageCapacity: optText,
  trunkCapacity: optInt,

  // Motor & performans
  fuelType: optText,
  transmission: optText,
  gearCount: optInt,
  driveType: optText,
  engine: optText,
  engineVolume: optInt,
  enginePower: optInt,
  torque: optInt,
  acceleration: optNum,
  topSpeed: optInt,
  fuelConsumption: optNum,
  tankCapacity: optInt,
  batteryCapacity: optNum,
  electricRange: optInt,
  chargeTime: optText,
  emissionClass: optText,
  co2Emission: optInt,

  // Ölçüler
  lengthMm: optInt,
  widthMm: optInt,
  heightMm: optInt,
  curbWeight: optInt,

  // Donanım
  safetyFeatures: optText,
  comfortFeatures: optText,
  techFeatures: optText,
  exteriorFeatures: optText,

  // Konfor bayrakları
  hasAirConditioning: flag.default(true),
  hasNavigation: flag.default(false),
  hasBluetooth: flag.default(true),
  hasParkingSensor: flag.default(false),
  hasReverseCamera: flag.default(false),
  hasCruiseControl: flag.default(false),
  hasSunroof: flag.default(false),
  hasLeatherSeats: flag.default(false),
  hasIsofix: flag.default(true),

  // Fiyat
  dailyPrice: optNum,
  weeklyPrice: optNum,
  monthlyPrice: optNum,
  deposit: optNum,
  showPrice: flag.default(true),
  extraKmPrice: optNum,
  vatIncluded: flag.default(true),

  // Koşullar
  minimumRentalDays: z.coerce.number().int().min(1).default(1),
  dailyKmLimit: optInt,
  monthlyKmLimit: optInt,
  minDriverAge: z.coerce.number().int().min(16).max(80).default(21),
  minLicenseYears: z.coerce.number().int().min(0).max(30).default(1),
  insuranceInfo: optText,
  fuelPolicy: optText,
  deliveryInfo: optText,
  cancellationPolicy: optText,
  hgsIncluded: flag.default(true),
  additionalDriverAllowed: flag.default(true),
  cityDeliveryFree: flag.default(true),

  // Yayın
  status: z.enum(['AVAILABLE', 'RENTED', 'RESERVED', 'MAINTENANCE', 'PASSIVE']),
  featured: flag.default(false),
  budgetFriendly: flag.default(false),
  showOnHomepage: flag.default(false),
  sortOrder: z.coerce.number().int().default(0),
  mainImage: optText,
  interiorImages: optText,
  videoUrl: optText,
  rating: optNum,

  seoTitle: optText,
  seoDescription: optText,
});

export type VehicleInput = z.infer<typeof vehicleSchema>;
