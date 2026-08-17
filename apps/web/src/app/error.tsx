'use client';

export default function ErrorPage({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="error-page">
      <span>500</span>
      <h1>Beklenmeyen bir sorun oluştu.</h1>
      <p>Sayfayı yeniden yüklemeyi deneyin. Sorun sürerse bizi telefonla arayabilirsiniz.</p>
      <div className="btn-row">
        <button className="btn btn-accent" onClick={reset}>Tekrar Dene</button>
        <a className="btn btn-outline" href="/">Ana Sayfa</a>
      </div>
    </main>
  );
}
