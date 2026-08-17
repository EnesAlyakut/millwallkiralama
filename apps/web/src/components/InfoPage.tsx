import Link from 'next/link';
import PublicChrome from './PublicChrome';
import Reveal from './Reveal';

export type InfoSection = { number: string; title: string; text: string };

export type InfoPageProps = {
  eyebrow: string;
  title: string;
  lead: string;
  crumb?: string;
  stats?: Array<[string, string]>;
  intro?: { heading: string; body: string[] };
  sections: InfoSection[];
  bullets?: { title: string; items: string[] };
  cta?: string;
  ctaText?: string;
};

export default function InfoPage({
  eyebrow,
  title,
  lead,
  crumb,
  stats,
  intro,
  sections,
  bullets,
  cta = 'Bir sonraki adımı birlikte planlayalım',
  ctaText = 'İhtiyacınızı paylaşın, size uygun kiralama kurgusunu birlikte oluşturalım.',
}: InfoPageProps) {
  return (
    <PublicChrome>
      <main>
        <section className="page-hero">
          <div className="container">
            <nav className="crumbs">
              <Link href="/">Ana Sayfa</Link>
              <span className="sep">/</span>
              <strong>{crumb || title}</strong>
            </nav>
            <span className="eyebrow">{eyebrow}</span>
            <h1>{title}</h1>
            <p>{lead}</p>
            {stats && (
              <div className="page-hero-stats">
                {stats.map(([value, label]) => (
                  <div key={label}>
                    <strong>{value}</strong>
                    <span>{label}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {intro && (
          <section className="section">
            <div className="container">
              <div className="sect-head">
                <div>
                  <span className="eyebrow eyebrow-dark">GENEL BAKIŞ</span>
                  <h2>{intro.heading}</h2>
                </div>
              </div>
              <Reveal className="prose">
                {intro.body.map((paragraph) => (
                  <p key={paragraph.slice(0, 24)}>{paragraph}</p>
                ))}
              </Reveal>
            </div>
          </section>
        )}

        <section className="section section-tint">
          <div className="container">
            <div className="sect-head">
              <div>
                <span className="eyebrow eyebrow-dark">AYRINTILAR</span>
                <h2>Profesyonel yaklaşım, ölçülebilir fayda.</h2>
              </div>
            </div>
            <div className="info-cards">
              {sections.map((item, i) => (
                <Reveal as="article" key={item.number} delay={i * 60}>
                  <b>{item.number}</b>
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {bullets && (
          <section className="section">
            <div className="container">
              <div className="sect-head">
                <div>
                  <span className="eyebrow eyebrow-dark">KAPSAM</span>
                  <h2>{bullets.title}</h2>
                </div>
              </div>
              <Reveal className="prose">
                <ul>
                  {bullets.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </Reveal>
            </div>
          </section>
        )}

        <section className="section">
          <div className="container">
            <div className="cta-box">
              <div>
                <span className="eyebrow">BİR SONRAKİ ADIM</span>
                <h2>{cta}</h2>
                <p>{ctaText}</p>
              </div>
              <div className="btn-row">
                <Link className="btn btn-accent" href="/iletisim">
                  Talebinizi İletin
                </Link>
                <Link className="btn btn-ghost" href="/araclar">
                  Araçları İnceleyin
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    </PublicChrome>
  );
}
