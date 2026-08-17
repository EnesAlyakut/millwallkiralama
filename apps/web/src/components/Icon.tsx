import type { SVGProps } from 'react';

/**
 * Millwal ikon seti — ince çizgi (line) stilinde, kurumsal görünüm için
 * emoji yerine kullanılır. Tüm ikonlar 24x24 kutuda, currentColor ile boyanır.
 */
export type IconName =
  | 'calendar'
  | 'fuel'
  | 'gearbox'
  | 'users'
  | 'phone'
  | 'whatsapp'
  | 'document'
  | 'shield'
  | 'wrench'
  | 'support'
  | 'road'
  | 'card'
  | 'pin'
  | 'refresh'
  | 'receipt'
  | 'gauge'
  | 'car'
  | 'leaf'
  | 'checklist'
  | 'user'
  | 'seat'
  | 'device'
  | 'sparkle'
  | 'check'
  | 'arrow-right'
  | 'chevron-left'
  | 'chevron-right'
  | 'expand'
  | 'close'
  | 'image'
  | 'tag'
  | 'building'
  | 'mail'
  | 'luggage'
  | 'snow'
  | 'navigation'
  | 'bluetooth'
  | 'camera'
  | 'sun'
  | 'door'
  | 'clock'
  | 'play'
  | 'pause'
  | 'video';

const PATHS: Record<IconName, React.ReactNode> = {
  play: <path d="m8 5 11 7-11 7V5Z" />,
  pause: (
    <>
      <path d="M8 5v14M16 5v14" />
    </>
  ),
  video: (
    <>
      <rect x="3" y="5" width="13" height="14" rx="2.5" />
      <path d="m16 10 5-3v10l-5-3" />
    </>
  ),
  calendar: (
    <>
      <rect x="3" y="5" width="18" height="16" rx="2.5" />
      <path d="M3 10h18M8 3v4M16 3v4" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7.5V12l3 2" />
    </>
  ),
  fuel: (
    <>
      <path d="M4 21V5.5A2.5 2.5 0 0 1 6.5 3h5A2.5 2.5 0 0 1 14 5.5V21" />
      <path d="M3 21h12M4 11h10" />
      <path d="M14 8h3.5A2.5 2.5 0 0 1 20 10.5V16a1.8 1.8 0 0 1-3.6 0v-2.4" />
    </>
  ),
  gearbox: (
    <>
      <path d="M6 4v16M12 4v16M18 4v10" />
      <path d="M6 10h12" />
      <circle cx="6" cy="4" r="1.6" />
      <circle cx="12" cy="4" r="1.6" />
      <circle cx="18" cy="4" r="1.6" />
      <circle cx="6" cy="20" r="1.6" />
      <circle cx="12" cy="20" r="1.6" />
    </>
  ),
  users: (
    <>
      <circle cx="9" cy="8" r="3.2" />
      <path d="M3 20a6 6 0 0 1 12 0" />
      <path d="M16 5.2a3.2 3.2 0 0 1 0 5.9M17.5 14.2A6 6 0 0 1 21 20" />
    </>
  ),
  phone: (
    <path d="M6.6 3.5h2.6l1.5 3.8-2 1.4a11.5 11.5 0 0 0 5.6 5.6l1.4-2 3.8 1.5v2.6A2.5 2.5 0 0 1 17 19a14.3 14.3 0 0 1-13-13 2.5 2.5 0 0 1 2.6-2.5Z" />
  ),
  whatsapp: (
    <>
      <path d="M3.8 20.2 5 16.6a7.9 7.9 0 1 1 3 3l-4.2 0.6Z" />
      <path d="M9 9.2c0 3 2.4 5.2 5 5.6.7.1 1.3-.4 1.4-1l.1-.7-2-.9-.8.9a5.4 5.4 0 0 1-2-2l.9-.8-.9-2-.7.1c-.6.1-1 .6-1 1.2Z" />
    </>
  ),
  document: (
    <>
      <path d="M14 3v5h5" />
      <path d="M19 8v11a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7l5 5Z" />
      <path d="M9 13h6M9 17h4" />
    </>
  ),
  shield: (
    <>
      <path d="M12 3 5 6v5.5c0 4.3 2.9 7.7 7 9.5 4.1-1.8 7-5.2 7-9.5V6l-7-3Z" />
      <path d="m9.2 12 2 2 3.6-3.8" />
    </>
  ),
  wrench: (
    <path d="M15.5 3.5a5 5 0 0 0-4.8 6.4L3.8 16.8a2 2 0 0 0 2.8 2.8l6.9-6.9a5 5 0 0 0 6.4-4.8l-3 3-2.6-.6-.6-2.6 3-3Z" />
  ),
  support: (
    <>
      <path d="M4 14v-2a8 8 0 0 1 16 0v2" />
      <rect x="2.6" y="13.4" width="4" height="6" rx="1.6" />
      <rect x="17.4" y="13.4" width="4" height="6" rx="1.6" />
      <path d="M19.4 19.4a3 3 0 0 1-3 2.1H13" />
    </>
  ),
  road: (
    <>
      <path d="M7 3 4 21M17 3l3 18" />
      <path d="M12 4v3M12 11v3M12 18v3" />
    </>
  ),
  card: (
    <>
      <rect x="2.6" y="5" width="18.8" height="14" rx="2.5" />
      <path d="M2.6 10h18.8M6.5 15h3.5" />
    </>
  ),
  pin: (
    <>
      <path d="M12 21s7-5.6 7-11a7 7 0 1 0-14 0c0 5.4 7 11 7 11Z" />
      <circle cx="12" cy="10" r="2.6" />
    </>
  ),
  refresh: (
    <>
      <path d="M20 11a8 8 0 0 0-14.3-4.6M4 13a8 8 0 0 0 14.3 4.6" />
      <path d="M20 4.5V11h-6M4 19.5V13h6" />
    </>
  ),
  receipt: (
    <>
      <path d="M6 3h12v18l-2.4-1.6L13.2 21l-2.4-1.6L8.4 21 6 19.4V3Z" />
      <path d="M9.5 8h5M9.5 12h5" />
    </>
  ),
  gauge: (
    <>
      <path d="M4 18a8.5 8.5 0 1 1 16 0" />
      <path d="m12 14 4-4" />
      <circle cx="12" cy="15" r="1.4" />
    </>
  ),
  car: (
    <>
      <path d="M4 16v2.5M20 16v2.5" />
      <path d="M3 16v-3.2l2-4.4A2.5 2.5 0 0 1 7.3 7h9.4a2.5 2.5 0 0 1 2.3 1.4l2 4.4V16Z" />
      <path d="M5 12.6h14" />
      <circle cx="7.5" cy="16" r="1.2" />
      <circle cx="16.5" cy="16" r="1.2" />
    </>
  ),
  leaf: (
    <>
      <path d="M20 4c0 9-5.2 13-9.5 13A5.5 5.5 0 0 1 5 11.5C5 7.2 9 4 20 4Z" />
      <path d="M14.5 9.5 5 20" />
    </>
  ),
  checklist: (
    <>
      <path d="m3 7 2 2 3.5-3.5M3 16l2 2 3.5-3.5" />
      <path d="M12 7.5h9M12 16.5h9" />
    </>
  ),
  user: (
    <>
      <circle cx="12" cy="8" r="3.6" />
      <path d="M5 20a7 7 0 0 1 14 0" />
    </>
  ),
  seat: (
    <>
      <path d="M7 3.5h6a2 2 0 0 1 2 2l.6 8.5H6.4L7 5.5a2 2 0 0 1 2-2Z" />
      <path d="M5 14h12a3 3 0 0 1 3 3v3.5M5 14v6.5" />
    </>
  ),
  device: (
    <>
      <rect x="6.5" y="2.6" width="11" height="18.8" rx="2.6" />
      <path d="M10.5 5.6h3M11 18.4h2" />
    </>
  ),
  sparkle: (
    <>
      <path d="M12 3.5 13.8 9l5.5 1.8-5.5 1.8L12 18.1l-1.8-5.5L4.7 10.8 10.2 9 12 3.5Z" />
      <path d="M18.5 16.5 19.3 19l2.5.8-2.5.8-.8 2.5" />
    </>
  ),
  check: <path d="m5 12.5 4.5 4.5L19 7" />,
  'arrow-right': <path d="M4 12h15M13 6l6 6-6 6" />,
  'chevron-left': <path d="m14.5 5.5-7 6.5 7 6.5" />,
  'chevron-right': <path d="m9.5 5.5 7 6.5-7 6.5" />,
  expand: <path d="M9 4H4v5M15 4h5v5M15 20h5v-5M9 20H4v-5" />,
  close: <path d="m6 6 12 12M18 6 6 18" />,
  image: (
    <>
      <rect x="3" y="4.5" width="18" height="15" rx="2.5" />
      <circle cx="8.5" cy="10" r="1.6" />
      <path d="m4 17 5-4.5 4.5 4 3-2.5L20 18" />
    </>
  ),
  tag: (
    <>
      <path d="M3.5 11.2V4.5h6.7l9.3 9.3-6.7 6.7-9.3-9.3Z" />
      <circle cx="7.6" cy="8.6" r="1.3" />
    </>
  ),
  building: (
    <>
      <path d="M4 21V5.5A1.5 1.5 0 0 1 5.5 4h7A1.5 1.5 0 0 1 14 5.5V21" />
      <path d="M14 10h4.5A1.5 1.5 0 0 1 20 11.5V21" />
      <path d="M2.8 21h18.4" />
      <path d="M7 8h4M7 12h4M7 16h4M16.5 14h1.5M16.5 17.5h1.5" />
    </>
  ),
  mail: (
    <>
      <rect x="2.8" y="4.8" width="18.4" height="14.4" rx="2.4" />
      <path d="m3.4 6.6 8.6 6 8.6-6" />
    </>
  ),
  luggage: (
    <>
      <rect x="3.5" y="7" width="17" height="13" rx="2.4" />
      <path d="M8.5 7V4.8A1.3 1.3 0 0 1 9.8 3.5h4.4a1.3 1.3 0 0 1 1.3 1.3V7" />
      <path d="M9 11v5M15 11v5M3.5 20.5v.8M20.5 20.5v.8" />
    </>
  ),
  snow: (
    <>
      <path d="M12 2.8v18.4M4 7.4l16 9.2M20 7.4 4 16.6" />
      <path d="M12 6.2 9.8 4.4M12 6.2l2.2-1.8M12 17.8l-2.2 1.8M12 17.8l2.2 1.8" />
    </>
  ),
  navigation: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="m15.5 8.5-2 5.2-5.2 2 2-5.2 5.2-2Z" />
    </>
  ),
  bluetooth: <path d="m7.5 7.5 9 9L12 21V3l4.5 4.5-9 9" />,
  camera: (
    <>
      <path d="M3.5 8.5h3l1.6-2.4h7.8L17.5 8.5h3v10.4h-17V8.5Z" />
      <circle cx="12" cy="13.4" r="3.2" />
    </>
  ),
  sun: (
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2.6v2.2M12 19.2v2.2M4.3 4.3l1.6 1.6M18.1 18.1l1.6 1.6M2.6 12h2.2M19.2 12h2.2M4.3 19.7l1.6-1.6M18.1 5.9l1.6-1.6" />
    </>
  ),
  door: (
    <>
      <path d="M5 21V4.6A1.6 1.6 0 0 1 6.6 3h8.8A1.6 1.6 0 0 1 17 4.6V21" />
      <path d="M3.5 21h17" />
      <circle cx="13.8" cy="12.4" r="1.1" />
    </>
  ),
};

type Props = SVGProps<SVGSVGElement> & { name: IconName; size?: number };

export default function Icon({ name, size = 20, ...rest }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      {PATHS[name]}
    </svg>
  );
}
