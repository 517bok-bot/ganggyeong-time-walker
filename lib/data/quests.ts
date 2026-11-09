import type { GameState } from "../types";
import { CAT_FAMILY, DAECHU_BROS } from "./characters";
import { RECOMMENDED_ROUTE } from "./locations";

export type QuestType = "story" | "collect" | "visit" | "npc" | "quiz" | "craft" | "online" | "daily" | "style" | "picnic";

export interface QuestStep { label: string; done: (s: GameState) => boolean }
export interface Quest {
  id: string;
  title: string;
  type: QuestType;
  difficulty: 1 | 2 | 3;
  desc: string;
  steps: QuestStep[];
  reward: { exp: number; coins: number; items?: Record<string, number>; badge?: string };
  featured?: boolean;
}

const found = (id: string) => (s: GameState) => !!s.characters[id];
const visited = (id: string) => (s: GameState) => !!s.visits[id];

export const QUESTS: Quest[] = [
  {
    id: "q-cat-family", title: "사라진 고양이 가족을 찾아라!", type: "story", difficulty: 2, featured: true,
    desc: "강경근대거리 곳곳에 숨겨진 강이, 갱이, 콩이를 찾아 가족 도감을 완성하세요. 마지막엔 강경모던상회에서 가족이 다시 모여요!",
    steps: [
      { label: "첫 번째 고양이 발견", done: (s) => CAT_FAMILY.filter((c) => s.characters[c]).length >= 1 },
      { label: "두 번째 고양이 발견", done: (s) => CAT_FAMILY.filter((c) => s.characters[c]).length >= 2 },
      { label: "마지막 아기 고양이 콩이 발견", done: found("kongi") },
      { label: "고양이 가족 완성 (세 마리 모두)", done: (s) => CAT_FAMILY.every((c) => s.characters[c]) },
      { label: "강경모던상회에서 가족 재회", done: (s) => CAT_FAMILY.every((c) => s.characters[c]) && (visited("modern-store")(s) || s.villageFound.includes("reunion")) },
    ],
    reward: { exp: 300, coins: 150, items: { sincerity: 2 }, badge: "가족 완성 배지" },
  },
  {
    id: "q-berijyu", title: "베리쥬의 논산 여행단", type: "collect", difficulty: 1,
    desc: "새로운 장소가 궁금한 베리쥬와 함께 강경을 여행해요. 베리쥬를 만나고 장소 3곳을 방문하세요.",
    steps: [
      { label: "베리쥬 만나기", done: found("berijyu") },
      { label: "장소 3곳 방문 (실제 또는 온라인)", done: (s) => Object.keys(s.visits).length + s.villageFound.filter((v) => v.startsWith("place:")).length >= 3 },
    ],
    reward: { exp: 120, coins: 60, items: { shrimp: 2 } },
  },
  {
    id: "q-daechu", title: "셋이 있으면 축제같아! 대추삼형제", type: "collect", difficulty: 2,
    desc: "흩어진 대추삼형제를 모두 찾아 도감을 완성하세요.",
    steps: DAECHU_BROS.map((id, i) => ({ label: `${["첫째", "둘째", "막내"][i]} 찾기`, done: found(id) })),
    reward: { exp: 200, coins: 100, items: { yellowfish: 2, salt: 3 }, badge: "대추 축제 배지" },
  },
  {
    id: "q-first-step", title: "타임워커의 첫 발걸음", type: "visit", difficulty: 1,
    desc: "여정의 시작, 웰컴센터를 방문하세요. (GPS · QR · 온라인 마을 모두 가능)",
    steps: [{ label: "웰컴센터 방문", done: (s) => visited("welcome-center")(s) || s.villageFound.includes("place:welcome-center") }],
    reward: { exp: 50, coins: 30, items: { salt: 2 } },
  },
  {
    id: "q-route", title: "추천 동선 완주", type: "visit", difficulty: 3,
    desc: "추천 탐험 동선 15곳을 실제로 방문 인증하세요. (실제 방문 전용)",
    steps: [
      { label: "5곳 방문", done: (s) => RECOMMENDED_ROUTE.filter((id) => s.visits[id]).length >= 5 },
      { label: "10곳 방문", done: (s) => RECOMMENDED_ROUTE.filter((id) => s.visits[id]).length >= 10 },
      { label: "15곳 완주", done: (s) => RECOMMENDED_ROUTE.every((id) => s.visits[id]) },
    ],
    reward: { exp: 500, coins: 300, badge: "강경 완주 배지" },
  },
  {
    id: "q-npc", title: "강경 사람들과 인사하기", type: "npc", difficulty: 1,
    desc: "NPC 3명과 대화하세요.",
    steps: [
      { label: "NPC 1명과 대화", done: (s) => s.npcTalked.length >= 1 },
      { label: "NPC 3명과 대화", done: (s) => s.npcTalked.length >= 3 },
    ],
    reward: { exp: 80, coins: 40, items: { anchovy: 1 } },
  },
  {
    id: "q-quiz", title: "강경 역사 퀴즈", type: "quiz", difficulty: 2,
    desc: "NPC에게 들은 이야기를 바탕으로 퀴즈 3개를 맞혀 보세요.",
    steps: [
      { label: "퀴즈 1개 정답", done: (s) => s.quizCorrect.length >= 1 },
      { label: "퀴즈 3개 정답", done: (s) => s.quizCorrect.length >= 3 },
    ],
    reward: { exp: 150, coins: 70, items: { sincerity: 1 } },
  },
  {
    id: "q-jeotgal", title: "첫 젓갈 만들기", type: "craft", difficulty: 1,
    desc: "젓갈 장인 덕배에게 배워 첫 항아리를 담그고 숙성을 완료하세요.",
    steps: [
      { label: "항아리 담그기", done: (s) => s.jars.length >= 1 },
      { label: "숙성 완료", done: (s) => s.jars.some((j) => j.status === "done") },
    ],
    reward: { exp: 120, coins: 50, items: { anchovy: 2, salt: 2 } },
  },
  {
    id: "q-online", title: "온라인 강경마을 산책", type: "online", difficulty: 1,
    desc: "온라인 강경마을에서 장소 4곳을 발견하세요.",
    steps: [{ label: "온라인 장소 4곳 발견", done: (s) => s.villageFound.filter((v) => v.startsWith("place:")).length >= 4 }],
    reward: { exp: 80, coins: 40, items: { shrimp: 1 } },
  },
  {
    id: "q-style", title: "멋쟁이 타임워커", type: "style", difficulty: 1,
    desc: "옷장에서 새 액세서리를 하나 사서 착용해 보세요.",
    steps: [
      { label: "새 아이템 구입", done: (s) => (s.wardrobe?.length ?? 1) >= 2 },
      { label: "모자 외 부위 착용", done: (s) => !!(s.equipped?.neck || s.equipped?.face) },
    ],
    reward: { exp: 60, coins: 30 },
  },
  {
    id: "q-companion", title: "함께 걷는 친구", type: "style", difficulty: 1,
    desc: "만난 캐릭터 중 한 명을 동행 친구로 정하면 마을에서 함께 걸어요.",
    steps: [{ label: "동행 친구 정하기", done: (s) => !!s.companion }],
    reward: { exp: 50, coins: 30, items: { salt: 2 } },
  },
  {
    id: "q-artisan", title: "젓갈 장인의 길", type: "craft", difficulty: 3,
    desc: "젓갈을 여러 번 완성해 장인 레벨 3에 도전하세요. 새 레시피와 항아리가 열려요.",
    steps: [
      { label: "젓갈 3개 완성", done: (s) => s.jars.filter((j) => j.status === "done").length >= 3 },
      { label: "장인 레벨 3 달성", done: (s) => s.artisanExp >= 250 },
    ],
    reward: { exp: 250, coins: 120, items: { yellowfish: 2, sincerity: 1 }, badge: "젓갈 장인 칭호" },
  },
  {
    id: "q-postcards", title: "추억을 담은 엽서", type: "collect", difficulty: 2,
    desc: "서로 다른 장소 3곳에서 기념 엽서를 만들어 여행 앨범을 채워요.",
    steps: [
      { label: "엽서 1장", done: (s) => (s.postcardsMade?.length ?? 0) >= 1 },
      { label: "엽서 3장", done: (s) => (s.postcardsMade?.length ?? 0) >= 3 },
    ],
    reward: { exp: 150, coins: 80 },
  },
  {
    id: "q-picnic", title: "강경으로 소풍 가자", type: "picnic", difficulty: 2,
    desc: "장소를 돌며 소풍 보따리를 채우고, 금강 둑에 돗자리를 펼쳐 보세요.",
    steps: [
      { label: "소풍 아이템 6가지 모으기", done: (s) => Object.entries(s.picnic ?? {}).filter(([, n]) => n > 0).length >= 6 || (s.picnicsHeld ?? 0) > 0 },
      { label: "소풍 한 번 펼치기", done: (s) => (s.picnicsHeld ?? 0) >= 1 },
    ],
    reward: { exp: 120, coins: 60, items: { shrimp: 2 } },
  },
];

export const QUEST = Object.fromEntries(QUESTS.map((q) => [q.id, q])) as Record<string, Quest>;

export function questProgress(q: Quest, s: GameState) {
  const done = q.steps.filter((st) => st.done(s)).length;
  return { done, total: q.steps.length, complete: done === q.steps.length, claimed: !!s.quests[q.id] };
}

/** 오늘의 퀘스트: 날짜 기반으로 3개를 고릅니다 */
export function dailyQuestIds(date = new Date()) {
  const pool = QUESTS.filter((q) => !q.featured).map((q) => q.id);
  const seed = date.getFullYear() * 400 + date.getMonth() * 31 + date.getDate();
  const out: string[] = ["q-cat-family"];
  for (let i = 0; out.length < 3 && i < pool.length * 2; i++) {
    const id = pool[(seed * (i + 3)) % pool.length];
    if (!out.includes(id)) out.push(id);
  }
  return out;
}

export interface QuizQ { id: string; q: string; options: string[]; answer: number; knowledgeId: string }
export const QUIZ: QuizQ[] = [
  { id: "qz1", q: "철도가 놓이기 전, 강경포구는 어느 강의 하류에 있던 대표 포구였을까요?", options: ["한강", "금강", "낙동강", "영산강"], answer: 1, knowledgeId: "kd-port" },
  { id: "qz2", q: "강경장은 조선 후기 어느 두 도시의 시장과 함께 3대 시장으로 꼽혔다고 전해질까요?", options: ["서울·부산", "평양·대구", "개성·전주", "원주·상주"], answer: 1, knowledgeId: "kd-port" },
  { id: "qz3", q: "강경에서 젓갈이 발달한 바탕이 된 기술은 무엇일까요?", options: ["훈제법", "염장법", "건조 냉동법", "통조림"], answer: 1, knowledgeId: "kd-jeotgal" },
  { id: "qz4", q: "안내도 '특별수배'에서 고양이 가족을 만날 수 있다고 힌트를 준 장소는?", options: ["강경씨네마", "음악도서관", "강경모던상회", "딴스홀"], answer: 2, knowledgeId: "kd-cats" },
];
