import { db } from '@/lib/db';
import VehicleForm from '@/components/admin/VehicleForm';

export const dynamic = 'force-dynamic';

export default async function Page() {
  const categories = await db.category.findMany({ orderBy: { sortOrder: 'asc' } });

  return (
    <div className="admin-page">
      <div className="admin-title">
        <div>
          <span>ARAÇ YÖNETİMİ</span>
          <h1>Yeni Araç Ekle</h1>
        </div>
      </div>
      <VehicleForm categories={categories} />
    </div>
  );
}
