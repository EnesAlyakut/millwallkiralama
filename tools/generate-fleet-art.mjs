/**
 * Millwal — filo görsel üreteci
 * Stüdyo ışıklı, premium his veren SVG araç görselleri üretir.
 * Kullanım: node tools/generate-fleet-art.mjs
 */
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'apps/web/public/fleet');

/* ------------------------------------------------------------------ */
/*  Tekerlek yardımcıları                                              */
/* ------------------------------------------------------------------ */
function wheel(cx, cy, r, id) {
  const rim = r * 0.6;
  const spokes = Array.from({ length: 10 }, (_, i) => {
    const a = (Math.PI * 2 * i) / 10;
    const x1 = cx + Math.cos(a) * (rim * 0.28);
    const y1 = cy + Math.sin(a) * (rim * 0.28);
    const x2 = cx + Math.cos(a) * (rim * 0.94);
    const y2 = cy + Math.sin(a) * (rim * 0.94);
    return `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="url(#rim-${id})" stroke-width="${(r * 0.075).toFixed(1)}" stroke-linecap="round"/>`;
  }).join('');
  return `
  <g>
    <circle cx="${cx}" cy="${cy}" r="${r}" fill="#0a0f16"/>
    <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="#1b2531" stroke-width="${(r * 0.09).toFixed(1)}"/>
    <circle cx="${cx}" cy="${cy}" r="${(r * 0.78).toFixed(1)}" fill="#111922"/>
    <circle cx="${cx}" cy="${cy}" r="${rim.toFixed(1)}" fill="url(#hub-${id})"/>
    ${spokes}
    <circle cx="${cx}" cy="${cy}" r="${(rim * 0.26).toFixed(1)}" fill="#2b3947"/>
    <circle cx="${cx}" cy="${cy}" r="${(rim * 0.26).toFixed(1)}" fill="none" stroke="#4a5b6c" stroke-width="2"/>
  </g>`;
}

/* ------------------------------------------------------------------ */
/*  Gövde şablonları — hepsi 1600x1000 tuval, zemin y = 768            */
/* ------------------------------------------------------------------ */
const GROUND = 768;

const shapes = {
  sedan: () => ({
    body: `M 272 662
      C 262 596 276 556 318 542
      L 374 524
      C 394 466 438 432 512 420
      L 694 404
      C 764 396 892 396 964 406
      L 1110 446
      C 1198 464 1274 498 1324 540
      C 1354 564 1362 610 1354 662
      L 1232 662
      A 102 102 0 0 0 1028 662
      L 622 662
      A 102 102 0 0 0 418 662
      Z`,
    glass: `M 430 518 C 450 474 488 448 540 438 L 700 424 C 766 418 878 418 940 426 L 1068 460 Z`,
    detail: `
      <path d="M 700 424 L 700 660" stroke="#0b1118" stroke-opacity=".45" stroke-width="4"/>
      <path d="M 430 545 C 560 565 900 574 1320 568" stroke="#ffffff" stroke-opacity=".2" stroke-width="5" fill="none"/>
      <path d="M 900 604 L 962 604" stroke="#0b1118" stroke-opacity=".45" stroke-width="9" stroke-linecap="round"/>
      <path d="M 640 604 L 702 604" stroke="#0b1118" stroke-opacity=".45" stroke-width="9" stroke-linecap="round"/>
      <path d="M 1140 470 L 1290 522" stroke="#ffffff" stroke-opacity=".22" stroke-width="4" fill="none"/>`,
    wheels: [{ x: 1130, y: 670, r: 98 }, { x: 520, y: 670, r: 98 }],
    lamp: { x: 1330, y: 566 }, tail: { x: 288, y: 566 },
  }),

  hatchback: () => ({
    body: `M 342 666
      C 328 606 336 560 372 540
      L 400 470
      C 418 436 452 416 508 408
      L 700 394
      C 782 388 878 392 942 404
      L 1078 448
      C 1160 468 1226 500 1268 542
      C 1298 570 1304 616 1296 666
      L 1198 666
      A 100 100 0 0 0 994 666
      L 654 666
      A 100 100 0 0 0 450 666
      Z`,
    glass: `M 424 504 C 442 460 476 434 522 426 L 700 414 C 774 409 862 412 920 422 L 1042 462 Z`,
    detail: `
      <path d="M 706 414 L 706 664" stroke="#0b1118" stroke-opacity=".45" stroke-width="4"/>
      <path d="M 400 548 C 540 568 900 576 1248 572" stroke="#ffffff" stroke-opacity=".2" stroke-width="5" fill="none"/>
      <path d="M 872 608 L 932 608" stroke="#0b1118" stroke-opacity=".45" stroke-width="9" stroke-linecap="round"/>
      <path d="M 636 608 L 696 608" stroke="#0b1118" stroke-opacity=".45" stroke-width="9" stroke-linecap="round"/>`,
    wheels: [{ x: 1096, y: 674, r: 94 }, { x: 552, y: 674, r: 94 }],
    lamp: { x: 1274, y: 572 }, tail: { x: 354, y: 566 },
  }),

  suv: () => ({
    body: `M 302 640
      L 296 476
      C 296 424 318 398 360 390
      L 500 376
      L 936 368
      C 998 368 1040 386 1064 418
      L 1142 502
      C 1234 516 1302 544 1338 578
      C 1360 600 1366 620 1358 640
      L 1244 640
      A 122 122 0 0 0 1000 640
      L 634 640
      A 122 122 0 0 0 390 640
      Z`,
    glass: `M 336 480 L 336 424 C 338 404 354 394 384 390 L 934 380 C 980 380 1010 396 1030 424 L 1094 498 Z`,
    detail: `
      <path d="M 560 384 L 560 494" stroke="#0b1118" stroke-opacity=".4" stroke-width="4"/>
      <path d="M 790 380 L 790 492" stroke="#0b1118" stroke-opacity=".4" stroke-width="4"/>
      <path d="M 336 520 C 560 536 960 546 1340 542" stroke="#ffffff" stroke-opacity=".22" stroke-width="5" fill="none"/>
      <rect x="330" y="592" width="960" height="26" rx="13" fill="#0b1118" fill-opacity=".4"/>
      <path d="M 864 566 L 926 566" stroke="#0b1118" stroke-opacity=".45" stroke-width="9" stroke-linecap="round"/>
      <path d="M 620 566 L 682 566" stroke="#0b1118" stroke-opacity=".45" stroke-width="9" stroke-linecap="round"/>
      <path d="M 400 366 L 900 356" stroke="#1b2531" stroke-width="14" stroke-linecap="round"/>`,
    wheels: [{ x: 1122, y: 652, r: 116 }, { x: 512, y: 652, r: 116 }],
    lamp: { x: 1336, y: 560 }, tail: { x: 312, y: 524 },
  }),

  wagon: () => ({
    body: `M 270 656
      L 264 496
      C 264 448 286 426 326 418
      L 490 402
      L 902 394
      C 962 396 1002 412 1028 444
      L 1112 522
      C 1214 536 1302 568 1350 602
      C 1372 620 1378 638 1372 656
      L 1250 656
      A 102 102 0 0 0 1046 656
      L 612 656
      A 102 102 0 0 0 408 656
      Z`,
    glass: `M 302 500 L 302 448 C 304 428 320 418 348 414 L 900 406 C 944 406 970 420 988 448 L 1046 516 Z`,
    detail: `
      <path d="M 520 410 L 520 512" stroke="#0b1118" stroke-opacity=".4" stroke-width="4"/>
      <path d="M 762 406 L 762 510" stroke="#0b1118" stroke-opacity=".4" stroke-width="4"/>
      <path d="M 302 540 C 540 558 960 568 1358 562" stroke="#ffffff" stroke-opacity=".2" stroke-width="5" fill="none"/>
      <path d="M 872 600 L 934 600" stroke="#0b1118" stroke-opacity=".45" stroke-width="9" stroke-linecap="round"/>
      <path d="M 620 600 L 682 600" stroke="#0b1118" stroke-opacity=".45" stroke-width="9" stroke-linecap="round"/>
      <path d="M 350 394 L 880 386" stroke="#1b2531" stroke-width="12" stroke-linecap="round"/>`,
    wheels: [{ x: 1146, y: 664, r: 100 }, { x: 508, y: 664, r: 100 }],
    lamp: { x: 1362, y: 584 }, tail: { x: 280, y: 520 },
  }),

  vanSmall: () => ({
    body: `M 254 660
      C 244 580 250 500 262 442
      C 270 400 300 378 356 372
      L 940 356
      C 1004 352 1054 372 1090 412
      L 1180 512
      C 1288 534 1350 566 1374 606
      C 1386 626 1386 644 1380 660
      L 1252 660
      A 104 104 0 0 0 1044 660
      L 584 660
      A 104 104 0 0 0 376 660
      Z`,
    glass: `M 300 430 C 306 400 330 386 372 382 L 640 372 L 640 470 L 300 476 Z
            M 700 370 L 930 362 C 986 359 1024 378 1052 414 L 1112 492 L 700 476 Z`,
    detail: `
      <path d="M 668 368 L 668 656" stroke="#0b1118" stroke-opacity=".45" stroke-width="4"/>
      <path d="M 262 524 C 520 546 960 556 1370 552" stroke="#ffffff" stroke-opacity=".18" stroke-width="5" fill="none"/>
      <rect x="300" y="588" width="980" height="24" rx="12" fill="#0b1118" fill-opacity=".35"/>
      <path d="M 604 560 L 662 560" stroke="#0b1118" stroke-opacity=".45" stroke-width="9" stroke-linecap="round"/>`,
    wheels: [{ x: 1150, y: 668, r: 100 }, { x: 480, y: 668, r: 100 }],
    lamp: { x: 1366, y: 600 }, tail: { x: 268, y: 500 },
  }),

  vanLarge: () => ({
    body: `M 236 656
      C 226 540 230 420 240 344
      C 246 300 274 280 328 276
      L 970 276
      C 1032 276 1078 300 1108 348
      L 1188 486
      C 1298 510 1358 546 1382 596
      C 1392 618 1392 640 1386 656
      L 1282 656
      A 104 104 0 0 0 1074 656
      L 556 656
      A 104 104 0 0 0 348 656
      Z`,
    glass: `M 276 336 C 280 308 300 296 340 294 L 604 292 L 604 400 L 276 402 Z
            M 700 292 L 952 292 C 1008 292 1044 312 1068 352 L 1122 464 L 700 452 Z`,
    detail: `
      <path d="M 664 288 L 664 650" stroke="#0b1118" stroke-opacity=".4" stroke-width="4"/>
      <path d="M 240 474 C 520 498 980 510 1380 506" stroke="#ffffff" stroke-opacity=".16" stroke-width="5" fill="none"/>
      <rect x="280" y="572" width="1020" height="26" rx="13" fill="#0b1118" fill-opacity=".35"/>
      <path d="M 600 520 L 658 520" stroke="#0b1118" stroke-opacity=".45" stroke-width="9" stroke-linecap="round"/>`,
    wheels: [{ x: 1178, y: 664, r: 100 }, { x: 452, y: 664, r: 100 }],
    lamp: { x: 1374, y: 592 }, tail: { x: 250, y: 420 },
  }),

  pickup: () => ({
    body: `M 254 648
      L 250 512
      L 656 500
      L 664 420
      C 672 386 704 364 752 356
      L 986 350
      C 1044 350 1082 374 1104 414
      L 1172 508
      C 1260 524 1330 556 1358 592
      C 1376 614 1378 632 1372 648
      L 1252 648
      A 118 118 0 0 0 1016 648
      L 590 648
      A 118 118 0 0 0 354 648
      Z`,
    glass: `M 700 438 C 708 410 730 392 766 386 L 980 380 C 1024 380 1052 398 1070 430 L 1114 502 L 700 506 Z`,
    detail: `
      <path d="M 264 514 L 656 502 L 656 542 L 264 554 Z" fill="#080d14" fill-opacity=".55"/>
      <path d="M 250 512 L 656 500" stroke="#ffffff" stroke-opacity=".28" stroke-width="6"/>
      <path d="M 890 382 L 890 504" stroke="#0b1118" stroke-opacity=".4" stroke-width="4"/>
      <path d="M 266 578 C 540 596 960 604 1362 598" stroke="#ffffff" stroke-opacity=".18" stroke-width="5" fill="none"/>
      <path d="M 852 572 L 914 572" stroke="#0b1118" stroke-opacity=".45" stroke-width="9" stroke-linecap="round"/>
      <path d="M 700 344 L 950 338" stroke="#1b2531" stroke-width="12" stroke-linecap="round"/>`,
    wheels: [{ x: 1130, y: 656, r: 118 }, { x: 470, y: 656, r: 118 }],
    lamp: { x: 1364, y: 578 }, tail: { x: 264, y: 528 },
  }),

  motorcycle: () => ({
    body: `M 512 556
      C 552 524 610 514 672 520
      L 792 532
      C 802 488 830 464 876 456
      L 978 444
      C 1018 440 1036 460 1030 496
      L 1016 546
      L 906 560
      L 802 568
      C 758 594 692 604 630 596
      L 530 584
      C 504 578 496 566 512 556 Z`,
    glass: `M 946 456 C 990 450 1014 470 1008 502 L 1000 540 L 928 532 Z`,
    detail: `
      <path d="M 792 566 L 480 666" stroke="#131c26" stroke-width="26" stroke-linecap="round"/>
      <path d="M 1022 500 L 1164 664" stroke="#131c26" stroke-width="24" stroke-linecap="round"/>
      <path d="M 1000 486 L 1150 640" stroke="#5c6d80" stroke-width="8" stroke-linecap="round"/>
      <path d="M 752 566 L 966 552 C 1004 550 1020 570 1014 600 L 1000 640 C 994 662 976 672 950 670 L 800 658 C 768 654 750 634 748 604 Z" fill="#101822" fill-opacity=".85"/>
      <path d="M 760 640 L 1050 634" stroke="#4a5b6c" stroke-width="14" stroke-linecap="round"/>
      <path d="M 512 556 C 600 542 720 540 800 548" stroke="#ffffff" stroke-opacity=".22" stroke-width="6" fill="none"/>
      <path d="M 920 412 L 1096 400" stroke="#1b2531" stroke-width="18" stroke-linecap="round"/>
      <path d="M 1010 400 L 1034 452" stroke="#1b2531" stroke-width="12" stroke-linecap="round"/>`,
    wheels: [{ x: 1164, y: 664, r: 104 }, { x: 480, y: 666, r: 102 }],
    lamp: { x: 1042, y: 470 }, tail: { x: 520, y: 540 },
  }),

  scooter: () => ({
    body: `M 398 606
      C 390 550 428 518 494 514
      L 668 520
      C 704 522 726 542 732 574
      L 740 600
      L 890 600
      C 890 518 918 462 966 432
      L 1038 388
      C 1072 368 1102 388 1092 428
      L 1046 594
      C 1040 614 1024 624 1000 624
      L 470 638
      C 418 636 400 628 398 606 Z`,
    glass: `M 1002 424 C 1036 402 1064 414 1058 444 L 1042 500 L 984 486 Z`,
    detail: `
      <path d="M 736 592 L 500 664" stroke="#131c26" stroke-width="22" stroke-linecap="round"/>
      <path d="M 1058 470 L 1152 656" stroke="#131c26" stroke-width="20" stroke-linecap="round"/>
      <path d="M 1046 464 L 1136 640" stroke="#5c6d80" stroke-width="7" stroke-linecap="round"/>
      <path d="M 420 566 C 520 540 626 534 700 542 L 706 578 C 620 574 500 584 428 600 Z" fill="#0b1118" fill-opacity=".45"/>
      <path d="M 740 600 L 890 600" stroke="#0b1118" stroke-opacity=".45" stroke-width="9"/>
      <path d="M 906 520 C 960 512 1010 508 1052 510" stroke="#ffffff" stroke-opacity=".24" stroke-width="6" fill="none"/>
      <path d="M 946 356 L 1128 344" stroke="#1b2531" stroke-width="16" stroke-linecap="round"/>
      <path d="M 1042 350 L 1058 394" stroke="#1b2531" stroke-width="11" stroke-linecap="round"/>`,
    wheels: [{ x: 1152, y: 660, r: 90 }, { x: 500, y: 664, r: 90 }],
    lamp: { x: 1080, y: 452 }, tail: { x: 412, y: 560 },
  }),

  boat: () => ({
    body: `M 236 574
      L 1318 546
      C 1382 544 1406 572 1380 606
      C 1326 676 1234 718 1118 726
      L 486 738
      C 356 730 268 666 236 574 Z`,
    glass: `M 566 424 C 578 396 604 380 646 378 L 986 368 C 1030 368 1058 388 1070 420 L 1094 496 L 546 508 Z`,
    detail: `
      <path d="M 236 574 L 1330 548" stroke="#ffffff" stroke-opacity=".3" stroke-width="8"/>
      <path d="M 268 636 L 1300 612" stroke="#0b1118" stroke-opacity=".35" stroke-width="7"/>
      <path d="M 520 574 L 548 508 L 1094 496 L 1150 566 Z" fill="#0b1118" fill-opacity=".3"/>
      <path d="M 660 378 L 654 500 M 852 372 L 848 498 M 992 368 L 992 496" stroke="#0b1118" stroke-opacity=".35" stroke-width="4"/>
      <path d="M 380 566 L 500 566" stroke="#ffffff" stroke-opacity=".25" stroke-width="6" stroke-linecap="round"/>
      <path d="M 1146 372 L 1146 236" stroke="#1b2531" stroke-width="10" stroke-linecap="round"/>
      <path d="M 1146 250 L 1268 292" stroke="#ff7a3d" stroke-width="9" stroke-linecap="round"/>
      <path d="M 300 546 L 300 470" stroke="#1b2531" stroke-width="8" stroke-linecap="round"/>`,
    wheels: [], lamp: { x: 1338, y: 576 }, tail: { x: 262, y: 552 }, water: true,
  }),

  jetski: () => ({
    body: `M 300 592
      C 332 546 392 522 476 518
      L 690 508
      C 720 462 762 434 822 428
      L 1002 414
      C 1084 408 1142 434 1168 484
      L 1236 596
      C 1268 630 1258 660 1214 668
      L 486 682
      C 364 676 302 644 300 592 Z`,
    glass: `M 856 452 C 872 432 900 422 940 420 L 1010 418 C 1052 418 1078 436 1090 470 L 1096 492 L 840 500 Z`,
    detail: `
      <path d="M 336 600 C 640 620 1000 622 1230 608" stroke="#ffffff" stroke-opacity=".28" stroke-width="7" fill="none"/>
      <path d="M 452 646 L 1206 636" stroke="#0b1118" stroke-opacity=".35" stroke-width="7"/>
      <path d="M 490 528 C 560 512 640 506 700 508 L 700 566 C 620 570 540 574 486 584 Z" fill="#0b1118" fill-opacity=".38"/>
      <path d="M 700 512 L 700 604" stroke="#0b1118" stroke-opacity=".3" stroke-width="4"/>
      <path d="M 1096 448 L 1226 416" stroke="#1b2531" stroke-width="15" stroke-linecap="round"/>
      <path d="M 1180 424 L 1196 470" stroke="#1b2531" stroke-width="11" stroke-linecap="round"/>`,
    wheels: [], lamp: { x: 1224, y: 552 }, tail: { x: 318, y: 566 }, water: true,
  }),

  atv: () => ({
    body: `M 336 596
      C 328 540 366 508 428 504
      L 668 500
      C 682 464 712 444 754 440
      L 908 432
      C 968 428 1014 452 1034 500
      L 1076 566
      C 1104 588 1094 614 1050 616
      L 392 620
      C 352 618 334 610 336 596 Z`,
    glass: `M 812 452 C 858 446 892 462 902 494 L 908 518 L 798 514 Z`,
    detail: `
      <path d="M 326 618 A 134 134 0 0 1 578 618 L 542 618 A 98 98 0 0 0 362 618 Z" fill="#0b1118" fill-opacity=".55"/>
      <path d="M 1022 618 A 134 134 0 0 1 1274 618 L 1238 618 A 98 98 0 0 0 1058 618 Z" fill="#0b1118" fill-opacity=".55"/>
      <path d="M 660 520 L 470 636" stroke="#131c26" stroke-width="30" stroke-linecap="round"/>
      <path d="M 1030 512 L 1146 636" stroke="#131c26" stroke-width="30" stroke-linecap="round"/>
      <path d="M 636 500 L 736 494 L 740 528 L 640 534 Z" fill="#0b1118" fill-opacity=".5"/>
      <path d="M 380 566 C 620 586 900 590 1046 578" stroke="#ffffff" stroke-opacity=".26" stroke-width="6" fill="none"/>
      <path d="M 796 386 L 972 374" stroke="#1b2531" stroke-width="20" stroke-linecap="round"/>
      <path d="M 886 380 L 900 430" stroke="#1b2531" stroke-width="13" stroke-linecap="round"/>
      <path d="M 372 516 L 560 508" stroke="#3a4a5c" stroke-width="12" stroke-linecap="round"/>`,
    wheels: [{ x: 1148, y: 636, r: 128 }, { x: 452, y: 638, r: 128 }],
    lamp: { x: 1064, y: 470 }, tail: { x: 366, y: 540 },
  }),
};

/* ------------------------------------------------------------------ */
/*  SVG kompozisyonu                                                   */
/* ------------------------------------------------------------------ */
function build({ id, shape, color, colorDark, title, subtitle, tag }) {
  const s = shapes[shape]();
  const wheels = s.wheels.map((w, i) => wheel(w.x, w.y, w.r, `${id}-${i}`)).join('');
  const rimDefs = s.wheels
    .map(
      (_, i) => `
    <radialGradient id="hub-${id}-${i}" cx="38%" cy="32%" r="80%">
      <stop offset="0%" stop-color="#6b7c8d"/><stop offset="55%" stop-color="#38475a"/><stop offset="100%" stop-color="#1a2430"/>
    </radialGradient>
    <linearGradient id="rim-${id}-${i}" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#93a4b6"/><stop offset="100%" stop-color="#3c4c5f"/>
    </linearGradient>`
    )
    .join('');

  const water = s.water
    ? `<g opacity=".85">
        <path d="M 0 742 C 220 726 380 758 600 748 C 820 738 1000 762 1220 750 C 1360 742 1500 754 1600 744 L 1600 1000 L 0 1000 Z" fill="url(#water-${id})"/>
        <path d="M 120 790 C 320 780 460 800 660 792" stroke="#ffffff" stroke-opacity=".18" stroke-width="5" fill="none"/>
        <path d="M 820 828 C 1000 818 1160 836 1360 826" stroke="#ffffff" stroke-opacity=".12" stroke-width="5" fill="none"/>
      </g>`
    : `<ellipse cx="800" cy="${GROUND + 26}" rx="560" ry="34" fill="url(#shadow-${id})"/>`;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 1000" width="1600" height="1000" role="img" aria-label="${title}">
  <defs>
    <linearGradient id="bg-${id}" x1="0" y1="0" x2="0.4" y2="1">
      <stop offset="0%" stop-color="#101b27"/><stop offset="48%" stop-color="#0a121c"/><stop offset="100%" stop-color="#060b12"/>
    </linearGradient>
    <radialGradient id="glow-${id}" cx="50%" cy="46%" r="58%">
      <stop offset="0%" stop-color="#4d76a1" stop-opacity=".95"/>
      <stop offset="42%" stop-color="#25405c" stop-opacity=".55"/>
      <stop offset="100%" stop-color="#080e16" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="body-${id}" x1="0.1" y1="0" x2="0.7" y2="1">
      <stop offset="0%" stop-color="${color}"/>
      <stop offset="52%" stop-color="${color}"/>
      <stop offset="100%" stop-color="${colorDark}"/>
    </linearGradient>
    <linearGradient id="glass-${id}" x1="0" y1="0" x2="0.6" y2="1">
      <stop offset="0%" stop-color="#cfe2f2" stop-opacity=".92"/>
      <stop offset="45%" stop-color="#7f9cb8" stop-opacity=".82"/>
      <stop offset="100%" stop-color="#22323f" stop-opacity=".92"/>
    </linearGradient>
    <radialGradient id="shadow-${id}" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#000000" stop-opacity=".62"/>
      <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="water-${id}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#12354f"/><stop offset="100%" stop-color="#071723"/>
    </linearGradient>
    <linearGradient id="tagline-${id}" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#ff7a3d"/><stop offset="100%" stop-color="#ff7a3d" stop-opacity="0"/>
    </linearGradient>
    ${rimDefs}
  </defs>

  <rect width="1600" height="1000" fill="url(#bg-${id})"/>
  <ellipse cx="800" cy="460" rx="820" ry="470" fill="url(#glow-${id})"/>

  <g opacity=".16" stroke="#7fa8cf" stroke-width="1.4">
    ${Array.from({ length: 9 }, (_, i) => `<line x1="${100 + i * 175}" y1="0" x2="${100 + i * 175}" y2="1000"/>`).join('')}
    ${Array.from({ length: 6 }, (_, i) => `<line x1="0" y1="${120 + i * 160}" x2="1600" y2="${120 + i * 160}"/>`).join('')}
  </g>

  <circle cx="800" cy="470" r="330" fill="none" stroke="#ffffff" stroke-opacity=".07" stroke-width="2"/>
  <circle cx="800" cy="470" r="430" fill="none" stroke="#ffffff" stroke-opacity=".05" stroke-width="2"/>

  ${water}
  ${wheels}
  <path d="${s.body}" fill="url(#body-${id})"/>
  <path d="${s.body}" fill="none" stroke="#ffffff" stroke-opacity=".3" stroke-width="3.5"/>
  <path d="${s.glass}" fill="url(#glass-${id})"/>
  <path d="${s.glass}" fill="none" stroke="#0b1118" stroke-opacity=".35" stroke-width="3"/>
  ${s.detail}
  <ellipse cx="${s.lamp.x}" cy="${s.lamp.y}" rx="34" ry="16" fill="#fff3d8" opacity=".95"/>
  <ellipse cx="${s.lamp.x}" cy="${s.lamp.y}" rx="72" ry="34" fill="#ffe6b0" opacity=".18"/>
  <ellipse cx="${s.tail.x}" cy="${s.tail.y}" rx="20" ry="13" fill="#ff4d3d" opacity=".92"/>

  <text x="1514" y="944" text-anchor="end" font-family="Segoe UI, Arial, sans-serif" font-size="22" letter-spacing="5" font-weight="700" fill="#ffffff" fill-opacity=".28">MILLWAL</text>
</svg>`;
}

/* ------------------------------------------------------------------ */
/*  Üretilecek görseller — seed dosyasıyla birebir eşleşir             */
/* ------------------------------------------------------------------ */
export const artworks = [
  ['fiat-egea', 'sedan', '#e8ecf1', '#9aa7b4', 'FIAT EGEA', 'SEDAN · DİZEL · MANUEL', 'EKONOMİK SINIF'],
  ['renault-clio', 'hatchback', '#e2e6ea', '#98a5b2', 'RENAULT CLIO', 'HATCHBACK · BENZİN · OTOMATİK', 'EKONOMİK SINIF'],
  ['volkswagen-passat', 'sedan', '#2a374a', '#121a25', 'VW PASSAT', 'SEDAN · DİZEL · DSG', 'YÖNETİCİ SINIFI'],
  ['toyota-corolla-hybrid', 'sedan', '#c9d3dd', '#7f8d9c', 'TOYOTA COROLLA', 'HİBRİT · E-CVT', 'HİBRİT'],
  ['renault-megane', 'sedan', '#3a4b60', '#1c2634', 'RENAULT MEGANE', 'SEDAN · DİZEL · EDC', 'ORTA SINIF'],
  ['hyundai-i20', 'hatchback', '#dbe2e8', '#93a1af', 'HYUNDAI i20', 'HATCHBACK · BENZİN', 'EKONOMİK SINIF'],
  ['peugeot-2008', 'suv', '#2b3a4c', '#141d28', 'PEUGEOT 2008', 'CROSSOVER · BENZİN', 'SUV'],
  ['nissan-qashqai', 'suv', '#e6eaee', '#9ba8b6', 'NISSAN QASHQAI', 'SUV · HİBRİT · CVT', 'SUV'],
  ['bmw-320i', 'sedan', '#242f3f', '#0d141d', 'BMW 320i', 'SEDAN · BENZİN · STEPTRONIC', 'PREMIUM'],
  ['mercedes-e200', 'sedan', '#2c3849', '#131b25', 'MERCEDES E 200', 'SEDAN · BENZİN · 9G-TRONIC', 'VIP SINIF'],
  ['audi-a4', 'sedan', '#7d8896', '#414b57', 'AUDI A4', 'SEDAN · DİZEL · S TRONIC', 'PREMIUM'],
  ['tesla-model-3', 'sedan', '#b9202e', '#6d0f19', 'TESLA MODEL 3', 'ELEKTRİKLİ · TEK VİTES', 'ELEKTRİKLİ'],
  ['skoda-superb', 'wagon', '#243444', '#0f1720', 'ŠKODA SUPERB', 'STATION WAGON · DİZEL', 'KURUMSAL'],
  ['ford-transit-custom', 'vanSmall', '#e9edf1', '#98a6b3', 'FORD TRANSIT CUSTOM', 'PANELVAN · DİZEL', 'TİCARİ'],
  ['fiat-doblo', 'vanSmall', '#dfe5ea', '#8f9dab', 'FIAT DOBLO CARGO', 'HAFİF TİCARİ · DİZEL', 'TİCARİ'],
  ['ford-transit-jumbo', 'vanLarge', '#eceff2', '#9aa7b4', 'FORD TRANSIT JUMBO', 'UZUN ŞASİ · DİZEL', 'BÜYÜK TİCARİ'],
  ['mercedes-sprinter', 'vanLarge', '#dde3e9', '#8d9baa', 'MERCEDES SPRINTER', 'PANELVAN · DİZEL', 'BÜYÜK TİCARİ'],
  ['ford-ranger', 'pickup', '#1e3348', '#0b1620', 'FORD RANGER', 'PICKUP · 4x4 · DİZEL', 'ARAZİ'],
  ['honda-cbf-250', 'motorcycle', '#c0362d', '#6c1a15', 'HONDA CBF 250', 'MOTOSİKLET · 250 CC', 'MOTOSİKLET'],
  ['yamaha-mt-07', 'motorcycle', '#1b2a3d', '#08111c', 'YAMAHA MT-07', 'NAKED · 689 CC', 'MOTOSİKLET'],
  ['vespa-primavera', 'scooter', '#3f6f6a', '#1d3a37', 'VESPA PRIMAVERA', 'SCOOTER · 125 CC', 'ŞEHİR İÇİ'],
  ['sea-ray-230', 'boat', '#e8edf2', '#93a2b0', 'SEA RAY 230 SLX', 'SÜRAT TEKNESİ · 8 KİŞİ', 'DENİZ'],
  ['bayliner-vr5', 'boat', '#2a4a68', '#122636', 'BAYLINER VR5', 'BOWRIDER · 7 KİŞİ', 'DENİZ'],
  ['yamaha-vx-cruiser', 'jetski', '#1f4c74', '#0c2136', 'YAMAHA VX CRUISER', 'JETSKİ · 3 KİŞİ', 'DENİZ'],
  ['seadoo-gti-130', 'jetski', '#c9532a', '#6d2913', 'SEA-DOO GTI 130', 'JETSKİ · 3 KİŞİ', 'DENİZ'],
  ['cfmoto-cforce-520', 'atv', '#2d6a3f', '#12331d', 'CFMOTO CFORCE 520', 'ATV · 4x4', 'ARAZİ'],
  ['polaris-sportsman-570', 'atv', '#b03a20', '#5c1c0e', 'POLARIS SPORTSMAN 570', 'ATV · 4x4', 'ARAZİ'],
];

async function main() {
  await mkdir(OUT, { recursive: true });
  for (const [id, shape, color, colorDark, title, subtitle, tag] of artworks) {
    const svg = build({ id, shape, color, colorDark, title, subtitle, tag });
    await writeFile(path.join(OUT, `${id}.svg`), svg, 'utf8');
  }
  console.log(`${artworks.length} görsel üretildi → apps/web/public/fleet`);
}

main();
