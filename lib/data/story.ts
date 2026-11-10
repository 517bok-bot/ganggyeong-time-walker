// 메인 이야기 「멈춘 시간의 포구」 (게임 창작 세계관)
// ─────────────────────────────────────────────────────────────
// 금강 포구가 가장 붐비던 시절, 기억의 등대 꼭대기 '시간의 종'이 매일 저녁 울려 강경의 기억을 지켰다.
// 어느 밤 종에 금이 가자 강에서 '망각의 안개'가 올라와 거리의 색과 시간이 멈추고,
// 고양이 가족은 서로 다른 시간 속으로 흩어졌다. 종이 고른 타임워커는 흩어진 시간 조각을 모아 종을 고치고
// 가족을 다시 만나게 해야 한다.
// 실존 장소의 '역사'처럼 보이는 문장은 쓰지 않고, 판타지 설정임이 드러나게 씁니다.
// 캐릭터 대사 중 안내판 원문(강이·갱이·콩이의 한마디)은 그대로 인용합니다.
import type { GameState } from "../types";
import { CAT_FAMILY } from "./characters";

export type Speaker = "narr" | "popo" | "kangi" | "kaengi" | "kongi" | "berijyu" | "sweetpo" | "daechu" | "me" | "deokbae";
export interface Line { who: Speaker; text: string; mood?: "idle" | "happy" | "surprised" | "wave" }
export interface Objective { label: string; done: (s: GameState) => boolean; hint: string; href: string; count?: (s: GameState) => [number, number] }
export interface Chapter {
  id: string;
  no: string;
  title: string;
  sub: string;
  scene: "night" | "fog" | "street" | "kitchen" | "lighthouse" | "festival";
  objectives: Objective[];
  reward: { exp: number; coins: number; items?: Record<string, number>; badge?: string };
  intro: Line[];
  outro: Line[];
}

const places = (s: GameState) => Object.keys(s.visits).length + s.villageFound.filter((v) => v.startsWith("place:")).length;
const friends = (s: GameState) => ["berijyu", "sweetpo", "daechu-1", "daechu-2", "daechu-3"].filter((c) => s.characters[c]).length;
const found = (id: string) => (s: GameState) => !!s.characters[id];

export const CHAPTERS: Chapter[] = [
  {
    id: "ch0", no: "서장", title: "까치의 편지", sub: "종이 고른 사람", scene: "night",
    objectives: [{ label: "수호 신수와 계약하기", done: (s) => !!s.player.house, hint: "첫 장에서 ‘시간 여행 시작’을 눌러요", href: "/?prologue=1" }],
    reward: { exp: 20, coins: 30 },
    intro: [
      { who: "narr", text: "달 밝은 밤, 창가에 까치 한 마리가 내려앉았다. 부리에는 붉은 부적이 붙은 편지 한 통." },
      { who: "popo", text: "깍! 저는 시간을 나르는 까치, 포포예요. 이 편지는… 강경의 ‘시간의 종’이 직접 보낸 거예요." },
      { who: "narr", text: "봉투를 여는 순간, 부적의 붉은 글씨가 빛나며 공중에 떠올랐다. 그리고 손바닥 위에 가느다란 붓 한 자루가 내려앉았다." },
      { who: "popo", text: "그건 ‘시간붓’이에요. 흩어진 시간을 붙잡을 수 있는 붓이죠. 종이 당신을 타임워커로 골랐어요!" },
      { who: "popo", text: "하지만 혼자 가면 위험해요. 하늘의 네 신수 중 하나가 당신을 지켜 줄 거예요. 마음이 끌리는 쪽을 골라요." },
    ],
    outro: [
      { who: "popo", text: "계약의 인장, 쾅! 신수의 기운이 당신 그림자에 깃들었어요." },
      { who: "popo", text: "자, 금강 포구로 가요. 제 날개 끝을 꼭 잡아요. 시간의 문이 열려요!" },
    ],
  },
  {
    id: "ch1", no: "1장", title: "안개 낀 포구", sub: "흩어진 시간 조각", scene: "fog",
    objectives: [{ label: "지도에서 시간 조각 3개 붙잡기", done: (s) => (s.sparkTotal ?? 0) >= 3, hint: "지도 위 반짝이는 조각을 눌러요", href: "/explore", count: (s) => [Math.min(3, s.sparkTotal ?? 0), 3] }],
    reward: { exp: 60, coins: 40, items: { salt: 2 } },
    intro: [
      { who: "narr", text: "근대거리는 회색 안개에 잠겨 있었다. 은방울꽃 모양 영란등도, 길바닥을 수놓던 고보 조명도 하나둘 꺼져 있었다." },
      { who: "narr", text: "웰컴센터의 붉은 벽, 샹들리에 아래 화면 속에는 돛단배가 가득한 옛 포구가 흐르고 있었다. 부두 끝에 고양이 한 마리가 등을 보이고 앉아 있었다." },
      { who: "popo", text: "옛날 강경은 원산과 함께 조선 2대 포구, 강경장은 평양·대구와 함께 3대 시장이었대요. 배와 사람과 물건이 끝없이 오가던 거리였죠." },
      { who: "popo", text: "등대 꼭대기의 ‘시간의 종’ 보이죠? 매일 저녁 울려서 강경의 기억을 지켜 주던 종이에요." },
      { who: "popo", text: "그런데 어젯밤 종에 금이 갔어요. 그 틈으로 강에서 ‘망각의 안개’가 올라왔고요." },
      { who: "popo", text: "종에서 떨어져 나간 시간 조각들이 거리에 흩어졌어요. 반짝이는 게 보이면 시간붓으로 톡! 붙잡아 주세요." },
      { who: "me", text: "(지도 위에서 무언가 반짝인다…)" },
    ],
    outro: [
      { who: "narr", text: "조각 세 개가 손바닥 위에서 서로를 끌어당기더니, 작은 종소리를 냈다. 딩— 가까운 영란등 하나에 노란 불이 들어왔다." },
      { who: "popo", text: "들었어요? 안개가 한 겹 걷혔어요! 어, 저기… 주유소 간판 아래 누가 자고 있는데요?" },
    ],
  },
  {
    id: "ch2", no: "2장", title: "이름을 받은 고양이", sub: "엄마 고양이 갱이", scene: "street",
    objectives: [
      { label: "갱이 만나기", done: found("kaengi"), hint: "광신석유에서 QR·GPS 인증", href: "/explore" },
      { label: "장소 2곳 방문 인증", done: (s) => places(s) >= 2, hint: "현장에서 장소 QR을 찍거나 GPS 인증", href: "/explore", count: (s) => [Math.min(2, places(s)), 2] },
    ],
    reward: { exp: 90, coins: 60, items: { shrimp: 2 } },
    intro: [
      { who: "kaengi", mood: "idle", text: "으음… 누구야? 안개 때문에 깜빡 잠들었네." },
      { who: "kaengi", mood: "happy", text: "잠깐 쉬어가도 괜찮아! 여행은 여유가 있어야 하잖아." },
      { who: "popo", text: "갱이 씨! 강이 씨랑 콩이는요? 셋이 늘 같이 다녔잖아요." },
      { who: "kaengi", mood: "surprised", text: "그게… 종이 깨지던 밤에 다 같이 있었는데, 눈을 떠 보니 나 혼자였어." },
      { who: "kaengi", mood: "idle", text: "나, 원래 이름 없이 떠돌던 고양이였거든. 강이가 이름을 지어 줘서 강경이 집이 됐어. 그 기억까지 흐려지는 건 싫어." },
      { who: "kaengi", mood: "idle", text: "포구 장터가 북적이던 시절부터 우리 고양이들은 저 감성산책로를 따라 다녔어. 길 곳곳에 우리 흔적이 남아 있을 거야." },
      { who: "popo", text: "걱정 마요. 우리 타임워커가 거리를 걸으면, 걸은 곳마다 기억이 돌아와요!" },
    ],
    outro: [
      { who: "narr", text: "그때 붉은 벽돌의 음악도서관에서, 아무도 건반에 손을 대지 않았는데 피아노 선율이 흘러나왔다." },
      { who: "kaengi", mood: "happy", text: "들려? 기억이 돌아올 때마다 저 피아노가 울려. 골목 냄새도 돌아왔어! 이 길, 콩이가 제일 좋아하던 길인데…" },
      { who: "kaengi", mood: "surprised", text: "킁킁… 이건 젓갈 냄새야. 콩이는 맛있는 냄새만 나면 따라가거든!" },
    ],
  },
  {
    id: "ch3", no: "3장", title: "맛있는 냄새를 따라", sub: "아기 고양이 콩이", scene: "kitchen",
    objectives: [
      { label: "콩이 만나기", done: found("kongi"), hint: "대성상회에서 QR·GPS 인증", href: "/explore" },
      { label: "시간 조각 6개 모으기 (냄새의 실마리)", done: (s) => (s.sparkTotal ?? 0) >= 6, hint: "조각은 매일 새로 떨어져요", href: "/explore", count: (s) => [Math.min(6, s.sparkTotal ?? 0), 6] },
    ],
    reward: { exp: 120, coins: 80, items: { sincerity: 1 } },
    intro: [
      { who: "deokbae", text: "허허, 손님. 요 녀석이 아까부터 항아리 옆을 떠나질 않아요." },
      { who: "kongi", mood: "happy", text: "저쪽으로 가면 정말 맛있는 냄새가 나!" },
      { who: "kaengi", mood: "surprised", text: "콩이야! 엄마 여기 있어!" },
      { who: "kongi", mood: "wave", text: "엄마! 근데 아빠가 없어. 아빠는 맨날 등대에 올라가서 종을 보잖아." },
      { who: "deokbae", text: "냄새는 기억을 깨우는 법이지. 거리에 흩어진 시간 조각을 몇 개 더 모아 보게. 조각이 모이면 길이 보일 거요." },
    ],
    outro: [
      { who: "narr", text: "조각들이 한꺼번에 반짝이자, 젓갈 냄새 사이로 강바람이 불었다. 바람은 등대 쪽으로 불고 있었다." },
      { who: "kongi", mood: "surprised", text: "저기! 등대 꼭대기에 꼬리가 보였어!" },
    ],
  },
  {
    id: "ch4", no: "4장", title: "등대지기의 비밀", sub: "아빠 고양이 강이", scene: "lighthouse",
    objectives: [
      { label: "강이 만나기", done: found("kangi"), hint: "기억의 등대에서 QR·GPS 인증", href: "/explore" },
      { label: "시간 조각 10개 모으기 (종을 고칠 만큼)", done: (s) => (s.sparkTotal ?? 0) >= 10, hint: "조각은 매일 새로 떨어져요", href: "/explore", count: (s) => [Math.min(10, s.sparkTotal ?? 0), 10] },
    ],
    reward: { exp: 160, coins: 100, items: { sincerity: 1 } },
    intro: [
      { who: "kangi", mood: "idle", text: "…왔구나. 계단이 꽤 길었지?" },
      { who: "me", text: "강이 씨! 가족들이 다 찾고 있어요." },
      { who: "kangi", mood: "idle", text: "알아. 종이 깨진 건 내 탓이야. 너무 오래 혼자 종을 지켰거든. 지켜야 할 기억이 너무 많았어." },
      { who: "kangi", mood: "idle", text: "게다가 반짝이는 기억만 골라 지키려고 했지. 강경이 북적이던 시절은 일제강점기이기도 했어. 은행의 특혜를 받은 일본 상인들 틈에서 고생한 사람도 많았고." },
      { who: "popo", text: "좋은 기억만 넣어 두면 종이 바른 소리를 못 내는 거군요. 아픈 기억도 같이 지켜야 진짜 강경의 소리가 나요." },
      { who: "popo", text: "강이 씨는 대체 몇 살이에요? 까치들의 오래된 편지에도 안 나와요." },
      { who: "kangi", mood: "happy", text: "나이? 그건 비밀이라냥." },
      { who: "kangi", mood: "idle", text: "종을 고치려면 시간 조각이 더 필요해. 혼자서는 못 모았지만… 이번엔 같이 해 볼까." },
    ],
    outro: [
      { who: "narr", text: "열 개의 조각이 금 간 자리를 하나씩 메웠다. 등대의 화면에 빛바랜 옛 사진들이 차례로 떠올랐다가, 내일의 강경으로 바뀌었다." },
      { who: "kangi", mood: "happy", text: "이제 한 가지만 남았어. 종은 혼자 울리는 게 아니거든. 가족이 같이 있어야 소리가 나." },
    ],
  },
  {
    id: "ch5", no: "종장", title: "다시 울리는 종", sub: "강경, 다시 축제", scene: "festival",
    objectives: [
      { label: "고양이 가족 모두 만나기", done: (s) => CAT_FAMILY.every((c) => s.characters[c]), hint: "강이·갱이·콩이", href: "/dex" },
      { label: "강경모던상회에서 가족 재회", done: (s) => !!s.visits["modern-store"] || s.villageFound.includes("reunion"), hint: "강경모던상회에서 QR·GPS 인증", href: "/explore" },
      { label: "논산 여행단 친구 2명 만나기", done: (s) => friends(s) >= 2, hint: "베리쥬·스윗포·대추삼형제", href: "/explore", count: (s) => [Math.min(2, friends(s)), 2] },
    ],
    reward: { exp: 300, coins: 200, items: { sincerity: 2 }, badge: "강경의 종지기" },
    intro: [
      { who: "narr", text: "해 질 녘, 강경모던상회 앞. 클래식카의 동그란 전조등이 깜빡이는 사이, 처음으로 세 고양이가 한자리에 모였다." },
      { who: "berijyu", mood: "wave", text: "여행단도 왔어요! 종이 다시 울린다는 소문 듣고 딸기 들고 왔지!" },
      { who: "kongi", mood: "happy", text: "아빠, 엄마, 손 잡아! 아니 발!" },
      { who: "kangi", mood: "idle", text: "…견습생. 마지막 조각은 네 시간붓으로 넣어 줘." },
    ],
    outro: [
      { who: "narr", text: "데엥— 데엥— 금강 위로 종소리가 퍼지자 안개가 물러났다. 영란등이 줄지어 켜지고, 길바닥엔 고보 조명 꽃이 피고, 간판마다 색이 돌아왔다." },
      { who: "narr", text: "낭만광장에서는 풍류 예인들의 장단이 시작됐고, 음악도서관의 피아노가 그 장단에 맞춰 스스로 건반을 눌렀다." },
      { who: "kaengi", mood: "happy", text: "들려? 우리 집 소리야." },
      { who: "popo", text: "종소리를 타고 별빛 편지가 내려왔어요! ‘이제부터 그대를 강경의 종지기라 부르노라.’ 축하해요!" },
      { who: "kangi", mood: "happy", text: "가끔 들러. 종은 매일 저녁 울릴 테니까. 그리고… 고마워." },
      { who: "narr", text: "― 멈춘 시간의 포구, 끝. 강경의 시간은 오늘도 흐른다. (시간 조각은 매일 새로 떨어져요!)" },
    ],
  },
];
export const CHAPTER = Object.fromEntries(CHAPTERS.map((c) => [c.id, c])) as Record<string, Chapter>;

export function chapterProgress(c: Chapter, s: GameState) {
  const done = c.objectives.filter((o) => o.done(s)).length;
  return { done, total: c.objectives.length, complete: done === c.objectives.length, claimed: (s.story ?? []).includes(c.id) };
}
/** 지금 진행 중인 장 (모두 끝났으면 null) */
export function currentChapter(s: GameState): Chapter | null {
  return CHAPTERS.find((c) => !(s.story ?? []).includes(c.id)) ?? null;
}
/** 0~1: 안개가 걷힌 정도 */
export function fogCleared(s: GameState) { return (s.story ?? []).length / CHAPTERS.length; }

export const SPEAKER_NAME: Record<Speaker, string> = {
  narr: "", popo: "포포", kangi: "강이", kaengi: "갱이", kongi: "콩이", berijyu: "베리쥬", sweetpo: "스윗포", daechu: "대추삼형제", me: "나", deokbae: "덕배 장인",
};

/** 진행 중인 목표 한 줄 요약 (예: "시간 조각 3개 붙잡기 · 1/3") */
export function objectiveLine(c: Chapter, s: GameState) {
  const o = c.objectives.find((x) => !x.done(s));
  if (!o) return "목표 달성!";
  const [n, need] = o.count ? o.count(s) : [c.objectives.filter((x) => x.done(s)).length, c.objectives.length];
  return `${o.label} · ${n}/${need}`;
}
