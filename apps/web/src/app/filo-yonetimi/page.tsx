import InfoPage from '@/components/InfoPage';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Filo Yönetimi',
  description: 'Araç filonuzun bakım, kullanım ve maliyet takibini tek noktadan yürütün.',
};

export default function Page() {
  return (
    <InfoPage
      eyebrow="OPERASYON"
      title="Filo yönetimi"
      crumb="Filo Yönetimi"
      lead="Araç başına maliyeti, bakım takvimini ve kullanım verilerini tek yerden görün. Operasyon yükünü ekibinizin üzerinden alalım."
      stats={[['Tek', 'muhatap'], ['Aylık', 'maliyet raporu'], ['Planlı', 'bakım takvimi']]}
      intro={{
        heading: 'Filonuzu tahminle değil veriyle yönetin',
        body: [
          'Filo büyüdükçe bakım tarihleri, muayene süreleri, lastik değişimleri ve ceza takibi ciddi bir operasyon yüküne dönüşür. Bu yükü üstlenerek ekibinizin asıl işine odaklanmasını sağlıyoruz.',
          'Her araç için bakım geçmişi, kilometre kullanımı ve maliyet kalemleri kayıt altında tutulur. Dönemsel raporlarla hangi aracın beklenenden pahalıya çalıştığını net olarak görürsünüz.',
          'Bakım ve muayene tarihleri yaklaştığında proaktif olarak bilgilendirme yapılır; araçlarınız plansız şekilde devre dışı kalmaz.',
        ],
      }}
      sections={[
        { number: '01', title: 'Bakım takvimi', text: 'Her aracın periyodik bakım ve muayene tarihleri takip edilir, zamanı geldiğinde randevu planlanır.' },
        { number: '02', title: 'Maliyet takibi', text: 'Yakıt, bakım, lastik ve sigorta kalemleri araç bazında raporlanır; toplam sahip olma maliyetini görürsünüz.' },
        { number: '03', title: 'Kullanım analizi', text: 'Kilometre verileriyle araçların gerçekten ihtiyaç duyulan sınıfta olup olmadığını değerlendiririz.' },
        { number: '04', title: 'Hasar ve ceza süreci', text: 'Kaza, hasar ve trafik cezası süreçleri takip edilir; evrak yükü ekibinizin üzerinden alınır.' },
        { number: '05', title: 'İkame araç', text: 'Planlı bakım veya arıza durumlarında operasyonun durmaması için ikame araç sağlanır.' },
        { number: '06', title: 'Dönemsel gözden geçirme', text: 'Üç aylık değerlendirmelerle filo yapısını ihtiyacınıza göre yeniden optimize ederiz.' },
      ]}
      cta="Filonuzun yönetimini bize bırakın"
      ctaText="Mevcut araç listenizi paylaşın; nereden tasarruf edebileceğinizi birlikte çıkaralım."
    />
  );
}
