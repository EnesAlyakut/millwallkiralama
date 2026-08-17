import type { MetadataRoute } from 'next';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

const STATIC_PAGES: Array<[string, number]> = [
  ['', 1], ['araclar', 0.9], ['markalar', 0.7], ['elektrikli-araclar', 0.7],
  ['kampanyalar', 0.7], ['filo-kiralama', 0.8], ['filo-yonetimi', 0.7],
  ['operasyonel-hizmetler', 0.7], ['kurumsal', 0.6], ['referanslar', 0.5],
  ['surdurulebilirlik', 0.5], ['blog', 0.6], ['sikca-sorulan-sorular', 0.6],
  ['iletisim', 0.8], ['kvkk', 0.3], ['gizlilik', 0.3],
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const [vehicles, categories] = await Promise.all([
    db.vehicle.findMany({
      where: { deletedAt: null, status: { not: 'PASSIVE' } },
      select: { slug: true, updatedAt: true },
    }),
    db.category.findMany({ where: { isActive: true }, select: { slug: true, updatedAt: true } }),
  ]);

  return [
    ...STATIC_PAGES.map(([path, priority]) => ({
      url: `${base}/${path}`,
      lastModified: new Date(),
      priority,
    })),
    ...categories.map((c) => ({
      url: `${base}/kategori/${c.slug}`,
      lastModified: c.updatedAt,
      priority: 0.7,
    })),
    ...vehicles.map((v) => ({
      url: `${base}/kiralik-arac/${v.slug}`,
      lastModified: v.updatedAt,
      priority: 0.8,
    })),
  ];
}
