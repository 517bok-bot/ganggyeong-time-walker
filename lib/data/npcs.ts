// NPC 데이터 — NPC 자체는 모두 '게임 창작 인물'입니다 (실존 인물·실제 상인이 아님).
// 역사/관광 정보 대사는 knowledgeId 로 승인 자료(knowledge.ts)를 참조합니다.

export interface DialogueChoice {
  label: string;
  next?: string;
  /** 대화 노드 대신 승인 자료를 낭독 */
  knowledgeId?: string;
  action?: "give-quest" | "give-items" | "open-jeotgal" | "close";
  questId?: string;
  items?: Record<string, number>;
}
export interface DialogueNode {
  text: string;
  choices: DialogueChoice[];
}
export interface Npc {
  id: string;
  name: string;
  title: string;
  /** 초상화 스타일 */
  look: { hat: string; outfit: string; skin: string; prop?: "jar" | "camera" | "letter" | "map" | "bag" };
  locationId?: string;
  greeting: string;
  dialogue: Record<string, DialogueNode>;
}

export const NPCS: Npc[] = [
  {
    id: "guide", name: "달래", title: "마을 안내인",
    look: { hat: "#263D40", outfit: "#B58B48", skin: "#F6D9BE", prop: "map" },
    locationId: "welcome-center",
    greeting: "어서 와요, 타임워커! 시간을 걷는 곳, 강경에 온 걸 환영해요.",
    dialogue: {
      start: { text: "무엇이 궁금한가요?", choices: [
        { label: "강경은 어떤 곳이었어요?", knowledgeId: "kd-port" },
        { label: "방문 안내를 알려주세요", knowledgeId: "kd-visit" },
        { label: "고양이 소문을 들었어요", next: "cats" },
        { label: "고마워요!", action: "close" },
      ]},
      cats: { text: "후후, 안내도에 붙은 '특별수배' 봤어요? 강이, 갱이, 콩이… 거리 어딘가에 숨어 있대요.", choices: [
        { label: "제가 찾아볼게요!", action: "give-quest", questId: "q-cat-family" },
        { label: "자세히 알려주세요", knowledgeId: "kd-cats" },
      ]},
    },
  },
  {
    id: "artisan", name: "덕배", title: "젓갈 장인",
    look: { hat: "#E8D8B8", outfit: "#963F38", skin: "#E9C3A0", prop: "jar" },
    greeting: "허허, 항아리 냄새를 맡고 왔구먼. 젓갈 이야기 좀 들어볼 텐가?",
    dialogue: {
      start: { text: "무엇을 도와줄까?", choices: [
        { label: "강경 젓갈은 왜 유명해요?", knowledgeId: "kd-jeotgal" },
        { label: "젓갈축제가 있다면서요?", knowledgeId: "kd-festival" },
        { label: "젓갈 만들기를 배우고 싶어요", next: "learn" },
        { label: "다음에 올게요", action: "close" },
      ]},
      learn: { text: "좋지! 게임 속 항아리로 연습해 보게나. 단, 여기서 쓰는 비율은 '게임 수치'일 뿐 실제 식품 제조법이 아니라네. 첫 재료는 내가 챙겨주지.", choices: [
        { label: "재료 받기 (새우 2, 소금 3)", action: "give-items", items: { shrimp: 2, salt: 3 } },
        { label: "항아리 공방으로 가기", action: "open-jeotgal" },
      ]},
    },
  },
  {
    id: "photographer", name: "은솔", title: "옛날 사진사",
    look: { hat: "#39332F", outfit: "#5A4033", skin: "#F3D2B5", prop: "camera" },
    locationId: "photo-studio",
    greeting: "찰칵! 오늘의 빛이 아주 좋네요. 기념 엽서 한 장 어때요?",
    dialogue: {
      start: { text: "엽서 공방은 2단계에서 문을 열어요. 대신 이야기를 들려드릴게요.", choices: [
        { label: "포구 시절 이야기", knowledgeId: "kd-port" },
        { label: "포구는 어떻게 변했어요?", knowledgeId: "kd-decline" },
        { label: "안녕히 계세요", action: "close" },
      ]},
    },
  },
  {
    id: "merchant", name: "만복", title: "근대거리 상인",
    look: { hat: "#963F38", outfit: "#263D40", skin: "#EFC9A6", prop: "bag" },
    locationId: "modern-store",
    greeting: "어서 오세요~ 모던상회에 고양이 손님이 자주 온다는 소문, 들으셨어요?",
    dialogue: {
      start: { text: "무엇을 찾으세요?", choices: [
        { label: "고양이 가족 소문", knowledgeId: "kd-cats" },
        { label: "멸치 좀 얻을 수 있을까요?", action: "give-items", items: { anchovy: 2 } },
        { label: "구경만 할게요", action: "close" },
      ]},
    },
  },
  {
    id: "postman", name: "포포", title: "까치 우체부",
    look: { hat: "#74302A", outfit: "#B58B48", skin: "#F6D9BE", prop: "letter" },
    locationId: "ganggyeong-gwan",
    greeting: "까악! 편지 왔어요~ 과거에서도, 미래에서도요. 학당의 편지는 까치들이 날라요.",
    dialogue: {
      start: { text: "시간 우체국은 4단계에서 문을 열어요. 미래의 방문객에게 편지를 남길 수 있게 될 거예요!", choices: [
        { label: "기대할게요!", action: "close" },
        { label: "축제 소식 있어요?", knowledgeId: "kd-festival" },
      ]},
    },
  },
];

export const NPC = Object.fromEntries(NPCS.map((n) => [n.id, n])) as Record<string, Npc>;
