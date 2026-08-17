import Link from 'next/link';
import PublicChrome from '@/components/PublicChrome';
import { getSettings } from '@/lib/site';

export const dynamic = 'force-dynamic';
export const metadata = {
  title: 'KVKK Aydınlatma Metni',
  description: '6698 sayılı Kişisel Verilerin Korunması Kanunu kapsamında aydınlatma metni.',
};

export default async function Page() {
  const s = await getSettings();

  return (
    <PublicChrome>
      <main>
        <section className="page-hero">
          <div className="container">
            <nav className="crumbs">
              <Link href="/">Ana Sayfa</Link>
              <span className="sep">/</span>
              <strong>KVKK Aydınlatma Metni</strong>
            </nav>
            <span className="eyebrow">YASAL</span>
            <h1>KVKK aydınlatma metni</h1>
            <p>6698 sayılı Kişisel Verilerin Korunması Kanunu kapsamında hazırlanmıştır.</p>
          </div>
        </section>

        <section className="section">
          <div className="container prose">
            <h2>1. Veri sorumlusu</h2>
            <p>
              Kişisel verileriniz, veri sorumlusu sıfatıyla {s?.companyLegalName} (“Şirket”) tarafından
              aşağıda açıklanan kapsamda işlenmektedir. Adres: {s?.address}. İletişim: {s?.email} ·{' '}
              {s?.phone}.
            </p>

            <h2>2. İşlenen kişisel veriler</h2>
            <ul>
              <li>Kimlik bilgileri: ad, soyad</li>
              <li>İletişim bilgileri: telefon numarası, e-posta adresi, adres</li>
              <li>Müşteri işlem bilgileri: kiralama talebi, tarih aralığı, teslim ve iade noktası</li>
              <li>Sözleşme aşamasına geçilmesi halinde: sürücü belgesi ve kimlik bilgileri, fatura bilgileri</li>
              <li>İşlem güvenliği bilgileri: IP adresi ve temel çerez kayıtları</li>
            </ul>

            <h2>3. İşleme amaçları</h2>
            <ul>
              <li>Kiralama talebinin değerlendirilmesi ve size dönüş yapılması</li>
              <li>Araç müsaitliğinin, fiyatlandırmanın ve koşulların paylaşılması</li>
              <li>Sözleşmenin kurulması, ifası ve faturalandırma süreçlerinin yürütülmesi</li>
              <li>Yasal yükümlülüklerin yerine getirilmesi ve resmî makam taleplerinin karşılanması</li>
              <li>Hizmet kalitesinin ölçülmesi ve iyileştirilmesi</li>
            </ul>

            <h2>4. Hukuki sebepler</h2>
            <p>
              Verileriniz; KVKK m.5/2-(c) sözleşmenin kurulması veya ifası için gerekli olması, m.5/2-(ç)
              hukuki yükümlülüğün yerine getirilmesi ve m.5/2-(f) meşru menfaat hukuki sebeplerine dayanılarak
              işlenir. Bunların dışındaki işlemeler açık rızanıza dayanır.
            </p>

            <h2>5. Aktarım</h2>
            <p>
              Kişisel verileriniz; yasal yükümlülükler kapsamında yetkili kamu kurum ve kuruluşlarına, hizmet
              alınan sigorta şirketleri ile yetkili servislere ve muhasebe/hukuk danışmanlarımıza, yalnızca
              ilgili amaçla sınırlı olarak aktarılabilir. Yurt dışına veri aktarımı yapılmamaktadır.
            </p>

            <h2>6. Saklama süresi</h2>
            <p>
              Sözleşmeye dönüşmeyen talep kayıtları en fazla 12 ay saklanır. Sözleşme kurulan kayıtlar ise
              ilgili mevzuatta öngörülen zamanaşımı ve saklama süreleri boyunca muhafaza edilir, sürenin
              dolmasıyla silinir veya anonim hâle getirilir.
            </p>

            <h2>7. Haklarınız</h2>
            <p>KVKK m.11 uyarınca aşağıdaki haklara sahipsiniz:</p>
            <ul>
              <li>Kişisel verinizin işlenip işlenmediğini öğrenme ve buna ilişkin bilgi talep etme</li>
              <li>İşlenme amacını ve amacına uygun kullanılıp kullanılmadığını öğrenme</li>
              <li>Yurt içinde veya yurt dışında verilerin aktarıldığı üçüncü kişileri bilme</li>
              <li>Eksik veya yanlış işlenmiş verilerin düzeltilmesini isteme</li>
              <li>Silinmesini veya yok edilmesini isteme</li>
              <li>Otomatik sistemlerle analiz sonucu aleyhinize bir sonuç doğmasına itiraz etme</li>
              <li>Kanuna aykırı işleme sebebiyle zarara uğramanız hâlinde zararın giderilmesini talep etme</li>
            </ul>

            <h2>8. Başvuru</h2>
            <p>
              Taleplerinizi {s?.email} adresine e-posta ile veya {s?.address} adresine yazılı olarak
              iletebilirsiniz. Başvurularınız en geç 30 gün içinde sonuçlandırılır.
            </p>
          </div>
        </section>
      </main>
    </PublicChrome>
  );
}
