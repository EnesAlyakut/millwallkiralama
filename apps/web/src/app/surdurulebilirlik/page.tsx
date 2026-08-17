import InfoPage from '@/components/InfoPage';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Sürdürülebilirlik',
  description: 'Filo yenileme, emisyon azaltımı ve kaynak verimliliğine yönelik yaklaşımımız.',
};

export default function Page() {
  return (
    <InfoPage
      eyebrow="SORUMLULUK"
      title="Sürdürülebilirlik"
      crumb="Sürdürülebilirlik"
      lead="Daha verimli araçlar, daha planlı kullanım ve daha az atık. Kiralama modelinin çevresel avantajlarını somut adımlarla destekliyoruz."
      stats={[['Euro 6', 'emisyon standardı'], ['Elektrikli', 've hibrit seçenekler'], ['Planlı', 'bakım = az atık']]}
      intro={{
        heading: 'Paylaşımlı kullanım, daha az kaynak',
        body: [
          'Kiralama modeli doğası gereği kaynak verimlidir: aynı araç, tek bir işletmenin atıl kapasitesi olarak beklemek yerine daha yüksek doluluk oranıyla kullanılır.',
          'Filomuzu düşük emisyonlu ve güncel motor teknolojisine sahip araçlarla yeniliyor; elektrikli ve hibrit seçeneklerin payını kademeli olarak artırıyoruz.',
          'Periyodik bakımların zamanında yapılması yakıt tüketimini ve parça atığını azaltır. Bakım takvimini titizlikle takip etmemizin bir nedeni de budur.',
        ],
      }}
      sections={[
        { number: '01', title: 'Filo yenileme', text: 'Araçlar belirli kilometre ve yaş eşiklerinde yenilenerek emisyon ve arıza oranı düşük tutulur.' },
        { number: '02', title: 'Düşük emisyon', text: 'Elektrikli ve hibrit araç seçeneklerini genişletiyor, müşterilerimizi bu sınıflara yönlendiriyoruz.' },
        { number: '03', title: 'Atık yönetimi', text: 'Yağ, lastik ve akü gibi atıklar yetkili toplama noktalarına yönlendirilir.' },
        { number: '04', title: 'Dijital süreç', text: 'Sözleşme ve teslim formlarını dijitalleştirerek kâğıt kullanımını azaltıyoruz.' },
        { number: '05', title: 'Rota verimliliği', text: 'Teslimat planlamasını toplulaştırarak araç hareketlerini ve yakıt tüketimini azaltıyoruz.' },
        { number: '06', title: 'Sürücü bilinci', text: 'Teslim sırasında yakıt verimliliğini artıran kullanım önerilerini paylaşıyoruz.' },
      ]}
      cta="Düşük emisyonlu bir filo kurgulayalım"
      ctaText="Elektrikli ve hibrit seçeneklerin operasyonunuza uygunluğunu birlikte değerlendirelim."
    />
  );
}
