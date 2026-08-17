'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { BODY_TYPES, DRIVE_TYPES, FUEL_TYPES, SEGMENTS, TRANSMISSIONS } from '@/lib/fleet';
import { slugify } from '@/lib/site';

type Category = { id: string; name: string };
type Initial = Record<string, unknown> & {
  id?: string;
  images?: { imageUrl: string }[];
  interiorImages?: string | null;
};

/** Sayıya çevrilecek alanlar */
const NUMERIC = [
  'year', 'seatCount', 'doorCount', 'trunkCapacity', 'gearCount', 'engineVolume',
  'enginePower', 'torque', 'acceleration', 'topSpeed', 'fuelConsumption', 'tankCapacity',
  'batteryCapacity', 'electricRange', 'co2Emission', 'lengthMm', 'widthMm', 'heightMm',
  'curbWeight', 'dailyPrice', 'weeklyPrice', 'monthlyPrice', 'deposit', 'extraKmPrice',
  'dailyKmLimit', 'monthlyKmLimit', 'rating',
];

/** Checkbox alanları */
const FLAGS = [
  'hasAirConditioning', 'hasNavigation', 'hasBluetooth', 'hasParkingSensor', 'hasReverseCamera',
  'hasCruiseControl', 'hasSunroof', 'hasLeatherSeats', 'hasIsofix',
  'showPrice', 'vatIncluded', 'hgsIncluded', 'additionalDriverAllowed', 'cityDeliveryFree',
  'featured', 'budgetFriendly', 'showOnHomepage',
];

const COMFORT_FLAGS: Array<[string, string]> = [
  ['hasAirConditioning', 'Klima'],
  ['hasNavigation', 'Navigasyon'],
  ['hasBluetooth', 'Bluetooth'],
  ['hasParkingSensor', 'Park sensörü'],
  ['hasReverseCamera', 'Geri görüş kamerası'],
  ['hasCruiseControl', 'Hız sabitleyici'],
  ['hasSunroof', 'Sunroof'],
  ['hasLeatherSeats', 'Deri döşeme'],
  ['hasIsofix', 'ISOFIX'],
];

export default function VehicleForm({
  categories,
  initial,
}: {
  categories: Category[];
  initial?: Initial;
}) {
  const router = useRouter();
  const [slug, setSlug] = useState(String(initial?.slug || ''));
  const [images, setImages] = useState<string[]>(initial?.images?.map((i) => i.imageUrl) || []);
  const [mainImage, setMainImage] = useState(String(initial?.mainImage || ''));
  const [videoUrl, setVideoUrl] = useState(String(initial?.videoUrl || ''));
  /* Ic mekan olarak isaretlenen gorseller — arac detayinda kapilar acilinca gosterilir. */
  const [interior, setInterior] = useState<string[]>(() => {
    try {
      const raw = initial?.interiorImages;
      const list = typeof raw === 'string' && raw ? JSON.parse(raw) : [];
      return Array.isArray(list) ? list.filter((x): x is string => typeof x === 'string') : [];
    } catch {
      return [];
    }
  });
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  const val = (key: string) => String(initial?.[key] ?? '');
  const on = (key: string, fallback = false) =>
    initial ? Boolean(initial[key]) : fallback;

  async function upload(files: FileList | null) {
    if (!files?.length) return;
    const fd = new FormData();
    Array.from(files).forEach((f) => fd.append('files', f));
    const res = await fetch('/api/admin/upload', { method: 'POST', body: fd });
    const data = await res.json();
    if (res.ok) {
      setImages((v) => [...v, ...data.urls]);
      if (!mainImage) setMainImage(data.urls[0]);
    } else {
      setMessage(data.error);
    }
  }

  async function uploadVideo(files: FileList | null) {
    const file = files?.[0];
    if (!file) return;
    setMessage('Video yükleniyor…');
    const fd = new FormData();
    fd.append('files', file);
    const res = await fetch('/api/admin/upload', { method: 'POST', body: fd });
    const data = await res.json();
    if (res.ok) {
      setVideoUrl(data.urls[0]);
      setMessage('Video yüklendi. Kaydettiğinizde araç sayfasında ilk sırada oynatılacak.');
    } else {
      setMessage(data.error);
    }
  }

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setMessage('');

    const fd = new FormData(e.currentTarget);
    const data: Record<string, unknown> = Object.fromEntries(fd);

    for (const key of FLAGS) data[key] = fd.has(key);
    for (const key of NUMERIC) data[key] = data[key] ? Number(data[key]) : null;

    data.minimumRentalDays = Number(data.minimumRentalDays || 1);
    data.minDriverAge = Number(data.minDriverAge || 21);
    data.minLicenseYears = Number(data.minLicenseYears || 1);
    data.sortOrder = Number(data.sortOrder || 0);
    data.slug = slug || slugify(String(data.name || ''));
    data.mainImage = mainImage;
    data.videoUrl = videoUrl;
    data.images = images;
    data.interiorImages = interior.length ? JSON.stringify(interior.filter((u) => images.includes(u))) : '';

    const url = initial?.id ? `/api/admin/vehicles/${initial.id}` : '/api/admin/vehicles';
    const res = await fetch(url, {
      method: initial?.id ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const body = await res.json();

    if (res.ok) {
      router.push('/admin/vehicles');
      router.refresh();
    } else {
      setMessage(body.error || 'İşlem tamamlanamadı.');
      setBusy(false);
    }
  }

  const textField = (name: string, label: string, extra?: React.InputHTMLAttributes<HTMLInputElement>) => (
    <label key={name}>
      {label}
      <input name={name} defaultValue={val(name)} {...extra} />
    </label>
  );

  const selectField = (name: string, label: string, options: readonly string[]) => (
    <label key={name}>
      {label}
      <select name={name} defaultValue={val(name)}>
        <option value="">Seçin</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </label>
  );

  return (
    <form className="admin-form" onSubmit={submit}>
      <div 
        className="form-tabs" 
        style={{ 
          position: 'sticky', 
          top: 80, 
          zIndex: 10, 
          background: 'var(--paper-2)', 
          padding: '14px 20px', 
          margin: '0 -20px 24px -20px',
          display: 'flex', 
          gap: '8px', 
          overflowX: 'auto', 
          borderBottom: '1px solid var(--line)',
          borderTop: '1px solid var(--line)'
        }}
      >
        <a href="#sec-genel" className="chip chip-accent">① Genel</a>
        <a href="#sec-govde" className="chip chip-accent">② Gövde</a>
        <a href="#sec-motor" className="chip chip-accent">③ Motor</a>
        <a href="#sec-donanim" className="chip chip-accent">④ Donanım</a>
        <a href="#sec-fiyat" className="chip chip-accent">⑤ Fiyat</a>
        <a href="#sec-kosul" className="chip chip-accent">⑥ Koşullar</a>
        <a href="#sec-gorsel" className="chip chip-accent">⑦ Görseller</a>
        <a href="#sec-yayin" className="chip chip-accent">⑧ Yayın/SEO</a>
      </div>

      {/* --------------------------------------------------------- GENEL */}
      <section className="form-section" id="sec-genel">
        <h2><i>①</i> Genel bilgiler</h2>
        <div className="form-grid form-grid-3">
          <label>
            Araç adı *
            <input
              name="name"
              required
              defaultValue={val('name')}
              onBlur={(e) => !slug && setSlug(slugify(e.currentTarget.value))}
            />
          </label>
          {textField('brand', 'Marka *', { required: true })}
          {textField('model', 'Model *', { required: true })}
          {textField('version', 'Versiyon / donanım paketi')}
          {textField('year', 'Model yılı', { type: 'number' })}
          <label>
            Kategori *
            <select name="categoryId" defaultValue={val('categoryId')} required>
              <option value="">Seçin</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            URL slug *
            <input value={slug} onChange={(e) => setSlug(e.target.value)} required />
          </label>
          {textField('badge', 'Rozet (örn. YENİ, POPÜLER)')}
          {selectField('segment', 'Segment', SEGMENTS)}
          <label className="full">
            Kısa açıklama (kart ve özet alanında görünür)
            <input name="shortDescription" defaultValue={val('shortDescription')} />
          </label>
          <label className="full">
            Detaylı açıklama
            <textarea name="description" rows={5} defaultValue={val('description')} />
          </label>
          <label className="full">
            Ek vurgu metni (opsiyonel ikinci paragraf)
            <textarea name="highlightText" rows={3} defaultValue={val('highlightText')} />
          </label>
        </div>
      </section>

      {/* ------------------------------------------------ GÖVDE & ÖLÇÜLER */}
      <section className="form-section" id="sec-govde">
        <h2><i>②</i> Gövde ve ölçüler</h2>
        <div className="form-grid form-grid-4">
          {selectField('bodyType', 'Kasa tipi', BODY_TYPES)}
          {textField('color', 'Renk')}
          {textField('seatCount', 'Koltuk sayısı', { type: 'number' })}
          {textField('doorCount', 'Kapı sayısı', { type: 'number' })}
          {textField('trunkCapacity', 'Bagaj hacmi (L)', { type: 'number' })}
          {textField('luggageCapacity', 'Bagaj açıklaması')}
          {textField('lengthMm', 'Uzunluk (mm)', { type: 'number' })}
          {textField('widthMm', 'Genişlik (mm)', { type: 'number' })}
          {textField('heightMm', 'Yükseklik (mm)', { type: 'number' })}
          {textField('curbWeight', 'Boş ağırlık (kg)', { type: 'number' })}
        </div>
      </section>

      {/* --------------------------------------------- MOTOR & PERFORMANS */}
      <section className="form-section" id="sec-motor">
        <h2><i>③</i> Motor ve performans</h2>
        <div className="form-grid form-grid-4">
          {selectField('fuelType', 'Yakıt türü', FUEL_TYPES)}
          {selectField('transmission', 'Vites', TRANSMISSIONS)}
          {textField('gearCount', 'Vites kademesi', { type: 'number' })}
          {selectField('driveType', 'Çekiş', DRIVE_TYPES)}
          {textField('engine', 'Motor (örn. 1.5 dCi)')}
          {textField('engineVolume', 'Motor hacmi (cc)', { type: 'number' })}
          {textField('enginePower', 'Motor gücü (HP)', { type: 'number' })}
          {textField('torque', 'Tork (Nm)', { type: 'number' })}
          {textField('acceleration', '0-100 km/s (sn)', { type: 'number', step: '0.1' })}
          {textField('topSpeed', 'Azami hız (km/s)', { type: 'number' })}
          {textField('fuelConsumption', 'Tüketim (lt/100km)', { type: 'number', step: '0.1' })}
          {textField('tankCapacity', 'Yakıt deposu (lt)', { type: 'number' })}
          {textField('batteryCapacity', 'Batarya (kWh)', { type: 'number', step: '0.1' })}
          {textField('electricRange', 'Elektrikli menzil (km)', { type: 'number' })}
          {textField('chargeTime', 'Şarj süresi')}
          {textField('emissionClass', 'Emisyon sınıfı')}
          {textField('co2Emission', 'CO₂ (g/km)', { type: 'number' })}
        </div>
      </section>

      {/* -------------------------------------------------------- DONANIM */}
      <section className="form-section" id="sec-donanim">
        <h2><i>④</i> Donanım listeleri</h2>
        <p className="form-note" style={{ marginBottom: 16 }}>
          Her satıra bir madde yazın. Bu maddeler araç detay sayfasında donanım listesi olarak görünür.
        </p>
        <div className="form-grid">
          <label>
            Güvenlik donanımı
            <textarea name="safetyFeatures" rows={6} defaultValue={val('safetyFeatures')} placeholder={'ABS\nESP\n6 hava yastığı'} />
          </label>
          <label>
            Konfor donanımı
            <textarea name="comfortFeatures" rows={6} defaultValue={val('comfortFeatures')} placeholder={'Otomatik klima\nIsıtmalı koltuk'} />
          </label>
          <label>
            Teknoloji ve multimedya
            <textarea name="techFeatures" rows={6} defaultValue={val('techFeatures')} placeholder={'Apple CarPlay\nDijital gösterge'} />
          </label>
          <label>
            Dış donanım
            <textarea name="exteriorFeatures" rows={6} defaultValue={val('exteriorFeatures')} placeholder={'LED farlar\n17" alaşım jant'} />
          </label>
        </div>
        <div className="toggle-row">
          {COMFORT_FLAGS.map(([name, label]) => (
            <label key={name}>
              <input type="checkbox" name={name} defaultChecked={on(name, name === 'hasAirConditioning' || name === 'hasBluetooth' || name === 'hasIsofix')} />
              {label}
            </label>
          ))}
        </div>
      </section>

      {/* --------------------------------------------------- FİYATLANDIRMA */}
      <section className="form-section" id="sec-fiyat">
        <h2><i>⑤</i> Fiyatlandırma</h2>
        <div className="form-grid form-grid-4">
          {textField('dailyPrice', 'Günlük fiyat (₺)', { type: 'number' })}
          {textField('weeklyPrice', 'Haftalık fiyat (₺)', { type: 'number' })}
          {textField('monthlyPrice', 'Aylık fiyat (₺)', { type: 'number' })}
          {textField('deposit', 'Depozito (₺)', { type: 'number' })}
          {textField('extraKmPrice', 'Ek km ücreti (₺)', { type: 'number', step: '0.1' })}
        </div>
        <div className="toggle-row">
          <label>
            <input type="checkbox" name="showPrice" defaultChecked={on('showPrice', true)} />
            Fiyatı sitede göster
          </label>
          <label>
            <input type="checkbox" name="vatIncluded" defaultChecked={on('vatIncluded', true)} />
            Fiyatlara KDV dahil
          </label>
        </div>
      </section>

      {/* ---------------------------------------------- KİRALAMA KOŞULLARI */}
      <section className="form-section" id="sec-kosul">
        <h2><i>⑥</i> Kiralama koşulları</h2>
        <div className="form-grid form-grid-4">
          <label>
            Minimum gün
            <input name="minimumRentalDays" type="number" min={1} defaultValue={val('minimumRentalDays') || '1'} />
          </label>
          {textField('dailyKmLimit', 'Günlük km limiti', { type: 'number' })}
          {textField('monthlyKmLimit', 'Aylık km limiti', { type: 'number' })}
          {textField('minDriverAge', 'Minimum sürücü yaşı', { type: 'number' })}
          {textField('minLicenseYears', 'Minimum ehliyet yılı', { type: 'number' })}
        </div>
        <div className="form-grid" style={{ marginTop: 16 }}>
          <label>
            Sigorta bilgisi
            <textarea name="insuranceInfo" rows={3} defaultValue={val('insuranceInfo')} />
          </label>
          <label>
            Yakıt politikası
            <textarea name="fuelPolicy" rows={3} defaultValue={val('fuelPolicy')} />
          </label>
          <label>
            Teslimat bilgisi
            <textarea name="deliveryInfo" rows={3} defaultValue={val('deliveryInfo')} />
          </label>
          <label>
            İptal ve değişiklik politikası
            <textarea name="cancellationPolicy" rows={3} defaultValue={val('cancellationPolicy')} />
          </label>
        </div>
        <div className="toggle-row">
          <label>
            <input type="checkbox" name="hgsIncluded" defaultChecked={on('hgsIncluded', true)} />
            HGS cihazı araçta
          </label>
          <label>
            <input type="checkbox" name="additionalDriverAllowed" defaultChecked={on('additionalDriverAllowed', true)} />
            Ek sürücü tanımlanabilir
          </label>
          <label>
            <input type="checkbox" name="cityDeliveryFree" defaultChecked={on('cityDeliveryFree', true)} />
            Şehir içi teslimat ücretsiz
          </label>
        </div>
      </section>

      {/* -------------------------------------------------------- GÖRSELLER */}
      <section className="form-section" id="sec-gorsel">
        <h2><i>⑦</i> Görseller</h2>
        <label className="drop-zone">
          <span>Görselleri sürükleyin veya seçin</span>
          <small>JPG, PNG veya WebP · en fazla 5 MB</small>
          <input type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={(e) => upload(e.target.files)} />
        </label>
        <div className="upload-grid">
          {images.map((url, i) => (
            <div key={url}>
              <img src={url} alt="Araç görseli" />
              {interior.includes(url) && <span className="upload-tag">İç mekân</span>}
              <div>
                <button type="button" onClick={() => setMainImage(url)}>
                  {mainImage === url ? '★ Ana' : 'Ana yap'}
                </button>
                <button
                  type="button"
                  data-on={interior.includes(url)}
                  onClick={() =>
                    setInterior((v) => (v.includes(url) ? v.filter((x) => x !== url) : [...v, url]))
                  }
                >
                  {interior.includes(url) ? 'İç ✓' : 'İç mekân'}
                </button>
                <button
                  type="button"
                  disabled={!i}
                  onClick={() =>
                    setImages((v) => {
                      const n = [...v];
                      [n[i - 1], n[i]] = [n[i], n[i - 1]];
                      return n;
                    })
                  }
                >
                  ←
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setImages((v) => v.filter((x) => x !== url));
                    setInterior((v) => v.filter((x) => x !== url));
                  }}
                >
                  Sil
                </button>
              </div>
            </div>
          ))}
        </div>
        <p className="form-note" style={{ marginTop: 14 }}>
          <b>İç mekân:</b> Direksiyon, vites, koltuk gibi kabin fotoğraflarını yükleyip
          &laquo;İç mekân&raquo; olarak işaretleyin. Araç detay sayfasında dış görsele dokunulduğunda
          kapılar açılır ve bu fotoğraflar gösterilir. İşaretli fotoğraf yoksa bu özellik görünmez.
        </p>
        <div className="form-grid" style={{ marginTop: 16 }}>
          <label>
            Video URL
            <input
              name="videoUrl"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="YouTube, Vimeo veya yüklenen MP4/WebM adresi"
            />
          </label>
          <label className="drop-zone video-drop-zone">
            <span>{videoUrl ? 'Tanıtım videosunu değiştir' : 'Gerçek araç tanıtım videosu yükle'}</span>
            <small>MP4 veya WebM · en fazla 80 MB · iç ve dış çekim önerilir</small>
            <input type="file" accept="video/mp4,video/webm" onChange={(e) => uploadVideo(e.target.files)} />
          </label>
        </div>
      </section>

      {/* ------------------------------------------------------ YAYIN & SEO */}
      <section className="form-section" id="sec-yayin">
        <h2><i>⑧</i> Yayın durumu ve SEO</h2>
        <div className="form-grid form-grid-3">
          <label>
            Durum
            <select name="status" defaultValue={val('status') || 'AVAILABLE'}>
              <option value="AVAILABLE">Müsait</option>
              <option value="RENTED">Kirada</option>
              <option value="RESERVED">Rezerve</option>
              <option value="MAINTENANCE">Bakımda</option>
              <option value="PASSIVE">Pasif (sitede görünmez)</option>
            </select>
          </label>
          {textField('sortOrder', 'Gösterim sırası', { type: 'number' })}
          {textField('rating', 'Puan (0-5)', { type: 'number', step: '0.1', min: 0, max: 5 })}
        </div>
        <div className="toggle-row">
          <label>
            <input type="checkbox" name="featured" defaultChecked={on('featured')} />
            Öne çıkan
          </label>
          <label>
            <input type="checkbox" name="budgetFriendly" defaultChecked={on('budgetFriendly')} />
            Uygun fiyatlı
          </label>
          <label>
            <input type="checkbox" name="showOnHomepage" defaultChecked={on('showOnHomepage')} />
            Ana sayfada öne çıkar
          </label>
        </div>
        <div className="form-grid" style={{ marginTop: 16 }}>
          {textField('seoTitle', 'SEO başlığı')}
          <label>
            SEO açıklaması
            <textarea name="seoDescription" rows={3} defaultValue={val('seoDescription')} />
          </label>
        </div>
      </section>

      {message && <p className="form-error">{message}</p>}

      <div className="form-actions">
        <button className="btn btn-accent btn-lg" disabled={busy}>
          {busy ? 'Kaydediliyor…' : initial?.id ? 'Değişiklikleri Kaydet' : 'Aracı Kaydet'}
        </button>
        <button type="button" className="btn btn-outline" onClick={() => router.back()}>
          Vazgeç
        </button>
      </div>
    </form>
  );
}
