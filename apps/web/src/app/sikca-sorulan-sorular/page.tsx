import Link from 'next/link';
import PublicChrome from '@/components/PublicChrome';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Sıkça Sorulan Sorular',
  description: 'Kiralama süreci, fiyatlandırma, belgeler ve iletişim hakkında merak edilenler.',
};

const GROUPS: Array<[string, Array<[string, string]>]> = [
  ['Kiralama süreci', [
    ['Millwal’da üyelik gerekiyor mu?', 'Hayır. Araçları üyelik oluşturmadan inceleyebilir; telefon, WhatsApp veya araç sayfasındaki talep formuyla bize ulaşabilirsiniz.'],
    ['Talep formu rezervasyon anlamına gelir mi?', 'Hayır. Form bir ön talep oluşturur. Müsaitlik ve kiralama koşulları, ekibimizin sizinle iletişime geçmesiyle kesinleşir.'],
    ['Hangi dönemlerde kiralama yapılabilir?', 'Araçta tanımlanan minimum gün bilgisine bağlı olarak günlük, haftalık, aylık veya kurumsal uzun dönem seçenekleri değerlendirilebilir.'],
    ['Kiralama süresini uzatabilir miyim?', 'Süre bitiminden önce bildirmeniz halinde, araç müsaitse uzatma yapılabilir. Talebinizi en az 24 saat önce iletmeniz süreci hızlandırır.'],
  ]],
  ['Belgeler ve koşullar', [
    ['Kiralama için hangi belgeler gerekiyor?', 'Geçerli sürücü belgesi, kimlik ve kiralayan adına kredi kartı gereklidir. Kurumsal kiralamalarda ayrıca vergi levhası ve imza sirküleri talep edilir.'],
    ['Yaş ve ehliyet şartı nedir?', 'Araç sınıfına göre değişmekle birlikte genel olarak en az 21 yaş ve 1 yıllık ehliyet gerekir. Üst sınıf araçlarda bu koşullar yükselebilir; ilgili araç sayfasında belirtilir.'],
    ['Ek sürücü tanımlayabilir miyim?', 'Evet. Ek sürücünün de yaş ve ehliyet koşullarını sağlaması ve sözleşmede tanımlanması gerekir.'],
    ['Aracı yurt dışına çıkarabilir miyim?', 'Yurt içi kullanımda kısıtlama yoktur. Yurt dışı çıkışları için önceden yazılı izin alınması gerekir.'],
  ]],
  ['Fiyatlandırma', [
    ['Fiyatlar neden bazı araçlarda görünmüyor?', 'Dönemsel koşullar veya araç tipi nedeniyle bazı fiyatlar görüşme sırasında paylaşılır. Bu araçlarda “Teklif alın” ifadesi gösterilir.'],
    ['Fiyatlara neler dahil?', 'Zorunlu trafik sigortası, kasko ve periyodik bakım kapsam içindedir. Yakıt, otoyol/köprü geçişleri ve trafik cezaları kiracıya aittir.'],
    ['Online ödeme yapılıyor mu?', 'Hayır. Sitede kart, sepet veya satın alma sistemi bulunmaz. Kiralama süreci firma yetkilisiyle görüşülerek ilerler.'],
    ['Depozito ne zaman iade edilir?', 'Araç iadesi sonrası hasar ve ceza kontrolü tamamlandığında iade edilir. Ceza sorgularının sisteme yansıması nedeniyle birkaç iş günü sürebilir.'],
  ]],
  ['Kullanım ve destek', [
    ['Arıza durumunda ne yapmalıyım?', 'Destek hattımızı arayın. Yol yardımı organize edilir; onarım süresi uzarsa ikame araç sağlanır.'],
    ['Kaza durumunda süreç nasıl işler?', 'Öncelikle güvenliğinizi sağlayın ve kaza tespit tutanağı düzenleyin. Ardından bizi bilgilendirin; sigorta ve onarım sürecini biz takip ederiz.'],
    ['WhatsApp mesajı araca göre değişir mi?', 'Evet. Araç detayındaki WhatsApp butonu, seçtiğiniz aracın adını mesaj içine otomatik olarak ekler.'],
  ]],
];

export default function Page() {
  const faqLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: GROUPS.flatMap(([, items]) =>
      items.map(([q, a]) => ({
        '@type': 'Question',
        name: q,
        acceptedAnswer: { '@type': 'Answer', text: a },
      })),
    ),
  };

  return (
    <PublicChrome>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
      <main>
        <section className="page-hero">
          <div className="container">
            <nav className="crumbs">
              <Link href="/">Ana Sayfa</Link>
              <span className="sep">/</span>
              <strong>Sıkça Sorulan Sorular</strong>
            </nav>
            <span className="eyebrow">DESTEK</span>
            <h1>Sıkça sorulan sorular</h1>
            <p>Kiralama, fiyatlandırma, belgeler ve destek süreçleriyle ilgili merak edilenler.</p>
          </div>
        </section>

        <section className="section">
          <div className="container container-narrow">
            {GROUPS.map(([group, items]) => (
              <div key={group} style={{ marginBottom: 44 }}>
                <span className="eyebrow eyebrow-dark">{group.toLocaleUpperCase('tr-TR')}</span>
                <div className="accordion" style={{ marginTop: 16 }}>
                  {items.map(([q, a]) => (
                    <details key={q}>
                      <summary>
                        {q} <i>+</i>
                      </summary>
                      <div>{a}</div>
                    </details>
                  ))}
                </div>
              </div>
            ))}

            <div className="empty">
              <h3>Sorunuzun yanıtını bulamadınız mı?</h3>
              <p>Bize doğrudan yazın; en kısa sürede dönüş yapalım.</p>
              <Link className="btn btn-dark" href="/iletisim">Bize Ulaşın</Link>
            </div>
          </div>
        </section>
      </main>
    </PublicChrome>
  );
}
