"use client";
import { useEffect, useRef, useState } from "react";
import { Ico } from "@/components/art/Icons";
import Link from "next/link";
import { useGame } from "@/lib/game";
import { Building } from "@/components/Building";
import { PLACES, WORLD_W, GROUND, TREASURE_X, type Place } from "@/lib/data/village";
import { VILLAGE_PICNIC_SPOTS } from "@/lib/data/picnic";
import { CharacterArt, NpcArt, WalkerArt } from "@/components/Characters";
import { NPC } from "@/lib/data/npcs";
import { CAT_FAMILY } from "@/lib/data/characters";
import { useContent } from "@/lib/content";
import { PageHeader, Hud, Modal } from "@/components/ui";
import NpcDialog from "@/components/NpcDialog";
import { sfx } from "@/lib/sfx";

export default function Village() {
  const { state, findOnline, villageFind, toast } = useGame();
  const { CHAR } = useContent();
  const [x, setX] = useState(120);
  const [dir, setDir] = useState(0);
  const [target, setTarget] = useState<number | null>(null);
  const [face, setFace] = useState(1);
  const [vw, setVw] = useState(390);
  const [npcId, setNpcId] = useState<string | null>(null);
  const [place, setPlace] = useState<Place | null>(null);
  const [reunion, setReunion] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);
  const xr = useRef(x); xr.current = x;

  useEffect(() => {
    const onResize = () => setVw(wrap.current?.clientWidth ?? 390);
    onResize(); window.addEventListener("resize", onResize);
    const key = (e: KeyboardEvent, down: boolean) => {
      if (e.key === "ArrowLeft") { setDir(down ? -1 : 0); setTarget(null); e.preventDefault(); }
      if (e.key === "ArrowRight") { setDir(down ? 1 : 0); setTarget(null); e.preventDefault(); }
    };
    const kd = (e: KeyboardEvent) => key(e, true), ku = (e: KeyboardEvent) => key(e, false);
    window.addEventListener("keydown", kd); window.addEventListener("keyup", ku);
    return () => { window.removeEventListener("resize", onResize); window.removeEventListener("keydown", kd); window.removeEventListener("keyup", ku); };
  }, []);

  useEffect(() => {
    if (!dir && target === null) return;
    let raf = 0, last = performance.now(), stepAt = 0;
    const step = (t: number) => {
      const dt = Math.min(0.05, (t - last) / 1000); last = t;
      let d = dir;
      if (target !== null) { const diff = target - xr.current; if (Math.abs(diff) < 4) { setTarget(null); return; } d = Math.sign(diff); }
      setFace(d);
      if (t - stepAt > 280) { stepAt = t; sfx.step(); }
      setX((v) => Math.max(40, Math.min(WORLD_W - 40, v + d * 260 * dt)));
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [dir, target]);

  const cam = Math.max(0, Math.min(WORLD_W - vw, x - vw / 2));
  const near = PLACES.find((p) => Math.abs(p.x + p.w / 2 - x) < p.w / 2 + 40) ?? null;
  const walking = dir !== 0 || target !== null;
  const nearTreasure = Math.abs(TREASURE_X - x) < 90;
  const catsAll = CAT_FAMILY.every((c) => state.characters[c]);
  const onlinePlaces = state.villageFound.filter((v) => v.startsWith("place:")).length;

  const explorePlace = (p: Place) => {
    sfx.tap(); setPlace(p);
    villageFind(`place:${p.key}`); // 보상은 엔진의 VILLAGE_REWARDS 표에서 결정
  };

  return (
    <main className="px-3">
      <PageHeader title="온라인 강경마을" sub="집에서도 강경을 걸어요 · ← → 키, 버튼, 땅 터치로 이동" />
      <Hud />

      <div ref={wrap} className="paper mt-3 overflow-hidden relative select-none touch-none" style={{ height: 440 }}
        onPointerDown={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const yy = e.clientY - rect.top;
          if (yy > GROUND - 10 && (e.target as HTMLElement).dataset.ground) setTarget(cam + (e.clientX - rect.left));
        }}>
        <div className="absolute top-0 left-0 h-full" style={{ width: WORLD_W, transform: `translateX(${-cam}px)`, transition: "transform 60ms linear" }}>
          <svg width={WORLD_W} height={440} className="absolute inset-0">
            <defs>
              <linearGradient id="vsky" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#1A2B2D" /><stop offset=".55" stopColor="#3B5659" /><stop offset="1" stopColor="#B5A787" /></linearGradient>
              <filter id="vwc"><feTurbulence baseFrequency=".025" numOctaves="2" seed="7" /><feDisplacementMap in="SourceGraphic" scale="4" /></filter>
            </defs>
            <rect width={WORLD_W} height={440} fill="url(#vsky)" />
            {[400, 1500, 2500].map((mx) => <g key={mx}><circle cx={mx} cy={80} r={70} fill="#EFE2C2" opacity=".1" /><circle cx={mx} cy={80} r={30} fill="#EFE2C2" /></g>)}
            {Array.from({ length: 9 }).map((_, i) => (
              <g key={i} fill="#E8D8B8" opacity=".55"><ellipse cx={180 + i * 330} cy={60 + (i % 3) * 18} rx={56} ry={14} /><ellipse cx={220 + i * 330} cy={50 + (i % 3) * 18} rx={36} ry={14} /></g>
            ))}
            <path d={`M0 250 ${Array.from({ length: 30 }).map((_, i) => `Q${i * 100 + 50} ${215 + (i % 2) * 20} ${(i + 1) * 100} 240`).join(" ")} V${GROUND} H0Z`} fill="#65516F" opacity=".6" />
            {/* 강경포구 (가상 재현) */}
            <rect x={2560} y={GROUND - 30} width={WORLD_W - 2560} height={140} fill="#3B5659" />
            <g className="anim-idle"><path d="M2640 300 h120 l-20 22 h-80z" fill="#5A4033" stroke="#39332F" strokeWidth="2.4" /><path d="M2700 300 v-70 l40 60z" fill="#F2E7D0" stroke="#39332F" strokeWidth="2" /></g>
            <g filter="url(#vwc)">
              {PLACES.map((p) => <Building key={p.key} x={p.x} y={GROUND - p.h} w={p.w} h={p.h} style={p.style} wall={p.wall} roof={p.roof} sign={p.label} />)}
            </g>
            <rect y={GROUND} width={2560} height={140} fill="#C4AC80" />
            <rect y={GROUND} width={2560} height={140} fill="url(#pt-grain)" />
            <path d={`M0 ${GROUND} H2560`} stroke="#39332F" strokeWidth="2.4" />
            <g stroke="#8A6731" strokeWidth="2" opacity=".55">{Array.from({ length: 60 }).map((_, i) => <path key={i} d={`M${i * 44} ${GROUND + 60} h26`} />)}</g>
            {/* 장소 이름표: 실제/가상 구분 */}
            {PLACES.map((p) => (
              <g key={`t${p.key}`} transform={`translate(${p.x + p.w / 2} ${GROUND + 22})`}>
                <rect x={-34} y={-12} width={68} height={20} rx={2} fill={p.real ? "#263D40" : "#65516F"} stroke="#B58B48" strokeWidth={1} />
                <text textAnchor="middle" y={3} fontSize="12" fill="#E8D8B8" fontFamily="'Nanum Myeongjo', serif" fontWeight={700}>{p.real ? "실제 장소" : "가상 장소"}</text>
              </g>
            ))}
            {[230, 600, 1000, 1440, 1850, 2310].map((lx) => (
              <g key={lx}><path d={`M${lx} ${GROUND} v-80`} stroke="#39332F" strokeWidth="3" /><circle cx={lx} cy={GROUND - 84} r={9} fill="#F3D896" stroke="#39332F" strokeWidth="2" /></g>
            ))}
            <text x={2700} y={GROUND + 60} textAnchor="middle" fontFamily="'Nanum Myeongjo', serif" fontWeight={700} fontSize="18" fill="#1A2B2D">강경포구 (가상 재현)</text>
          </svg>
          {/* 땅 터치 영역 */}
          <div data-ground="1" className="absolute left-0 right-0" style={{ top: GROUND - 10, height: 440 - GROUND + 10 }} />

          {/* 숨은 캐릭터 */}
          {PLACES.filter((p) => p.hidden).map((p) => {
            const h = p.hidden!; const got = !!state.characters[h.charId];
            const cx = p.x + h.dx, cy = GROUND - p.h + h.dy;
            const isNear = Math.abs(cx - x) < 140;
            if (got) return <div key={p.key} className="absolute w-12 h-14 anim-idle pointer-events-none" style={{ left: cx - 24, top: Math.max(56, cy - 20) }}><CharacterArt id={h.charId} mood="happy" className="w-full h-full" /></div>;
            return (
              <button key={p.key} aria-label="수상한 기척" className="absolute z-10 w-12 h-12 grid place-items-center" style={{ left: cx - 24, top: cy - 12 }}
                onClick={() => {
                  if (!isNear) { toast("조금 더 가까이 가 보세요!", "🐾"); return; }
                  findOnline(h.charId);
                }}>
                {isNear ? <span className="anim-shake inline-block"><Ico name="plum" size={34} /></span> : <span className="opacity-50 anim-idle inline-block"><Ico name="paw" size={24} /></span>}
              </button>
            );
          })}

          {/* NPC */}
          {PLACES.filter((p) => p.npcId).map((p) => {
            const n = NPC[p.npcId!];
            return (
              <button key={`n${p.key}`} className="absolute w-14 h-16 anim-squish" style={{ left: p.x + p.w - 20, top: GROUND - 58 }}
                aria-label={`${n.name}와 대화`} onClick={() => { if (Math.abs(p.x + p.w - x) > 200) { setTarget(p.x + p.w - 40); return; } setNpcId(n.id); }}>
                <NpcArt look={n.look} />
                <span className="absolute -top-6 left-1/2 -translate-x-1/2 anim-idle pointer-events-none"><Ico name="lantern" size={22} /></span>
              </button>
            );
          })}

          {/* 반짝이는 소풍 보따리 */}
          {VILLAGE_PICNIC_SPOTS.filter((sp) => !state.villageFound.includes(sp.key)).map((sp) => (
            <button key={sp.key} className="absolute z-10 w-10 h-10 grid place-items-center" style={{ left: sp.x - 20, top: GROUND - 2 }} aria-label="반짝이는 보따리"
              onClick={() => { if (Math.abs(sp.x - x) > 110) { setTarget(sp.x - 30); return; } villageFind(sp.key).then((ok) => ok && sfx.coin()); }}>
              <span className="absolute inset-0 rounded-full anim-glow" style={{ background: "radial-gradient(circle, rgba(243,216,150,.75), transparent 70%)" }} />
              <span className="relative anim-idle"><Ico name="gift" size={28} /></span>
            </button>
          ))}
          {/* 보물 */}
          {!state.villageFound.includes("treasure:port") && (
            <button className="absolute text-3xl anim-idle" style={{ left: TREASURE_X - 16, top: GROUND - 6 }} aria-label="숨겨진 보물"
              onClick={() => {
                if (!nearTreasure) { setTarget(TREASURE_X - 40); return; }
                villageFind("treasure:port").then((ok) => ok && sfx.collect());
              }}><Ico name="gift" size={34} /></button>
          )}

          {/* 동행 친구 (3단계) */}
          {state.companion && (
            <div className="absolute w-12 h-14 pointer-events-none" style={{ left: x - 24 - face * 52, top: GROUND - 54, transition: "left 220ms ease-out" }}>
              <CharacterArt id={state.companion} mood={walking ? "happy" : "idle"} className={`w-full h-full ${walking ? "anim-jump" : "anim-idle"}`} />
            </div>
          )}
          {/* 플레이어 */}
          <div className="absolute w-16 h-24 pointer-events-none" style={{ left: x - 32, top: GROUND - 82 }}>
            <WalkerArt avatar={state.player.avatar} walking={walking} flip={face < 0} />
            <p className="absolute -top-5 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs font-game bg-cream-light/90 rounded-full px-2 border border-wood/40">{state.player.name}</p>
          </div>
        </div>

        {/* 근처 행동 */}
        {near && (
          <div className="absolute top-3 left-3 right-3 flex justify-center pointer-events-none">
            <div className="paper px-3 py-2 flex items-center gap-2 pointer-events-auto anim-rise">
              <span className="font-game text-wood-dark">{near.label}</span>
              <span className={`chip ${near.real ? "bg-teal" : "bg-dream"} text-cream`}>{near.real ? "실제" : "가상"}</span>
              <button className="btn-gold btn-sm !py-1" onClick={() => explorePlace(near)}>살펴보기</button>
              {near.key === "modern-store" && catsAll && <button className="btn-brick btn-sm !py-1" onClick={() => { setReunion(true); villageFind("reunion").then((ok) => ok && sfx.collect()); }}>가족 재회</button>}
            </div>
          </div>
        )}
        {/* 미니맵 */}
        <div className="absolute bottom-2 left-3 right-3 h-2 rounded-full bg-cream-dark/90 border border-wood/40">
          {PLACES.map((p) => <span key={p.key} className={`absolute top-0 h-full w-1 ${p.real ? "bg-teal" : "bg-dream"}`} style={{ left: `${((p.x + p.w / 2) / WORLD_W) * 100}%` }} />)}
          <span className="absolute -top-1 w-4 h-4 rounded-full bg-gold border-2 border-wood-dark" style={{ left: `calc(${(x / WORLD_W) * 100}% - 8px)` }} />
        </div>
      </div>

      <div className="flex gap-2 mt-3">
        {[-1, 1].map((d) => (
          <button key={d} className="btn-sage flex-1 text-2xl py-4"
            onPointerDown={() => { setTarget(null); setDir(d); }} onPointerUp={() => setDir(0)} onPointerLeave={() => setDir(0)} onPointerCancel={() => setDir(0)}
            aria-label={d < 0 ? "왼쪽으로" : "오른쪽으로"}>{d < 0 ? "◀" : "▶"}</button>
        ))}
      </div>

      <section className="paper p-4 mt-3 text-sm">
        <p className="font-game text-wood-dark">온라인 발견 장소 {onlinePlaces}/{PLACES.length} · 발견한 캐릭터 {Object.values(state.characters).filter((c) => c.method === "online").length}명 (온라인)</p>
        <p className="text-wood mt-1">발자국에 가까이 가면 매화로 바뀌어요. 눌러서 숨은 친구를 찾아보세요! 온라인 보상은 실제 방문 보상과 구분돼요 (온라인: 장소당 +10EXP / 현장: 장소당 +30EXP 이상).</p>
        <p className="text-[11px] text-wood/80 mt-2">※ 마을 건물은 안내도의 장소를 분위기로 표현한 창작 일러스트이며 실제 외관과 다를 수 있습니다. ‘가상 장소’는 게임 전용 공간입니다.</p>
        <div className="flex gap-2 mt-2"><Link href="/explore" className="btn-cream btn-sm"><Ico name="map" size={20} />실제 탐험 지도</Link><Link href="/jeotgal" className="btn-gold btn-sm"><Ico name="jar" size={20} />젓갈 공방</Link></div>
      </section>

      <Modal open={!!place} onClose={() => setPlace(null)} label="장소 살펴보기">
        {place && (
          <div className="p-4">
            <span className={`chip ${place.real ? "bg-teal" : "bg-dream"} text-cream`}>{place.real ? "실제 장소 (안내도 표기)" : "가상 장소 (게임 전용)"}</span>
            <h2 className="font-story font-bold text-2xl text-wood-dark mt-1">{place.label}</h2>
            <p className="text-wood mt-1">{place.desc}</p>
            {place.hidden && !state.characters[place.hidden.charId] && <p className="mt-2 text-sm text-brick font-game">단서 · {CHAR[place.hidden.charId].onlineHint}</p>}
            <div className="flex gap-2 mt-4">
              {place.npcId && <button className="btn-sage btn-sm flex-1" onClick={() => { setNpcId(place.npcId!); setPlace(null); }}><Ico name="lantern" size={20} />{NPC[place.npcId].name}와 대화</button>}
              {place.key === "v-market" && <Link href="/jeotgal" className="btn-gold btn-sm flex-1"><Ico name="jar" size={20} />공방 입장</Link>}
              <button className="btn-cream btn-sm flex-1" onClick={() => setPlace(null)}>닫기</button>
            </div>
          </div>
        )}
      </Modal>

      <Modal open={reunion} onClose={() => setReunion(false)} label="가족 재회">
        <div className="p-5 text-center">
          <p className="font-game text-brick">강경모던상회</p>
          <h2 className="font-story font-bold text-2xl text-wood-dark">고양이 가족이 다시 모였어요!</h2>
          <div className="flex justify-center items-end gap-1 mt-3">
            <div className="w-24 h-28 anim-idle"><CharacterArt id="kangi" mood="happy" className="w-full h-full" /></div>
            <div className="w-16 h-20 anim-jump"><CharacterArt id="kongi" mood="happy" className="w-full h-full" /></div>
            <div className="w-24 h-28 anim-idle" style={{ animationDelay: ".3s" }}><CharacterArt id="kaengi" mood="wave" className="w-full h-full" /></div>
          </div>
          <p className="mt-3 text-wood">“강경에 살다 보니 여기가 제일 좋다냥” — 갱이</p>
          <Link href="/quests" className="btn-brick w-full mt-4">퀘스트 보상 받으러 가기</Link>
        </div>
      </Modal>

      <NpcDialog npcId={npcId} onClose={() => setNpcId(null)} />
    </main>
  );
}
