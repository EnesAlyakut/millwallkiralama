import Link from 'next/link';
import { db } from '@/lib/db';
import { REQUEST_STATUS, dateShort, money } from '@/lib/site';

export const dynamic = 'force-dynamic';

export default async function Page() {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const weekAgo = new Date(Date.now() - 7 * 86400000);

  const [total, available, rented, reserved, maintenance, newReq, todayReq, weekReq, catCount, popular, recent, revenueRows] =
    await Promise.all([
      db.vehicle.count({ where: { deletedAt: null } }),
      db.vehicle.count({ where: { deletedAt: null, status: 'AVAILABLE' } }),
      db.vehicle.count({ where: { deletedAt: null, status: 'RENTED' } }),
      db.vehicle.count({ where: { deletedAt: null, status: 'RESERVED' } }),
      db.vehicle.count({ where: { deletedAt: null, status: 'MAINTENANCE' } }),
      db.rentalRequest.count({ where: { deletedAt: null, status: 'NEW' } }),
      db.rentalRequest.count({ where: { deletedAt: null, createdAt: { gte: startOfDay } } }),
      db.rentalRequest.count({ where: { deletedAt: null, createdAt: { gte: weekAgo } } }),
      db.category.count(),
      db.vehicle.findMany({ where: { deletedAt: null }, orderBy: { viewCount: 'desc' }, take: 6 }),
      db.rentalRequest.findMany({
        where: { deletedAt: null },
        include: { vehicle: true },
        orderBy: { createdAt: 'desc' },
        take: 8,
      }),
      db.vehicle.aggregate({ where: { deletedAt: null, dailyPrice: { not: null } }, _avg: { dailyPrice: true } }),
    ]);

  const stats: Array<[string, string | number, string]> = [
    ['Toplam Araç', total, ''],
    ['Müsait Araç', available, 'is-ok'],
    ['Kiradaki Araç', rented, ''],
    ['Rezerve', reserved, ''],
    ['Bakımda', maintenance, maintenance > 0 ? 'is-alert' : ''],
    ['Kategori', catCount, ''],
    ['Yeni Talep', newReq, newReq > 0 ? 'is-alert' : ''],
    ['Bugünkü Talep', todayReq, ''],
    ['Son 7 Gün', weekReq, ''],
    ['Ort. Günlük Fiyat', money(Math.round(revenueRows._avg.dailyPrice || 0)), ''],
  ];

  return (
    <div className="admin-page">
      <div className="admin-title">
        <div>
          <span>GENEL BAKIŞ</span>
          <h1>Dashboard</h1>
        </div>
        <Link className="btn btn-accent" href="/admin/vehicles/new">
          ＋ Yeni Araç Ekle
        </Link>
      </div>

      <div className="admin-stats">
        {stats.map(([label, value, tone]) => (
          <div className={`admin-stat ${tone}`} key={label}>
            <small>{label}</small>
            <strong>{value}</strong>
          </div>
        ))}
      </div>

      <div className="admin-columns">
        <section className="admin-card">
          <h2>Son kiralama talepleri</h2>
          <div className="admin-table">
            <table>
              <thead>
                <tr>
                  <th>Müşteri</th>
                  <th>Araç</th>
                  <th>Telefon</th>
                  <th>Durum</th>
                  <th>Tarih</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((r) => (
                  <tr key={r.id}>
                    <td><b>{r.fullName}</b></td>
                    <td>{r.vehicle.name}</td>
                    <td><a href={`tel:${r.phone}`}>{r.phone}</a></td>
                    <td><span className={`status ${r.status}`}>{REQUEST_STATUS[r.status]}</span></td>
                    <td>{dateShort(r.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {recent.length === 0 && <p className="table-count">Henüz talep yok.</p>}
          <div className="form-actions" style={{ marginTop: 16 }}>
            <Link className="btn btn-outline btn-sm" href="/admin/requests">Tüm talepleri gör</Link>
          </div>
        </section>

        <section className="admin-card">
          <h2>En çok incelenen araçlar</h2>
          {popular.map((v, i) => (
            <div className="popular-row" key={v.id}>
              <b>{i + 1}</b>
              <span>{v.name}</span>
              <small>{v.viewCount} görüntülenme</small>
            </div>
          ))}
          {popular.length === 0 && <p className="table-count">Henüz veri yok.</p>}
        </section>
      </div>
    </div>
  );
}
