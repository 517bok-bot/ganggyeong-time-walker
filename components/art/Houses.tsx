// 수호 신수(守護神獸) — 사신(四神)에서 따온 창작 세계관 (게임 설정). 타임워커의 그림자에 깃들어 지켜 줍니다.
export interface House { id: string; name: string; hanja: string; color: string; light: string; virtue: string; desc: string }

export const HOUSES: House[] = [
  { id: "cheongryong", name: "청룡", hanja: "靑龍", color: "#263D40", light: "#748A70", virtue: "지혜 · 탐구", desc: "동쪽 하늘의 푸른 용. 옛 기록과 지도를 읽어 길을 열어 줘요. 탐험과 옛이야기에 강해요." },
  { id: "jujak", name: "주작", hanja: "朱雀", color: "#963F38", light: "#D9806F", virtue: "열정 · 축제", desc: "남쪽 하늘의 붉은 새. 사람을 모으고 잔치를 밝혀요. 축제와 공동 항아리에 앞장서요." },
  { id: "baekho", name: "백호", hanja: "白虎", color: "#B58B48", light: "#F2E7D0", virtue: "용기 · 모험", desc: "서쪽 하늘의 흰 범. 누구보다 먼저 길을 나서요. 현장 탐험과 숨은 인연 찾기를 즐겨요." },
  { id: "hyeonmu", name: "현무", hanja: "玄武", color: "#65516F", light: "#A08AA9", virtue: "기억 · 끈기", desc: "북쪽 하늘의 검은 거북과 뱀. 오래 기다리고 끝까지 지켜요. 숙성과 편지, 기록을 아껴요." },
];
export const HOUSE = Object.fromEntries(HOUSES.map((h) => [h.id, h])) as Record<string, House>;

/** 레벨별 타임워커 칭호 */
export function rankTitle(level: number) {
  if (level >= 10) return "대(大)타임워커";
  if (level >= 7) return "시간 술사";
  if (level >= 5) return "기억 수집가";
  if (level >= 3) return "시간 길잡이";
  return "견습 나그네";
}

/** 수호 신수 문장: 둥근 패 안의 상징 무늬 */
export function HouseEmblem({ id, size = 40 }: { id: string; size?: number }) {
  const h = HOUSE[id] ?? HOUSES[0];
  const K = "#39332F";
  return (
    <svg viewBox="0 0 64 64" width={size} height={size} role="img" aria-label={`${h.name} 문장`} className="inline-block shrink-0">
      <circle cx="32" cy="32" r="30" fill={h.color} stroke="#B58B48" strokeWidth="3" />
      <circle cx="32" cy="32" r="24" fill="none" stroke="#E6CB8E" strokeWidth="1" opacity=".8" />
      {id === "cheongryong" && (
        <g fill="none" stroke="#E6CB8E" strokeWidth="2.6" strokeLinecap="round">
          <path d="M16 40 Q22 22 32 30 Q42 38 48 22" />
          <path d="M44 20 l6 -2 l-2 6" />
          {[20, 26, 32, 38].map((x, i) => <path key={i} d={`M${x} ${36 - (i % 2) * 4} q2 -3 4 0`} strokeWidth="1.4" />)}
          <path d="M14 48 q6 -4 12 0 q6 -4 12 0" strokeWidth="1.6" />
        </g>
      )}
      {id === "jujak" && (
        <g stroke={K} strokeWidth="1">
          {[-40, -20, 0, 20, 40].map((r) => <path key={r} d="M32 44 Q26 28 32 14 Q38 28 32 44Z" fill={r === 0 ? "#F3D896" : "#E6A06A"} transform={`rotate(${r} 32 44)`} />)}
          <circle cx="32" cy="46" r="4" fill="#F3D896" />
        </g>
      )}
      {id === "baekho" && (
        <g>
          <circle cx="32" cy="32" r="18" fill="#F2E7D0" />
          {[[-8, -10], [0, -12], [8, -10], [-12, 2], [12, 2], [-6, 10], [6, 10]].map(([dx, dy], i) => <path key={i} d={`M${32 + dx - 3} ${32 + dy} q3 -5 6 0`} stroke={K} strokeWidth="2.4" fill="none" strokeLinecap="round" />)}
        </g>
      )}
      {id === "hyeonmu" && (
        <g fill="none" stroke="#E6CB8E" strokeWidth="1.8">
          <path d="M32 18 l10 6 v12 l-10 6 l-10 -6 v-12z" />
          <path d="M32 24 l5 3 v6 l-5 3 l-5 -3 v-6z" />
          <path d="M14 44 Q24 52 32 46 Q40 40 50 48" strokeWidth="2.4" strokeLinecap="round" />
        </g>
      )}
    </svg>
  );
}
