import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="error-page">
      <span>404</span>
      <h1>Aradığınız sayfa bulunamadı.</h1>
      <p>
        Sayfa taşınmış veya kaldırılmış olabilir. Filoyu inceleyerek aradığınız araca ulaşabilirsiniz.
      </p>
      <div className="btn-row">
        <Link className="btn btn-accent" href="/">Ana Sayfaya Dön</Link>
        <Link className="btn btn-outline" href="/araclar">Araçları İncele</Link>
      </div>
    </main>
  );
}
