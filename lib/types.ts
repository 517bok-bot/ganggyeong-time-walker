export type VisitMethod = "gps" | "qr" | "demo";
export type Proof = { qr?: string; gps?: { lat: number; lng: number; accuracy: number } };
export type FoundMethod = "real" | "online";

export interface JarRecord {
  id: string;
  typeId: string;
  ingredients: Record<string, number>;
  ratio: number; // 소금 비율(게임 수치, %)
  order: string[];
  startedAt: number;
  readyAt: number;
  status: "aging" | "done";
  grade?: string;
  score?: number;
  finishedAt?: number;
  jarSkin: string;
}

export interface GameState {
  version: 1;
  player: { name: string; avatar: string; level: number; exp: number; coins: number; title: string; house?: string };
  visits: Record<string, { method: VisitMethod; at: number }>;
  characters: Record<string, { method: FoundMethod; at: number; place: string }>;
  quests: Record<string, { claimedAt: number }>;
  inventory: Record<string, number>;
  jars: JarRecord[];
  artisanExp: number;
  npcTalked: string[];
  knowledgeRead: string[];
  achievements: Record<string, number>;
  villageFound: string[];
  communityContribution: number;
  quizCorrect: string[];
  /** 엽서를 만든 장소 (장소당 1회 보상) */
  postcardsMade: string[];
  /** 3단계: 보유 의상, 착용 중인 의상, 동행 캐릭터 */
  wardrobe: string[];
  equipped: { hat?: string; neck?: string; face?: string; outfit?: string; prop?: string };
  companion?: string | null;
  /** 시간 우체국: 보낸 편지 수 */
  lettersSent?: number;
  /** 소풍: 보따리 속 아이템, 연 소풍 횟수, 마지막 소풍 날짜(YYYY-MM-DD) */
  picnic?: Record<string, number>;
  picnicsHeld?: number;
  lastPicnicDay?: string;
  sparks?: { day: string; got: number[] };
  sparkTotal?: number;
  story?: string[];
  lastDaily?: string;
  log: { at: number; text: string }[];
}
