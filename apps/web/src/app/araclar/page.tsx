import type { Metadata } from 'next';
import Link from 'next/link';
import type { Prisma } from '@kiralama/database';
import PublicChrome from '@/components/PublicChrome';
import VehicleCard from '@/components/VehicleCard';
import FilterToggle from '@/components/FilterToggle';
import Reveal from '@/components/Reveal';
import Icon from '@/components/Icon';
import { db } from '@/lib/db';
import { getSettings } from '@/lib/site';
import { FUEL_TYPES, SORT_OPTIONS, TRANSMISSIONS } from '@/lib/fleet';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Kiralık Araçlarımız',
  description:
    'Millwal araç filosunu kategori, marka, vites, yakıt türü ve fiyata göre filtreleyin; ihtiyacınıza uygun kiralık aracı bulun.',
};

const PER_PAGE = 12;

type Query = Record<string, string | undefined>;

function orderFor(sort?: string): Prisma.VehicleOrderByWithRelationInput[] {
  switch (sort) {
    case 'fiyat-artan':
      return [{ dailyPrice: 'asc' }, { sortOrder: 'asc' }];
    case 'fiyat-azalan':
      return [{ dailyPrice: 'desc' }, { sortOrder: 'asc' }];
    case 'yeni':
      return [{ createdAt: 'desc' }];
    case 'populer':
      return [{ viewCount: 'desc' }, { sortOrder: 'asc' }];
    case 'model-yili':
      return [{ year: 'desc' }, { sortOrder: 'asc' }];
    default:
      return [{ featured: 'desc' }, { sortOrder: 'asc' }, { createdAt: 'desc' }];
  }
}

function buildHref(q: Query, remove: string) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(q)) {
    if (value && key !== remove && key !== 'page') params.set(key, value);
  }
  const qs = params.toString();
  return qs ? `/araclar?${qs}` : '/araclar';
}

function pageHref(q: Query, page: number) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(q)) {
    if (value && key !== 'page') params.set(key, value);
  }
  if (page > 1) params.set('page', String(page));
  const qs = params.toString();
  return qs ? `/araclar?${qs}` : '/araclar';
}

export default async function Page({ searchParams }: { searchParams: Promise<Query> }) {
  const q = await searchParams;
  const page = Math.max(1, Number(q.page) || 1);

  const where: Prisma.VehicleWhereInput = { deletedAt: null, status: { not: 'PASSIVE' } };
  if (q.kategori) where.category = { slug: q.kategori };
  if (q.marka) where.brand = q.marka;
  if (q.vites) where.transmission = q.vites;
  if (q.yakit) where.fuelType = q.yakit;
  if (q.koltuk) where.seatCount = { gte: Number(q.koltuk) || 0 };
  if (q.max) where.dailyPrice = { lte: Number(q.max) || undefined };
  if (q.ara) {
    where.OR = [
      { name: { contains: q.ara } },
      { brand: { contains: q.ara } },
      { model: { contains: q.ara } },
      { bodyType: { contains: q.ara } },
    ];
  }

  const [items, total, categories, brandRows, s] = await Promise.all([
    db.vehicle.findMany({
      where,
      include: { category: true },
      orderBy: orderFor(q.sirala),
      skip: (page - 1) * PER_PAGE,
      take: PER_PAGE,
    }),
    db.vehicle.count({ where }),
    db.category.findMany({ where: { isActive: true }, orderBy: { sortOrder: 'asc' } }),
    db.vehicle.findMany({
      where: { deletedAt: null, status: { not: 'PASSIVE' } },
      select: { brand: true },
      distinct: ['brand'],
      orderBy: { brand: 'asc' },
    }),
    getSettings(),
  ]);

  const pages = Math.max(1, Math.ceil(total / PER_PAGE));
  const activeKeys = ['kategori', 'marka', 'vites', 'yakit', 'koltuk', 'max', 'ara'].filter((k) => q[k]);
  const labels: Record<string, string> = {
    kategori: 'Kategori', marka: 'Marka', vites: 'Vites',
    yakit: 'Yakıt', koltuk: 'Min. koltuk', max: 'Maks. günlük', ara: 'Arama',
  };

  return (
    <PublicChrome>
      <main>
        <section className="page-hero">
          <div className="container">
            <nav className="crumbs">
              <Link href="/">Ana Sayfa</Link>
              <span className="sep">/</span>
              <strong>Kiralık Araçlar</strong>
            </nav>
            <span className="eyebrow">MILLWAL FİLOSU</span>
            <h1>Kiralık araçlarımız</h1>
            <p>
              Filtreleri kullanarak ihtiyacınıza uyan aracı saniyeler içinde bulun. Her araç sayfasında
              teknik özellikler, donanım listesi ve kiralama koşulları ayrıntılı olarak yer alır.
            </p>
            <div className="page-hero-stats">
              <div>
                <strong>{total}</strong>
                <span>filtreye uyan araç</span>
              </div>
              <div>
                <strong>{categories.length}</strong>
                <span>kategori</span>
              </div>
              <div>
                <strong>{brandRows.length}</strong>
                <span>marka</span>
              </div>
            </div>
          </div>
        </section>

        <div className="container listing-layout">
          <div>
            <FilterToggle count={activeKeys.length}>
              <aside className="filter-panel">
                <div className="filter-head">
                  <h3>
                    Filtrele
                    {activeKeys.length > 0 && <em>{activeKeys.length}</em>}
                  </h3>
                  {activeKeys.length > 0 && (
                    <Link href="/araclar">
                      Temizle <Icon name="close" size={14} />
                    </Link>
                  )}
                </div>

                <form>
                  {q.sirala && <input type="hidden" name="sirala" value={q.sirala} />}

                  <div className="filter-body">

                  <div className="filter-block">
                    <span>Arama</span>
                    <input name="ara" defaultValue={q.ara || ''} placeholder="Marka, model veya araç adı" />
                  </div>

                  <div className="filter-block">
                    <span>Kategori</span>
                    <select name="kategori" defaultValue={q.kategori || ''}>
                      <option value="">Tüm kategoriler</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.slug}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="filter-block">
                    <span>Marka</span>
                    <select name="marka" defaultValue={q.marka || ''}>
                      <option value="">Tüm markalar</option>
                      {brandRows.map((b) => (
                        <option key={b.brand} value={b.brand}>
                          {b.brand}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="filter-block">
                    <span>Vites</span>
                    <div className="filter-pills">
                      {TRANSMISSIONS.map((t) => (
                        <label key={t}>
                          <input type="radio" name="vites" value={t} defaultChecked={q.vites === t} />
                          {t}
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="filter-block">
                    <span>Yakıt</span>
                    <div className="filter-pills">
                      {FUEL_TYPES.map((f) => (
                        <label key={f}>
                          <input type="radio" name="yakit" value={f} defaultChecked={q.yakit === f} />
                          {f}
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="filter-block">
                    <span>Minimum koltuk</span>
                    <div className="filter-pills">
                      {['2', '4', '5', '7'].map((n) => (
                        <label key={n}>
                          <input type="radio" name="koltuk" value={n} defaultChecked={q.koltuk === n} />
                          {n}+
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="filter-block">
                    <span>Maksimum günlük fiyat (₺)</span>
                    <input name="max" type="number" min={0} step={100} defaultValue={q.max || ''} placeholder="Örn. 2500" />
                      <small className="filter-hint">Belirtilen tutara kadar olan araçlar listelenir.</small>
                    </div>
                  </div>

                  <div className="filter-actions">
                    <button className="btn btn-dark btn-block">
                      <Icon name="checklist" size={18} /> Sonuçları Göster
                    </button>
                    {activeKeys.length > 0 && (
                      <Link className="filter-reset" href="/araclar">
                        Filtreleri sıfırla
                      </Link>
                    )}
                  </div>
                </form>
              </aside>
            </FilterToggle>
          </div>

          <section>
            <div className="listing-toolbar">
              <h2>
                <span>{total}</span> araç bulundu
              </h2>
              <form>
                {activeKeys.map((k) => (
                  <input key={k} type="hidden" name={k} value={q[k]} />
                ))}
                <select name="sirala" defaultValue={q.sirala || 'onerilen'}>
                  {SORT_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
                <button className="btn btn-outline btn-sm">Uygula</button>
              </form>
            </div>

            {activeKeys.length > 0 && (
              <div className="active-filters">
                {activeKeys.map((k) => (
                  <Link key={k} href={buildHref(q, k)}>
                    {labels[k]}: {q[k]} <span aria-hidden="true">×</span>
                  </Link>
                ))}
              </div>
            )}

            {items.length ? (
              <>
                <div className="vehicle-grid">
                  {items.map((v, i) => (
                    <Reveal key={v.id} delay={i * 40}>
                      <VehicleCard v={v} phone={s?.phone || ''} whatsapp={s?.whatsapp || ''} />
                    </Reveal>
                  ))}
                </div>

                {pages > 1 && (
                  <nav className="pager" aria-label="Sayfalama">
                    <Link className={page <= 1 ? 'is-off' : ''} href={pageHref(q, page - 1)}>
                      ‹ Önceki
                    </Link>
                    {Array.from({ length: pages }, (_, i) => i + 1)
                      .filter((n) => n === 1 || n === pages || Math.abs(n - page) <= 1)
                      .map((n, idx, arr) => (
                        <span key={n} style={{ display: 'contents' }}>
                          {idx > 0 && arr[idx - 1] !== n - 1 && <span className="is-off">…</span>}
                          <Link className={n === page ? 'is-active' : ''} href={pageHref(q, n)}>
                            {n}
                          </Link>
                        </span>
                      ))}
                    <Link className={page >= pages ? 'is-off' : ''} href={pageHref(q, page + 1)}>
                      Sonraki ›
                    </Link>
                  </nav>
                )}
              </>
            ) : (
              <div className="empty">
                <h3>Bu filtreye uyan araç bulunamadı.</h3>
                <p>
                  Filtreleri gevşetebilir veya ihtiyacınızı doğrudan bize iletebilirsiniz; uygun aracı
                  birlikte bulalım.
                </p>
                <div className="btn-row" style={{ justifyContent: 'center' }}>
                  <Link className="btn btn-dark" href="/araclar">
                    Filtreleri Temizle
                  </Link>
                  <Link className="btn btn-outline" href="/iletisim">
                    Bize Ulaşın
                  </Link>
                </div>
              </div>
            )}
          </section>
        </div>
      </main>
    </PublicChrome>
  );
}
