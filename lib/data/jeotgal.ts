// 젓갈 만들기 미니게임 데이터
// ⚠ 이 미니게임의 비율·숙성 시간·등급은 모두 "교육용 게임 수치"입니다.
//   실제 식품 제조법·식품 안전 기준이 아니며, 실제 발효 과정을 재현한다고 주장하지 않습니다.
//   실제 레시피 안내는 검증된 자료(2단계 관리자 등록) 기반으로만 제공합니다.

export interface Item { id: string; name: string; emoji: string; desc: string }

export const ITEMS: Record<string, Item> = {
  shrimp: { id: "shrimp", name: "새우", emoji: "🦐", desc: "새우젓의 주재료 (게임 아이템)" },
  anchovy: { id: "anchovy", name: "멸치", emoji: "🐟", desc: "멸치젓의 주재료 (게임 아이템)" },
  yellowfish: { id: "yellowfish", name: "황석어", emoji: "🐠", desc: "황석어젓의 주재료 (게임 아이템)" },
  salt: { id: "salt", name: "소금", emoji: "🧂", desc: "모든 젓갈에 필요한 소금 (게임 아이템)" },
  sincerity: { id: "sincerity", name: "정성 한 스푼", emoji: "✨", desc: "퀘스트 보상. 넣으면 등급 보너스 (게임 전용)" },
  golden_jar: { id: "golden_jar", name: "황금 항아리 조각", emoji: "🏺", desc: "협동 이벤트 보상 (데모)" },
};

export interface JeotgalType {
  id: string;
  name: string;
  main: string;
  mainNeed: number;
  saltNeed: number;
  /** 게임 속 '알맞은 소금 비율' 구간 (%) — 게임 수치 */
  sweetSpot: [number, number];
  /** 게임 내 숙성 시간 (분) */
  agingMinutes: number;
  unlockLevel: number;
  color: string;
  blurb: string;
}

export const JEOTGAL_TYPES: JeotgalType[] = [
  { id: "saeu", name: "새우젓", main: "shrimp", mainNeed: 2, saltNeed: 2, sweetSpot: [25, 35], agingMinutes: 3, unlockLevel: 1, color: "#F2B8A0",
    blurb: "작은 새우로 만드는 젓갈. 장인 덕배가 가장 먼저 가르쳐 주는 기본 레시피예요." },
  { id: "myeolchi", name: "멸치젓", main: "anchovy", mainNeed: 2, saltNeed: 2, sweetSpot: [20, 30], agingMinutes: 5, unlockLevel: 2, color: "#9C8B7A",
    blurb: "멸치로 만드는 젓갈. 장인 레벨 2에 해금돼요." },
  { id: "hwangseogeo", name: "황석어젓", main: "yellowfish", mainNeed: 2, saltNeed: 3, sweetSpot: [28, 38], agingMinutes: 8, unlockLevel: 3, color: "#D9B45A",
    blurb: "황석어로 만드는 젓갈. 장인 레벨 3에 해금돼요." },
];
export const JTYPE = Object.fromEntries(JEOTGAL_TYPES.map((t) => [t.id, t])) as Record<string, JeotgalType>;

/** 게임 규칙: 주재료 → 소금 → 웃소금(덮는 소금) 순서로 넣으면 보너스 */
export const IDEAL_ORDER = ["main", "salt", "topsalt"];

export const GRADES = [
  { min: 90, name: "황금빛 장인 젓갈", stars: 4 },
  { min: 70, name: "정성 가득 젓갈", stars: 3 },
  { min: 45, name: "제법 그럴듯한 젓갈", stars: 2 },
  { min: 0, name: "초보 장인의 젓갈", stars: 1 },
];

export const JAR_SKINS = [
  { id: "basic", name: "옹기 항아리", body: "#6B4A36", rim: "#4A3426", unlock: 1 },
  { id: "sage", name: "비색 유약 항아리", body: "#748A70", rim: "#566A53", unlock: 2 },
  { id: "brick", name: "주홍 유약 항아리", body: "#963F38", rim: "#74302A", unlock: 3 },
  { id: "gold", name: "황금 항아리", body: "#B58B48", rim: "#8A6731", unlock: 5 },
];

export const ARTISAN_LEVELS = [0, 100, 250, 450, 700, 1000];
export function artisanLevel(exp: number) {
  let lv = 1;
  ARTISAN_LEVELS.forEach((need, i) => { if (exp >= need) lv = i + 1; });
  return Math.min(lv, ARTISAN_LEVELS.length);
}

export function scoreJar(typeId: string, ratio: number, order: string[], sincerity: number) {
  const t = JTYPE[typeId];
  const [lo, hi] = t.sweetSpot;
  const mid = (lo + hi) / 2;
  let ratioScore: number;
  if (ratio >= lo && ratio <= hi) ratioScore = 60 - Math.abs(ratio - mid) * 1.2;
  else ratioScore = Math.max(0, 40 - Math.min(Math.abs(ratio - lo), Math.abs(ratio - hi)) * 3);
  const orderScore = order.join(",") === IDEAL_ORDER.join(",") ? 25 : order[0] === "main" ? 12 : 4;
  const bonus = Math.min(15, sincerity * 8);
  const score = Math.round(Math.min(100, ratioScore + orderScore + bonus));
  const grade = GRADES.find((g) => score >= g.min)!;
  return { score, grade };
}
