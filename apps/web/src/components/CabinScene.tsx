/**
 * Kapıları açılan araç şeması.
 * Yandan görünüm; kapılar menteşelerinden dönerek açılır ve kabin görünür:
 * direksiyon, gösterge paneli, multimedya ekranı, vites, koltuklar ve pedallar.
 * Fotoğraf gerektirmez, tamamen vektörel çizilir.
 */

const APERTURE =
  'M340 392 L340 300 L404 205 Q414 191 434 190 L640 186 Q662 186 676 202 L752 300 L752 392 Z';

export default function CabinScene({ idPrefix = 'cab' }: { idPrefix?: string }) {
  const id = (n: string) => `${idPrefix}-${n}`;

  return (
    <svg
      className="cabin-car"
      viewBox="0 0 1000 520"
      role="img"
      aria-label="Kapıları açık araç şeması: direksiyon, gösterge paneli, multimedya ekranı, vites ve koltuklar"
    >
      <defs>
        <linearGradient id={id('body')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1f5566" />
          <stop offset="1" stopColor="#0a2a34" />
        </linearGradient>
        <linearGradient id={id('door')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#276b80" />
          <stop offset="1" stopColor="#0c3644" />
        </linearGradient>
        <linearGradient id={id('glass')} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#9beefb" stopOpacity=".34" />
          <stop offset="1" stopColor="#9beefb" stopOpacity=".10" />
        </linearGradient>
        <clipPath id={id('clip')}>
          <path d={APERTURE} />
        </clipPath>
      </defs>

      <ellipse cx="516" cy="452" rx="378" ry="15" fill="#000" opacity=".38" />

      {/* Gövde */}
      <g>
        <path
          d="M92 392 L92 344 Q92 326 112 320 L318 298 L404 205 Q414 191 434 190 L640 186
             Q662 186 676 202 L754 300 L892 316 Q938 322 942 356 L944 384 Q944 392 930 392 Z"
          fill={`url(#${id('body')})`}
          stroke="#071e25"
          strokeWidth="3"
          strokeLinejoin="round"
        />
        <path d="M770 302 q80 2 130 10" stroke="#0b323e" strokeWidth="3" fill="none" opacity=".8" />
        <path d="M902 336 q30 2 34 20 q2 12-14 12 h-34 q-10 0-10-12 z" fill="#e8fbff" opacity=".92" />
        <path d="M112 348 q-22 2-24 16 q-1 11 13 11 h28 q10 0 10-11 z" fill="#ff7f6d" opacity=".6" />
        <path d="M160 392 h150" stroke="#071e25" strokeWidth="5" opacity=".5" fill="none" />
      </g>

      {/* Kabin — yalnızca kapı açıklığında görünür */}
      <g clipPath={`url(#${id('clip')})`}>
        <rect x="330" y="180" width="432" height="220" fill="#08242e" />
        <ellipse cx="560" cy="300" rx="230" ry="150" fill="#0d3d4d" opacity=".7" />
        <path d="M336 206 q210-18 420 2 v-30 H336Z" fill="#12485a" opacity=".55" />
        <path d="M340 372 h420 v22 H340Z" fill="#0a2731" />

        {/* Arka koltuk */}
        <g className="hs">
          <path d="M366 374 v-40 q0-14 14-14 h40 q14 0 14 14 v40 Z" fill="#17566a" />
          <path d="M362 334 q-6-52 8-64 q9-8 19-6 q12 2 13 15 l3 55 Z" fill="#1d6a82" />
          <path d="M366 272 q10-9 22-7" stroke="#5fd0e6" strokeWidth="5" fill="none" strokeLinecap="round" />
        </g>

        {/* Ön koltuk */}
        <g className="hs">
          <path d="M474 374 v-46 q0-14 14-14 h44 q14 0 14 14 v46 Z" fill="#1a6076" />
          <path d="M470 328 q-8-64 8-77 q11-9 22-7 q14 3 15 18 l4 66 Z" fill="#227a94" />
          <path d="M474 252 q12-11 26-8" stroke="#5fd0e6" strokeWidth="5" fill="none" strokeLinecap="round" />
          <path d="M482 314 h56" stroke="#07222b" strokeWidth="3" opacity=".8" />
        </g>

        {/* Orta konsol ve vites */}
        <g className="hs">
          <path d="M556 374 v-34 q0-11 12-11 h30 q12 0 12 11 v34 Z" fill="#0d3341" />
          <path d="M583 329 v-26" stroke="#4fc3d9" strokeWidth="7" strokeLinecap="round" />
          <circle cx="583" cy="298" r="9" fill="#9beefb" />
        </g>

        {/* Torpido ve multimedya ekranı */}
        <g className="hs">
          <path d="M614 374 q2-58 24-80 l52-46 q10-9 24-7 l30 5 v128 Z" fill="#0c3140" />
          <rect x="624" y="250" width="60" height="40" rx="6" fill="#08262f" stroke="#4fc3d9" strokeWidth="3" />
          <path d="M635 280 l12-15 10 10 8-12 10 17Z" fill="#9beefb" opacity=".9" />
          <rect x="630" y="304" width="44" height="8" rx="4" fill="#2b7d92" />
          <rect x="630" y="320" width="28" height="8" rx="4" fill="#2b7d92" opacity=".7" />
        </g>

        {/* Direksiyon ve gösterge paneli */}
        <g className="hs">
          <rect x="674" y="220" width="52" height="26" rx="6" fill="#08262f" stroke="#39a6bf" strokeWidth="3" />
          <path d="M685 238 a13 13 0 0 1 30 0" fill="none" stroke="#9beefb" strokeWidth="3" />
          <ellipse cx="700" cy="292" rx="23" ry="41" fill="none" stroke="#9beefb" strokeWidth="9" />
          <ellipse cx="700" cy="292" rx="11" ry="20" fill="none" stroke="#39a6bf" strokeWidth="5" />
          <path d="M677 292 h46" stroke="#9beefb" strokeWidth="7" strokeLinecap="round" />
          <path d="M700 272 v-14" stroke="#39a6bf" strokeWidth="6" strokeLinecap="round" />
        </g>

        {/* Pedallar */}
        <path d="M686 360 h20 v10 h-20Z" fill="#2b7d92" opacity=".85" />
        <path d="M714 360 h16 v10 h-16Z" fill="#2b7d92" opacity=".6" />
      </g>

      {/* B direği — kapılar açılınca yerinde kalır */}
      <path d="M512 392 v-198 h16 v198 Z" fill="#12485a" stroke="#071e25" strokeWidth="2" />

      {/* Arka kapı */}
      <g className="car-door car-door-rear">
        <path
          d="M340 392 L340 300 L404 205 Q414 191 434 190 L520 189 L520 392 Z"
          fill={`url(#${id('door')})`}
          stroke="#071e25"
          strokeWidth="3"
          strokeLinejoin="round"
        />
        <path
          d="M356 292 L412 209 Q420 199 434 198 L508 197 L508 292 Z"
          fill={`url(#${id('glass')})`}
          stroke="#4d9db2"
          strokeWidth="2.5"
        />
        <rect x="432" y="318" width="46" height="10" rx="5" fill="#9beefb" opacity=".9" />
        <path d="M356 342 q76 20 150 12" stroke="#071e25" strokeWidth="3" fill="none" opacity=".45" />
      </g>

      {/* Ön kapı */}
      <g className="car-door car-door-front">
        <path
          d="M520 392 L520 189 L640 186 Q662 186 676 202 L752 300 L752 392 Z"
          fill={`url(#${id('door')})`}
          stroke="#071e25"
          strokeWidth="3"
          strokeLinejoin="round"
        />
        <path
          d="M532 292 L532 197 L638 195 Q652 195 662 207 L734 292 Z"
          fill={`url(#${id('glass')})`}
          stroke="#4d9db2"
          strokeWidth="2.5"
        />
        <rect x="552" y="318" width="50" height="10" rx="5" fill="#9beefb" opacity=".9" />
        <path d="M532 342 q94 22 200 12" stroke="#071e25" strokeWidth="3" fill="none" opacity=".45" />
        <path d="M528 268 q-16 4-18 18 q-1 10 10 10 h10 z" fill="#0d3644" stroke="#071e25" strokeWidth="2" />
      </g>

      {/* Tekerlekler */}
      <g>
        <circle cx="272" cy="392" r="62" fill="#06202a" stroke="#071e25" strokeWidth="3" />
        <circle cx="272" cy="392" r="33" fill="#123c49" />
        <circle cx="272" cy="392" r="10" fill="#2b7d92" />
        <circle cx="800" cy="392" r="62" fill="#06202a" stroke="#071e25" strokeWidth="3" />
        <circle cx="800" cy="392" r="33" fill="#123c49" />
        <circle cx="800" cy="392" r="10" fill="#2b7d92" />
      </g>
    </svg>
  );
}
