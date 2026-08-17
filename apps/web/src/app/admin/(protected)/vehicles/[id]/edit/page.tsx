import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import VehicleForm from '@/components/admin/VehicleForm';

export const dynamic = 'force-dynamic';

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [vehicle, categories] = await Promise.all([
    db.vehicle.findUnique({ where: { id }, include: { images: { orderBy: { sortOrder: 'asc' } } } }),
    db.category.findMany({ orderBy: { sortOrder: 'asc' } }),
  ]);
  if (!vehicle) notFound();

  return (
    <div className="admin-page">
      <div className="admin-title">
        <div>
          <span>ARAÇ YÖNETİMİ</span>
          <h1>{vehicle.name}</h1>
        </div>
      </div>
      <VehicleForm categories={categories} initial={vehicle as unknown as Record<string, unknown>} />
    </div>
  );
}
