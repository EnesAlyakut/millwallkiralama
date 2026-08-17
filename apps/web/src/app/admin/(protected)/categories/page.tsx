import { db } from '@/lib/db';
import CategoryManager from '@/components/admin/CategoryManager';

export const dynamic = 'force-dynamic';

export default async function Page() {
  const items = await db.category.findMany({
    include: { _count: { select: { vehicles: true } } },
    orderBy: { sortOrder: 'asc' },
  });

  return (
    <div className="admin-page">
      <div className="admin-title">
        <div>
          <span>İÇERİK</span>
          <h1>Kategoriler</h1>
        </div>
      </div>
      <CategoryManager items={items} />
    </div>
  );
}
