// 온라인 마을 '이웃 부탁' — 날마다 새로 하는 심부름 (게임 창작)
// 보상과 조건은 엔진이 이 표로만 판단합니다. 하루에 부탁마다 한 번씩.
import type { GameState } from "../types";
import { PICNIC } from "./picnic";

export type ErrandKind = "deliver" | "give" | "check" | "trade";
export interface Errand {
  id: string;
  npc: string;
  /** 배달 부탁: 받을 사람 */
  to?: string;
  kind: ErrandKind;
  title: string;
  ask: string;
  thanks: string;
  need?: Record<string, number>;
  check?: (s: GameState, day: string) => boolean;
  checkHint?: string;
  reward: { exp: number; coins: number; items?: Record<string, number> };
}

export const ERRANDS: Errand[] = [
  {
    id: "letter", npc: "postman", to: "guide", kind: "deliver", title: "포포의 급한 편지",
    ask: "까악! 날개를 다쳐서 그래요… 이 편지를 웰컴센터의 달래 씨에게 전해 줄래요? 시간의 종 소식이 들었대요!",
    thanks: "어머, 포포가 보낸 편지네요? 고마워요, 타임워커. 이건 수고비예요!",
    reward: { exp: 30, coins: 25 },
  },
  {
    id: "shrimp", npc: "artisan", kind: "give", title: "덕배의 새우 부탁",
    ask: "허허, 오늘 항아리를 하나 더 앉히려는데 새우가 모자라네. 새우 두 마리만 나눠 주겠나?",
    thanks: "옳지, 싱싱하구먼! 답례로 정성 한 스푼 넣어 두었네.",
    need: { shrimp: 2 }, reward: { exp: 25, coins: 30, items: { sincerity: 1 } },
  },
  {
    id: "sparks", npc: "guide", kind: "check", title: "달래의 시간 조각 조사",
    ask: "요즘 거리에 반짝이는 조각이 떨어진대요. 오늘 탐험 지도에서 시간 조각 세 개를 모아 와 줄래요?",
    thanks: "정말 모아 왔네요! 안개가 조금 옅어진 것 같아요. 소금 좀 챙겨 가요.",
    check: (s, day) => s.sparks?.day === day && s.sparks.got.length >= 3, checkHint: "오늘 지도에서 시간 조각 3개",
    reward: { exp: 30, coins: 20, items: { salt: 2 } },
  },
  {
    id: "photo", npc: "photographer", kind: "check", title: "은솔의 기념사진",
    ask: "찰칵! 오늘은 ‘친구와 함께’ 사진을 찍고 싶어요. 동행하는 친구를 데려와 줄래요? (옷장에서 동행 친구를 고를 수 있어요)",
    thanks: "둘이 나란히, 하나 둘 셋! 정말 잘 나왔어요. 사진값은 제가 낼게요!",
    check: (s) => !!s.companion, checkHint: "동행 친구와 함께",
    reward: { exp: 25, coins: 25 },
  },
  {
    id: "trade", npc: "merchant", kind: "trade", title: "만복의 물물교환",
    ask: "소풍 보따리에 먹을거리 남는 거 있어요? 하나만 바꿔 주면 멸치 두 줌하고 엽전을 드릴게요!",
    thanks: "거래 성사! 장사는 이 맛이죠. 또 오세요~",
    reward: { exp: 20, coins: 40, items: { anchovy: 2 } },
  },
];
export const ERRAND = Object.fromEntries(ERRANDS.map((e) => [e.id, e])) as Record<string, Errand>;

/** 물물교환에 쓸 먹을거리 (가장 많이 가진 것) */
export function tradeFood(s: GameState) {
  const foods = Object.entries(s.picnic ?? {}).filter(([k, n]) => n > 0 && PICNIC[k]?.kind === "food").sort((a, b) => b[1] - a[1]);
  return foods[0]?.[0] ?? null;
}

export function errandReady(e: Errand, s: GameState, day: string) {
  if (e.kind === "give") return Object.entries(e.need ?? {}).every(([k, n]) => (s.inventory[k] ?? 0) >= n);
  if (e.kind === "check") return !!e.check?.(s, day);
  if (e.kind === "trade") return !!tradeFood(s);
  return true;
}
export const errandDone = (s: GameState, id: string, day: string) => s.errands?.day === day && s.errands.done.includes(id);
