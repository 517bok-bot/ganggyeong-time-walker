// 게임 엔진 규칙 테스트: npx tsx tests/engine.test.ts
import assert from "node:assert/strict";
import { applyAction, initialState, type Action } from "../lib/engine";
import type { GameState } from "../lib/types";

let passed = 0;
const t = (name: string, fn: () => void) => { fn(); passed++; console.log("✓", name); };
const now = 1_762_650_000_000;
const ctx = { now, allowDemo: false };
const run = (s: GameState, a: Action, c = ctx) => applyAction(s, a, c);

t("QR 방문: 보상·캐릭터 발견·중복 차단", () => {
  const s0 = initialState();
  const r = run(s0, { type: "visit", locationId: "gwangshin", method: "qr" });
  assert.ok(r.ok);
  assert.ok(r.state.visits.gwangshin);
  assert.deepEqual(r.newly, ["kaengi"]);
  assert.equal(r.effects.visit?.location_id, "gwangshin");
  assert.ok(r.state.player.coins > s0.player.coins);
  const dup = run(r.state, { type: "visit", locationId: "gwangshin", method: "gps" });
  assert.equal(dup.ok, false);
  assert.equal(dup.state, r.state); // 실패 시 상태 불변
});

t("시뮬레이션 방문은 allowDemo 일 때만", () => {
  assert.equal(run(initialState(), { type: "visit", locationId: "welcome-center", method: "demo" }).ok, false);
  assert.ok(run(initialState(), { type: "visit", locationId: "welcome-center", method: "demo" }, { now, allowDemo: true }).ok);
});

t("스윗포: 커피인터뷰 현장 발견 / 온라인 발견", () => {
  const r = run(initialState(), { type: "visit", locationId: "coffee-interview", method: "qr" });
  assert.deepEqual(r.newly, ["sweetpo"]);
  const o = run(initialState(), { type: "findOnline", charId: "sweetpo" });
  assert.ok(o.ok); assert.equal(o.state.characters.sweetpo.method, "online");
});

t("온라인 발견은 마을에 숨은 캐릭터만", () => {
  assert.equal(run(initialState(), { type: "findOnline", charId: "nope" }).ok, false);
});

t("마을 보상은 서버 표에서 결정 · 가족 재회 조건", () => {
  const r = run(initialState(), { type: "villageFind", key: "place:gallery" });
  assert.ok(r.ok); assert.equal(r.state.player.exp, 10);
  assert.equal(run(initialState(), { type: "villageFind", key: "place:hacked" }).ok, false);
  assert.equal(run(initialState(), { type: "villageFind", key: "reunion" }).ok, false);
  let s = initialState();
  for (const c of ["kangi", "kaengi", "kongi"]) s = run(s, { type: "findOnline", charId: c }).state;
  assert.ok(s.achievements["cat-family"]);
  assert.ok(run(s, { type: "villageFind", key: "reunion" }).ok);
});

t("퀘스트: 미완료 거절, 완료 1회만 수령", () => {
  const s0 = initialState();
  assert.equal(run(s0, { type: "claimQuest", questId: "q-first-step" }).ok, false);
  const s1 = run(s0, { type: "visit", locationId: "welcome-center", method: "qr" }).state;
  const c = run(s1, { type: "claimQuest", questId: "q-first-step" });
  assert.ok(c.ok); assert.equal(c.effects.questClaim, "q-first-step");
  assert.equal(run(c.state, { type: "claimQuest", questId: "q-first-step" }).ok, false);
});

t("젓갈: 재료·해금·비율·순서 검증, 숙성 전 개봉 불가", () => {
  const s0 = initialState();
  const bad = { type: "startJar", typeId: "saeu", ratio: 30, order: ["main", "salt"], useSincerity: false, jarSkin: "basic" } as const;
  assert.equal(run(s0, { ...bad, order: [...bad.order] }).ok, false);
  assert.equal(run(s0, { ...bad, order: ["main", "salt", "topsalt"], ratio: 99 }).ok, false);
  assert.equal(run(s0, { ...bad, order: ["main", "salt", "topsalt"], typeId: "hwangseogeo" }).ok, false); // 레벨 잠금
  assert.equal(run(s0, { ...bad, order: ["main", "salt", "topsalt"], jarSkin: "gold" }).ok, false);   // 항아리 잠금
  const r = run(s0, { ...bad, order: ["main", "salt", "topsalt"] });
  assert.ok(r.ok); assert.equal(r.state.inventory.shrimp, 0); assert.equal(r.state.inventory.salt, 2);
  const jar = r.data!.jar!;
  assert.equal(run(r.state, { type: "openJar", jarId: jar.id }).ok, false);
  assert.equal(run(r.state, { type: "openJar", jarId: jar.id, fastForward: true }).ok, false); // 데모 아님
  const later = run(r.state, { type: "openJar", jarId: jar.id }, { now: jar.readyAt + 1, allowDemo: false });
  assert.ok(later.ok); assert.equal(later.data!.jar!.status, "done"); assert.ok(later.state.artisanExp > 0);
  assert.equal(run(later.state, { type: "openJar", jarId: jar.id }, { now: jar.readyAt + 2, allowDemo: false }).ok, false);
});

t("NPC 선물: 정의된 선택지만, 1회", () => {
  const g = run(initialState(), { type: "npcGift", npcId: "artisan", node: "learn", index: 0 });
  assert.ok(g.ok); assert.equal(g.state.inventory.shrimp, 4);
  assert.equal(run(g.state, { type: "npcGift", npcId: "artisan", node: "learn", index: 0 }).ok, false);
  assert.equal(run(initialState(), { type: "npcGift", npcId: "artisan", node: "start", index: 0 }).ok, false);
});

t("퀴즈 정답은 서버가 판정", () => {
  const w = run(initialState(), { type: "answerQuiz", quizId: "qz1", answer: 0 });
  assert.equal(w.data!.correct, false); assert.equal(w.state.quizCorrect.length, 0);
  const c = run(initialState(), { type: "answerQuiz", quizId: "qz1", answer: 1 });
  assert.equal(c.data!.correct, true); assert.deepEqual(c.state.quizCorrect, ["qz1"]);
});

t("엽서: 방문한 장소만, 보상 1회", () => {
  assert.equal(run(initialState(), { type: "postcard", locationId: "gallery" }).ok, false);
  const s = run(initialState(), { type: "visit", locationId: "gallery", method: "qr" }).state;
  const p1 = run(s, { type: "postcard", locationId: "gallery" });
  const p2 = run(p1.state, { type: "postcard", locationId: "gallery" });
  assert.ok(p1.ok && p2.ok); assert.equal(p2.state.player.exp, p1.state.player.exp);
});

t("공동 항아리 기여: 재고 필요", () => {
  const s = initialState(); s.inventory.anchovy = 0;
  assert.equal(run(s, { type: "contribute", itemId: "anchovy" }).ok, false);
  const r = run(initialState(), { type: "contribute", itemId: "salt" });
  assert.ok(r.ok); assert.equal(r.effects.contribution?.item_id, "salt");
});

t("프로필 입력 정리", () => {
  const r = run(initialState(), { type: "profile", name: "<script>아주아주긴이름입니다요", avatar: "brick" });
  assert.equal(r.state.player.name, "script아주아주긴이"); assert.equal(r.state.player.avatar, "brick");
  assert.equal(run(initialState(), { type: "profile", name: "a", avatar: "x" }).ok, false);
});

t("3단계 옷장: 레벨·코인·소유 검사", () => {
  const s0 = initialState();
  assert.equal(run(s0, { type: "buyWear", wearId: "hat-cat" }).ok, false);           // 레벨 4 필요
  const poor = { ...s0, player: { ...s0.player, coins: 10 } };
  assert.equal(run(poor, { type: "buyWear", wearId: "neck-scarf" }).ok, false);      // 코인 부족
  const b = run(s0, { type: "buyWear", wearId: "neck-scarf" });
  assert.ok(b.ok); assert.equal(b.state.player.coins, 10); assert.equal(b.state.equipped.neck, "neck-scarf");
  assert.equal(run(b.state, { type: "buyWear", wearId: "neck-scarf" }).ok, false);   // 중복 구매
  assert.equal(run(b.state, { type: "equip", slot: "face", wearId: "face-glasses" }).ok, false); // 미보유
  assert.equal(run(b.state, { type: "equip", slot: "hat", wearId: "neck-scarf" }).ok, false);    // 부위 불일치
  assert.equal(run(b.state, { type: "equip", slot: "neck", wearId: null }).state.equipped.neck, undefined);
});

t("3단계 동행 친구: 만난 캐릭터만", () => {
  assert.equal(run(initialState(), { type: "companion", charId: "kongi" }).ok, false);
  const s = run(initialState(), { type: "findOnline", charId: "kongi" }).state;
  assert.equal(run(s, { type: "companion", charId: "kongi" }).state.companion, "kongi");
});

t("소풍: 방문하면 보따리에 담기고, 조건이 맞을 때 하루 한 번만 펼침", () => {
  let s = initialState();
  for (const id of ["welcome-center", "tailor", "music-library", "dance-hall", "memory-lighthouse"]) s = run(s, { type: "visit", locationId: id, method: "qr" }).state;
  // 1 mat, 3 basket, 2 riceball, 4 injeolmi, 5 sikhye
  assert.equal(s.picnic?.mat, 1); assert.equal(s.picnic?.basket, 1);
  assert.equal(run(s, { type: "picnic", foods: ["riceball", "injeolmi"] }).ok, false);              // 3가지 필요
  assert.equal(run(s, { type: "picnic", foods: ["riceball", "injeolmi", "cider"] }).ok, false);     // 없는 먹을거리
  assert.equal(run(s, { type: "picnic", foods: ["riceball", "injeolmi", "mat"] }).ok, false);       // 도구는 먹을거리 아님
  const p = run(s, { type: "picnic", foods: ["riceball", "injeolmi", "sikhye"] });
  assert.ok(p.ok); assert.equal(p.state.picnicsHeld, 1); assert.equal(p.state.picnic?.riceball, 0); assert.ok(p.state.achievements["badge:강경 소풍객"]);
  const again = { ...p.state, picnic: { ...p.state.picnic, riceball: 1, injeolmi: 1, sikhye: 1 } };
  assert.equal(run(again, { type: "picnic", foods: ["riceball", "injeolmi", "sikhye"] }).ok, false); // 하루 한 번
  assert.ok(run(again, { type: "picnic", foods: ["riceball", "injeolmi", "sikhye"] }, { now: now + 86400_000, allowDemo: false }).ok);
});

t("온라인 마을 보따리: 정해진 자리만, 1회", () => {
  const r = run(initialState(), { type: "villageFind", key: "picnic:2" });
  assert.ok(r.ok); assert.equal(r.state.picnic?.basket, 1);
  assert.equal(run(r.state, { type: "villageFind", key: "picnic:2" }).ok, false);
  assert.equal(run(initialState(), { type: "villageFind", key: "picnic:99" }).ok, false);
});

t("근대 의상·소품 착용과 학당 문(門)", () => {
  let s = initialState(); s = { ...s, player: { ...s.player, level: 5, coins: 999 } };
  const b = run(s, { type: "buyWear", wearId: "outfit-academy" });
  assert.ok(b.ok); assert.equal(b.state.equipped.outfit, "outfit-academy");
  assert.ok(run(b.state, { type: "buyWear", wearId: "prop-compass" }).ok);
  assert.equal(run(b.state, { type: "equip", slot: "prop", wearId: "outfit-academy" }).ok, false);
  assert.equal(run(s, { type: "profile", name: "학생", avatar: "sage", house: "jujak" }).state.player.house, "jujak");
  assert.equal(run(s, { type: "profile", name: "학생", avatar: "sage", house: "slytherin" }).ok, false);
});

console.log(`\n${passed}개 테스트 통과`);
