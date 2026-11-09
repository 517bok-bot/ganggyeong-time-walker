// 시간 조각 (매일 지도 위에 새로 나타나는 수집 요소, 게임 창작)
// ─────────────────────────────────────────────────────────────
// - 날짜(한국 시간)마다 같은 자리에 같은 조각이 나타나도록 날짜를 씨앗으로 한 난수를 씁니다.
// - 보상은 엔진이 sparkReward(day, index)로만 결정합니다. 클라이언트는 몇 번째 조각인지만 보냅니다.
// - 그림 지도 위의 놀이 요소라 위치 인증은 요구하지 않습니다(하루 개수 제한으로 균형).

export const SPARKS_PER_DAY = 6;

export type SparkKind = "moment" | "golden" | "picnic" | "shrimp" | "salt";
export interface SparkInfo { kind: SparkKind; name: string; exp: number; coins: number; picnic?: string; items?: Record<string, number> }

function hash(str: string) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}
export function rng(seed: string) {
  let a = hash(seed);
  return () => { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

export const SPARK_LABEL: Record<SparkKind, string> = {
  moment: "시간 조각", golden: "황금 시간 조각", picnic: "소풍 보따리", shrimp: "반짝 새우", salt: "천일염 결정",
};

export function sparkReward(day: string, index: number): SparkInfo {
  const r = rng(`${day}#${index}`);
  const roll = r();
  if (roll < 0.15) return { kind: "golden", name: SPARK_LABEL.golden, exp: 30, coins: 30 };
  if (roll < 0.45) return { kind: "picnic", name: "반짝 시간 조각", exp: 20, coins: 15 };
  return { kind: "moment", name: SPARK_LABEL.moment, exp: 14, coins: 10 };
}

/** 그림 지도(OldMap 좌표계) 위 조각 위치: 두 장소 사이 길 위 + 약간의 흔들림 */
export function sparkSpots(day: string, anchors: { x: number; y: number }[]) {
  return Array.from({ length: SPARKS_PER_DAY }, (_, i) => {
    const r = rng(`${day}@${i}`);
    const a = anchors[Math.floor(r() * anchors.length)];
    const b = anchors[Math.floor(r() * anchors.length)];
    const t = 0.25 + r() * 0.5;
    return { index: i, x: a.x + (b.x - a.x) * t + (r() - 0.5) * 60, y: a.y + (b.y - a.y) * t + (r() - 0.5) * 60, info: sparkReward(day, i) };
  });
}

export const dayKeyKST = (now: number) => new Date(now + 9 * 3600_000).toISOString().slice(0, 10);
