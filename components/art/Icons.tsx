// 강경 타임워커 삽화형 아이콘 (목판 채색 + 먹선, 32×32)
// 서양식 라인 아이콘·이모지를 대신합니다. 새 아이콘은 ICONS 에 추가하면 됩니다.
import React from "react";

const K = "#39332F"; // 먹
const V = "#963F38", T = "#263D40", G = "#B58B48", H = "#F2E7D0", HD = "#D6C29C", J = "#748A70", P = "#65516F";
const s = { stroke: K, strokeWidth: 1.6, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };

export const ICONS: Record<string, React.ReactNode> = {
  // 한옥 지붕 (홈)
  home: <g {...s}><path d="M3 14 Q16 4 29 14 Q24 12.5 16 9 Q8 12.5 3 14Z" fill={T} /><path d="M7 14h18v13H7z" fill={H} /><path d="M13 27v-7h6v7" fill={V} /><path d="M9 17h3v3H9zM20 17h3v3h-3z" fill={HD} /><path d="M2 14.5 Q4 16 6 14.5M26 14.5Q28 16 30 14.5" fill="none" /></g>,
  // 두루마리 지도 (탐험)
  map: <g {...s}><path d="M6 6h20v20H6z" fill={H} /><path d="M6 6 Q3 6 3 9v14q0 3 3 3M26 6q3 0 3 3v14q0 3-3 3" fill={HD} /><path d="M9 21 Q13 12 17 16 T24 10" fill="none" stroke={V} strokeDasharray="2 2" /><path d="M9 11 l3 -3 l3 3z" fill={J} /><circle cx="23" cy="20" r="2.2" fill={V} /></g>,
  // 인장 찍힌 두루마리 (퀘스트)
  scroll: <g {...s}><rect x="7" y="5" width="18" height="22" fill={H} /><rect x="4" y="3" width="24" height="4" rx="2" fill={G} /><rect x="4" y="25" width="24" height="4" rx="2" fill={G} /><path d="M11 11h10M11 15h10M11 19h6" stroke={K} strokeWidth="1.2" /><rect x="18" y="17" width="5" height="5" fill={V} stroke="none" /></g>,
  // 선장본 고서 (도감)
  book: <g {...s}><path d="M6 4h20v24H6z" fill={T} /><path d="M10 4v24" stroke={H} strokeWidth="1.2" /><path d="M6 8h3M6 13h3M6 18h3M6 23h3" stroke={G} strokeWidth="1.4" /><rect x="14" y="8" width="8" height="12" fill={H} /><path d="M18 10v8" stroke={K} strokeWidth="1.2" /></g>,
  // 복주머니 (내 공간)
  pouch: <g {...s}><path d="M10 11 Q4 26 16 28 Q28 26 22 11Z" fill={V} /><path d="M10 11 Q16 7 22 11" fill={G} /><path d="M12 8 Q16 4 20 8" fill="none" stroke={G} strokeWidth="2" /><circle cx="16" cy="19" r="3.4" fill={G} /><path d="M16 17v4M14 19h4" stroke={K} strokeWidth="1" /></g>,
  // 옹기 항아리
  jar: <g {...s}><path d="M10 8 Q4 13 5.5 21 Q7 28 16 28 Q25 28 26.5 21 Q28 13 22 8Z" fill="#6B4A36" /><ellipse cx="16" cy="8" rx="7" ry="2.2" fill="#4A3426" /><path d="M7 17 Q16 21 25 17" fill="none" stroke={G} strokeWidth="1.3" /><path d="M9 21 Q16 24 23 21" fill="none" stroke={HD} strokeWidth="1" strokeDasharray="1.5 2" /></g>,
  shrimp: <g {...s}><path d="M24 9 Q28 18 20 24 Q13 28 7 23 Q12 23 15 20 Q11 19 12 15 Q16 17 18 13 Q15 11 17 8Z" fill="#D9866F" /><path d="M24 9 l5-4M23 8 l2-5" fill="none" /><circle cx="22" cy="11" r="1" fill={K} /><path d="M7 23 l-3 2 l3 1" fill="#D9866F" /></g>,
  anchovy: <g {...s}><path d="M4 16 Q14 8 25 15 L29 11 L28 16 L29 21 L25 17 Q14 24 4 16Z" fill="#8FA3A6" /><path d="M8 16 Q15 13 23 16" fill="none" stroke={T} strokeWidth="1" /><circle cx="8" cy="15" r="1" fill={K} /></g>,
  fish: <g {...s}><path d="M3 16 Q13 6 24 14 L29 9 L28 16 L29 23 L24 18 Q13 26 3 16Z" fill="#D9B05A" /><path d="M12 12 v8M16 11v10" stroke={K} strokeWidth="1" /><circle cx="7" cy="15" r="1.1" fill={K} /></g>,
  salt: <g {...s}><path d="M5 20h22l-3 7H8z" fill={T} /><path d="M7 20 Q10 11 16 9 Q22 11 25 20Z" fill={H} /><path d="M12 16h1M17 13h1M19 17h1M14 19h1" stroke={HD} strokeWidth="1.6" /></g>,
  // 정성 한 스푼: 연꽃 봉오리 빛
  sincerity: <g {...s}><path d="M16 6 Q22 13 16 24 Q10 13 16 6Z" fill="#D9A79B" /><path d="M16 24 Q8 22 6 14 Q12 15 16 24Z M16 24 Q24 22 26 14 Q20 15 16 24Z" fill={H} /><path d="M10 27 h12" stroke={J} strokeWidth="2" /></g>,
  // 엽전 (코인)
  coin: <g {...s}><circle cx="16" cy="16" r="12" fill={G} /><circle cx="16" cy="16" r="9" fill="none" stroke="#8A6731" strokeWidth="1" /><rect x="13" y="13" width="6" height="6" fill={H} /></g>,
  moon: <g {...s}><circle cx="16" cy="16" r="11" fill="#EFE2C2" /><path d="M10 13 q2 -1 3 1M18 20 q2 -1 4 1M19 10 q1 1 2 0" fill="none" stroke={HD} strokeWidth="1.2" /></g>,
  cloud: <g {...s}><path d="M5 20 Q4 14 10 14 Q11 8 17 9 Q23 7 25 13 Q30 14 28 20 Q25 23 20 21 Q16 24 12 21 Q7 23 5 20Z" fill={H} /><path d="M10 18 q3-3 6 0 q3-3 6 0" fill="none" stroke={K} strokeWidth="1.1" /></g>,
  letter: <g {...s}><rect x="4" y="8" width="24" height="17" fill={H} /><path d="M4 8 l12 9 l12-9" fill="none" /><circle cx="16" cy="17" r="3" fill={V} stroke="none" /></g>,
  stamp: <g {...s}><rect x="6" y="6" width="20" height="20" rx="2" fill={V} /><rect x="9" y="9" width="14" height="14" fill="none" stroke={H} strokeWidth="1.3" /><path d="M12 13h8M16 13v7M12 20h8" stroke={H} strokeWidth="1.4" /></g>,
  camera: <g {...s}><rect x="5" y="10" width="22" height="15" fill={T} /><rect x="9" y="7" width="7" height="4" fill={G} /><circle cx="17" cy="18" r="4.5" fill={H} /><circle cx="17" cy="18" r="2" fill={K} /></g>,
  // 풍경(처마 끝 종) — 소리
  bell: <g {...s}><path d="M16 3v4" /><path d="M10 9 Q16 5 22 9 L23 19 H9Z" fill={G} /><path d="M9 19h14" /><path d="M16 19v5" /><path d="M13 24 h6 l-3 5z" fill={J} /></g>,
  bellmute: <g {...s}><path d="M10 9 Q16 5 22 9 L23 19 H9Z" fill={HD} /><path d="M5 5 L27 27" stroke={V} strokeWidth="2.2" /></g>,
  lantern: <g {...s}><path d="M16 2v4" /><rect x="10" y="6" width="12" height="3" fill={T} /><path d="M10 9 Q8 16 10 22 H22 Q24 16 22 9Z" fill={V} /><path d="M10 15h12" stroke={T} strokeWidth="3" /><rect x="10" y="22" width="12" height="3" fill={T} /><path d="M16 25v5" stroke={V} /></g>,
  plum: <g {...s}>{[0, 72, 144, 216, 288].map((r) => <ellipse key={r} cx="16" cy="9.5" rx="4.6" ry="5.6" fill="#F0D6CC" transform={`rotate(${r} 16 16)`} />)}<circle cx="16" cy="16" r="2.6" fill={G} /></g>,
  paw: <g fill={K}><ellipse cx="16" cy="21" rx="6" ry="5" /><ellipse cx="9" cy="13" rx="2.4" ry="3.2" /><ellipse cx="14" cy="9.5" rx="2.4" ry="3.2" /><ellipse cx="19.5" cy="9.5" rx="2.4" ry="3.2" /><ellipse cx="24" cy="13" rx="2.4" ry="3.2" /></g>,
  compass: <g {...s}><circle cx="16" cy="16" r="12" fill={HD} /><circle cx="16" cy="16" r="8" fill={H} /><path d="M16 8 l2.5 8 L16 24 l-2.5-8z" fill={V} /><path d="M16 8 l2.5 8 h-5z" fill={T} /></g>,
  // 갓 (옷장)
  gat: <g {...s}><ellipse cx="16" cy="21" rx="13" ry="3.6" fill={K} /><path d="M11 20 V12 Q16 9 21 12 V20" fill={K} /><path d="M11 20 q5 2 10 0" fill="none" stroke={G} /><path d="M12 22 Q14 28 13 30M20 22 Q18 28 19 30" fill="none" stroke={G} strokeWidth="1.2" /></g>,
  // 보자기 꾸러미 (선물)
  gift: <g {...s}><path d="M6 14 Q5 26 16 27 Q27 26 26 14Z" fill={P} /><path d="M6 14 Q16 18 26 14" fill="none" /><path d="M16 14 Q11 6 9 9 Q8 12 16 14 Q21 6 23 9 Q24 12 16 14Z" fill={G} /></g>,
  pin: <g {...s}><path d="M16 29 Q7 18 7 12 a9 9 0 0 1 18 0 Q25 18 16 29Z" fill={V} /><rect x="12.5" y="8.5" width="7" height="7" fill="none" stroke={H} strokeWidth="1.4" /></g>,
  qr: <g {...s}><rect x="5" y="5" width="22" height="22" fill={H} /><rect x="8" y="8" width="6" height="6" fill={K} /><rect x="18" y="8" width="6" height="6" fill={K} /><rect x="8" y="18" width="6" height="6" fill={K} /><path d="M18 18h3v3h3v3h-6z" fill={V} stroke="none" /></g>,
  village: <g {...s}><path d="M2 16 Q8 10 14 16Z" fill={T} /><rect x="4" y="16" width="8" height="10" fill={H} /><path d="M13 14 Q21 6 30 14Z" fill={V} /><rect x="15" y="14" width="13" height="12" fill={H} /><rect x="19" y="19" width="4" height="7" fill={T} /></g>,
  album: <g {...s}><rect x="5" y="4" width="22" height="24" fill={J} /><rect x="9" y="8" width="14" height="10" fill={H} transform="rotate(-4 16 13)" /><path d="M10 22h12M10 25h8" stroke={H} strokeWidth="1.3" /></g>,
  postcard: <g {...s}><rect x="3" y="7" width="26" height="18" fill={H} /><rect x="21" y="10" width="5" height="6" fill={V} /><path d="M6 12h10M6 16h10M6 20h7" stroke={K} strokeWidth="1.1" /></g>,
  check: <g {...s}><rect x="5" y="5" width="22" height="22" rx="3" fill={V} /><path d="M10 16 l4 4 l8 -9" fill="none" stroke={H} strokeWidth="2.6" /></g>,
  warn: <g {...s}><path d="M16 4 L29 27 H3Z" fill={G} /><path d="M16 12v8" strokeWidth="2.4" /><circle cx="16" cy="23.5" r="1.3" fill={K} /></g>,
  star: <g {...s}><path d="M16 3 l3.6 8 8.4.8-6.4 5.6 2 8.4L16 21.4 8.4 25.8l2-8.4L4 11.8l8.4-.8z" fill={G} /></g>,
  hourglass: <g {...s}><path d="M8 4h16M8 28h16" strokeWidth="2.2" /><path d="M10 4 Q10 12 16 16 Q22 12 22 4Z M10 28 Q10 20 16 16 Q22 20 22 28Z" fill={H} /><path d="M12 26 Q16 21 20 26Z" fill={G} stroke="none" /></g>,
  brush: <g {...s}><path d="M22 3 L28 9 L14 23 L9 18Z" fill={T} /><path d="M9 18 L14 23 Q10 29 4 28 Q4 22 9 18Z" fill={K} /></g>,
  key: <g {...s}><circle cx="11" cy="16" r="6" fill={G} /><circle cx="11" cy="16" r="2.2" fill={H} /><path d="M17 16h11v4M24 16v3" fill="none" strokeWidth="2" /></g>,
  person: <g {...s}><circle cx="16" cy="11" r="5.5" fill="#EBC9A8" /><path d="M6 28 Q6 18 16 18 Q26 18 26 28Z" fill={T} /><ellipse cx="16" cy="6.5" rx="9" ry="2" fill={K} /><path d="M12 6.5 V3.5 Q16 2 20 3.5 V6.5" fill={K} /></g>,
  route: <g {...s}><path d="M6 26 Q8 16 16 18 T26 6" fill="none" stroke={V} strokeDasharray="3 3" strokeWidth="2" /><circle cx="6" cy="26" r="2.5" fill={T} /><circle cx="26" cy="6" r="2.5" fill={V} /></g>,
  // ── 소풍 아이템 ──
  riceball: <g {...s}><path d="M16 5 Q27 18 26 24 Q24 28 16 28 Q8 28 6 24 Q5 18 16 5Z" fill="#FBF8EE" /><rect x="10" y="19" width="12" height="9" rx="1" fill="#2F3B2F" /><circle cx="13" cy="14" r=".8" fill={K} /><circle cx="19" cy="14" r=".8" fill={K} /></g>,
  injeolmi: <g {...s}>{[[9, 13], [19, 11], [13, 21], [23, 20]].map(([x, y], i) => <rect key={i} x={x - 4} y={y - 4} width="9" height="8" rx="2" fill="#E3C27A" />)}<path d="M5 26 q11 4 22 0" stroke="#B58B48" fill="none" /></g>,
  sikhye: <g {...s}><path d="M7 10 h18 l-2 16 q-7 3 -14 0z" fill="#F2E7D0" /><ellipse cx="16" cy="10" rx="9" ry="2.6" fill="#EADBB4" />{[[12, 16], [17, 19], [20, 14], [14, 22]].map(([x, y], i) => <ellipse key={i} cx={x} cy={y} rx="1.4" ry=".9" fill="#D9C08A" stroke="none" />)}</g>,
  cider: <g {...s}><path d="M13 3 h6 v6 q4 3 4 8 v10 q0 3 -3 3 h-8 q-3 0 -3 -3 v-10 q0 -5 4 -8z" fill="#A9CFC4" /><rect x="10" y="16" width="12" height="7" fill="#F2E7D0" /><path d="M12 19.5 h8" stroke={V} strokeWidth="1.2" /><rect x="13" y="2" width="6" height="2.5" fill={G} /></g>,
  strawberry: <g {...s}><path d="M16 29 Q5 24 6 14 Q8 9 16 10 Q24 9 26 14 Q27 24 16 29Z" fill="#D9473F" /><path d="M10 9 l3 3 l3 -4 l3 4 l3 -3 l-1 4 h-10z" fill="#6F9B63" />{[[11, 16], [17, 15], [21, 19], [13, 22], [18, 24]].map(([x, y], i) => <ellipse key={i} cx={x} cy={y} rx=".8" ry="1.2" fill="#F3D896" stroke="none" />)}</g>,
  jujube: <g {...s}><ellipse cx="13" cy="19" rx="7" ry="9" fill="#8E2A35" /><ellipse cx="21" cy="17" rx="6" ry="8" fill="#A9343F" /><path d="M21 9 q1 -4 4 -5 M13 10 q0 -4 -2 -6" stroke="#6F9B4E" strokeWidth="1.8" fill="none" /><path d="M18 13 q2 -2 4 0" stroke="#F2E7D0" strokeWidth="1.2" fill="none" opacity=".6" /></g>,
  redbean: <g {...s}><ellipse cx="16" cy="18" rx="12" ry="9" fill="#C98A48" /><ellipse cx="16" cy="15" rx="9" ry="5" fill="#DDA663" /><circle cx="16" cy="14" r="2" fill="#F2E7D0" stroke="none" />{[-3, 0, 3].map((d) => <circle key={d} cx={16 + d} cy={11} r=".7" fill="#3A2420" stroke="none" />)}</g>,
  yakgwa: <g {...s}>{[0, 60, 120, 180, 240, 300].map((r) => <circle key={r} cx="16" cy="9.5" r="5" fill="#B9773A" transform={`rotate(${r} 16 16)`} />)}<circle cx="16" cy="16" r="5" fill="#9C5E2A" /><circle cx="16" cy="16" r="2" fill="#E9B95E" stroke="none" /></g>,
  mat: <g {...s}><path d="M3 22 L10 10 H29 L22 22Z" fill="#D9C08A" /><path d="M6 17 h19 M8 14 h19 M5 20 h18" stroke="#8A6731" strokeWidth="1" /><path d="M3 22 v3 h19 v-3" fill="#B89A55" /></g>,
  basket: <g {...s}><path d="M9 14 Q16 2 23 14" fill="none" stroke="#8A6731" strokeWidth="2.4" /><path d="M5 14 h22 l-3 13 h-16z" fill="#C9A15E" /><path d="M7 18 h18 M8 22 h16 M11 14 v13 M16 14 v13 M21 14 v13" stroke="#8A6731" strokeWidth="1" /><rect x="5" y="13" width="22" height="3" fill={V} /></g>,
  pinwheel: <g {...s}><path d="M16 16 L16 4 Q22 6 16 16Z" fill={V} /><path d="M16 16 L28 16 Q26 22 16 16Z" fill={G} /><path d="M16 16 L16 28 Q10 26 16 16Z" fill={T} /><path d="M16 16 L4 16 Q6 10 16 16Z" fill={J} /><circle cx="16" cy="16" r="1.6" fill={K} /><path d="M16 17 L20 30" strokeWidth="2" /></g>,
  kite: <g {...s}><rect x="7" y="4" width="18" height="22" fill="#F2E7D0" /><circle cx="16" cy="15" r="4" fill="none" /><path d="M7 4 L25 26 M25 4 L7 26 M16 4 v22 M7 15 h18" stroke={K} strokeWidth=".8" /><path d="M7 4 h18 v3 h-18z" fill={V} /><path d="M16 26 q-4 3 0 6" fill="none" /></g>,
};

/** 이모지 → 삽화 아이콘 (엔진 메시지·토스트용) */
const EMOJI: Record<string, string> = {
  "📍": "pin", "🏺": "jar", "🏅": "star", "🎁": "gift", "📜": "scroll", "💌": "letter", "🏘️": "village", "🐾": "paw",
  "💎": "gift", "🎉": "plum", "ℹ️": "cloud", "⚠️": "warn", "🎬": "scroll", "📡": "compass", "⏳": "hourglass", "✨": "plum",
  "🦐": "shrimp", "🐟": "anchovy", "🐠": "fish", "🧂": "salt", "🙂": "cloud", "👓": "gat", "🧣": "gat", "🎀": "gat",
  "🎩": "gat", "👒": "gat", "🎨": "gat", "🐱": "paw", "🥼": "gat", "🧐": "gat", "🪙": "coin", "📷": "camera",
};

export function Ico({ name, size = 24, className = "", title }: { name: string; size?: number; className?: string; title?: string }) {
  const key = ICONS[name] ? name : EMOJI[name];
  if (!key) return <span className={className} style={{ fontSize: size * 0.8 }} aria-hidden>{name}</span>;
  return (
    <svg viewBox="0 0 32 32" width={size} height={size} className={`inline-block shrink-0 ${className}`} role={title ? "img" : undefined} aria-hidden={title ? undefined : true}>
      {title && <title>{title}</title>}
      {ICONS[key]}
    </svg>
  );
}

/** 게임 아이템 → 아이콘 */
export const ITEM_ICON: Record<string, string> = { shrimp: "shrimp", anchovy: "anchovy", yellowfish: "fish", salt: "salt", sincerity: "sincerity", golden_jar: "jar" };
