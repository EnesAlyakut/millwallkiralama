import Link from 'next/link';
import type { Prisma } from '@kiralama/database';
import { db } from '@/lib/db';
import { money, statusLabel } from '@/lib/site';
import VehicleTableActions from '@/components/admin/VehicleTableActions';

export const dynamic = 'force-dynamic';

const PER_PAGE = 20;

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const q = await searchParams;
  const page = Math.max(1, Number(q.page) || 1);

  const where: Prisma.VehicleWhereInput = { deletedAt: null };
  if (q.search) {
    where.OR = [
      { name: { contains: q.search } },
      { brand: { contains: q.search } },
      { model: { contains: q.search } },
    ];
  }
  if (q.status) where.status = q.status as Prisma.VehicleWhereInput['status'];

  const [items, total, categories] = await Promise.all([
    db.vehicle.findMany({
      where,
      include: { category: true },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * PER_PAGE,
      take: PER_PAGE,
    }),
    db.vehicle.count({ where }),
    db.category.findMany({ orderBy: { sortOrder: 'asc' } }),
  ]);

  const pages = Math.max(1, Math.ceil(total / PER_PAGE));

  return (
    <div className="admin-page">
      <div className="admin-title">
        <div>
          <span>ARAÇ YÖNETİMİ</span>
          <h1>Tüm Araçlar</h1>
        </div>
        <Link className="btn btn-accent" href="/admin/vehicles/new">
          ＋ Yeni Araç
        </Link>
      </div>

      <form className="admin-filters">
        <input name="search" defaultValue={q.search} placeholder="Araç, marka veya model ara…" />
        <select name="status" defaultValue={q.status || ''}>
          <option value="">Tüm durumlar</option>
          {['AVAILABLE', 'RENTED', 'RESERVED', 'MAINTENANCE', 'PASSIVE'].map((v) => (
            <option key={v} value={v}>
              {statusLabel(v)}
            </option>
          ))}
        </select>
        <select name="kategori" defaultValue={q.kategori || ''} disabled>
          <option value="">{categories.length} kategori</option>
        </select>
        <button className="btn btn-dark">Filtrele</button>
      </form>

      <section className="admin-card">
        <div className="admin-table">
          <table>
            <thead>
              <tr>
                <th>Fotoğraf</th>
                <th>Araç</th>
                <th>Kategori</th>
                <th>Günlük</th>
                <th>Durum</th>
                <th>Etiket</th>
                <th>Görüntülenme</th>
                <th>İşlem</th>
              </tr>
            </thead>
            <tbody>
              {items.map((v) => (
                <tr key={v.id}>
                  <td>{v.mainImage && <img className="table-thumb" src={v.mainImage} alt="" />}</td>
                  <td>
                    <b>{v.name}</b>
                    <small>
                      {v.brand} · {v.model} {v.year ? `· ${v.year}` : ''}
                    </small>
                  </td>
                  <td>{v.category.name}</td>
                  <td>{v.showPrice ? money(v.dailyPrice) || '—' : 'Gizli'}</td>
                  <td>
                    <span className={`status ${v.status}`}>{statusLabel(v.status)}</span>
                  </td>
                  <td>
                    {[v.featured && 'Öne çıkan', v.budgetFriendly && 'Avantajlı'].filter(Boolean).join(', ') || '—'}
                  </td>
                  <td>{v.viewCount}</td>
                  <td>
                    <VehicleTableActions id={v.id} slug={v.slug} name={v.name} status={v.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="table-count">
          Toplam {total} araç · sayfa {page}/{pages}
        </p>
        {pages > 1 && (
          <nav className="pager">
            {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
              <Link
                key={n}
                className={n === page ? 'is-active' : ''}
                href={`/admin/vehicles?${new URLSearchParams({ ...(q as Record<string, string>), page: String(n) })}`}
              >
                {n}
              </Link>
            ))}
          </nav>
        )}
      </section>
    </div>
  );
}
