import Link from 'next/link';
import PublicChrome from '@/components/PublicChrome';
import { getSettings } from '@/lib/site';

export const dynamic = 'force-dynamic';
export const metadata = {
  title: 'Gizlilik ve Çerez Politikası',
  description: 'Web sitemizde kullanılan çerezler ve gizlilik uygulamaları hakkında bilgi.',
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
              <strong>Gizlilik &amp; Çerezler</strong>
            </nav>
            <span className="eyebrow">YASAL</span>
            <h1>Gizlilik ve çerez politikası</h1>
            <p>Sitemizi kullanırken hangi verilerin toplandığını ve nasıl kullanıldığını açıklar.</p>
          </div>
        </section>

        <section className="section">
          <div className="container prose">
            <h2>Genel ilke</h2>
            <p>
              {s?.companyLegalName} olarak, web sitemizi ziyaret edenlerin gizliliğine önem veriyoruz. Sitemiz
              üzerinden yalnızca hizmetin sunulması için gerekli olan verileri topluyor; bu verileri
              pazarlama amacıyla üçüncü taraflara satmıyoruz.
            </p>

            <h2>Toplanan bilgiler</h2>
            <ul>
              <li>Talep formu aracılığıyla ilettiğiniz ad, telefon, e-posta ve mesaj içeriği</li>
              <li>Sunucu kayıtlarında tutulan IP adresi ve tarayıcı bilgisi</li>
              <li>Sitenin çalışması için gerekli temel çerez kayıtları</li>
            </ul>

            <h2>Çerez türleri</h2>
            <h3>Zorunlu çerezler</h3>
            <p>
              Oturum yönetimi, form güvenliği ve tercihlerinizin hatırlanması için kullanılır. Bu çerezler
              olmadan site düzgün çalışmaz ve devre dışı bırakılamaz.
            </p>
            <h3>İşlevsel çerezler</h3>
            <p>
              Çerez tercihiniz ve kampanya penceresini kapatma gibi seçimlerinizi hatırlar; her ziyarette aynı
              bildirimleri görmenizi engeller.
            </p>
            <h3>Ölçüm çerezleri</h3>
            <p>
              Hangi araç sayfalarının daha çok incelendiğini anlamak için temel sayaç bilgisi tutulur. Bu
              ölçüm kişisel kimliğinizi tespit etmeye yönelik değildir.
            </p>

            <h2>Çerez tercihlerinizi yönetme</h2>
            <p>
              Siteyi ilk ziyaretinizde gösterilen bildirim üzerinden tercihinizi belirleyebilirsiniz.
              Ayrıca tarayıcınızın ayarlar bölümünden çerezleri silebilir veya engelleyebilirsiniz; ancak
              zorunlu çerezlerin engellenmesi bazı işlevleri kullanılamaz hâle getirebilir.
            </p>

            <h2>Veri güvenliği</h2>
            <p>
              Verileriniz yetkisiz erişime karşı korunur; yönetim paneline erişim şifreli oturum ve rol
              bazlı yetkilendirme ile sınırlandırılmıştır. Aktarım sırasında güvenli bağlantı kullanılır.
            </p>

            <h2>İletişim</h2>
            <p>
              Gizlilik uygulamalarımıza ilişkin sorularınız için {s?.email} adresinden bize
              ulaşabilirsiniz. Kişisel verilerinize ilişkin haklarınız için{' '}
              <Link href="/kvkk">KVKK Aydınlatma Metni</Link> sayfasını inceleyebilirsiniz.
            </p>
          </div>
        </section>
      </main>
    </PublicChrome>
  );
}
