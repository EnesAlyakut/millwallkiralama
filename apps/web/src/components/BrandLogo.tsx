import { logoFor, monogramFor } from '@/lib/brand-logos';

/**
 * Marka logosu. Logo listesinde bulunmayan markalar için
 * marka adının ilk iki harfinden oluşan monogram gösterilir.
 */
export default function BrandLogo({ name, size = 26 }: { name: string; size?: number }) {
  const logo = logoFor(name);

  if (!logo) {
    return (
      <span className="brand-logo brand-logo-mono" style={{ fontSize: Math.round(size * 0.46) }}>
        {monogramFor(name)}
      </span>
    );
  }

  return (
    <svg
      className="brand-logo"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
    >
      <path d={logo.path} />
    </svg>
  );
}
