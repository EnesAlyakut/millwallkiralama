import InfoPage from '@/components/InfoPage';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Operasyonel Hizmetler',
  description: 'Bakım, lastik, ikame araç ve hasar süreçlerini kapsayan operasyonel destek hizmetleri.',
};

export default function Page() {
  return (
    <InfoPage
      eyebrow="DESTEK HİZMETLERİ"
      title="Operasyonel hizmetler"
      crumb="Operasyonel Hizmetler"
      lead="Kiralama süresince araçlarınızın yolda kalmasını sağlayan bakım, lastik, ikame araç ve hasar yönetimi hizmetleri."
      stats={[['7/24', 'destek hattı'], ['Planlı', 'bakım organizasyonu'], ['Hızlı', 'ikame araç']]}
      intro={{
        heading: 'Aracınız durduğunda işiniz durmasın',
        body: [
          'Bir aracın plansız şekilde servise girmesi, saha ekibinin bir gününü kaybetmesi anlamına gelir. Operasyonel hizmetlerimiz tam olarak bu kaybı önlemek için kurgulanmıştır.',
          'Bakım randevularını yoğunluğunuzun düşük olduğu zamanlara planlar, gerekli durumlarda araç alma-bırakma hizmetiyle ekibinizi servise göndermeden süreci tamamlarız.',
          'Arıza veya kaza halinde ikame araç süreci devreye girer; operasyonunuz kesintiye uğramadan devam eder.',
        ],
      }}
      sections={[
        { number: '01', title: 'Periyodik bakım', text: 'Üretici bakım takvimine uygun servis randevuları planlanır ve takip edilir.' },
        { number: '02', title: 'Lastik hizmetleri', text: 'Mevsimsel lastik değişimi, balans-rot ayarı ve lastik depolama tek paket halinde sunulur.' },
        { number: '03', title: 'İkame araç', text: 'Bakım veya onarım süresince operasyonunuzun aksamaması için ikame araç sağlanır.' },
        { number: '04', title: 'Hasar yönetimi', text: 'Kaza sonrası ekspertiz, sigorta ve onarım süreçleri baştan sona takip edilir.' },
        { number: '05', title: 'Yol yardımı', text: 'Lastik patlaması, akü ve çekici ihtiyacında 7/24 yol yardımı desteği devreye girer.' },
        { number: '06', title: 'Muayene işlemleri', text: 'Zorunlu araç muayenesi ve egzoz emisyon ölçümü sizin adınıza organize edilir.' },
      ]}
      bullets={{
        title: 'Hizmet kapsamı',
        items: [
          'Servis randevusu planlama ve araç alma-bırakma',
          'Mevsimsel lastik değişimi ve depolama',
          'İkame araç tedariki',
          'Kaza ve hasar dosyası takibi',
          '7/24 yol yardımı',
          'Muayene ve resmi işlem takibi',
        ],
      }}
      cta="Operasyon yükünü bize devredin"
      ctaText="Mevcut süreçlerinizi anlatın; hangi adımları üstlenebileceğimizi netleştirelim."
    />
  );
}
