import InfoPage from '@/components/InfoPage';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Filo Kiralama',
  description: 'İşletmenizin araç ihtiyacına uygun, esnek dönemli kurumsal filo kiralama çözümleri.',
};

export default function Page() {
  return (
    <InfoPage
      eyebrow="KURUMSAL ÇÖZÜMLER"
      title="Filo kiralama"
      crumb="Filo Kiralama"
      lead="Sermayenizi araca bağlamadan, ihtiyacınıza göre ölçeklenebilen bir araç filosuna sahip olun. Dönem, araç sınıfı ve kilometre planını birlikte belirleyelim."
      stats={[['12–48 ay', 'esnek sözleşme süresi'], ['1–100+', 'araçlık ölçek'], ['Tek', 'muhatap ve fatura']]}
      intro={{
        heading: 'Satın alma yükü olmadan büyüyen bir filo',
        body: [
          'Filo kiralama, işletmenizin araç ihtiyacını sabit bir dönemsel maliyetle karşılamanızı sağlar. Aracın satın alma bedeli, değer kaybı ve elden çıkarma süreci sizin gündeminizden çıkar.',
          'Ekip büyüklüğünüz veya saha operasyonunuz değiştiğinde filo da buna göre ölçeklenir. Yeni araç eklemek ya da mevcut araçları değiştirmek için yeni bir yatırım kararı almanız gerekmez.',
          'Sözleşme süresi, yıllık kilometre limiti ve araç sınıfı üçlüsünü kullanım verinize göre belirleriz; böylece hem gereksiz kapasite hem de limit aşım maliyetleri önlenir.',
        ],
      }}
      sections={[
        { number: '01', title: 'İhtiyaç analizi', text: 'Kaç araç, hangi sınıf, hangi rota ve aylık kaç kilometre? Mevcut kullanım verinizi birlikte inceleyip gerçekçi bir plan çıkarırız.' },
        { number: '02', title: 'Araç ve dönem seçimi', text: 'Bütçenize ve kullanım yoğunluğunuza uyan araç sınıflarını, 12 ile 48 ay arasında değişen sözleşme seçenekleriyle sunarız.' },
        { number: '03', title: 'Sözleşme ve teslimat', text: 'Koşullar netleştikten sonra sözleşme hazırlanır; araçlar belirlediğiniz lokasyonlara planlı şekilde teslim edilir.' },
        { number: '04', title: 'Kullanım süresi desteği', text: 'Periyodik bakım, lastik değişimi ve arıza durumlarında ikame araç süreçleri tek noktadan yürütülür.' },
        { number: '05', title: 'Raporlama', text: 'Filo maliyeti, kilometre kullanımı ve bakım geçmişi dönemsel olarak paylaşılır; bütçe planınızı verilerle yaparsınız.' },
        { number: '06', title: 'Dönem sonu', text: 'Sözleşme bitiminde araçları yenileyebilir, sayıyı artırıp azaltabilir veya süreyi uzatabilirsiniz.' },
      ]}
      bullets={{
        title: 'Kiralama paketine dahil olanlar',
        items: [
          'Zorunlu trafik sigortası ve kasko',
          'Periyodik bakım ve yağ değişimi',
          'Mevsimsel lastik değişimi ve depolama',
          'Arıza ve kaza durumunda ikame araç',
          'Muayene ve egzoz emisyon işlemleri',
          'Filo raporlaması ve tek kalem faturalandırma',
        ],
      }}
      cta="Filo ihtiyacınızı birlikte planlayalım"
      ctaText="Araç sayısı, kullanım süresi ve rotanızı paylaşın; size özel bir filo teklifi hazırlayalım."
    />
  );
}
