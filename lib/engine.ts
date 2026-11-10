// 강경 타임워커 게임 엔진 (순수 함수)
// ─────────────────────────────────────────────────────────────
// 같은 코드가 두 곳에서 실행됩니다.
//  - 로컬 모드(Supabase 미설정): 브라우저에서 실행, 결과를 localStorage에 저장
//  - 서버 모드(로그인): /api/game/action 에서 실행 → 결과를 DB에 원자적으로 커밋
// 보상 값은 항상 이 파일과 lib/data/* 에서 결정합니다. 클라이언트가 보상 수치를 보내지 않습니다.
// QR 서명·GPS 거리 같은 '증명' 검증은 엔진 밖(API Route)에서 먼저 수행합니다.

import type { FoundMethod, GameState, JarRecord, VisitMethod } from "./types";
import { LOC, locLabel } from "./data/locations";
import { CHAR, CAT_FAMILY } from "./data/characters";
import { QUEST, QUIZ, questProgress } from "./data/quests";
import { JTYPE, JAR_SKINS, ITEMS, artisanLevel, scoreJar } from "./data/jeotgal";
import { NPC } from "./data/npcs";
import { PLACES, VILLAGE_REWARDS, VILLAGE_TREASURES, ONLINE_CHARACTERS } from "./data/village";
import { WEAR, type Slot } from "./data/wardrobe";
import { PICNIC, LOCATION_PICNIC, VILLAGE_PICNIC_SPOTS, PICNIC_FOOD_NEED } from "./data/picnic";
import { SPARKS_PER_DAY, sparkReward } from "./data/sparks";
import { CHAPTER, CHAPTERS, chapterProgress, MISSION } from "./data/story";
import { ERRAND, errandDone, errandReady, tradeFood } from "./data/errands";

export type Action =
  | { type: "visit"; locationId: string; method: VisitMethod }
  | { type: "findOnline"; charId: string }
  | { type: "villageFind"; key: string }
  | { type: "claimQuest"; questId: string }
  | { type: "talkNpc"; npcId: string }
  | { type: "readKnowledge"; id: string }
  | { type: "npcGift"; npcId: string; node: string; index: number }
  | { type: "startJar"; typeId: string; ratio: number; order: string[]; useSincerity: boolean; jarSkin: string }
  | { type: "openJar"; jarId: string; fastForward?: boolean }
  | { type: "answerQuiz"; quizId: string; answer: number }
  | { type: "contribute"; itemId: string }
  | { type: "postcard"; locationId: string }
  | { type: "profile"; name: string; avatar: string; house?: string }
  | { type: "buyWear"; wearId: string }
  | { type: "equip"; slot: Slot; wearId: string | null }
  | { type: "companion"; charId: string | null }
  | { type: "letter" }
  | { type: "picnic"; foods: string[] }
  | { type: "spark"; index: number }
  | { type: "chapter"; id: string }
  | { type: "mission"; id: string; answer: number }
  | { type: "couponIssue" }
  | { type: "couponUsed"; code: string }
  | { type: "errand"; id: string };

/** DB 정규화 테이블에 같이 기록할 부수 효과 (중복 방지 UNIQUE 제약·통계용) */
export interface Effects {
  visit?: { location_id: string; method: VisitMethod };
  collections: { item_type: string; item_id: string; method?: string }[];
  questClaim?: string;
  jar?: JarRecord;
  contribution?: { item_id: string; source: "real" | "online" };
}
export interface Msg { text: string; icon?: string }
export interface Outcome {
  ok: boolean;
  error?: string;
  state: GameState;
  newly: string[];
  messages: Msg[];
  effects: Effects;
  data?: { jar?: JarRecord; correct?: boolean; spark?: import("./data/sparks").SparkInfo };
}
export interface EngineCtx { now: number; allowDemo: boolean }

export const AVATAR_IDS = ["sage", "brick", "gold", "wood"];

export const initialState = (): GameState => ({
  version: 1,
  player: { name: "타임워커", avatar: "sage", level: 1, exp: 0, coins: 50, title: "새내기 타임워커" },
  visits: {},
  characters: {},
  quests: {},
  inventory: { shrimp: 2, salt: 4, anchovy: 1 },
  jars: [],
  artisanExp: 0,
  npcTalked: [],
  knowledgeRead: [],
  achievements: {},
  villageFound: [],
  communityContribution: 0,
  quizCorrect: [],
  postcardsMade: [],
  wardrobe: ["hat-fedora"],
  equipped: { hat: "hat-fedora" },
  companion: null,
  log: [],
});

/** 저장된 상태를 현재 형식으로 보정 (필드 추가 대비) */
export function normalize(raw: unknown): GameState {
  const base = initialState();
  if (!raw || typeof raw !== "object") return base;
  const r = raw as Partial<GameState>;
  return { ...base, ...r, player: { ...base.player, ...(r.player ?? {}) }, postcardsMade: r.postcardsMade ?? [],
    wardrobe: r.wardrobe ?? base.wardrobe, equipped: r.equipped ?? base.equipped, companion: r.companion ?? null, lettersSent: r.lettersSent ?? 0,
    picnic: r.picnic ?? {}, picnicsHeld: r.picnicsHeld ?? 0, sparks: r.sparks ?? { day: "", got: [] }, sparkTotal: r.sparkTotal ?? 0, story: r.story ?? [], missions: r.missions ?? [], errands: r.errands ?? { day: "", done: [] } };
}

export const expToNext = (level: number) => 100 + (level - 1) * 50;
/** 현장에서 받은 진한 도장 수 (실물 엽서 쿠폰 기준) */
export const realStamps = (s: GameState) => Object.values(s.visits).filter((v) => v.method !== "online").length;
export const FREE_PRINT_STAMPS = 5;

function applyExp(s: GameState, exp: number, coins: number): GameState {
  let { level, exp: e } = s.player;
  e += exp;
  while (e >= expToNext(level)) { e -= expToNext(level); level++; }
  return { ...s, player: { ...s.player, level, exp: e, coins: s.player.coins + coins } };
}
function addItems(s: GameState, items?: Record<string, number>): GameState {
  if (!items) return s;
  const inv = { ...s.inventory };
  for (const [k, v] of Object.entries(items)) inv[k] = Math.max(0, (inv[k] ?? 0) + v);
  return { ...s, inventory: inv };
}
function addPicnic(s: GameState, id: string, n = 1): GameState {
  const p = { ...(s.picnic ?? {}) };
  p[id] = Math.max(0, (p[id] ?? 0) + n);
  return { ...s, picnic: p };
}
const dayKey = (now: number) => new Date(now + 9 * 3600_000).toISOString().slice(0, 10); // 한국 시간 기준 날짜
const log = (s: GameState, text: string, now: number): GameState => ({ ...s, log: [{ at: now, text }, ...s.log].slice(0, 60) });

class Run {
  s: GameState; newly: string[] = []; messages: Msg[] = []; effects: Effects = { collections: [] };
  data: Outcome["data"];
  constructor(s: GameState, public ctx: EngineCtx) { this.s = s; }
  msg(text: string, icon?: string) { this.messages.push({ text, icon }); }
  discover(charId: string, method: FoundMethod, place: string) {
    const s = this.s;
    if (s.characters[charId] || !CHAR[charId]) return;
    this.newly.push(charId);
    let n: GameState = { ...s, characters: { ...s.characters, [charId]: { method, at: this.ctx.now, place } } };
    n = applyExp(n, 40, 10);
    n = log(n, `${CHAR[charId].name}을(를) 만났어요! (${place})`, this.ctx.now);
    this.effects.collections.push({ item_type: "character", item_id: charId, method });
    if (CAT_FAMILY.every((c) => n.characters[c]) && !n.achievements["cat-family"]) {
      n = { ...n, achievements: { ...n.achievements, "cat-family": this.ctx.now } };
      n = log(n, "업적 달성: 고양이 가족 완성!", this.ctx.now);
      this.effects.collections.push({ item_type: "achievement", item_id: "cat-family" });
    }
    this.s = n;
  }
  done(): Outcome {
    return { ok: true, state: this.s, newly: this.newly, messages: this.messages, effects: this.effects, data: this.data };
  }
}

const fail = (s: GameState, error: string): Outcome => ({ ok: false, error, state: s, newly: [], messages: [], effects: { collections: [] } });

export function applyAction(state: GameState, a: Action, ctx: EngineCtx): Outcome {
  const r = new Run(state, ctx);
  const s = state;
  const now = ctx.now;

  switch (a.type) {
    case "visit": {
      const loc = LOC[a.locationId];
      if (!loc) return fail(s, "알 수 없는 장소예요");
      if (!["gps", "qr", "demo", "online"].includes(a.method)) return fail(s, "잘못된 인증 방식");
      if (a.method === "demo" && !ctx.allowDemo) return fail(s, "시뮬레이션은 비활성화되어 있어요");
      const prev = s.visits[a.locationId];
      const online = a.method === "online";
      if (prev && (online || prev.method !== "online")) return fail(s, online ? "이미 도장을 받은 장소예요" : "이미 방문 인증한 장소예요 (중복 보상 없음)");
      if (prev) {
        // 흐린 도장 → 진한 도장: 현장에 직접 와서 다시 찍으면 남은 보상과 현장 친구를 받아요
        let n: GameState = { ...s, visits: { ...s.visits, [a.locationId]: { method: a.method, at: now } } };
        n = applyExp(n, loc.reward.exp - Math.floor(loc.reward.exp / 2), loc.reward.coins - Math.floor(loc.reward.coins / 2));
        n = addItems(n, loc.reward.items);
        r.s = log(n, `${locLabel(loc)} 현장 방문! 흐린 도장이 진한 도장으로 바뀌었어요`, now);
        r.effects.visit = { location_id: loc.id, method: a.method };
        for (const c of loc.characterIds ?? []) {
          if (r.s.characters[c]?.method === "online") r.s = { ...r.s, characters: { ...r.s.characters, [c]: { ...r.s.characters[c], method: "real", place: locLabel(loc) } } };
          else r.discover(c, "real", locLabel(loc));
        }
        r.msg(`${locLabel(loc)} 진한 도장 완성! 직접 와 줘서 고마워요`, "📍");
        return r.done();
      }
      if (online) {
        let n: GameState = { ...s, visits: { ...s.visits, [a.locationId]: { method: "online", at: now } } };
        n = applyExp(n, Math.floor(loc.reward.exp / 2), Math.floor(loc.reward.coins / 2));
        r.s = log(n, `${locLabel(loc)} 온라인 방문 (흐린 도장)`, now);
        r.effects.collections.push({ item_type: "online_visit", item_id: loc.id });
        for (const c of loc.characterIds ?? []) r.discover(c, "online", `${locLabel(loc)} (온라인)`);
        r.msg(`${locLabel(loc)} 흐린 도장! 강경에 오면 진한 도장으로 바꿀 수 있어요`, "🏠");
        return r.done();
      }
      let n: GameState = { ...s, visits: { ...s.visits, [a.locationId]: { method: a.method, at: now } } };
      n = applyExp(n, loc.reward.exp, loc.reward.coins);
      n = addItems(n, loc.reward.items);
      r.s = log(n, `${locLabel(loc)} 방문 인증 (${a.method.toUpperCase()})`, now);
      r.effects.visit = { location_id: loc.id, method: a.method };
      const drop = LOCATION_PICNIC(loc.no);
      r.s = addPicnic(r.s, drop);
      r.msg(`소풍 보따리에 ‘${PICNIC[drop].name}’을(를) 담았어요`, "🎁");
      for (const c of loc.characterIds ?? []) r.discover(c, "real", locLabel(loc));
      r.msg(`${locLabel(loc)} 방문 완료! +${loc.reward.exp}EXP +${loc.reward.coins}코인`, "📍");
      return r.done();
    }
    case "findOnline": {
      const place = ONLINE_CHARACTERS[a.charId];
      if (!place) return fail(s, "온라인 마을에서 찾을 수 없는 캐릭터예요");
      if (s.characters[a.charId]) return fail(s, "이미 만난 친구예요");
      r.discover(a.charId, "online", `온라인 마을 · ${place}`);
      return r.done();
    }
    case "villageFind": {
      if (s.villageFound.includes(a.key)) return fail(s, "이미 발견했어요");
      let reward: { exp: number; coins: number; items?: Record<string, number> };
      if (a.key.startsWith("place:")) {
        if (!PLACES.some((p) => `place:${p.key}` === a.key)) return fail(s, "알 수 없는 장소");
        reward = VILLAGE_REWARDS.place;
      } else if (a.key.startsWith("picnic:")) {
        const spot = VILLAGE_PICNIC_SPOTS.find((p) => p.key === a.key);
        if (!spot) return fail(s, "알 수 없는 보따리");
        r.s = log(addPicnic({ ...s, villageFound: [...s.villageFound, a.key] }, spot.item), `반짝이는 보따리에서 ${PICNIC[spot.item].name}을(를) 찾았어요`, now);
        r.msg(`반짝이는 보따리! ‘${PICNIC[spot.item].name}’ 획득`, "🎁");
        return r.done();
      } else if (VILLAGE_TREASURES.includes(a.key)) reward = VILLAGE_REWARDS.treasure;
      else if (a.key === "reunion") {
        if (!CAT_FAMILY.every((c) => s.characters[c])) return fail(s, "아직 고양이 가족이 다 모이지 않았어요");
        reward = VILLAGE_REWARDS.reunion;
      } else return fail(s, "알 수 없는 항목");
      r.s = addItems(applyExp({ ...s, villageFound: [...s.villageFound, a.key] }, reward.exp, reward.coins), reward.items);
      r.effects.collections.push({ item_type: a.key.startsWith("place:") ? "online_place" : "treasure", item_id: a.key, method: "online" });
      if (a.key.startsWith("place:")) r.msg(`온라인 탐험: ${PLACES.find((p) => `place:${p.key}` === a.key)!.label} 발견! +${reward.exp}EXP`, "🏘️");
      else if (a.key === "reunion") r.msg("고양이 가족 재회! +30EXP", "🐾");
      else r.msg("숨겨진 보물 발견! 소금×3, 정성 한 스푼×1", "💎");
      return r.done();
    }
    case "claimQuest": {
      const q = QUEST[a.questId];
      if (!q) return fail(s, "알 수 없는 퀘스트");
      const p = questProgress(q, s);
      if (p.claimed) return fail(s, "이미 보상을 받았어요");
      if (!p.complete) return fail(s, "아직 완료하지 않은 퀘스트예요");
      let n: GameState = { ...s, quests: { ...s.quests, [q.id]: { claimedAt: now } } };
      n = addItems(applyExp(n, q.reward.exp, q.reward.coins), q.reward.items);
      if (q.reward.badge) {
        n = { ...n, achievements: { ...n.achievements, [`badge:${q.reward.badge}`]: now } };
        r.effects.collections.push({ item_type: "achievement", item_id: `badge:${q.reward.badge}` });
      }
      r.s = log(n, `퀘스트 완료: ${q.title}`, now);
      r.effects.questClaim = q.id;
      r.msg(`퀘스트 보상 획득! +${q.reward.exp}EXP +${q.reward.coins}코인`, "🏅");
      return r.done();
    }
    case "talkNpc": {
      if (!NPC[a.npcId]) return fail(s, "알 수 없는 NPC");
      if (s.npcTalked.includes(a.npcId)) return r.done();
      r.s = applyExp({ ...s, npcTalked: [...s.npcTalked, a.npcId] }, 15, 5);
      r.effects.collections.push({ item_type: "npc", item_id: a.npcId });
      return r.done();
    }
    case "readKnowledge": {
      if (typeof a.id !== "string" || a.id.length > 64) return fail(s, "잘못된 요청");
      if (s.knowledgeRead.includes(a.id)) return r.done();
      r.s = applyExp({ ...s, knowledgeRead: [...s.knowledgeRead, a.id] }, 10, 0);
      r.effects.collections.push({ item_type: "knowledge", item_id: a.id });
      r.msg("역사 이야기 도감에 기록됐어요", "📜");
      return r.done();
    }
    case "npcGift": {
      const npc = NPC[a.npcId];
      const choice = npc?.dialogue[a.node]?.choices[a.index];
      if (!choice || choice.action !== "give-items" || !choice.items) return fail(s, "받을 수 있는 선물이 없어요");
      const key = `gift:${npc.id}:${Object.keys(choice.items).join("-")}`;
      if (s.villageFound.includes(key)) return fail(s, "이미 받은 선물이에요");
      const why = `${npc.name}에게 ${Object.entries(choice.items).map(([k, v]) => `${ITEMS[k].name} ${v}`).join(", ")}을(를) 받았어요`;
      r.s = log(addItems({ ...s, villageFound: [...s.villageFound, key] }, choice.items), why, now);
      r.msg(why, "🎁");
      return r.done();
    }
    case "startJar": {
      const t = JTYPE[a.typeId];
      if (!t) return fail(s, "알 수 없는 젓갈");
      const lv = artisanLevel(s.artisanExp);
      if (lv < t.unlockLevel) return fail(s, "아직 해금되지 않은 레시피예요");
      const skin = JAR_SKINS.find((k) => k.id === a.jarSkin);
      if (!skin || lv < skin.unlock) return fail(s, "사용할 수 없는 항아리예요");
      const ratio = Math.round(Number(a.ratio));
      if (!(ratio >= 5 && ratio <= 60)) return fail(s, "비율 범위를 벗어났어요");
      const order = Array.isArray(a.order) ? a.order.slice(0, 3) : [];
      if (order.length !== 3 || new Set(order).size !== 3 || !order.every((o) => ["main", "salt", "topsalt"].includes(o))) return fail(s, "재료를 모두 담아 주세요");
      if (s.jars.filter((j) => j.status === "aging").length >= 6) return fail(s, "숙성 중인 항아리가 너무 많아요 (최대 6개)");
      const ing: Record<string, number> = { [t.main]: t.mainNeed, salt: t.saltNeed };
      if (a.useSincerity) ing.sincerity = 1;
      for (const [k, v] of Object.entries(ing)) if ((s.inventory[k] ?? 0) < v) return fail(s, "재료가 부족해요");
      const jar: JarRecord = { id: `jar-${now}`, typeId: t.id, ingredients: ing, ratio, order, jarSkin: skin.id, startedAt: now, readyAt: now + t.agingMinutes * 60_000, status: "aging" };
      const neg = Object.fromEntries(Object.entries(ing).map(([k, v]) => [k, -v]));
      r.s = log({ ...addItems(s, neg), jars: [jar, ...s.jars] }, `${t.name} 항아리를 담갔어요`, now);
      r.effects.jar = jar;
      r.data = { jar };
      r.msg(`${t.name} 숙성 시작! ${t.agingMinutes}분 뒤에 열어보세요`, "🏺");
      return r.done();
    }
    case "openJar": {
      const jar = s.jars.find((j) => j.id === a.jarId);
      if (!jar || jar.status === "done") return fail(s, "열 수 있는 항아리가 없어요");
      if (now < jar.readyAt && !(a.fastForward && ctx.allowDemo)) return fail(s, "아직 숙성 중이에요");
      const { score, grade } = scoreJar(jar.typeId, jar.ratio, jar.order, jar.ingredients.sincerity ?? 0);
      const done: JarRecord = { ...jar, status: "done", score, grade: grade.name, finishedAt: now };
      const before = artisanLevel(s.artisanExp);
      let n: GameState = { ...s, jars: s.jars.map((j) => (j.id === jar.id ? done : j)), artisanExp: s.artisanExp + 40 + score };
      n = applyExp(n, 30 + Math.round(score / 2), 10 + Math.round(score / 5));
      const after = artisanLevel(n.artisanExp);
      if (after > before) { n = log(n, `젓갈 장인 레벨 ${after} 달성!`, now); r.msg(`젓갈 장인 레벨 ${after} 달성!`, "🏺"); }
      r.s = log(n, `${JTYPE[jar.typeId].name} 완성: ${grade.name} (${score}점)`, now);
      r.effects.jar = done;
      r.effects.collections.push({ item_type: "jeotgal", item_id: jar.typeId });
      r.data = { jar: done };
      return r.done();
    }
    case "answerQuiz": {
      const z = QUIZ.find((q) => q.id === a.quizId);
      if (!z) return fail(s, "알 수 없는 퀴즈");
      const correct = a.answer === z.answer;
      r.data = { correct };
      if (correct && !s.quizCorrect.includes(z.id)) r.s = applyExp({ ...s, quizCorrect: [...s.quizCorrect, z.id] }, 20, 10);
      return r.done();
    }
    case "contribute": {
      if (!["shrimp", "anchovy", "salt", "yellowfish"].includes(a.itemId)) return fail(s, "기여할 수 없는 재료예요");
      if ((s.inventory[a.itemId] ?? 0) < 1) return fail(s, "재료가 부족해요");
      r.s = applyExp({ ...addItems(s, { [a.itemId]: -1 }), communityContribution: s.communityContribution + 1 }, 5, 2);
      r.effects.contribution = { item_id: a.itemId, source: Object.keys(s.visits).length ? "real" : "online" };
      r.msg(`${ITEMS[a.itemId].name} 1개를 공동 항아리에 넣었어요!`, "🏺");
      return r.done();
    }
    case "postcard": {
      if (!s.visits[a.locationId]) return fail(s, "방문 인증한 장소에서만 엽서를 만들 수 있어요");
      if (s.postcardsMade.includes(a.locationId)) return r.done(); // 다시 만들기는 가능, 보상은 1회
      r.s = log(applyExp({ ...s, postcardsMade: [...s.postcardsMade, a.locationId] }, 20, 10), `${locLabel(LOC[a.locationId])} 엽서를 만들었어요`, now);
      r.effects.collections.push({ item_type: "postcard", item_id: a.locationId });
      r.msg("기념 엽서 완성! +20EXP", "💌");
      return r.done();
    }
    case "profile": {
      const name = String(a.name ?? "").replace(/[<>]/g, "").trim().slice(0, 12) || "타임워커";
      if (!AVATAR_IDS.includes(a.avatar)) return fail(s, "알 수 없는 의상");
      const houses = ["cheongryong", "jujak", "baekho", "hyeonmu"];
      if (a.house !== undefined && !houses.includes(a.house)) return fail(s, "알 수 없는 수호 신수");
      r.s = { ...s, player: { ...s.player, name, avatar: a.avatar, house: a.house ?? s.player.house } };
      return r.done();
    }
    case "buyWear": {
      const w = WEAR[a.wearId];
      if (!w) return fail(s, "알 수 없는 아이템");
      if (s.wardrobe.includes(w.id)) return fail(s, "이미 가지고 있어요");
      if (s.player.coins < w.price) return fail(s, "코인이 부족해요");
      const n: GameState = { ...s, wardrobe: [...s.wardrobe, w.id], player: { ...s.player, coins: s.player.coins - w.price },
        equipped: { ...s.equipped, [w.slot]: w.id } };
      r.s = log(n, `${w.name}을(를) 샀어요`, now);
      r.msg(`${w.name} 획득! 바로 착용했어요`, w.emoji);
      return r.done();
    }
    case "equip": {
      if (!["hat", "neck", "face", "outfit", "prop"].includes(a.slot)) return fail(s, "잘못된 부위");
      if (a.wearId !== null && (!s.wardrobe.includes(a.wearId) || WEAR[a.wearId]?.slot !== a.slot)) return fail(s, "가지고 있지 않은 아이템이에요");
      r.s = { ...s, equipped: { ...s.equipped, [a.slot]: a.wearId ?? undefined } };
      return r.done();
    }
    case "companion": {
      if (a.charId !== null && !s.characters[a.charId]) return fail(s, "만난 적 있는 친구만 동행할 수 있어요");
      r.s = { ...s, companion: a.charId };
      if (a.charId) r.msg(`${CHAR[a.charId].name}이(가) 함께 여행해요!`, "🐾");
      return r.done();
    }
    case "picnic": {
      const foods = Array.isArray(a.foods) ? [...new Set(a.foods)].slice(0, 5) : [];
      const bag = s.picnic ?? {};
      if ((bag.mat ?? 0) < 1 || (bag.basket ?? 0) < 1) return fail(s, "돗자리와 소풍 바구니가 있어야 소풍을 펼칠 수 있어요");
      if (foods.length < PICNIC_FOOD_NEED || !foods.every((f) => PICNIC[f]?.kind === "food")) return fail(s, `서로 다른 먹을거리 ${PICNIC_FOOD_NEED}가지를 골라 주세요`);
      if (!foods.every((f) => (bag[f] ?? 0) >= 1)) return fail(s, "보따리에 없는 먹을거리가 있어요");
      const today = dayKey(now);
      if (s.lastPicnicDay === today) return fail(s, "소풍은 하루에 한 번! 내일 또 펼쳐요");
      let st: GameState = s;
      for (const f of foods) st = addPicnic(st, f, -1);
      const held = (s.picnicsHeld ?? 0) + 1;
      st = applyExp({ ...st, picnicsHeld: held, lastPicnicDay: today }, 40 + foods.length * 5, 25);
      st = addItems(st, { sincerity: 1 });
      if (held === 1) {
        st = { ...st, achievements: { ...st.achievements, "badge:강경 소풍객": now } };
        r.effects.collections.push({ item_type: "achievement", item_id: "badge:강경 소풍객" });
      }
      r.s = log(st, `금강 둑에서 소풍을 펼쳤어요 (${foods.map((f) => PICNIC[f].name).join(", ")})`, now);
      r.msg(held === 1 ? "첫 소풍! ‘강경 소풍객’ 배지와 정성 한 스푼을 받았어요" : "즐거운 소풍! 정성 한 스푼을 받았어요", "🎉");
      return r.done();
    }
    case "spark": {
      const i = a.index;
      if (!Number.isInteger(i) || i < 0 || i >= SPARKS_PER_DAY) return fail(s, "사라진 시간 조각이에요");
      const today = dayKey(now);
      const cur = s.sparks?.day === today ? s.sparks.got : [];
      if (cur.includes(i)) return fail(s, "이미 모은 시간 조각이에요");
      const info = sparkReward(today, i);
      let st: GameState = { ...s, sparks: { day: today, got: [...cur, i] }, sparkTotal: (s.sparkTotal ?? 0) + 1 };
      st = applyExp(st, info.exp, info.coins);
      st = addItems(st, info.items);
      if (info.picnic) st = addPicnic(st, info.picnic);
      if (cur.length + 1 === SPARKS_PER_DAY) { st = applyExp(st, 40, 30); r.msg("오늘의 시간 조각을 모두 모았어요! 보너스 +40EXP", "✨"); }
      r.s = st;
      r.data = { spark: info };
      return r.done();
    }
    case "chapter": {
      const c = CHAPTER[a.id];
      if (!c) return fail(s, "없는 이야기예요");
      const story = s.story ?? [];
      if (story.includes(c.id)) return fail(s, "이미 마친 장이에요");
      const next = CHAPTERS.find((x) => !story.includes(x.id));
      if (next?.id !== c.id) return fail(s, "앞 장을 먼저 마쳐 주세요");
      if (!chapterProgress(c, s).complete) return fail(s, "아직 이 장의 목표를 다 이루지 못했어요");
      let st: GameState = { ...s, story: [...story, c.id] };
      st = applyExp(st, c.reward.exp, c.reward.coins);
      st = addItems(st, c.reward.items);
      if (c.reward.badge) {
        st = { ...st, achievements: { ...st.achievements, [`badge:${c.reward.badge}`]: now } };
        r.effects.collections.push({ item_type: "achievement", item_id: `badge:${c.reward.badge}` });
      }
      r.s = log(st, `${c.no} 「${c.title}」을(를) 마쳤어요`, now);
      r.msg(`${c.no} 완료! +${c.reward.exp}EXP · 엽전 ${c.reward.coins}`, "📜");
      return r.done();
    }
    case "mission": {
      const m = MISSION[a.id];
      if (!m) return fail(s, "없는 미션이에요");
      const done = s.missions ?? [];
      if (done.includes(m.id)) return fail(s, "이미 푼 미션이에요");
      if (!Number.isInteger(a.answer) || a.answer < 0 || a.answer >= m.choices.length) return fail(s, "잘못된 답");
      if (a.answer !== m.answer) { r.data = { correct: false }; return r.done(); }
      let st: GameState = { ...s, missions: [...done, m.id] };
      st = applyExp(st, 20, 10);
      r.s = log(st, `미션 「${m.title}」 성공`, now);
      r.data = { correct: true };
      r.msg(`미션 성공! +20EXP · 엽전 10`, "🎯");
      return r.done();
    }
    case "couponIssue": {
      if (s.coupon) return fail(s, "이미 쿠폰을 받았어요");
      if (realStamps(s) < FREE_PRINT_STAMPS) return fail(s, `현장 도장 ${FREE_PRINT_STAMPS}개가 필요해요`);
      // 1회용 번호 6자리 (헷갈리는 글자 0·O·1·I 제외)
      const ABC = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
      let h = 2166136261 >>> 0; for (const ch of `${now}|${s.player.name}|${Object.keys(s.visits).join(",")}`) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619) >>> 0; }
      let code = ""; for (let i = 0; i < 6; i++) { code += ABC[h % ABC.length]; h = Math.imul(h ^ (h >>> 13), 2654435761) >>> 0; }
      r.s = log({ ...s, coupon: { code, issuedAt: now } }, `엽서 무료 인쇄 쿠폰을 받았어요 (${code})`, now);
      r.msg("엽서 무료 인쇄 쿠폰이 열렸어요!", "🎟️");
      return r.done();
    }
    case "couponUsed": {
      if (!s.coupon || s.coupon.code !== a.code) return fail(s, "쿠폰 정보가 맞지 않아요");
      if (s.coupon.usedAt) return fail(s, "이미 사용한 쿠폰이에요");
      r.s = log({ ...s, coupon: { ...s.coupon, usedAt: now } }, "엽서 무료 인쇄 쿠폰을 사용했어요", now);
      return r.done();
    }
    case "errand": {
      const e = ERRAND[a.id];
      if (!e) return fail(s, "없는 부탁이에요");
      const today = dayKey(now);
      if (errandDone(s, e.id, today)) return fail(s, "오늘은 이미 들어준 부탁이에요. 내일 또 와요!");
      if (!errandReady(e, s, today)) return fail(s, e.kind === "give" ? "가방에 필요한 재료가 모자라요" : e.kind === "trade" ? "바꿀 소풍 먹을거리가 없어요" : `아직 조건이 안 됐어요 (${e.checkHint ?? ""})`);
      let st: GameState = s;
      if (e.kind === "give") st = addItems(st, Object.fromEntries(Object.entries(e.need ?? {}).map(([k, n]) => [k, -n])));
      if (e.kind === "trade") st = addPicnic(st, tradeFood(st)!, -1);
      const done = s.errands?.day === today ? s.errands.done : [];
      st = { ...st, errands: { day: today, done: [...done, e.id] } };
      st = applyExp(st, e.reward.exp, e.reward.coins);
      st = addItems(st, e.reward.items);
      r.s = log(st, `이웃 부탁 완료: ${e.title}`, now);
      r.msg(`${e.title} 완료! +${e.reward.exp}EXP · 엽전 ${e.reward.coins}`, "🎁");
      return r.done();
    }
    case "letter": {
      const n = (s.lettersSent ?? 0) + 1;
      let st: GameState = { ...s, lettersSent: n };
      if (n === 1) {
        st = applyExp(st, 30, 20);
        st = { ...st, achievements: { ...st.achievements, "badge:시간 우체부의 벗": now } };
        r.effects.collections.push({ item_type: "achievement", item_id: "badge:시간 우체부의 벗" });
        r.msg("첫 편지를 부쳤어요! +30EXP · ‘시간 우체부의 벗’ 배지", "💌");
      } else r.msg("편지를 부쳤어요", "💌");
      r.s = log(st, "시간 우체국에 편지를 부쳤어요", now);
      return r.done();
    }
    default:
      return fail(s, "알 수 없는 행동");
  }
}
