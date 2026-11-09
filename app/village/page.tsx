"use client";
// 온라인 강경마을: 화면 가득한 한 줄 거리. 어디든 톡 누르면 걸어가고, 사람·물건에 닿으면 저절로 말을 걸거나 줍습니다.
// 이웃들은 날마다 작은 부탁(배달·재료·조사·물물교환)을 합니다.
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Ico } from "@/components/art/Icons";
import { useGame } from "@/lib/game";
import VillageBackdrop from "@/components/VillageBackdrop";
import { PLACES, WORLD_W, GROUND, TREASURE_X, type Place } from "@/lib/data/village";
import { VILLAGE_PICNIC_SPOTS, PICNIC } from "@/lib/data/picnic";
import { CharacterArt, NpcArt, WalkerArt } from "@/components/Characters";
import { NPC } from "@/lib/data/npcs";
import { ITEMS } from "@/lib/data/jeotgal";
import { CAT_FAMILY } from "@/lib/data/characters";
import { useContent } from "@/lib/content";
import { MiniHud, Modal, Sheet } from "@/components/ui";
import NpcDialog from "@/components/NpcDialog";
import { sfx } from "@/lib/sfx";
import { ERRANDS, errandDone, errandReady, tradeFood, type Errand } from "@/lib/data/errands";
import { dayKeyKST } from "@/lib/data/sparks";
import { haptic } from "@/lib/fx";

const H = 440;
const CROP = 60; // 위쪽 하늘을 조금 잘라 인물을 더 크게
const SPEED = 240; // 마을 좌표/초
const CHATTER: Record<string, string[]> = {
  guide: ["오늘도 강경 날씨 좋네요!", "시간 조각 본 적 있어요?", "길 잃으면 저한테 와요~"],
  photographer: ["빛이 딱 좋은 시간이에요.", "찰칵! 아, 눈 감았다…", "사진관 앞이 명당이에요."],
  merchant: ["싸요 싸~ 구경하고 가세요!", "고양이 손님이 또 왔다던데?", "물물교환도 환영이에요!"],
  artisan: ["항아리는 기다림이 반이여.", "소금은 넉넉히, 마음은 느긋이.", "허허, 냄새 좋지?"],
  postman: ["까악! 편지 왔어요~", "날개가 좀 아파요…", "미래에서 온 편지도 있어요!"],
};
const npcX = (p: Place) => p.x + p.w - 10;

export default function Village() {
  const { state, findOnline, villageFind, toast, act } = useGame();
  const { CHAR } = useContent();
  const [day, setDay] = useState("");
  useEffect(() => { setDay(dayKeyKST(Date.now())); }, []);

  // ── 화면 크기: 마을 높이(440)를 화면 높이에 맞춰 키움 ──
  const stage = useRef<HTMLDivElement>(null);
  const [view, setView] = useState({ w: 390, h: 600, k: 1.3 });
  useEffect(() => {
    const fit = () => { const el = stage.current; if (!el) return; const w = el.clientWidth, h = el.clientHeight; setView({ w, h, k: Math.max(1, Math.min(2.1, h / (H - CROP))) }); };
    fit(); window.addEventListener("resize", fit); return () => window.removeEventListener("resize", fit);
  }, []);
  const viewRef = useRef(view); viewRef.current = view;

  // ── 움직임: React를 매 프레임 다시 그리지 않고 ref로 직접 옮겨 부드럽게 ──
  const world = useRef<HTMLDivElement>(null);
  const player = useRef<HTMLDivElement>(null);
  const buddy = useRef<HTMLDivElement>(null);
  const pos = useRef({ x: 140, cam: 0, buddy: 90, target: null as number | null, dir: 0, arrive: null as null | (() => void) });
  const [x, setX] = useState(140);
  const [walking, setWalking] = useState(false);
  const [face, setFace] = useState(1);

  const goTo = useCallback((tx: number, arrive?: () => void) => {
    const p = pos.current;
    p.target = Math.max(40, Math.min(WORLD_W - 40, tx)); p.dir = 0; p.arrive = arrive ?? null;
    if (Math.abs(p.target - p.x) < 6) { p.target = null; const f = p.arrive; p.arrive = null; f?.(); }
  }, []);

  useEffect(() => {
    let raf = 0, last = performance.now(), lastSync = 0, stepAt = 0, wasWalking = false, lastFace = 1;
    const tick = (t: number) => {
      const dt = Math.min(0.05, (t - last) / 1000); last = t;
      const p = pos.current, v = viewRef.current;
      let d = p.dir;
      if (p.target !== null) { const diff = p.target - p.x; if (Math.abs(diff) < 4) { p.target = null; d = 0; const f = p.arrive; p.arrive = null; f?.(); } else d = Math.sign(diff); }
      if (d) { p.x = Math.max(40, Math.min(WORLD_W - 40, p.x + d * SPEED * dt)); if (t - stepAt > 300) { stepAt = t; sfx.step(); } }
      if (d && d !== lastFace) { lastFace = d; setFace(d); }
      if (!!d !== wasWalking) { wasWalking = !!d; setWalking(!!d); }
      // 카메라: 가운데 40% 안에서는 가만히, 벗어나면 부드럽게 따라감
      const viewW = v.w / v.k;
      const lo = p.cam + viewW * 0.3, hi = p.cam + viewW * 0.7;
      let want = p.cam;
      if (p.x < lo) want = p.x - viewW * 0.3; else if (p.x > hi) want = p.x - viewW * 0.7;
      want = Math.max(0, Math.min(WORLD_W - viewW, want));
      p.cam += (want - p.cam) * (1 - Math.exp(-dt * 7));
      p.buddy += (p.x - lastFace * 52 - p.buddy) * (1 - Math.exp(-dt * 5));
      if (world.current) world.current.style.transform = `translate3d(${-p.cam * v.k}px,0,0) scale(${v.k})`;
      if (player.current) player.current.style.transform = `translate3d(${p.x}px,0,0)`;
      if (buddy.current) buddy.current.style.transform = `translate3d(${p.buddy}px,0,0)`;
      if (t - lastSync > 120) { lastSync = t; setX(Math.round(p.x)); }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    const key = (e: KeyboardEvent, down: boolean) => {
      if (e.key === "ArrowLeft" || e.key === "ArrowRight") { e.preventDefault(); pos.current.target = null; pos.current.arrive = null; pos.current.dir = down ? (e.key === "ArrowLeft" ? -1 : 1) : 0; }
    };
    const kd = (e: KeyboardEvent) => key(e, true), ku = (e: KeyboardEvent) => key(e, false);
    window.addEventListener("keydown", kd); window.addEventListener("keyup", ku);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("keydown", kd); window.removeEventListener("keyup", ku); };
  }, []);

  const tapGround = (e: React.PointerEvent) => {
    const r = stage.current!.getBoundingClientRect();
    goTo(pos.current.cam + (e.clientX - r.left) / view.k);
  };

  // ── 이웃 부탁 ──
  const [carry, setCarry] = useState(false); // 포포의 편지를 들고 있는지
  useEffect(() => { try { setCarry(localStorage.getItem("gtw-carry") === dayKeyKST(Date.now())); } catch { /* ignore */ } }, []);
  const setCarrying = (v: boolean) => { setCarry(v); try { if (v) localStorage.setItem("gtw-carry", day); else localStorage.removeItem("gtw-carry"); } catch { /* ignore */ } };
  const errandsFor = (npcId: string) => ERRANDS.filter((e) => e.npc === npcId || (e.to === npcId && carry && !errandDone(state, e.id, day)));
  const badge = (npcId: string) => {
    const mine = ERRANDS.filter((e) => e.npc === npcId);
    if (ERRANDS.some((e) => e.to === npcId && carry && !errandDone(state, e.id, day))) return "deliver";
    if (!mine.length) return null;
    return mine.every((e) => errandDone(state, e.id, day)) ? "done" : "ask";
  };
  const doneCount = ERRANDS.filter((e) => errandDone(state, e.id, day)).length;

  const [villager, setVillager] = useState<string | null>(null);
  const [npcId, setNpcId] = useState<string | null>(null);
  const [place, setPlace] = useState<Place | null>(null);
  const [reunion, setReunion] = useState(false);

  const meet = (id: string) => { sfx.talk(); haptic(8); setVillager(id); };
  const finishErrand = async (e: Errand) => {
    const r = await act({ type: "errand", id: e.id });
    if (r.ok) { sfx.quest(); if (e.kind === "deliver") setCarrying(false); }
  };

  const near = PLACES.find((p) => Math.abs(p.x + p.w / 2 - x) < p.w / 2 + 30) ?? null;
  const catsAll = CAT_FAMILY.every((c) => state.characters[c]);
  const chatty = useMemo(() => PLACES.filter((p) => p.npcId && Math.abs(npcX(p) - x) < 150).map((p) => p.npcId!), [x]);

  return (
    <main className="fixed inset-0 overflow-hidden bg-[#1A2B2D]">
      {/* ── 마을 무대 ── */}
      <div ref={stage} className="absolute inset-x-0 top-0 bottom-[86px] overflow-hidden select-none touch-none" onPointerDown={tapGround}>
        <div ref={world} className="absolute left-0 origin-top-left will-change-transform" style={{ width: WORLD_W, height: H, top: Math.max(0, view.h - H * view.k) }}>
          <VillageBackdrop />

          {/* 숨은 친구 */}
          {PLACES.filter((p) => p.hidden).map((p) => {
            const h = p.hidden!; const got = !!state.characters[h.charId];
            const cx = p.x + h.dx, cy = Math.max(CROP + 50, GROUND - p.h + h.dy);
            if (got) return <div key={p.key} className="absolute w-14 h-16 pointer-events-none anim-idle" style={{ left: cx - 28, top: cy - 30 }}><CharacterArt id={h.charId} mood="happy" className="w-full h-full" /></div>;
            const isNear = Math.abs(cx - x) < 130;
            return (
              <button key={p.key} aria-label="수상한 기척" className="absolute z-10 w-14 h-14 grid place-items-center" style={{ left: cx - 28, top: cy - 16 }}
                onPointerDown={(e) => { e.stopPropagation(); sfx.tap(); goTo(cx - 30, () => findOnline(h.charId)); }}>
                <span className="absolute inset-1 rounded-full anim-glow" style={{ background: "radial-gradient(circle, rgba(243,216,150,.6), transparent 70%)" }} />
                <span className={isNear ? "anim-shake inline-block relative" : "anim-idle inline-block relative opacity-80"}><Ico name={isNear ? "plum" : "paw"} size={isNear ? 32 : 26} /></span>
              </button>
            );
          })}

          {/* 이웃 */}
          {PLACES.filter((p) => p.npcId).map((p) => {
            const n = NPC[p.npcId!]; const b = badge(n.id); const talking = chatty.includes(n.id);
            const line = CHATTER[n.id]?.[Math.floor(x / 140) % (CHATTER[n.id]?.length ?? 1)];
            return (
              <button key={`n${p.key}`} className="absolute z-10 w-[72px] h-[84px]" style={{ left: npcX(p) - 36, top: GROUND - 82 }} aria-label={`${n.name}에게 가기`}
                onPointerDown={(e) => { e.stopPropagation(); sfx.tap(); goTo(npcX(p) - (pos.current.x < npcX(p) ? 56 : -56), () => meet(n.id)); }}>
                <span className="absolute inset-0 npc-sway"><NpcArt id={n.id} look={n.look} /></span>
                {b && (
                  <span className={`absolute -top-6 left-1/2 -translate-x-1/2 w-7 h-7 rounded-full grid place-items-center font-game font-bold text-sm border-2 ${b === "done" ? "bg-jade text-hanji-light border-hanji-light" : "bg-vermilion text-hanji-light border-antique-light anim-idle"}`}>
                    {b === "done" ? "✓" : b === "deliver" ? <Ico name="letter" size={16} /> : "!"}
                  </span>
                )}
                {talking && line && (
                  <span className="absolute -top-14 left-1/2 -translate-x-1/2 whitespace-nowrap px-2.5 py-1 rounded-xl bg-hanji-light text-sumi text-[11px] font-game font-bold border border-sumi/40 shadow-card anim-pop pointer-events-none">{line}</span>
                )}
              </button>
            );
          })}

          {/* 반짝이는 소풍 보따리 */}
          {VILLAGE_PICNIC_SPOTS.filter((sp) => !state.villageFound.includes(sp.key)).map((sp) => (
            <button key={sp.key} className="absolute z-10 w-12 h-12 grid place-items-center" style={{ left: sp.x - 24, top: GROUND - 6 }} aria-label="반짝이는 보따리"
              onPointerDown={(e) => { e.stopPropagation(); sfx.tap(); goTo(sp.x - 26, () => villageFind(sp.key).then((ok) => { if (ok) { sfx.coin(); toast(`소풍 보따리에서 ${PICNIC[sp.item]?.name ?? "선물"}을(를) 찾았어요`, "🧺"); } })); }}>
              <span className="absolute inset-0 rounded-full anim-glow" style={{ background: "radial-gradient(circle, rgba(243,216,150,.75), transparent 70%)" }} />
              <span className="relative anim-idle"><Ico name="basket" size={30} /></span>
            </button>
          ))}
          {!state.villageFound.includes("treasure:port") && (
            <button className="absolute z-10 w-12 h-12 grid place-items-center anim-idle" style={{ left: TREASURE_X - 24, top: GROUND - 8 }} aria-label="숨겨진 보물"
              onPointerDown={(e) => { e.stopPropagation(); goTo(TREASURE_X - 30, () => villageFind("treasure:port").then((ok) => ok && sfx.collect())); }}><Ico name="gift" size={34} /></button>
          )}

          {/* 동행 친구 */}
          {state.companion && (
            <div ref={buddy} className="absolute left-0 pointer-events-none" style={{ top: GROUND - 56 }}>
              <div className="w-12 h-14 -ml-6"><CharacterArt id={state.companion} mood={walking ? "happy" : "idle"} className={`w-full h-full ${walking ? "anim-walk" : "anim-idle"}`} /></div>
            </div>
          )}
          {/* 나 */}
          <div ref={player} className="absolute left-0 pointer-events-none" style={{ top: GROUND - 86 }}>
            <div className="w-[68px] h-[88px] -ml-[34px] relative">
              {carry && <span className="absolute -top-5 left-1/2 -translate-x-1/2 anim-idle"><Ico name="letter" size={22} /></span>}
              <WalkerArt avatar={state.player.avatar} walking={walking} flip={face < 0} />
            </div>
          </div>
        </div>
      </div>

      {/* ── 위: 명패 + 마을 이름 + 부탁 수 ── */}
      <div className="absolute top-0 inset-x-0 p-3 pt-[max(12px,env(safe-area-inset-top))] pr-14 flex items-start gap-2 pointer-events-none">
        <div className="pointer-events-auto"><MiniHud /></div>
        <div className="min-w-0 mt-1">
          <h1 className="font-story text-xl text-hanji-light leading-none drop-shadow">온라인 강경마을</h1>
          <p className="mt-1.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/30 text-[12px] font-game font-bold text-hanji">이웃 부탁 {doneCount}/{ERRANDS.length}</p>
        </div>
      </div>

      {/* ── 아래: 가까운 장소 ── */}
      <div className="absolute inset-x-0 bottom-[96px] px-3 flex flex-col items-center gap-2 pointer-events-none">
        {near && (
          <div key={near.key} className="paper px-3 py-2 flex items-center gap-2 pointer-events-auto anim-rise">
            <span className="font-story text-lg text-sumi">{near.label}</span>
            <span className={`chip ${near.real ? "bg-teal" : "bg-dream"} text-cream`}>{near.real ? "실제" : "가상"}</span>
            <button className="btn-gold btn-sm !py-1" onClick={() => { sfx.tap(); setPlace(near); villageFind(`place:${near.key}`); }}>살펴보기</button>
            {near.key === "modern-store" && catsAll && <button className="btn-brick btn-sm !py-1" onClick={() => { setReunion(true); villageFind("reunion").then((ok) => ok && sfx.collect()); }}>가족 재회</button>}
          </div>
        )}
        <div className="w-full max-w-md h-1.5 rounded-full bg-black/30 relative">
          {PLACES.map((p) => <span key={p.key} className={`absolute top-0 h-full w-1 ${p.npcId && badge(p.npcId) === "ask" ? "bg-vermilion" : "bg-hanji/50"}`} style={{ left: `${((p.x + p.w / 2) / WORLD_W) * 100}%` }} />)}
          <span className="absolute -top-1 w-3.5 h-3.5 rounded-full bg-antique-light border-2 border-sumi" style={{ left: `calc(${(x / WORLD_W) * 100}% - 7px)` }} />
        </div>
      </div>

      {/* ── 이웃과 이야기 ── */}
      <Sheet open={!!villager} onClose={() => setVillager(null)} label="이웃">
        {villager && (() => {
          const n = NPC[villager];
          const list = errandsFor(villager);
          return (
            <div className="px-4 pb-5">
              <div className="flex items-end gap-3">
                <div className="w-24 h-28 shrink-0"><NpcArt id={n.id} look={n.look} /></div>
                <div className="flex-1 min-w-0 pb-2">
                  <span className="chip bg-teal text-hanji-light">{n.title}</span>
                  <h2 className="font-story text-2xl text-sumi">{n.name}</h2>
                  <p className="text-sm font-game text-sumi-light">“{n.greeting}”</p>
                </div>
              </div>
              {list.map((e) => {
                const done = errandDone(state, e.id, day);
                const isRecipient = e.to === villager;
                const ready = errandReady(e, state, day);
                return (
                  <div key={e.id} className="mt-3 p-3 border-[1.5px] border-vermilion/60 bg-hanji-light" style={{ borderRadius: 8 }}>
                    <p className="font-game font-bold text-vermilion text-sm flex items-center gap-1"><Ico name="scroll" size={18} />이웃 부탁 · {e.title}</p>
                    <p className="text-[15px] text-sumi mt-1 leading-relaxed">{done ? e.thanks : isRecipient ? "어? 그 편지… 혹시 포포가 보낸 거예요?" : e.ask}</p>
                    {!done && e.kind === "give" && <p className="text-xs text-sumi-light mt-1">필요: {Object.entries(e.need ?? {}).map(([k, v]) => `${ITEMS[k]?.name ?? k} ${v} (가진 것 ${state.inventory[k] ?? 0})`).join(", ")}</p>}
                    {!done && e.kind === "trade" && <p className="text-xs text-sumi-light mt-1">{tradeFood(state) ? `내줄 것: ${PICNIC[tradeFood(state)!].name} 1개` : "소풍 먹을거리가 없어요. 탐험 지도나 마을의 보따리에서 모아요."}</p>}
                    {!done && e.kind === "check" && <p className="text-xs text-sumi-light mt-1">조건: {e.checkHint} {ready ? "✓" : ""}</p>}
                    <p className="text-xs font-game text-antique-dark mt-1">보상: +{e.reward.exp} EXP · 엽전 {e.reward.coins}{e.reward.items ? ` · ${Object.entries(e.reward.items).map(([k, v]) => `${ITEMS[k]?.name ?? k}×${v}`).join(", ")}` : ""}</p>
                    <div className="mt-2">
                      {done ? <p className="text-sm font-game font-bold text-jade">오늘 부탁 완료! 내일 또 와요</p>
                        : e.kind === "deliver" && !isRecipient ? (carry ? <p className="text-sm font-game text-sumi">편지를 들고 있어요. {NPC[e.to!].name}에게 가져다주세요!</p>
                          : <button className="btn-brick btn-sm w-full" onClick={() => { setCarrying(true); sfx.equip(); toast(`편지를 받았어요. ${NPC[e.to!].name}에게 전해 주세요!`, "💌"); setVillager(null); }}>편지 받아 들기</button>)
                        : e.kind === "deliver" ? <button className="btn-brick btn-sm w-full" onClick={() => finishErrand(e)}>편지 전하기</button>
                        : e.kind === "check" && e.id === "sparks" && !ready ? <Link href="/explore" className="btn-sage btn-sm w-full">탐험 지도로 조각 모으러 가기</Link>
                        : e.kind === "check" && e.id === "photo" && !ready ? <Link href="/wardrobe" className="btn-sage btn-sm w-full">옷장에서 동행 친구 고르기</Link>
                        : <button className="btn-brick btn-sm w-full" disabled={!ready} onClick={() => finishErrand(e)}>{e.kind === "give" ? "재료 건네기" : e.kind === "trade" ? "바꾸기" : "보여 주기"}</button>}
                    </div>
                  </div>
                );
              })}
              <div className="grid grid-cols-2 gap-2 mt-3">
                <button className="btn-cream btn-sm" onClick={() => { setNpcId(villager); setVillager(null); }}><Ico name="lantern" size={18} />이야기 나누기</button>
                <button className="btn-cream btn-sm" onClick={() => setVillager(null)}>또 봐요</button>
              </div>
            </div>
          );
        })()}
      </Sheet>

      <Modal open={!!place} onClose={() => setPlace(null)} label="장소 살펴보기">
        {place && (
          <div className="p-4">
            <span className={`chip ${place.real ? "bg-teal" : "bg-dream"} text-cream`}>{place.real ? "실제 장소 (안내도 표기)" : "가상 장소 (게임 전용)"}</span>
            <h2 className="font-story text-2xl text-sumi mt-1">{place.label}</h2>
            <p className="text-sumi-light mt-1">{place.desc}</p>
            {place.hidden && !state.characters[place.hidden.charId] && <p className="mt-2 text-sm text-vermilion font-game">단서 · {CHAR[place.hidden.charId].onlineHint}</p>}
            <p className="text-[11px] text-sumi-light/80 mt-3">※ 마을 건물은 안내도 장소의 분위기를 옮긴 창작 그림이에요. 실제 방문 도장은 탐험 지도에서 QR·GPS로 받아요.</p>
            <div className="flex gap-2 mt-3">
              {place.key === "v-market" && <Link href="/jeotgal" className="btn-gold btn-sm flex-1"><Ico name="jar" size={20} />젓갈 공방</Link>}
              {place.key === "v-post" && <Link href="/post" className="btn-gold btn-sm flex-1"><Ico name="letter" size={20} />시간 우체국</Link>}
              <button className="btn-cream btn-sm flex-1" onClick={() => setPlace(null)}>닫기</button>
            </div>
          </div>
        )}
      </Modal>

      <Modal open={reunion} onClose={() => setReunion(false)} label="가족 재회">
        <div className="p-5 text-center">
          <p className="font-game text-vermilion">강경모던상회</p>
          <h2 className="font-story text-2xl text-sumi">고양이 가족이 다시 모였어요!</h2>
          <div className="flex justify-center items-end gap-1 mt-3">
            <div className="w-24 h-28 anim-idle"><CharacterArt id="kangi" mood="happy" className="w-full h-full" /></div>
            <div className="w-16 h-20 anim-idle"><CharacterArt id="kongi" mood="happy" className="w-full h-full" /></div>
            <div className="w-24 h-28 anim-idle" style={{ animationDelay: ".3s" }}><CharacterArt id="kaengi" mood="wave" className="w-full h-full" /></div>
          </div>
          <p className="mt-3 text-sumi-light">“강경에 살다 보니 여기가 제일 좋다냥” — 갱이</p>
          <button className="btn-brick w-full mt-4" onClick={() => setReunion(false)}>좋아요!</button>
        </div>
      </Modal>

      <NpcDialog npcId={npcId} onClose={() => setNpcId(null)} />
    </main>
  );
}
