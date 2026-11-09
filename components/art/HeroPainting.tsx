"use client";
// 첫 화면 전체를 채우는 한 폭의 동양화 「금강의 달밤」 (자체 창작 · SVG 채색)
// 구도: 겹겹의 수묵 산 → 안개 → 불 켜진 강경 근대거리 → 물에 비친 마을 → 돌 둑길의 고양이 가족 → 앞쪽 소나무
// 화면 비율이 달라도 중요한 요소가 가운데(x 300~900, y 300~1000)에 오도록 배치했습니다.
import { Building, type BuildingStyle } from "../Building";
import { CharacterSvg } from "../Characters";

const K = "#39332F";

/** 준법(산의 결) 붓질이 있는 능선 */
function Ridge({ d, fill, opacity = 1, strokes = [] as [number, number][] }: { d: string; fill: string; opacity?: number; strokes?: [number, number][] }) {
  return (
    <g opacity={opacity}>
      <path d={d} fill={fill} filter="url(#wash)" />
      <path d={d} fill="url(#hp-mist-fade)" />
      {strokes.map(([x, y], i) => <path key={i} d={`M${x} ${y} q-4 14 -2 30 M${x + 8} ${y + 6} q-3 10 -1 22`} stroke={K} strokeWidth="1.4" opacity=".35" fill="none" strokeLinecap="round" />)}
    </g>
  );
}

/** 소나무: 붉은 줄기 + 층층이 얹힌 솔잎 덩어리 */
function Pine({ x, y, s = 1, flip = false }: { x: number; y: number; s?: number; flip?: boolean }) {
  const clusters: [number, number, number][] = [[-120, -250, 70], [-30, -300, 80], [70, -260, 75], [150, -200, 60], [-90, -170, 60], [40, -180, 55], [-170, -120, 45]];
  return (
    <g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`}>
      <g className="anim-sway" style={{ animationDuration: "11s" }}>
        <path d="M-10 0 Q-30 -80 0 -140 Q30 -200 -20 -260 M0 -140 Q60 -170 120 -190 M-6 -100 Q-80 -110 -150 -110 M-16 -210 Q-60 -250 -110 -250 M8 -160 Q40 -220 60 -250" fill="none" stroke="#5A3426" strokeWidth="16" strokeLinecap="round" />
        <path d="M-10 0 Q-30 -80 0 -140 Q30 -200 -20 -260" fill="none" stroke="#8A5440" strokeWidth="7" strokeLinecap="round" opacity=".7" />
        {[-20, -60, -110, -170, -220].map((yy, i) => <path key={i} d={`M${-14 + (i % 2) * 6} ${yy} q8 -4 14 0`} stroke="#2A1A14" strokeWidth="1.6" fill="none" />)}
        {clusters.map(([cx, cy, r], i) => (
          <g key={i}>
            <ellipse cx={cx} cy={cy} rx={r} ry={r * 0.42} fill="#22362E" />
            <ellipse cx={cx - 6} cy={cy - 6} rx={r * 0.9} ry={r * 0.34} fill="#33503F" />
            <ellipse cx={cx} cy={cy - 6} rx={r * 0.9} ry={r * 0.34} fill="url(#pt-hatch)" />
            <path d={`M${cx - r * 0.7} ${cy - 4} Q${cx} ${cy - r * 0.5} ${cx + r * 0.7} ${cy - 4}`} stroke="#6F9677" strokeWidth="2" fill="none" opacity=".55" strokeLinecap="round" />
          </g>
        ))}
      </g>
    </g>
  );
}

function Boat({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <g className="anim-idle" style={{ animationDuration: "5s" }}>
        <path d="M0 0 Q60 16 130 0 L116 16 Q60 26 12 16Z" fill="#2A211C" stroke={K} strokeWidth="2" />
        <path d="M30 0 Q30 -26 60 -30 Q90 -26 92 0" fill="#3B2C24" stroke={K} strokeWidth="1.6" />
        <circle cx="104" cy="-24" r="16" fill="#F3D896" opacity=".25" className="anim-glow" />
        <path d="M104 -40 V-30" stroke={K} strokeWidth="1.4" />
        <path d="M98 -30 Q96 -22 98 -14 H110 Q112 -22 110 -30Z" fill="#B2453B" stroke={K} strokeWidth="1.2" />
        <path d="M20 28 q60 10 110 0" stroke="#E6CB8E" strokeWidth="2" opacity=".35" fill="none" />
      </g>
    </g>
  );
}

const STREET: { x: number; w: number; h: number; style: BuildingStyle; wall?: string; roof?: string; sign?: string }[] = [
  { x: 150, w: 120, h: 150, style: "brick" },
  { x: 278, w: 130, h: 175, style: "brick", sign: "음악도서관" },
  { x: 416, w: 120, h: 120, style: "shop" },
  { x: 544, w: 120, h: 200, style: "tower" },
  { x: 672, w: 130, h: 128, style: "hanok" },
  { x: 810, w: 140, h: 160, style: "western", sign: "모던상회" },
  { x: 958, w: 120, h: 118, style: "station" },
  { x: 1086, w: 100, h: 230, style: "lighthouse" },
];
const BACK_ROOFS = [120, 260, 380, 500, 640, 760, 880, 1000, 1120];

export default function HeroPainting() {
  const streetBase = 900;
  const street = (
    <g>
      {/* 뒷줄 기와지붕 (불빛) */}
      {BACK_ROOFS.map((x, i) => (
        <g key={x} transform={`translate(${x} ${streetBase - 210 - (i % 3) * 12})`}>
          <rect x="6" y="30" width="96" height="70" fill="#4A4038" stroke={K} strokeWidth="1.5" />
          {[18, 46, 74].map((wx, j) => <rect key={wx} x={wx} y="48" width="14" height="16" fill={(i + j) % 3 ? "#E9B95E" : "#3B4A48"} opacity={(i + j) % 3 ? 0.95 : 1} />)}
          <path d="M-8 34 Q20 26 26 4 H82 Q88 26 116 34 Q54 24 -8 34Z" fill="#26302F" stroke={K} strokeWidth="1.5" />
          <path d="M-8 34 Q20 26 26 4 H82 Q88 26 116 34Z" fill="url(#pt-tile)" />
        </g>
      ))}
      {STREET.map((b) => <Building key={b.x} x={b.x} y={streetBase - b.h} w={b.w} h={b.h} style={b.style} wall={b.wall} roof={b.roof} sign={b.sign} />)}
      {/* 창 불빛 번짐 */}
      {STREET.map((b) => <ellipse key={`g${b.x}`} cx={b.x + b.w / 2} cy={streetBase - b.h * 0.45} rx={b.w * 0.6} ry={b.h * 0.35} fill="#F3D896" opacity=".1" />)}
    </g>
  );

  return (
    <svg viewBox="0 0 1200 1300" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 w-full h-full" role="img"
      aria-label="금강의 달밤: 겹겹의 산과 소나무, 불 켜진 강경 근대거리가 강물에 비치고 둑길에 고양이 가족이 있는 동양화">
      <defs>
        <linearGradient id="hp-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#16262A" /><stop offset=".25" stopColor="#25393C" /><stop offset=".45" stopColor="#4A5E57" />
          <stop offset=".6" stopColor="#9E956E" /><stop offset=".7" stopColor="#D2B97E" /><stop offset="1" stopColor="#D2B97E" />
        </linearGradient>
        <radialGradient id="hp-moon-halo"><stop offset="0" stopColor="#F6E6B4" stopOpacity=".75" /><stop offset=".35" stopColor="#EED59A" stopOpacity=".28" /><stop offset="1" stopColor="#EED59A" stopOpacity="0" /></radialGradient>
        <radialGradient id="hp-moon" cx="40%" cy="38%"><stop offset="0" stopColor="#FFF6D8" /><stop offset=".7" stopColor="#F1DDA3" /><stop offset="1" stopColor="#D9B86C" /></radialGradient>
        <linearGradient id="hp-mist-fade" x1="0" y1="0" x2="0" y2="1"><stop offset=".45" stopColor="#E8D8B8" stopOpacity="0" /><stop offset="1" stopColor="#E8D8B8" stopOpacity=".85" /></linearGradient>
        <linearGradient id="hp-river" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#2E4A4B" /><stop offset=".5" stopColor="#1F3536" /><stop offset="1" stopColor="#152526" /></linearGradient>
        <radialGradient id="hp-vignette" cx="50%" cy="48%" r="72%"><stop offset=".55" stopColor="#000" stopOpacity="0" /><stop offset="1" stopColor="#120E0B" stopOpacity=".55" /></radialGradient>
        <filter id="hp-ripple" x="-5%" y="-5%" width="110%" height="110%">
          <feTurbulence type="fractalNoise" baseFrequency=".004 .09" numOctaves="2" seed="4" result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="16" xChannelSelector="R" yChannelSelector="G" result="d" />
          <feGaussianBlur in="d" stdDeviation="1.4" />
        </filter>
      </defs>

      {/* 하늘 */}
      <rect width="1200" height="1300" fill="url(#hp-sky)" />
      <rect width="1200" height="1300" fill="url(#pt-hatch)" opacity=".18" />
      {[[120, 120], [300, 210], [430, 90], [980, 140], [1080, 260], [860, 60], [220, 330], [1140, 380]].map(([sx, sy], i) => <circle key={i} cx={sx} cy={sy} r="1.8" fill="#F1DDA3" className="anim-glow" style={{ animationDelay: `${i * 0.5}s` }} />)}

      {/* 달 + 달무리 + 새 떼 */}
      <circle cx="760" cy="380" r="300" fill="url(#hp-moon-halo)" className="anim-glow" style={{ animationDuration: "9s" }} />
      <circle cx="760" cy="380" r="104" fill="url(#hp-moon)" />
      <path d="M716 352 q16 -8 26 6 M772 420 q18 -6 30 8 M786 330 q8 6 16 0" fill="none" stroke="#D9B86C" strokeWidth="4" strokeLinecap="round" opacity=".7" />
      <g fill="none" stroke={K} strokeWidth="2" strokeLinecap="round" opacity=".75">
        {[[600, 300], [628, 284], [650, 310], [676, 292], [700, 318], [560, 330], [720, 280]].map(([bx, by], i) => <path key={i} d={`M${bx - 7} ${by} q7 -6 7 0 q0 -6 7 0`} />)}
      </g>

      {/* 민화 구름 */}
      <g opacity=".9">
        {[[860, 470, 1.4], [520, 250, 1], [960, 220, .9]].map(([cx, cy, s], i) => (
          <g key={i} transform={`translate(${cx} ${cy}) scale(${s})`}>
            <path d="M0 30 Q-4 12 16 12 Q20 -4 42 2 Q58 -10 74 6 Q96 2 98 22 Q112 26 106 38 Q90 46 70 40 Q52 50 34 42 Q12 48 0 30Z" fill="#EEDFC0" stroke={K} strokeWidth="1.4" opacity=".92" />
            <path d="M22 28 q8 -10 18 -2 q10 -10 20 0 q8 -8 18 2" fill="none" stroke={K} strokeWidth="1.1" />
          </g>
        ))}
      </g>

      {/* 겹겹의 산 (수묵) */}
      <Ridge d="M0 620 L60 560 L120 590 L210 470 L280 540 L340 500 L420 560 L520 430 L600 520 L660 480 L760 560 L860 450 L940 520 L1010 470 L1100 540 L1200 480 V760 H0Z" fill="#8E9A90" opacity={0.75}
        strokes={[[210, 480], [520, 440], [860, 460], [1010, 480]]} />
      <g className="anim-fog" opacity=".7"><ellipse cx="400" cy="640" rx="520" ry="34" fill="#E8D8B8" filter="url(#soft-fog)" /><ellipse cx="1000" cy="620" rx="420" ry="30" fill="#E8D8B8" filter="url(#soft-fog)" /></g>
      <Ridge d="M0 700 L80 620 L150 660 L250 560 L330 640 L440 590 L520 660 L600 610 L700 680 L800 600 L900 670 L980 630 L1080 690 L1200 620 V820 H0Z" fill="#5E7672" opacity={0.9}
        strokes={[[250, 570], [440, 600], [800, 610], [1200, 640]]} />
      <g className="anim-fog2" opacity=".65"><ellipse cx="600" cy="720" rx="700" ry="40" fill="#E8D8B8" filter="url(#soft-fog)" /></g>

      {/* 강경 근대거리 */}
      {street}
      {/* 돌 둑길 */}
      <path d="M0 900 H1200 V944 H0Z" fill="#7E6A55" stroke={K} strokeWidth="2" />
      <rect x="0" y="900" width="1200" height="44" fill="url(#pt-brick)" opacity=".5" />
      {[180, 470, 760, 1050].map((lx) => (
        <g key={lx}>
          <path d={`M${lx} 900 V836`} stroke={K} strokeWidth="3" />
          <circle cx={lx} cy={832} r="26" fill="#F3D896" opacity=".22" className="anim-glow" />
          <path d={`M${lx - 9} 822 Q${lx - 12} 834 ${lx - 9} 846 H${lx + 9} Q${lx + 12} 834 ${lx + 9} 822Z`} fill="#B2453B" stroke={K} strokeWidth="1.4" />
          <path d={`M${lx - 11} 834 H${lx + 11}`} stroke="#263D40" strokeWidth="3" />
        </g>
      ))}

      {/* 금강: 물에 비친 마을 */}
      <rect x="0" y="944" width="1200" height="356" fill="url(#hp-river)" />
      <g transform={`translate(0 ${944 * 2}) scale(1 -1)`} opacity=".42" filter="url(#hp-ripple)">{street}</g>
      <rect x="0" y="944" width="1200" height="356" fill="url(#pt-wave)" opacity=".8" />
      {/* 달빛 기둥 */}
      {Array.from({ length: 10 }).map((_, i) => <path key={i} d={`M${716 - i * 4} ${966 + i * 26} h${88 + i * 8}`} stroke="#F1DDA3" strokeWidth={4 - i * 0.3} strokeLinecap="round" opacity={0.7 - i * 0.05} className="anim-glow" style={{ animationDelay: `${i * 0.3}s` }} />)}
      {[[200, 980], [480, 1010], [1000, 990]].map(([gx, gy], i) => <path key={i} d={`M${gx} ${gy} h40 M${gx + 10} ${gy + 14} h30`} stroke="#E9B95E" strokeWidth="2.4" strokeLinecap="round" opacity=".55" />)}
      <Boat x={380} y={1060} s={1} />
      <Boat x={900} y={1130} s={0.7} />

      {/* 고양이 가족 */}
      <g className="anim-idle"><CharacterSvg id="kangi" box={{ x: 570, y: 652, width: 66, height: 72 }} /></g>
      <CharacterSvg id="kaengi" mood="wave" box={{ x: 520, y: 820, width: 92, height: 100 }} />
      <g className="anim-jump" style={{ animationDuration: "2.6s" }}><CharacterSvg id="kongi" mood="happy" box={{ x: 610, y: 844, width: 70, height: 76 }} /></g>

      {/* 앞쪽 바위와 소나무 (액자처럼) */}
      <path d="M0 1300 V1120 Q60 1080 120 1110 Q170 1060 230 1100 Q260 1150 240 1300Z" fill="#2A2522" />
      <path d="M40 1150 q30 -20 60 -6 M140 1110 q20 -14 40 0" stroke="#5C534C" strokeWidth="3" fill="none" />
      <path d="M1200 1300 V1160 Q1150 1120 1090 1150 Q1040 1120 1000 1170 Q980 1220 1000 1300Z" fill="#2A2522" />
      <Pine x={120} y={1180} s={1.25} />
      <Pine x={1110} y={1220} s={0.95} flip />
      {/* 앞 안개 */}
      <g className="anim-fog" opacity=".55"><ellipse cx="600" cy="1250" rx="760" ry="60" fill="#E8D8B8" filter="url(#soft-fog)" /></g>
      {/* 종이 질감과 가장자리 어둠 */}
      <rect width="1200" height="1300" fill="url(#pt-grain)" opacity=".3" />
      <rect width="1200" height="1300" fill="url(#hp-vignette)" />
    </svg>
  );
}
