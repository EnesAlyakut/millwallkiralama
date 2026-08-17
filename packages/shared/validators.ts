import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email('Geçerli bir e-posta adresi girin'),
  password: z.string().min(8, 'Şifre en az 8 karakter olmalı')
    .regex(/[A-Z]/, 'En az bir büyük harf içermeli')
    .regex(/[a-z]/, 'En az bir küçük harf içermeli')
    .regex(/[0-9]/, 'En az bir rakam içermeli'),
  firstName: z.string().min(2, 'Ad en az 2 karakter olmalı').max(50),
  lastName: z.string().min(2, 'Soyad en az 2 karakter olmalı').max(50),
  phone: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Geçerli bir e-posta adresi girin'),
  password: z.string().min(1, 'Şifre gerekli'),
});

export const branchSchema = z.object({
  name: z.string().min(2, 'Şube adı en az 2 karakter olmalı'),
  code: z.string().min(2, 'Şube kodu en az 2 karakter olmalı').max(10),
  address: z.string().optional(),
  city: z.string().optional(),
  district: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  isActive: z.boolean().optional(),
});

export const categorySchema = z.object({
  name: z.string().min(2, 'Kategori adı en az 2 karakter olmalı'),
  slug: z.string().optional(),
  description: z.string().optional(),
  icon: z.string().optional(),
  parentId: z.string().optional().nullable(),
  sortOrder: z.number().optional(),
  isActive: z.boolean().optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
});

export const categoryAttributeSchema = z.object({
  name: z.string().min(1),
  label: z.string().min(1),
  type: z.enum(['TEXT', 'NUMBER', 'SELECT', 'BOOLEAN', 'DATE']),
  options: z.string().optional(),
  unit: z.string().optional(),
  required: z.boolean().optional(),
  filterable: z.boolean().optional(),
  sortOrder: z.number().optional(),
});

export const productSchema = z.object({
  name: z.string().min(2, 'Ürün adı en az 2 karakter olmalı'),
  slug: z.string().optional(),
  description: z.string().optional(),
  categoryId: z.string().min(1, 'Kategori seçin'),
  branchId: z.string().min(1, 'Şube seçin'),
  serialNumber: z.string().optional(),
  plateNumber: z.string().optional(),
  showPrice: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  minAge: z.number().optional(),
  minLicenseYears: z.number().optional(),
  dailyKmLimit: z.number().optional(),
  depositAmount: z.number().min(0).optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
});

export const pricingRuleSchema = z.object({
  productId: z.string().min(1),
  type: z.enum(['HOURLY', 'DAILY', 'WEEKLY', 'MONTHLY']),
  price: z.number().min(0, 'Fiyat 0 veya daha büyük olmalı'),
  isActive: z.boolean().optional(),
});

export const reservationSchema = z.object({
  productId: z.string().min(1, 'Ürün seçin'),
  pickupBranchId: z.string().min(1, 'Teslim alma noktası seçin'),
  returnBranchId: z.string().min(1, 'İade noktası seçin'),
  pickupDate: z.string().min(1, 'Teslim tarihi seçin'),
  pickupTime: z.string().min(1, 'Teslim saati seçin'),
  returnDate: z.string().min(1, 'İade tarihi seçin'),
  returnTime: z.string().min(1, 'İade saati seçin'),
  extras: z.array(z.object({
    extraId: z.string(),
    quantity: z.number().min(1),
  })).optional(),
  couponCode: z.string().optional(),
  notes: z.string().optional(),
});

export const offerSchema = z.object({
  productName: z.string().min(1),
  startDate: z.string().min(1),
  endDate: z.string().min(1),
  customerNote: z.string().optional(),
});

export const reviewSchema = z.object({
  productId: z.string().min(1),
  rating: z.number().min(1).max(5),
  comment: z.string().optional(),
});

export const contactSchema = z.object({
  name: z.string().min(2, 'Ad en az 2 karakter olmalı'),
  email: z.string().email('Geçerli bir e-posta girin'),
  phone: z.string().optional(),
  subject: z.string().optional(),
  message: z.string().min(10, 'Mesaj en az 10 karakter olmalı'),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type BranchInput = z.infer<typeof branchSchema>;
export type CategoryInput = z.infer<typeof categorySchema>;
export type ProductInput = z.infer<typeof productSchema>;
export type ReservationInput = z.infer<typeof reservationSchema>;
export type OfferInput = z.infer<typeof offerSchema>;
export type ReviewInput = z.infer<typeof reviewSchema>;
export type ContactInput = z.infer<typeof contactSchema>;
