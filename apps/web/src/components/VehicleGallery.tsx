'use client';

import { useCallback, useEffect, useState } from 'react';
import Icon, { type IconName } from './Icon';

type Photo = { url: string; alt?: string | null };

type VideoSource = { kind: 'file' | 'embed'; url: string };

function resolveVideoSource(raw?: string | null): VideoSource | null {
  const value = raw?.trim();
  if (!value) return null;

  if (value.startsWith('/') || /\.(mp4|webm|ogg)(\?.*)?$/i.test(value)) {
    return { kind: 'file', url: value };
  }

  try {
    const url = new URL(value);
    if (!['http:', 'https:'].includes(url.protocol)) return null;

    const youtubeId = url.hostname.includes('youtu.be')
      ? url.pathname.split('/').filter(Boolean)[0]
      : url.hostname.includes('youtube.com')
        ? url.searchParams.get('v') || url.pathname.match(/\/(?:embed|shorts)\/([^/?]+)/)?.[1]
        : null;
    if (youtubeId) {
      const id = encodeURIComponent(youtubeId);
      return {
        kind: 'embed',
        url: `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&mute=1&loop=1&playlist=${id}&controls=1&rel=0`,
      };
    }

    if (url.hostname.includes('vimeo.com')) {
      const id = url.pathname.split('/').filter(Boolean).find((part) => /^\d+$/.test(part));
      if (id) return { kind: 'embed', url: `https://player.vimeo.com/video/${id}?autoplay=1&muted=1&loop=1` };
    }

    return { kind: 'file', url: value };
  } catch {
    return null;
  }
}

export type CabinItem = { icon: IconName; label: string; value: string };
export type Cabin = {
  /** Aracın gerçek iç mekân fotoğrafları. Boşsa kabin özelliği hiç görünmez. */
  images: Photo[];
  items: CabinItem[];
  note?: string | null;
};

export default function VehicleGallery({
  photos,
  name,
  cabin,
  videoUrl,
}: {
  photos: Photo[];
  name: string;
  cabin?: Cabin | null;
  videoUrl?: string | null;
}) {
  const video = resolveVideoSource(videoUrl);
  const [index, setIndex] = useState(0);
  const [zoom, setZoom] = useState(false);
  const [openCabin, setOpenCabin] = useState(false);
  const [cabinIndex, setCabinIndex] = useState(0);
  const [mediaMode, setMediaMode] = useState<'video' | 'photos'>(video ? 'video' : 'photos');
  const [autoPlay, setAutoPlay] = useState(true);
  const total = photos.length;
  const cabinTotal = cabin?.images.length ?? 0;
  const hasCabin = cabinTotal > 0;

  const goCabin = useCallback(
    (dir: number) => setCabinIndex((i) => (cabinTotal ? (i + dir + cabinTotal) % cabinTotal : 0)),
    [cabinTotal],
  );

  const go = useCallback(
    (dir: number) => {
      setOpenCabin(false);
      setIndex((i) => (total ? (i + dir + total) % total : 0));
    },
    [total],
  );

  const selectPhoto = useCallback((next: number) => {
    setMediaMode('photos');
    setOpenCabin(false);
    setIndex(next);
  }, []);

  useEffect(() => {
    if (!zoom) return;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setZoom(false);
      if (e.key === 'ArrowRight') go(1);
      if (e.key === 'ArrowLeft') go(-1);
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [zoom, go]);

  useEffect(() => {
    if (!openCabin) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpenCabin(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [openCabin]);

  /* Fotoğraflar video gibi akar; kullanıcı isterse durdurabilir veya oklarla ilerleyebilir. */
  useEffect(() => {
    if (!autoPlay || mediaMode !== 'photos' || total < 2 || zoom || openCabin) return;
    const timer = window.setInterval(() => go(1), 5200);
    return () => window.clearInterval(timer);
  }, [autoPlay, mediaMode, total, zoom, openCabin, go]);

  if (!total && !video) {
    return (
      <div className="gallery">
        <div className="gallery-main gallery-empty">
          <span className="no-photo">
            <Icon name="image" size={30} />
            GÖRSEL HAZIRLANIYOR
          </span>
        </div>
      </div>
    );
  }

  const current = photos[index];
  const alt = current?.alt || `${name} - görsel ${index + 1}`;

  return (
    <div className="gallery">
      <div className="gallery-main" data-cabin={openCabin} data-media={mediaMode}>
        {video && (
          <div className="gallery-media-tabs" aria-label="Araç medyası">
            <button data-active={mediaMode === 'video'} onClick={() => setMediaMode('video')}>
              <Icon name="video" size={15} /> Video tanıtım
            </button>
            {total > 0 && (
              <button data-active={mediaMode === 'photos'} onClick={() => setMediaMode('photos')}>
                <Icon name="image" size={15} /> Fotoğraflar
              </button>
            )}
          </div>
        )}

        {video && mediaMode === 'video' && (
          <div className="gallery-video">
            {video.kind === 'file' ? (
              <video
                src={video.url}
                poster={photos[0]?.url}
                autoPlay
                muted
                loop
                playsInline
                controls
                preload="metadata"
              />
            ) : (
              <iframe
                src={video.url}
                title={`${name} video tanıtımı`}
                allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                allowFullScreen
              />
            )}
            <span className="gallery-video-label">
              <i aria-hidden="true" /> GERÇEK ARAÇ · İÇ / DIŞ TANITIM
            </span>
          </div>
        )}

        {mediaMode === 'photos' && (
          <>
        {/* Kabin: aracın gerçek iç mekân fotoğrafı */}
        {hasCabin && (
          <div className="cabin" aria-hidden={!openCabin}>
            {cabin!.images.map((img, i) => (
              <img
                key={img.url}
                className="cabin-photo"
                data-active={i === cabinIndex}
                src={img.url}
                alt={img.alt || `${name} iç mekân görseli ${i + 1}`}
                loading="lazy"
              />
            ))}
            <span className="cabin-shade" />

            <div className="cabin-head">
              <span className="cabin-eyebrow">
                <Icon name="door" size={15} /> İÇ MEKÂN
              </span>
              <strong className="cabin-title">{name}</strong>
            </div>

            {cabinTotal > 1 && (
              <div className="cabin-switch">
                <button onClick={() => goCabin(-1)} aria-label="Önceki iç mekân görseli">
                  <Icon name="chevron-left" size={17} />
                </button>
                <span>
                  {cabinIndex + 1} / {cabinTotal}
                </span>
                <button onClick={() => goCabin(1)} aria-label="Sonraki iç mekân görseli">
                  <Icon name="chevron-right" size={17} />
                </button>
              </div>
            )}

            <ul className="cabin-strip">
              {cabin!.items.map((item, i) => (
                <li key={`${item.label}-${item.value}-${i}`} style={{ '--i': i } as React.CSSProperties}>
                  <span>
                    <Icon name={item.icon} size={16} />
                  </span>
                  <div>
                    <small>{item.label}</small>
                    <b>{item.value}</b>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Dış görseller tek parça kalır; fotoğraflar ve iç mekân sakin bir çapraz geçişle değişir. */}
        <div
          className="gallery-photo-stack"
          aria-live="polite"
          aria-hidden={hasCabin && openCabin}
        >
          {photos.map((photo, photoIndex) => (
            <img
              key={photo.url}
              src={photo.url}
              alt={photo.alt || `${name} - görsel ${photoIndex + 1}`}
              data-active={photoIndex === index}
              loading={photoIndex === 0 ? 'eager' : 'lazy'}
              aria-hidden={photoIndex !== index}
            />
          ))}
        </div>

        {/* Görsele dokununca iç ve dış mekân arasında geçiş yapılır. */}
        {hasCabin && (
          <button
            className="cabin-trigger"
            onClick={() => setOpenCabin((v) => !v)}
            aria-pressed={openCabin}
            aria-label={openCabin ? 'Dış görünüşe dön' : 'İç mekânı göster'}
          />
        )}

        {total > 1 && (
          <>
            <button
              className="gallery-nav gallery-prev"
              onClick={() => go(-1)}
              aria-label="Önceki görsel"
            >
              <Icon name="chevron-left" size={20} />
            </button>
            <button
              className="gallery-nav gallery-next"
              onClick={() => go(1)}
              aria-label="Sonraki görsel"
            >
              <Icon name="chevron-right" size={20} />
            </button>
          </>
        )}

        <div className="gallery-bar">
          <span className="gallery-count">
            <Icon name="image" size={14} />
            {index + 1} / {total}
          </span>

          <span className="gallery-tools">
            {total > 1 && (
              <button
                className="gallery-chip"
                onClick={() => setAutoPlay((value) => !value)}
                aria-label={autoPlay ? 'Otomatik geçişi durdur' : 'Otomatik geçişi başlat'}
                aria-pressed={autoPlay}
              >
                <Icon name={autoPlay ? 'pause' : 'play'} size={14} />
                <span className="gallery-chip-text">{autoPlay ? 'Otomatik' : 'Durduruldu'}</span>
              </button>
            )}
            {hasCabin && (
              <button
                className="gallery-chip gallery-chip-accent"
                onClick={() => setOpenCabin((v) => !v)}
                aria-pressed={openCabin}
              >
                <Icon name="door" size={14} />
                {openCabin ? 'Dış görünüş' : 'İç mekânı gör'}
              </button>
            )}
            <button className="gallery-chip" onClick={() => setZoom(true)} aria-label="Görseli büyüt">
              <Icon name="expand" size={14} />
              <span className="gallery-chip-text">Büyüt</span>
            </button>
          </span>
        </div>
          </>
        )}
      </div>

      {(total > 1 || video) && total > 0 && (
        <div className="gallery-thumbs">
          {photos.map((p, i) => (
            <button
              key={p.url + i}
              data-active={mediaMode === 'photos' && i === index}
              onClick={() => selectPhoto(i)}
              aria-label={`${i + 1}. görseli göster`}
              aria-current={i === index}
            >
              <img src={p.url} alt="" loading="lazy" />
            </button>
          ))}
        </div>
      )}

      {zoom && current && (
        <div
          className="lightbox"
          role="dialog"
          aria-modal="true"
          aria-label={`${name} görselleri`}
          onMouseDown={(e) => e.target === e.currentTarget && setZoom(false)}
        >
          <button className="lightbox-close" onClick={() => setZoom(false)} aria-label="Kapat">
            <Icon name="close" size={20} />
          </button>
          {total > 1 && (
            <>
              <button className="gallery-nav gallery-prev" onClick={() => go(-1)} aria-label="Önceki">
                <Icon name="chevron-left" size={20} />
              </button>
              <button className="gallery-nav gallery-next" onClick={() => go(1)} aria-label="Sonraki">
                <Icon name="chevron-right" size={20} />
              </button>
            </>
          )}
          <img src={current.url} alt={alt} />
          <span className="lightbox-caption">
            {name} · {index + 1} / {total}
          </span>
        </div>
      )}
    </div>
  );
}
