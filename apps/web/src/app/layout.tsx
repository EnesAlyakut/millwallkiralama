import type { Metadata, Viewport } from 'next';
import './globals.css';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Millwal Kurumsal Kiralama | Araç ve Filo Kiralama Çözümleri',
    template: '%s | Millwal Kurumsal Kiralama',
  },
  description:
    'Otomobil, ticari araç, motosiklet, tekne, jetski ve ATV kiralama seçenekleri. Günlük, haftalık, aylık ve kurumsal uzun dönem kiralama için hemen telefon veya WhatsApp ile bilgi alın.',
  keywords: [
    'araç kiralama', 'kurumsal araç kiralama', 'filo kiralama', 'uzun dönem kiralama',
    'kiralık otomobil', 'ticari araç kiralama', 'İstanbul araç kiralama',
  ],
  authors: [{ name: 'Millwal Kurumsal Kiralama' }],
  openGraph: {
    title: 'Millwal Kurumsal Kiralama',
    description: 'İhtiyacınıza uygun aracı kolayca kiralayın. Şeffaf koşullar, bakımlı filo, hızlı iletişim.',
    images: ['/og.png'],
    locale: 'tr_TR',
    type: 'website',
    siteName: 'Millwal Kurumsal Kiralama',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Millwal Kurumsal Kiralama',
    description: 'İhtiyacınıza uygun aracı kolayca kiralayın.',
    images: ['/og.png'],
  },
  robots: { index: true, follow: true },
  manifest: '/manifest.json',
};

export const viewport: Viewport = {
  themeColor: '#08111b',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const organization = {
    '@context': 'https://schema.org',
    '@type': 'AutoRental',
    name: 'Millwal Kurumsal Kiralama',
    url: SITE_URL,
    image: `${SITE_URL}/og.png`,
    areaServed: 'TR',
    priceRange: '₺₺',
  };

  return (
    <html lang="tr" data-scroll-behavior="smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Manrope:wght@600;700;800&display=swap"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organization) }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
