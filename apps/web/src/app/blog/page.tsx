import Link from 'next/link';
import PublicChrome from '@/components/PublicChrome';
import Reveal from '@/components/Reveal';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Araç Kiralama Bilgi Merkezi',
  description: 'Araç kiralama, filo yönetimi ve sürüş konularında sade ve uygulanabilir rehberler.',
};

const POSTS: Array<[string, string, string[]]> = [
  ['dogru-arac', 'Araç kiralarken doğru sınıfı nasıl seçersiniz?', [
    'Doğru araç sınıfı, kiralama deneyiminin en belirleyici unsurudur. Şehir içi kısa mesafeli kullanımda kompakt bir hatchback hem park kolaylığı hem düşük yakıt tüketimi sağlar. Uzun yol ağırlıklı kullanımda ise sedan veya station wagon gövde, sürüş konforu ve bagaj hacmi açısından belirgin fark yaratır.',
    'Karar verirken dört soruyu net yanıtlayın: kaç kişi seyahat edecek, ne kadar bagaj taşınacak, günde ortalama kaç kilometre yapılacak ve rota şehir içi mi şehirler arası mı? Bu dört veriye göre seçilen araç, hem konfor hem maliyet açısından en dengeli sonucu verir.',
    'Yolcu sayısı beşin üzerine çıkıyorsa minibüs sınıfını, düzenli yük taşımanız gerekiyorsa panelvan veya kamyonet seçeneklerini değerlendirin. Yük hacmini litre yerine taşıyacağınız kutunun ölçüsüyle düşünmek daha sağlıklı bir karar verdirir.',
  ]],
  ['kurumsal-kiralama', 'Kurumsal kiralamanın bütçe avantajları', [
    'Araç satın almak yalnızca peşin bedel değil; değer kaybı, sigorta, bakım, lastik, muayene ve elden çıkarma süreçlerini de beraberinde getirir. Bu kalemlerin toplamı, çoğu işletmede başlangıçta öngörülenin üzerine çıkar.',
    'Kiralama, bu kalemleri tek bir dönemsel gidere dönüştürür. Bütçe planlaması kolaylaşır; nakit akışınız araç yatırımına bağlanmaz. Ayrıca aracın ikinci el değerindeki dalgalanma riski sizin üzerinizde kalmaz.',
    'Vergi tarafında, kiralama bedelleri genellikle doğrudan gider olarak kaydedilebilir. Kendi durumunuz için mali müşavirinizle birlikte değerlendirme yapmanız, doğru karşılaştırma için önemlidir.',
  ]],
  ['uzun-yol', 'Uzun yola çıkmadan önce kontrol listesi', [
    'Aracı teslim alırken lastik basınçlarını, diş derinliğini ve stepneyi kontrol edin. Aydınlatma sisteminin tamamını (far, sinyal, stop, sis) çalıştırarak gözden geçirin.',
    'Motor yağı, cam suyu ve soğutma sıvısı seviyelerini doğrulayın. Zorunlu ekipmanların (reflektör, ilk yardım çantası, yangın söndürücü) araçta ve geçerli tarihte olduğundan emin olun.',
    'Rotanızı dinlenme molalarıyla birlikte planlayın; iki saatte bir kısa mola yorgunluk kaynaklı riski belirgin şekilde azaltır. Aracın kullanım özelliklerini (vites modu, sürüş asistanları, yakıt kapağı) teslim sırasında öğrenmek yolda vakit kaybettirmez.',
  ]],
  ['elektrikli', 'Elektrikli araç kiralamadan önce bilinmesi gerekenler', [
    'Menzili katalog değeriyle değil, gerçek kullanım senaryonuzla değerlendirin. Soğuk hava, yüksek hız ve klima kullanımı menzili belirgin şekilde düşürür. Günlük ihtiyacınızın yaklaşık 1,3 katı menzile sahip bir araç güvenli bir tercih olur.',
    'Rotanız üzerindeki şarj noktalarını önceden inceleyin. DC hızlı şarj ile AC şarj arasındaki süre farkı, gün planınızı doğrudan etkiler.',
    'Şehir içi yoğun kullanımda elektrikli araçlar rejeneratif frenleme sayesinde beklenenden verimli çalışır. Buna karşılık düzenli uzun yol yapıyorsanız hibrit bir model daha dengeli bir seçim olabilir.',
  ]],
  ['kilometre-limiti', 'Kilometre limiti ve aşım ücreti nasıl hesaplanır?', [
    'Kiralama sözleşmelerinde günlük veya aylık kilometre limiti tanımlanır. Limit, aracın değer kaybını ve bakım sıklığını öngörülebilir kılmak için vardır.',
    'Aylık kullanımınızı gerçekçi hesaplamak için son üç ayın kilometre verisine bakın ve üzerine yaklaşık %15 pay ekleyin. Limitin altında kalmak, aşım ücreti ödemekten her zaman daha ekonomiktir.',
    'Limit aşımında km başına sabit bir ücret uygulanır. Bu tutar araç sayfasında açıkça belirtilir; sözleşme öncesinde teyit etmenizi öneririz.',
  ]],
  ['depozito', 'Depozito neden alınır, ne zaman iade edilir?', [
    'Depozito, kiralama süresince oluşabilecek hasar, trafik cezası veya yakıt farkı gibi kalemler için alınan geçici bir güvencedir. Kiralama bedelinin bir parçası değildir.',
    'Araç iade edildikten sonra kontrol tamamlanır; hasar ve ceza sorgusu sonuçlandığında depozito iade edilir. Ceza sorgularının sisteme yansıması nedeniyle bu süreç birkaç iş günü sürebilir.',
    'Depozito tutarı araç sınıfına göre değişir. Kurumsal sözleşmelerde, düzenli çalışılan müşteriler için depozito koşulları farklılaştırılabilir.',
  ]],
];

export default function Page() {
  return (
    <PublicChrome>
      <main>
        <section className="page-hero">
          <div className="container">
            <nav className="crumbs">
              <Link href="/">Ana Sayfa</Link>
              <span className="sep">/</span>
              <strong>Bilgi Merkezi</strong>
            </nav>
            <span className="eyebrow">BİLGİ MERKEZİ</span>
            <h1>Araç ve kiralama rehberleri</h1>
            <p>Kiralama kararınızı kolaylaştıran, sade ve doğrudan uygulanabilir bilgiler.</p>
          </div>
        </section>

        <section className="section">
          <div className="container blog-list">
            {POSTS.map(([id, title, paragraphs], i) => (
              <Reveal as="article" key={id} id={id} delay={i * 40}>
                <span>REHBER · {String(i + 1).padStart(2, '0')}</span>
                <h2>{title}</h2>
                {paragraphs.map((p) => (
                  <p key={p.slice(0, 24)}>{p}</p>
                ))}
              </Reveal>
            ))}
          </div>
        </section>
      </main>
    </PublicChrome>
  );
}
