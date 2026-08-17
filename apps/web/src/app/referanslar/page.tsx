import InfoPage from '@/components/InfoPage';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Hizmet Yaklaşımımız',
  description: 'Millwal Kurumsal Kiralama hizmet standartları ve çalışma yöntemi.',
};

export default function Page() {
  return (
    <InfoPage
      eyebrow="HİZMET STANDARDI"
      title="Hizmet yaklaşımımız"
      crumb="Hizmet Yaklaşımımız"
      lead="Kiralama sürecinin her adımında ne yaptığımızı, ne zaman yaptığımızı ve neyi taahhüt ettiğimizi baştan paylaşıyoruz."
      stats={[['Aynı gün', 'talep dönüşü'], ['Yazılı', 'sözleşme'], ['Tek', 'muhatap']]}
      intro={{
        heading: 'İyi hizmet, sürprizsiz hizmettir',
        body: [
          'Araç kiralamada memnuniyetsizliğin büyük bölümü, sonradan ortaya çıkan koşullardan kaynaklanır. Bu yüzden fiyat, kilometre limiti, sigorta muafiyeti ve depozito gibi kalemleri sözleşme öncesinde yazılı olarak paylaşırız.',
          'Teslim ve iade anında araç durum formu birlikte doldurulur; fotoğraflarla kayıt altına alınır. Böylece hasar tartışmaları yaşanmaz.',
          'Kiralama süresince muhatabınız değişmez. Aynı kişiyle iletişim kurar, süreci baştan anlatmak zorunda kalmazsınız.',
        ],
      }}
      sections={[
        { number: '01', title: 'Talep karşılama', text: 'Telefon, WhatsApp veya form üzerinden gelen talepler mesai saatleri içinde yanıtlanır.' },
        { number: '02', title: 'Şeffaf teklif', text: 'Teklifte dahil olan ve olmayan kalemler ayrı ayrı belirtilir; sonradan kalem eklenmez.' },
        { number: '03', title: 'Teslim protokolü', text: 'Araç durum formu, yakıt seviyesi ve kilometre bilgisi taraflarca birlikte kayıt altına alınır.' },
        { number: '04', title: 'Kullanım desteği', text: 'Kiralama boyunca teknik sorularınız ve acil durumlar için ulaşabileceğiniz tek bir hat vardır.' },
        { number: '05', title: 'İade süreci', text: 'İadede aynı kontrol listesi uygulanır; depozito iadesi hızlıca sonuçlandırılır.' },
        { number: '06', title: 'Geri bildirim', text: 'Kiralama sonrası deneyiminizi sorar, aksayan noktaları süreçlerimize yansıtırız.' },
      ]}
      cta="Çalışma yöntemimizi denemek ister misiniz?"
      ctaText="Küçük bir kiralamayla başlayın; süreci birlikte görelim."
    />
  );
}
