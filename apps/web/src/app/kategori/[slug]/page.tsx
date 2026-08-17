import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import PublicChrome from '@/components/PublicChrome';
import VehicleCard from '@/components/VehicleCard';
import Reveal from '@/components/Reveal';
import { db } from '@/lib/db';
import { getSettings, money } from '@/lib/site';
import styles from './category.module.css';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const c = await db.category.findUnique({ where: { slug } });
  if (!c) return {};
  return {
    title: `Kiralık ${c.name}`,
    description: c.description || `${c.name} kategorisindeki kiralık araç seçeneklerini inceleyin.`,
    alternates: { canonical: `/kategori/${c.slug}` },
  };
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const c = await db.category.findUnique({
    where: { slug },
    include: {
      vehicles: {
        where: { deletedAt: null, status: { not: 'PASSIVE' } },
        include: { category: true },
        orderBy: [{ featured: 'desc' }, { sortOrder: 'asc' }],
      },
    },
  });
  if (!c || !c.isActive) notFound();

  const s = await getSettings();
  const prices = c.vehicles.map((v) => v.dailyPrice).filter((p): p is number => !!p);
  const from = prices.length ? Math.min(...prices) : null;

  return (
    <PublicChrome>
      <main>
        {/* HERO SECTION */}
        <section className={styles.hero}>
          <div className={styles.container}>
            <div className={styles.heroContent}>
              <nav className={styles.crumbs}>
                <Link href="/">Ana Sayfa</Link>
                <span className={styles.sep}>/</span>
                <Link href="/araclar">Kiralık Araçlar</Link>
                <span className={styles.sep}>/</span>
                <strong>{c.name}</strong>
              </nav>
              
              <span className={styles.eyebrow}>KATEGORİ</span>
              <h1 className={styles.title}>Kiralık {c.name}</h1>
              
              <p className={styles.desc}>
                {c.longDescription || c.description || `${c.name} kategorisindeki araçlarımızı inceleyin ve ihtiyacınıza uygun olanı hemen kiralayın.`}
              </p>
              
              <div className={styles.statsBar}>
                <div className={styles.statItem}>
                  <span className={styles.statValue}>{c.vehicles.length}</span>
                  <span className={styles.statLabel}>Araç Seçeneği</span>
                </div>
                {from && (
                  <div className={styles.statItem}>
                    <span className={styles.statValue}>{money(from)}</span>
                    <span className={styles.statLabel}>Başlangıç Fiyatı / Gün</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* CATALOG SECTION */}
        <section className={styles.catalogSection}>
          <div className={styles.container}>
            {c.vehicles.length ? (
              <div className={styles.grid}>
                {c.vehicles.map((v, i) => (
                  <Reveal key={v.id} delay={i * 40}>
                    <VehicleCard v={v} phone={s?.phone || ''} whatsapp={s?.whatsapp || ''} />
                  </Reveal>
                ))}
              </div>
            ) : (
              <div className="empty">
                <h3>Bu kategoride şu anda yayında araç bulunmuyor.</h3>
                <p>İhtiyacınızı bize iletin; uygun aracı sizin için araştıralım.</p>
                <div className="btn-row" style={{ justifyContent: 'center' }}>
                  <Link className="btn btn-ink" href="/araclar">Diğer Araçlar</Link>
                  <Link className="btn btn-outline" href="/iletisim">Bize Ulaşın</Link>
                </div>
              </div>
            )}
          </div>
        </section>
      </main>
    </PublicChrome>
  );
}
