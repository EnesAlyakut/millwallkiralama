import Link from 'next/link';
import PublicChrome from '@/components/PublicChrome';
import Reveal from '@/components/Reveal';
import BrandLogo from '@/components/BrandLogo';
import Icon from '@/components/Icon';
import { db } from '@/lib/db';
import styles from './brands.module.css';

export const dynamic = 'force-dynamic';
export const metadata = {
  title: 'Kiralık Araç Markaları',
  description: 'Millwal filosundaki kiralık araçları markaya göre keşfedin.',
};

export default async function Page() {
  const rows = await db.vehicle.groupBy({
    by: ['brand'],
    where: { deletedAt: null, status: { not: 'PASSIVE' } },
    _count: { brand: true },
    orderBy: { brand: 'asc' },
  });

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
                <strong>Markalar</strong>
              </nav>
              
              <span className={styles.eyebrow}>PREMİUM FİLO</span>
              <h1 className={styles.title}>Kiralık Araç Markaları</h1>
              
              <p className={styles.desc}>
                Dünyanın en seçkin otomobil markalarını keşfedin. İhtiyacınıza ve tarzınıza en uygun modeli seçerek hemen yola çıkın.
              </p>
              
              <div className={styles.statsBar}>
                <div className={styles.statItem}>
                  <span className={styles.statValue}>{rows.length}</span>
                  <span className={styles.statLabel}>Seçkin Marka</span>
                </div>
                <div className={styles.statItem}>
                  <span className={styles.statValue}>{rows.reduce((t, r) => t + r._count.brand, 0)}</span>
                  <span className={styles.statLabel}>Kiralık Araç</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CATALOG SECTION */}
        <section className={styles.catalogSection}>
          <div className={styles.container}>
            <div className={styles.grid}>
              {rows.map((row, i) => (
                <Reveal as="div" key={row.brand} delay={i * 30}>
                  <Link 
                    href={`/araclar?marka=${encodeURIComponent(row.brand)}`}
                    className={styles.card}
                  >
                    <div className={styles.logoBox}>
                      <BrandLogo name={row.brand} size={32} className={styles.logoImg} />
                    </div>
                    
                    <div className={styles.cardBody}>
                      <h3 className={styles.brandName}>{row.brand}</h3>
                      <span className={styles.vehicleCount}>
                        {row._count.brand} araç
                      </span>
                    </div>
                    
                    <div className={styles.arrowIcon}>
                      <Icon name="arrow-right" size={20} />
                    </div>
                  </Link>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      </main>
    </PublicChrome>
  );
}
