import { db } from '@/lib/db';
import RequestManager from '@/components/admin/RequestManager';

export const dynamic = 'force-dynamic';

export default async function Page() {
  const [items, vehicles] = await Promise.all([
    db.rentalRequest.findMany({
      where: { deletedAt: null },
      include: { vehicle: { select: { id: true, name: true, slug: true, status: true } } },
      orderBy: { createdAt: 'desc' },
      take: 100,
    }),
    db.vehicle.findMany({
      where: { deletedAt: null, status: { not: 'PASSIVE' } },
      select: { id: true, name: true, brand: true, model: true },
      orderBy: { name: 'asc' },
    }),
  ]);

  return (
    <div className="admin-page">
      <div className="admin-title">
        <div>
          <span>MÜŞTERİ</span>
          <h1>Kiralama Talepleri</h1>
        </div>
      </div>
      <RequestManager 
        initial={JSON.parse(JSON.stringify(items))} 
        vehicles={vehicles}
      />
    </div>
  );
}
