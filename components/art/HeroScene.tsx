"use client";
// 메인 화면의 큰 그림: 「달빛 강경」
// 목판 판화의 단계적 바림(보카시)과 먹선, 민화의 구름·매화 장식을 결합한 창작 삽화입니다.
// 근대 건축이 늘어선 강경 거리와 금강 포구, 돛단배, 달무리, 안개, 고양이 가족(강이·갱이·콩이)을 담았습니다.
import { Building } from "../Building";
import { CharacterSvg } from "../Characters";

const K = "#39332F";

/** 민화풍 구름(운문) */
function Cloud({ x, y, s = 1, o = 1 }: { x: number; y: number; s?: number; o?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} opacity={o}>
      <path d="M0 30 Q-4 12 16 12 Q20 -4 42 2 Q58 -10 74 6 Q96 2 98 22 Q112 26 106 38 Q90 46 70 40 Q52 50 34 42 Q12 48 0 30Z" fill="#E8D8B8" stroke={K} strokeWidth={1.6} />
      <path d="M22 28 q8 -10 18 -2 q10 -10 20 0 q8 -8 18 2" fill="none" stroke={K} strokeWidth={1.2} />
      <path d="M40 18 q6 -6 12 0" fill="none" stroke={K} strokeWidth={1} />
    </g>
  );
}

/** 매화 가지 (살랑임) */
function PlumBranch() {
  const flowers = [[150, 70], [210, 108], [260, 92], [96, 128], [300, 140], [180, 160], [340, 110], [60, 64]];
  return (
    <g className="anim-sway" style={{ transformOrigin: "0px 0px" }}>
      <path d="M-10 40 Q80 60 150 70 Q230 84 300 140 M150 70 Q190 100 210 108 M210 108 Q250 95 260 92 M110 64 Q100 100 96 128 M230 90 Q300 96 340 110 M150 70 Q170 140 180 160"
        fill="none" stroke="#2A2522" strokeWidth={7} strokeLinecap="round" />
      <path d="M-10 40 Q80 60 150 70 Q230 84 300 140" fill="none" stroke="#5C534C" strokeWidth={2} strokeLinecap="round" opacity={0.6} />
      {flowers.map(([fx, fy], i) => (
        <g key={i} transform={`translate(${fx} ${fy}) rotate(${i * 23})`}>
          {[0, 72, 144, 216, 288].map((r) => <ellipse key={r} cx={0} cy={-7} rx={5.2} ry={6.5} fill={i % 3 ? "#F2E2DA" : "#E7B9AE"} stroke="#963F38" strokeWidth={0.8} transform={`rotate(${r})`} />)}
          <circle r={2.6} fill="#B58B48" />
        </g>
      ))}
    </g>
  );
}

function Lantern({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <path d="M0 -70 V-34" stroke={K} strokeWidth={2.4} />
      <circle cx={0} cy={-20} r={26} fill="#F3D896" opacity={0.22} className="anim-glow" />
      <rect x={-9} y={-36} width={18} height={4} fill="#263D40" stroke={K} strokeWidth={1} />
      <path d="M-9 -32 Q-12 -20 -9 -8 H9 Q12 -20 9 -32Z" fill="#963F38" stroke={K} strokeWidth={1.4} />
      <path d="M-11 -20 H11" stroke="#263D40" strokeWidth={4} />
      <rect x={-9} y={-8} width={18} height={4} fill="#263D40" stroke={K} strokeWidth={1} />
      <path d="M0 -70 V70" stroke={K} strokeWidth={3} />
    </g>
  );
}

export default function HeroScene() {
  return (
    <svg viewBox="0 0 1200 760" className="w-full h-auto block" role="img" aria-label="달빛 아래 강경 근대 거리와 금강 포구, 돛단배와 고양이 가족이 있는 목판화풍 그림">
      <defs>
        <linearGradient id="hs-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1A2B2D" />
          <stop offset=".35" stopColor="#263D40" />
          <stop offset=".62" stopColor="#4A5E5C" />
          <stop offset=".8" stopColor="#8E8A79" />
          <stop offset="1" stopColor="#C9B994" />
        </linearGradient>
        <radialGradient id="hs-halo">
          <stop offset="0" stopColor="#EFE2C2" stopOpacity=".55" />
          <stop offset=".5" stopColor="#EFE2C2" stopOpacity=".15" />
          <stop offset="1" stopColor="#EFE2C2" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="hs-river" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3B5659" />
          <stop offset="1" stopColor="#263D40" />
        </linearGradient>
        <linearGradient id="hs-street" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#C4AC80" />
          <stop offset="1" stopColor="#A8916A" />
        </linearGradient>
        <clipPath id="hs-clip"><rect width="1200" height="760" /></clipPath>
      </defs>
      <g clipPath="url(#hs-clip)">
        {/* 하늘: 판화식 바림 */}
        <rect width="1200" height="760" fill="url(#hs-sky)" />
        <rect width="1200" height="760" fill="url(#pt-hatch)" opacity=".25" />
        {/* 별빛 */}
        {[[80, 60], [230, 120], [420, 40], [520, 150], [700, 70], [1080, 140], [1150, 50], [960, 30]].map(([sx, sy], i) => (
          <circle key={i} cx={sx} cy={sy} r={1.6} fill="#E6CB8E" className="anim-glow" style={{ animationDelay: `${i * 0.6}s` }} />
        ))}
        {/* 달과 달무리 */}
        <circle cx="800" cy="190" r="210" fill="url(#hs-halo)" className="anim-glow" />
        <circle cx="800" cy="190" r="92" fill="#EFE2C2" stroke="#B58B48" strokeWidth="2" />
        <circle cx="800" cy="190" r="104" fill="none" stroke="#E6CB8E" strokeWidth="1" opacity=".5" />
        <path d="M762 170 q14 -8 22 6 M810 225 q16 -6 26 8 M820 148 q8 6 14 0" fill="none" stroke="#D6C29C" strokeWidth="3" strokeLinecap="round" />
        <Cloud x={680} y={230} s={1.5} o={0.95} />
        <Cloud x={560} y={90} s={1.1} o={0.85} />
        <Cloud x={960} y={290} s={1} o={0.7} />

        {/* 먼 산: 수묵 능선 */}
        <path d="M0 400 Q90 300 180 350 Q260 260 360 330 Q450 280 540 340 Q640 270 740 330 Q860 280 960 340 Q1080 290 1200 330 V480 H0Z" fill="#65516F" opacity=".55" filter="url(#wash)" />
        <path d="M0 430 Q120 360 230 400 Q340 330 460 395 Q580 350 700 400 Q820 360 930 405 Q1060 360 1200 400 V500 H0Z" fill="#3B5659" opacity=".8" />
        {/* 안개 띠 */}
        <g className="anim-fog" opacity=".75"><ellipse cx="360" cy="430" rx="420" ry="26" fill="#E8D8B8" filter="url(#soft-fog)" /><ellipse cx="980" cy="440" rx="380" ry="22" fill="#E8D8B8" filter="url(#soft-fog)" /></g>

        {/* 금강 */}
        <path d="M0 470 Q300 455 600 468 T1200 462 V600 H0Z" fill="url(#hs-river)" stroke={K} strokeWidth="2" />
        <rect x="0" y="465" width="1200" height="140" fill="url(#pt-wave)" />
        {/* 달빛 물그림자 */}
        {[0, 1, 2, 3, 4, 5].map((i) => <path key={i} d={`M${750 - i * 8} ${480 + i * 16} h${100 + i * 16}`} stroke="#E6CB8E" strokeWidth={3 - i * 0.3} strokeLinecap="round" opacity={0.7 - i * 0.08} className="anim-glow" style={{ animationDelay: `${i * 0.4}s` }} />)}
        {/* 돛단배 */}
        <g transform="translate(260 455)"><g className="anim-idle">
          <path d="M0 40 Q60 58 130 40 L118 54 Q60 64 12 54Z" fill="#3B2C24" stroke={K} strokeWidth="2" />
          <path d="M62 40 V-40" stroke={K} strokeWidth="3" />
          <path d="M64 -38 Q104 -6 100 34 L64 34Z" fill="#E8D8B8" stroke={K} strokeWidth="2" />
          <path d="M66 -20 h26 M66 -4 h32 M66 12 h34" stroke={K} strokeWidth="1.2" opacity=".6" />
          <path d="M20 66 q50 8 100 0" fill="none" stroke="#E6CB8E" strokeWidth="2" opacity=".5" />
        </g></g>
        <g transform="translate(560 478) scale(.5)" opacity=".7">
          <path d="M0 40 Q60 58 130 40 L118 54 Q60 64 12 54Z" fill="#26211E" />
          <path d="M62 40 V-30" stroke={K} strokeWidth="3" /><path d="M64 -28 Q98 0 96 34 L64 34Z" fill="#D6C29C" />
        </g>

        {/* 강둑 */}
        <path d="M0 596 Q300 585 600 592 T1200 588 V620 H0Z" fill="#748A70" stroke={K} strokeWidth="2" />

        {/* 근대 거리 */}
        <g>
          <Building x={30} y={432} w={150} h={170} style="brick" sign="음악도서관" />
          <Building x={190} y={470} w={130} h={132} style="shop" />
          <Building x={335} y={400} w={130} h={202} style="tower" />
          <Building x={478} y={466} w={150} h={136} style="hanok" />
          <Building x={642} y={440} w={140} h={162} style="western" sign="모던상회" />
          <Building x={796} y={474} w={130} h={128} style="station" />
          <Building x={940} y={446} w={140} h={156} style="brick" wall="#7A4337" />
          <Building x={1092} y={380} w={110} h={222} style="lighthouse" />
        </g>
        {/* 거리 */}
        <path d="M0 602 H1200 V760 H0Z" fill="url(#hs-street)" stroke={K} strokeWidth="2" />
        <rect x="0" y="602" width="1200" height="158" fill="url(#pt-grain)" />
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((i) => <path key={i} d={`M${i * 104 + 20} 690 h60`} stroke="#8A7550" strokeWidth="3" strokeLinecap="round" opacity=".6" />)}
        <Lantern x={186} y={630} />
        <Lantern x={636} y={630} />
        <Lantern x={1086} y={630} />

        {/* 고양이 가족 */}
        <g className="anim-idle"><CharacterSvg id="kangi" box={{ x: 362, y: 352, width: 70, height: 77 }} /></g>
        <g><CharacterSvg id="kaengi" mood="wave" box={{ x: 700, y: 610, width: 104, height: 114 }} /></g>
        <g className="anim-jump" style={{ animationDuration: "2.4s" }}><CharacterSvg id="kongi" mood="happy" box={{ x: 798, y: 640, width: 76, height: 84 }} /></g>

        {/* 앞쪽 안개 */}
        <g className="anim-fog2" opacity=".55"><ellipse cx="600" cy="752" rx="700" ry="40" fill="#E8D8B8" filter="url(#soft-fog)" /></g>
        {/* 매화 가지 */}
        <g transform="translate(1200 0) scale(-1 1)"><PlumBranch /></g>
        {/* 판화 테두리 */}
        <rect x="6" y="6" width="1188" height="748" fill="none" stroke={K} strokeWidth="4" />
        <rect x="16" y="16" width="1168" height="728" fill="none" stroke="#B58B48" strokeWidth="1.5" />
      </g>
    </svg>
  );
}
