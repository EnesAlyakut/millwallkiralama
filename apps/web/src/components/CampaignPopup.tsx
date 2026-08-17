'use client';

import { useCallback, useEffect, useState } from 'react';
import Icon from './Icon';

export type CampaignSlide = { url: string; label?: string };

type Props = {
  enabled: boolean;
  title: string;
  text: string;
  slides: CampaignSlide[];
  buttonText: string;
  whatsappHref: string;
};

/** Görseller arası otomatik geçiş süresi (ms). */
const INTERVAL = 4200;

export default function CampaignPopup({ enabled, title, text, slides, buttonText, whatsappHref }: Props) {
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const total = slides.length;

  const close = useCallback(() => {
    window.sessionStorage.setItem('millwal-campaign-closed', '1');
    setOpen(false);
  }, []);

  useEffect(() => {
    if (!enabled) return;
    if (window.sessionStorage.getItem('millwal-campaign-closed')) return;
    const t = window.setTimeout(() => setOpen(true), 2200);
    return () => window.clearTimeout(t);
  }, [enabled]);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close();
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [open, close]);

  /* Otomatik geçiş — fare görselin üzerindeyken durur. */
  useEffect(() => {
    if (!open || paused || total < 2) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) return;
    const t = window.setInterval(() => setIndex((i) => (i + 1) % total), INTERVAL);
    return () => window.clearInterval(t);
  }, [open, paused, total]);

  if (!open) return null;

  const active = slides[index] ?? slides[0];

  return (
    <div
      className="campaign-backdrop"
      role="presentation"
      onMouseDown={(e) => e.target === e.currentTarget && close()}
    >
      <section className="campaign-modal" role="dialog" aria-modal="true" aria-label="Millwal kampanyası">
        <button className="campaign-close" onClick={close} aria-label="Kapat">
          <Icon name="close" size={18} />
        </button>

        <div
          className="campaign-media"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          {slides.map((slide, i) => (
            <img
              key={slide.url}
              src={slide.url}
              alt={slide.label || ''}
              data-active={i === index}
              loading={i === 0 ? 'eager' : 'lazy'}
            />
          ))}

          {active?.label && <span className="campaign-slide-name">{active.label}</span>}

          {total > 1 && (
            <div className="campaign-dots" role="tablist" aria-label="Kampanya görselleri">
              {slides.map((slide, i) => (
                <button
                  key={slide.url}
                  type="button"
                  role="tab"
                  data-active={i === index}
                  aria-selected={i === index}
                  aria-label={slide.label || `${i + 1}. görsel`}
                  onClick={() => setIndex(i)}
                />
              ))}
            </div>
          )}
        </div>

        <div className="campaign-copy">
          <span>SİZE ÖZEL KİRALAMA</span>
          <h2>{title}</h2>
          <p>{text}</p>
          <a className="btn btn-whatsapp" href={whatsappHref} target="_blank" rel="noreferrer" onClick={close}>
            <Icon name="whatsapp" size={18} /> {buttonText}
          </a>
        </div>
      </section>
    </div>
  );
}
