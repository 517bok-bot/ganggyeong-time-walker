// 메인 이야기 「다시 울리는 종」: 1시간 · 6곳 코스 (게임 창작 세계관 + 장소마다 실제 역사 한 가지)
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
export interface Line { who: Speaker; text: string; mood?: "idle" | "happy" | "surprised" | "wave"; /** 현장(진한 도장)·온라인(흐린 도장)일 때만 보이는 줄 */ only?: "onsite" | "online" }
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
  /** 장소에 도착(방문)한 뒤 미션 전에 보는 본 장면 */
  arrive?: Line[];
  outro: Line[];
  /** 이 장의 장소 · 미션 */
  place?: string;
  mission?: string;
}

const places = (s: GameState) => Object.keys(s.visits).length + s.villageFound.filter((v) => v.startsWith("place:")).length;
const friends = (s: GameState) => ["berijyu", "sweetpo", "daechu-1", "daechu-2", "daechu-3"].filter((c) => s.characters[c]).length;
const found = (id: string) => (s: GameState) => !!s.characters[id];
const visited = (id: string) => (s: GameState) => !!s.visits[id];
const solved = (id: string) => (s: GameState) => (s.missions ?? []).includes(id);

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
    id: "ch1", no: "1장", title: "멈춘 종소리", sub: "웰컴센터", scene: "fog", place: "welcome-center", mission: "m-market",
    objectives: [
      { label: "웰컴센터 도착", done: visited("welcome-center"), hint: "현장 QR·GPS 또는 집에서 지도로 방문", href: "/explore?loc=welcome-center" },
      { label: "미션: 조선 3대 시장", done: solved("m-market"), hint: "장면을 본 뒤 퀴즈를 풀어요", href: "/explore" },
    ],
    reward: { exp: 60, coins: 30 },
    intro: [
      { who: "popo", text: "자, 첫 번째 목적지는 강경근대거리 입구의 웰컴센터예요. 붉은 벽돌에 노란 전구 간판이 보이면 도착!" },
      { who: "me", text: "(지도에서 1번 웰컴센터를 찾아 가 보자.)" },
    ],
    arrive: [
      { who: "narr", text: "강경근대거리 입구, 붉은 벽돌 안내소. 노란 전구 간판 아래로 까치 한 마리가 포르르 내려앉았다." },
      { who: "popo", only: "onsite", text: "(직접 와 줬군요! 안내소 안 붉은 벽 화면, 꼭 들어가서 봐요. 옛 포구에 선 고양이가 보일 거예요.)" },
      { who: "popo", only: "online", text: "(지금은 사진으로 보는 웰컴센터예요. 강경에 오면 안 붉은 벽 화면 속 옛 포구가 움직이는 걸 볼 수 있어요!)" },
      { who: "popo", text: "깍! 잘 왔어요, 타임워커! 시간붓은 잘 챙겼죠?" },
      { who: "me", text: "타임워커라니… 나는 그냥 여행 온 건데." },
      { who: "popo", text: "그래서 딱이에요! 이 거리의 기억은 처음 온 사람 눈에만 보이거든요." },
      { who: "popo", text: "안으로 들어가 봐요. 붉은 벽 화면 속에 돛단배 가득한 옛 포구가 흐르죠? 옛날 강경은 바닷배와 강배가 만나는 큰 포구였어요." },
      { who: "popo", text: "강경장은 평양장·대구장과 함께 조선 3대 시장으로 꼽혔대요. 그 많은 사람과 물건의 기억을 지켜 온 게 바로 시간의 종이에요." },
      { who: "popo", text: "그런데 어젯밤 종에 금이 갔어요. 종소리가 멈추자 고양이 가족 강이·갱이·콩이가 뿔뿔이 흩어졌고요." },
      { who: "me", text: "고양이 가족?" },
      { who: "popo", text: "거리 안내도에 ‘특별수배’까지 붙은 유명한 고양이들이에요. 찾기 전에… 제 이야기 잘 들었나 확인해 볼게요!" },
    ],
    outro: [
      { who: "popo", text: "정답! 역시 내가 고른 타임워커예요." },
      { who: "popo", text: "먼저 엄마 고양이 갱이부터 찾아요. 기름 냄새 나는 가게, 광신석유 쪽이에요!" },
    ],
  },
  {
    id: "ch2", no: "2장", title: "간판 아래 잠든 고양이", sub: "광신석유", scene: "street", place: "gwangshin", mission: "m-sign",
    objectives: [
      { label: "광신석유 도착", done: visited("gwangshin"), hint: "웰컴센터에서 걸어서 약 1분", href: "/explore?loc=gwangshin" },
      { label: "미션: 간판 속 한자", done: solved("m-sign"), hint: "간판을 잘 봐요", href: "/explore" },
    ],
    reward: { exp: 70, coins: 35 },
    intro: [
      { who: "popo", text: "광신석유는 웰컴센터에서 금방이에요. 옛 주유기가 서 있는 짙은 목조 건물을 찾아요!" },
    ],
    arrive: [
      { who: "narr", text: "기와 차양을 두른 짙은 목조 건물. 빨강·청록 옛 주유기 사이에서 고양이 한 마리가 몸을 동그랗게 말고 있었다." },
      { who: "kaengi", mood: "wave", only: "onsite", text: "(주유기 옆 따뜻한 자리, 너도 한번 서 봐. 사진 찍기 딱 좋아!)" },
      { who: "kaengi", mood: "wave", only: "online", text: "(사진으로 봐도 멋지지? 직접 오면 옛 주유기 옆에 나란히 서서 사진 찍을 수 있어!)" },
      { who: "popo", text: "갱이 씨! 일어나요!" },
      { who: "kaengi", mood: "idle", text: "으음… 누구야? 주유기 옆이 따뜻해서 깜빡 잠들었네." },
      { who: "kaengi", mood: "surprised", text: "아, 포포! 그럼 이 사람이 새 타임워커야?" },
      { who: "kaengi", mood: "idle", text: "종이 깨지던 밤, 우리 셋은 등대 아래 있었어. 쾅 소리가 나고… 눈을 떠 보니 나 혼자 여기였어." },
      { who: "kaengi", mood: "idle", text: "나, 원래 이름 없이 떠돌던 고양이였거든. 강이가 ‘갱이’라고 불러 줘서 강경이 집이 됐어. 그 기억까지 흐려지는 건 싫어." },
      { who: "popo", text: "간판 좀 봐요. 光信石油, 江景石油, 자동차 회사 간판까지 걸려 있죠?" },
      { who: "popo", text: "철길이 놓이고 자동차가 다니면서 사람과 짐이 배 대신 길로 오가기 시작했어요. 1899년 군산항이 열린 것도 컸고요. 그때부터 포구는 조금씩 조용해졌대요." },
      { who: "kaengi", mood: "idle", text: "그래도 이 거리는 그 시절을 잊지 않으려고 간판을 다시 걸었지. 자, 간판 글씨 읽을 줄 알아?" },
    ],
    outro: [
      { who: "kaengi", mood: "happy", text: "잘 읽었어! 콩이는 어디 있는지 알 것 같아. 그 녀석, 맛있는 냄새만 나면 졸졸 따라가거든!" },
      { who: "popo", text: "바로 옆 대성상회에서 고소한 냄새가 나요. 가 봐요!" },
    ],
  },
  {
    id: "ch3", no: "3장", title: "맛있는 냄새를 따라", sub: "대성상회", scene: "kitchen", place: "daecheong", mission: "m-jeotgal",
    objectives: [
      { label: "대성상회 도착", done: visited("daecheong"), hint: "광신석유 바로 위쪽", href: "/explore?loc=daecheong" },
      { label: "미션: 강경 젓갈의 시작", done: solved("m-jeotgal"), hint: "덕배 장인의 이야기를 떠올려요", href: "/explore" },
    ],
    reward: { exp: 70, coins: 35 },
    intro: [
      { who: "kaengi", mood: "surprised", text: "킁킁… 저쪽이야! 회청색 벽에 금테 현판이 걸린 대성상회!" },
    ],
    arrive: [
      { who: "narr", text: "회청색 벽에 금테 현판 大成商會. 가게 앞 항아리 옆에서 작은 꼬리가 살랑거렸다." },
      { who: "deokbae", only: "onsite", text: "(가까이 와서 현판 좀 보시게. 大成商會, 금테가 아직 번쩍이지?)" },
      { who: "deokbae", only: "online", text: "(사진만 봐선 냄새를 모르지. 강경에 오면 진짜 젓갈 냄새를 맡게 해 주겠네.)" },
      { who: "deokbae", text: "허허, 손님. 요 녀석이 아까부터 항아리 옆을 떠나질 않네." },
      { who: "kongi", mood: "happy", text: "킁킁… 엄마 냄새가 나! …아니, 젓갈 냄새인가?" },
      { who: "kaengi", mood: "surprised", text: "콩이야! 엄마 여기 있어!" },
      { who: "kongi", mood: "wave", text: "엄마아! 나 길 잃은 거 아니야. 냄새 따라 탐험한 거야!" },
      { who: "deokbae", text: "이 냄새가 바로 강경의 냄새지. 옛날 강경엔 서해에서 소금이랑 생선이 배로 잔뜩 들어왔다오." },
      { who: "deokbae", text: "그 많은 생선을 하루에 다 팔 수가 있나. 남은 걸 소금에 절여 항아리에 오래 두었지. 그게 강경 젓갈의 바탕이라오." },
      { who: "me", text: "그래서 지금도 강경 하면 젓갈이구나." },
      { who: "deokbae", text: "그렇지. 가을이면 금강 둔치에서 젓갈축제도 열린다네. 자, 내 얘기 잘 들었나 볼까?" },
    ],
    outro: [
      { who: "kongi", mood: "surprised", text: "근데 엄마… 아빠가 없어. 아빠는 맨날 등대에 올라가서 종을 지켰잖아." },
      { who: "deokbae", text: "등대라… 냄새는 기억을 깨우는 법이지. 저 위쪽 바람을 따라가 보게." },
    ],
  },
  {
    id: "ch4", no: "4장", title: "금 간 종", sub: "기억의 등대", scene: "lighthouse", place: "memory-lighthouse", mission: "m-tail",
    objectives: [
      { label: "기억의 등대 도착", done: visited("memory-lighthouse"), hint: "거리 위쪽, 초록 기둥의 등대", href: "/explore?loc=memory-lighthouse" },
      { label: "미션: 화면 속 단서", done: solved("m-tail"), hint: "갱이가 본 꼬리를 떠올려요", href: "/explore" },
    ],
    reward: { exp: 80, coins: 40 },
    intro: [
      { who: "popo", text: "기억의 등대는 거리 위쪽이에요. 짙은 초록 기둥에 둥근 지붕, 금빛 띠를 찾아요!" },
    ],
    arrive: [
      { who: "narr", text: "짙은 초록 주물 기둥 위 둥근 지붕. 금빛 띠에 THE LIGHTHOUSE OF MEMORY. 기둥을 두른 화면으로 빛바랜 사진들이 흘러갔다." },
      { who: "popo", only: "onsite", text: "(등대 기둥 화면을 직접 올려다봐요. 사진이 바뀔 때마다 강경의 옛 모습이 지나가요.)" },
      { who: "popo", only: "online", text: "(사진 속 등대 기둥엔 화면이 둘러져 있어요. 직접 오면 그 화면에서 옛 사진들이 흘러가요.)" },
      { who: "popo", text: "여기가 시간의 종이 있던 곳이에요. …보여요? 꼭대기에 금이 간 자국." },
      { who: "kongi", mood: "surprised", text: "아빠! 아빠아! …없어." },
      { who: "kaengi", mood: "idle", text: "강이는 늘 여기서 거리를 내려다봤어. 기억이 흩어지지 않게 지켜야 한다면서." },
      { who: "popo", text: "화면을 봐요. 1920년대 강경엔 벌써 전깃불과 수도가 들어오고, 극장도 있었대요. 지금보다 훨씬 북적였죠." },
      { who: "me", text: "사진 속 사람들, 다들 바빠 보이네." },
      { who: "popo", text: "그런데 그때는 일제강점기였어요. 은행의 특혜를 받은 일본 상인들이 상권을 넓혀 가는 동안, 바쁘게 일해도 형편이 어려운 사람이 많았대요." },
      { who: "kaengi", mood: "idle", text: "그래서 강이가 늘 그랬어. 반짝이는 기억만 지키면 반쪽짜리라고." },
      { who: "kaengi", mood: "surprised", text: "잠깐, 방금 그 사진! 어떤 건물 창문에… 저 줄무늬 꼬리!" },
    ],
    outro: [
      { who: "kongi", mood: "happy", text: "아빠 꼬리다! 아빠는 저기 있어!" },
      { who: "popo", text: "붉은 벽돌에 쇠창살 창문… 강경구락부 정문 옆, 옛 한일은행이에요! 지금은 강경역사관이죠." },
    ],
  },
  {
    id: "ch5", no: "5장", title: "기억의 금고", sub: "옛 한일은행 · 강경역사관", scene: "street", place: "old-bank", mission: "m-vault",
    objectives: [
      { label: "강경역사관 도착", done: visited("old-bank"), hint: "강경구락부 정문 옆 붉은 벽돌 건물", href: "/explore?loc=old-bank" },
      { label: "미션: 금고 비밀번호", done: solved("m-vault"), hint: "은행이 처음 문을 연 해", href: "/explore" },
    ],
    reward: { exp: 90, coins: 45 },
    intro: [
      { who: "kaengi", mood: "idle", text: "은행이라… 강이다운 곳에 숨었네. 가자!" },
    ],
    arrive: [
      { who: "narr", text: "강경구락부 정문 옆, 쇠창살 창문이 달린 붉은 벽돌 건물. 문 안쪽에서 나지막한 목소리가 들렸다." },
      { who: "kangi", mood: "idle", only: "onsite", text: "(진짜 이곳까지 왔구나. 쇠창살 창문, 가까이서 보면 더 단단해 보이지?)" },
      { who: "kangi", mood: "idle", only: "online", text: "(멀리서 와 준 거지? 언젠가 진짜 이 계단을 올라와 봐. 안엔 강경의 옛 사진이 가득해.)" },
      { who: "kangi", mood: "idle", text: "…왔구나. 계단이 꽤 길었지?" },
      { who: "kaengi", mood: "surprised", text: "강이! 왜 혼자 여기 있어!" },
      { who: "kangi", mood: "idle", text: "종이 깨진 건 내 탓이야. 너무 오래 혼자 종을 지켰거든. 그래서 기억이 흩어지기 전에, 하나씩 주워서 이 금고에 넣어 두고 있었어." },
      { who: "popo", text: "이 건물은 진짜 은행이었어요. 1905년 한호농공은행 강경지점으로 문을 열었고, 나중엔 조선식산은행 강경지점이 됐죠." },
      { who: "popo", text: "조선식산은행은 일제가 조선의 경제를 쥐는 데 쓴 은행이기도 했어요. 그래서 이 건물엔 번성한 기억과 아픈 기억이 함께 있어요." },
      { who: "kangi", mood: "idle", text: "좋은 기억만 넣어 두면 금고가 닫히지 않아. 아픈 기억도 같이 지켜야 진짜 강경이 되지." },
      { who: "me", text: "은행 금고가 기억 금고가 된 거네." },
      { who: "kangi", mood: "happy", text: "맞아. 근데… 금고 비밀번호를 잊어버렸다냥." },
      { who: "kongi", mood: "surprised", text: "아빠!!" },
      { who: "kangi", mood: "idle", text: "힌트는 하나. 이 은행이 처음 문을 연 해야." },
    ],
    outro: [
      { who: "narr", text: "철컥. 금고가 열리자 흩어졌던 시간 조각들이 한꺼번에 빛났다." },
      { who: "kangi", mood: "happy", text: "고마워, 타임워커. 종은 혼자서는 울리지 않아. 가족이 같이 있어야 소리가 나지. 모던상회로 가자." },
    ],
  },
  {
    id: "ch6", no: "종장", title: "다시 울리는 종", sub: "강경모던상회", scene: "festival", place: "modern-store",
    objectives: [
      { label: "강경모던상회 도착", done: visited("modern-store"), hint: "강경역사관에서 걸어서 약 1분", href: "/explore?loc=modern-store" },
      { label: "고양이 가족 모두 만나기", done: (s) => CAT_FAMILY.every((c) => s.characters[c]), hint: "강이·갱이·콩이", href: "/dex" },
    ],
    reward: { exp: 150, coins: 100, badge: "강경의 종지기" },
    intro: [
      { who: "kongi", mood: "happy", text: "모던상회! 클래식카 있는 데! 내가 먼저 갈래!" },
    ],
    outro: [
      { who: "narr", text: "해 질 녘, 강경모던상회 앞. 클래식카의 동그란 전조등이 깜빡였다. 그리고 처음으로, 세 고양이가 한자리에 모였다." },
      { who: "kongi", mood: "happy", text: "아빠, 엄마, 손 잡아! 아니, 발!" },
      { who: "kaengi", mood: "happy", text: "이번엔 절대 놓치지 않을 거야." },
      { who: "popo", text: "안내도에 붙어 있던 ‘특별수배! 고양이 가족’, 드디어 다 찾았네요! 힌트가 ‘모던상회에 가면 만날 수 있을지도’였잖아요." },
      { who: "kangi", mood: "idle", text: "견습생, 마지막 조각은 네 시간붓으로 넣어 줘." },
      { who: "narr", text: "붓끝이 닿자 멀리 등대 쪽에서 딩— 종소리가 울렸다. 거리의 영란등이 하나둘 켜졌다." },
      { who: "kangi", mood: "happy", text: "오늘을 잊지 않게, 우리 같이 사진 한 장 찍을까?" },
      { who: "popo", text: "‘이제부터 그대를 강경의 종지기라 부르노라.’ 축하해요! 거리엔 아직 열여덟 곳의 기억이 잠들어 있어요. 해가 지면 밤에만 나타나는 친구들도 있대요. 또 와요!" },
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

// ── 미션: 현장에서도, 집에서도(사진을 보고) 풀 수 있는 퀴즈 ──
export interface Mission { id: string; title: string; q: string; choices: string[]; answer: number; photo?: string; hint: string }
export const MISSIONS: Mission[] = [
  { id: "m-market", title: "조선 3대 시장", q: "강경장과 함께 조선 3대 시장으로 꼽힌 곳은?", choices: ["평양장 · 대구장", "한양장 · 부산장", "전주장 · 광주장"], answer: 0, photo: "/story/welcome-center.webp", hint: "포포가 웰컴센터에서 한 이야기를 떠올려요" },
  { id: "m-sign", title: "간판 속 한자", q: "광신석유 간판에서 ‘석유’를 뜻하는 한자는?", choices: ["石油", "商會", "寫眞"], answer: 0, photo: "/story/gwangshin.webp", hint: "간판의 光信 다음 두 글자예요" },
  { id: "m-jeotgal", title: "강경 젓갈의 시작", q: "강경에서 젓갈이 발달한 까닭은?", choices: ["팔고 남은 생선을 소금에 절여 오래 두려고", "겨울 김장에 쓰려고 일부러 만들어서", "멀리 바다 건너로 팔려고"], answer: 0, photo: "/story/daecheong.webp", hint: "덕배 장인이 항아리 이야기를 했어요" },
  { id: "m-tail", title: "화면 속 단서", q: "등대 화면 속, 강이 꼬리가 보인 건물은?", choices: ["붉은 벽돌에 쇠창살 창문이 달린 은행", "초록 간판의 사진관", "기와 차양을 두른 석유 가게"], answer: 0, photo: "/story/memory-lighthouse.webp", hint: "강이는 늘 기억을 ‘보관’하고 싶어 했어요" },
  { id: "m-vault", title: "금고 비밀번호", q: "이 은행이 한호농공은행 강경지점으로 처음 문을 연 해는?", choices: ["1905년", "1945년", "1988년"], answer: 0, hint: "건물 앞 안내판이나 ‘더 듣기’ 카드에 있어요" },
];
export const MISSION = Object.fromEntries(MISSIONS.map((m) => [m.id, m])) as Record<string, Mission>;
