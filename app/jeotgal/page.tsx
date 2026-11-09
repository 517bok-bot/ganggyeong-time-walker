"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useGame } from "@/lib/game";
import { JEOTGAL_TYPES, JTYPE, ITEMS, JAR_SKINS, ARTISAN_LEVELS, artisanLevel, GRADES, IDEAL_ORDER, type JeotgalType } from "@/lib/data/jeotgal";
import type { JarRecord } from "@/lib/types";
import { PageHeader, Hud, Modal, DemoBadge, Stars } from "@/components/ui";
import { JarArt } from "@/components/Jar";
import { NpcArt } from "@/components/Characters";
import { NPC } from "@/lib/data/npcs";
import NpcDialog from "@/components/NpcDialog";
import { sfx } from "@/lib/sfx";
import { Ico, ITEM_ICON } from "@/components/art/Icons";
import { KitchenScene } from "@/components/art/Kitchen";
import { getBrowserSupabase } from "@/lib/supabase/browser";

type Step = "lobby" | "type" | "gather" | "mix" | "seal";
const ORDER_LABEL: Record<string, { label: string; icon: string; tip: string }> = {
  main: { label: "주재료", icon: "shrimp", tip: "먼저 주재료를 담아요" },
  salt: { label: "소금", icon: "salt", tip: "소금을 고루 섞어요" },
  topsalt: { label: "웃소금", icon: "salt", tip: "마지막에 위를 소금으로 덮어요" },
};
const DEMO_BASE = 1240; // 로컬 모드 데모용 가상 누적치
const DEMO_GOAL = 5000;
type Community = { live: boolean; id?: string; title?: string; goal?: number; progress?: number; status?: string };

function fmt(ms: number) {
  const s = Math.max(0, Math.ceil(ms / 1000));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

export default function Jeotgal() {
  const { state, startJar, openJar, contribute, mode, demoTools } = useGame();
  const [comm, setComm] = useState<Community>({ live: false });
  const [step, setStep] = useState<Step>("lobby");
  const [type, setType] = useState<JeotgalType | null>(null);
  const [ratio, setRatio] = useState(30);
  const [order, setOrder] = useState<string[]>([]);
  const [dropping, setDropping] = useState<string | null>(null);
  const [useSincerity, setUseSincerity] = useState(false);
  const [skin, setSkin] = useState("basic");
  const [result, setResult] = useState<JarRecord | null>(null);
  const [npc, setNpc] = useState<string | null>(null);
  const [now, setNow] = useState(Date.now());
  useEffect(() => { const id = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(id); }, []);

  const alv = artisanLevel(state.artisanExp);
  const nextNeed = ARTISAN_LEVELS[alv] ?? null;
  const inv = state.inventory;
  const aging = state.jars.filter((j) => j.status === "aging");
  const done = state.jars.filter((j) => j.status === "done");
  const jarSkin = JAR_SKINS.find((s) => s.id === skin)!;
  const enough = type ? (inv[type.main] ?? 0) >= type.mainNeed && (inv.salt ?? 0) >= type.saltNeed : false;

  const begin = () => { sfx.tap(); setType(null); setOrder([]); setRatio(30); setUseSincerity(false); setStep("type"); };
  const add = (k: string) => {
    if (order.includes(k)) return;
    sfx.plop(); setDropping(k); setTimeout(() => setDropping(null), 850);
    setOrder((o) => [...o, k]);
  };
  const seal = async () => {
    if (!type) return;
    if (!(await startJar({ typeId: type.id, ratio, order, useSincerity, jarSkin: skin }))) { sfx.error(); return; }
    sfx.success();
    setStep("lobby");
  };
  const open = async (j: JarRecord, ff = false) => {
    const r = await openJar(j.id, ff);
    if (r) { sfx.collect(); setResult(r); }
  };

  // 서버 모드: 실제 공동 항아리 진행도 + Realtime 구독
  useEffect(() => {
    if (mode !== "remote") { setComm({ live: false }); return; }
    const load = () => fetch("/api/community", { cache: "no-store" }).then((r) => r.json()).then(setComm).catch(() => {});
    load();
    const sb = getBrowserSupabase();
    const ch = sb?.channel("community-jars").on("postgres_changes", { event: "UPDATE", schema: "public", table: "community_jars" },
      (p) => setComm((c) => ({ ...c, ...(p.new as Community), live: true }))).subscribe();
    return () => { if (ch) sb?.removeChannel(ch); };
  }, [mode, state.communityContribution]);
  const goal = comm.live ? comm.goal ?? DEMO_GOAL : DEMO_GOAL;
  const community = comm.live ? comm.progress ?? 0 : DEMO_BASE + state.communityContribution;

  return (
    <main className="px-3">
      <PageHeader title="젓갈 공방" seal="공방" sub="장인 덕배의 부엌에서 옹기에 젓갈을 담가요" />
      <Hud />

      <div className="paper mt-3 p-3 flex items-center gap-3">
        <button className="w-16 h-16 shrink-0 rounded-xl bg-gold/40 border-2 border-wood anim-squish" onClick={() => setNpc("artisan")} aria-label="젓갈 장인과 대화"><NpcArt look={NPC.artisan.look} /></button>
        <div className="flex-1">
          <p className="font-game text-wood-dark">젓갈 장인 레벨 {alv} <span className="text-sm text-wood">({state.artisanExp}{nextNeed ? ` / ${nextNeed}` : " · MAX"})</span></p>
          <div className="h-2.5 bg-cream-dark rounded-full overflow-hidden mt-1 border border-wood/30">
            <div className="h-full bg-brick" style={{ width: `${nextNeed ? Math.min(100, ((state.artisanExp - ARTISAN_LEVELS[alv - 1]) / (nextNeed - ARTISAN_LEVELS[alv - 1])) * 100) : 100}%` }} />
          </div>
          <div className="flex flex-wrap gap-1.5 mt-2 text-sm">
            {["shrimp", "anchovy", "yellowfish", "salt", "sincerity"].map((k) => <span key={k} className="chip bg-hanji text-sumi !text-sm"><Ico name={ITEM_ICON[k]} size={18} />{ITEMS[k].name} {inv[k] ?? 0}</span>)}
          </div>
        </div>
      </div>
      <p className="text-[11px] text-wood mt-2 px-1">※ 이 미니게임의 비율·숙성 시간·등급은 <b>교육용 게임 수치</b>예요. 실제 식품 제조법이나 식품 안전 기준이 아니며, 실제 발효 과정을 그대로 재현하지 않습니다.</p>

      {step === "lobby" && (
        <>
          <section className="paper p-4 mt-3">
            <div className="flex items-center justify-between">
              <h2 className="title-ribbon">숙성 중인 항아리</h2>
              <button className="btn-brick btn-sm" onClick={begin}><Ico name="jar" size={20} />새 항아리</button>
            </div>
            {aging.length === 0 ? (
              <div className="text-center py-6">
                <div className="w-28 h-32 mx-auto anim-idle"><JarArt face="sleep" /></div>
                <p className="font-game text-wood mt-2">아직 담근 항아리가 없어요</p>
                <button className="btn-sage mt-3" onClick={begin}>첫 젓갈 담그기</button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-3">
                {aging.map((j) => {
                  const t = JTYPE[j.typeId]; const sk = JAR_SKINS.find((s) => s.id === j.jarSkin) ?? JAR_SKINS[0];
                  const pct = Math.min(1, (now - j.startedAt) / (j.readyAt - j.startedAt));
                  const ready = pct >= 1;
                  const stage = ready ? "숙성 완료!" : pct < 0.34 ? "숙성 시작" : "숙성 진행 중";
                  return (
                    <div key={j.id} className="rounded-xl bg-cream border-2 border-wood/40 p-2 text-center">
                      <div className={`w-24 h-28 mx-auto ${ready ? "anim-jump" : "anim-squish"}`}><JarArt fill={0.85} color={t.color} body={sk.body} rim={sk.rim} sealed face={ready ? "happy" : "sleep"} bubbling={!ready} /></div>
                      <p className="font-game text-wood-dark">{t.name}</p>
                      <p className={`text-xs font-game ${ready ? "text-brick" : "text-sage"}`}>{stage}</p>
                      <div className="h-2 bg-cream-dark rounded-full overflow-hidden mt-1"><div className="h-full bg-gradient-to-r from-sage to-gold transition-all" style={{ width: `${pct * 100}%` }} /></div>
                      {ready ? <button className="btn-brick btn-sm w-full mt-2" onClick={() => open(j)}>뚜껑 열기</button> : (
                        <>
                          <p className="text-xs text-wood mt-1">남은 시간 {fmt(j.readyAt - now)}</p>
                          {demoTools && <button className="text-[11px] underline text-wood mt-1" onClick={() => open(j, true)}>숙성 빨리감기 (시연용)</button>}
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          <section className="paper p-4 mt-3">
            <h2 className="title-ribbon !bg-sage">나의 젓갈 도감</h2>
            {done.length === 0 ? <p className="text-wood mt-3">완성한 젓갈이 여기에 기록돼요.</p> : (
              <ul className="mt-3 space-y-2">
                {done.map((j) => {
                  const t = JTYPE[j.typeId]; const g = GRADES.find((x) => x.name === j.grade)!;
                  return (
                    <li key={j.id} className="flex gap-3 items-center rounded-xl bg-cream border-2 border-wood/30 p-2">
                      <div className="w-14 h-16 shrink-0"><JarArt fill={0.85} color={t.color} face="happy" body={JAR_SKINS.find((s) => s.id === j.jarSkin)?.body} /></div>
                      <div className="flex-1 min-w-0 text-sm">
                        <p className="font-game text-wood-dark">{j.grade} · {t.name} <Stars n={g?.stars ?? 1} /></p>
                        <p className="text-wood text-xs">재료: {Object.entries(j.ingredients).map(([k, v]) => `${ITEMS[k].name}×${v}`).join(", ")} · 소금 비율 {j.ratio}% · 순서 {j.order.map((o) => ORDER_LABEL[o].label).join("→")}</p>
                        <p className="text-wood text-xs">제작 {new Date(j.startedAt).toLocaleString("ko-KR")} · 숙성 완료 {j.finishedAt ? new Date(j.finishedAt).toLocaleString("ko-KR") : "-"} · {j.score}점</p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          <section id="community" className="paper p-4 mt-3">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="title-ribbon !bg-wood">강경 공동 젓갈 항아리</h2>
              {comm.live ? <span className="chip bg-sage text-cream">● 실시간 집계</span> : <DemoBadge>로컬 모드 · 데모 수치</DemoBadge>}
            </div>
            <div className="flex gap-4 items-center mt-3">
              <div className="w-28 h-32 shrink-0 anim-squish"><JarArt fill={Math.min(1, community / goal)} color="#D9B45A" body="#8A6731" rim="#5A4033" face="happy" /></div>
              <div className="flex-1">
                <p className="font-game text-wood-dark">모두의 기여 {community.toLocaleString()} / {goal.toLocaleString()}</p>
                <div className="h-3 bg-cream-dark rounded-full overflow-hidden border border-wood/30 mt-1"><div className="h-full bg-gradient-to-r from-gold to-brick" style={{ width: `${(Math.min(1, community / goal)) * 100}%` }} /></div>
                <p className="text-xs text-wood mt-1">내 기여 {state.communityContribution} · 현장 방문객과 온라인 이용자가 함께 채우는 시즌 이벤트예요. {comm.live ? "모든 이용자의 기여가 서버에서 실시간으로 집계돼요." : <>로그인 전에는 전체 수치가 <b>데모 값</b>이에요. 로그인하면 실제 집계에 참여해요.</>}</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {["shrimp", "anchovy", "salt"].map((k) => (
                    <button key={k} className="btn-cream btn-sm" disabled={(inv[k] ?? 0) < 1} onClick={async () => { if (await contribute(k)) sfx.plop(); }}>
                      <Ico name={ITEM_ICON[k]} size={20} /> 기여
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </>
      )}

      {step !== "lobby" && (
        <section className="paper p-4 mt-3">
          <ol className="flex gap-1 text-xs font-game mb-3">
            {(["type", "gather", "mix", "seal"] as Step[]).map((s, i) => (
              <li key={s} className={`flex-1 text-center rounded-full py-1 ${s === step ? "bg-brick text-cream" : "bg-cream-dark text-wood"}`}>{i + 1}. {["종류", "재료", "담기", "숙성"][i]}</li>
            ))}
          </ol>

          {step === "type" && (
            <div className="grid gap-2">
              {JEOTGAL_TYPES.map((t) => {
                const locked = alv < t.unlockLevel;
                return (
                  <button key={t.id} disabled={locked} onClick={() => { sfx.tap(); setType(t); setRatio(Math.round((t.sweetSpot[0] + t.sweetSpot[1]) / 2) - 8); setStep("gather"); }}
                    className={`flex items-center gap-3 rounded-xl border-2 p-3 text-left ${locked ? "bg-cream-dark border-wood/30 opacity-60" : "bg-cream border-wood hover:bg-gold/20"}`}>
                    <div className="w-14 h-16 shrink-0"><JarArt fill={0.7} color={t.color} /></div>
                    <div className="flex-1">
                      <p className="font-game text-lg text-wood-dark">{t.name} {locked && `· 장인 Lv.${t.unlockLevel}부터`}</p>
                      <p className="text-sm text-wood">{t.blurb}</p>
                      <p className="text-xs text-wood flex flex-wrap items-center gap-1">필요: <Ico name={ITEM_ICON[t.main]} size={16} />{ITEMS[t.main].name}×{t.mainNeed} · <Ico name="salt" size={16} />소금×{t.saltNeed} · 숙성 {t.agingMinutes}분(게임 시간)</p>
                    </div>
                  </button>
                );
              })}
              <button className="btn-cream btn-sm" onClick={() => setStep("lobby")}>← 공방으로</button>
            </div>
          )}

          {step === "gather" && type && (
            <div>
              <h3 className="font-game text-xl text-wood-dark">{type.name} 재료 모으기</h3>
              <div className="grid grid-cols-2 gap-2 mt-3">
                {[[type.main, type.mainNeed], ["salt", type.saltNeed]].map(([k, need]) => {
                  const have = inv[k as string] ?? 0; const ok = have >= (need as number);
                  return (
                    <div key={k} className={`rounded-xl border-2 p-3 text-center ${ok ? "border-sage bg-sage/10" : "border-brick bg-brick/10"}`}>
                      <Ico name={ITEM_ICON[k as string]} size={48} className="mx-auto" />
                      <p className="font-game">{ITEMS[k as string].name}</p>
                      <p className={`font-game ${ok ? "text-sage" : "text-brick"}`}>{have} / {need}</p>
                    </div>
                  );
                })}
              </div>
              <label className="mt-3 flex items-center gap-2 rounded-xl bg-gold/30 p-3 font-game text-wood-dark">
                <input type="checkbox" className="w-5 h-5 accent-brick" checked={useSincerity} disabled={(inv.sincerity ?? 0) < 1} onChange={(e) => setUseSincerity(e.target.checked)} />
                <Ico name="sincerity" size={22} />정성 한 스푼 넣기 (보유 {inv.sincerity ?? 0}) — 등급 보너스
              </label>
              {!enough && (
                <div className="mt-3 text-sm rounded-xl bg-cream border-2 border-dashed border-brick p-3">
                  <p className="font-game text-brick">재료가 부족해요! 이렇게 모을 수 있어요:</p>
                  <ul className="list-disc pl-5 text-wood mt-1">
                    <li>실제 장소 방문 인증 (일부 장소에서 재료 보상)</li>
                    <li>퀘스트 보상 받기</li>
                    <li>NPC와 대화 (덕배·만복이 재료를 나눠줘요)</li>
                    <li>온라인 마을의 숨겨진 보물</li>
                  </ul>
                  <div className="flex gap-2 mt-2"><Link href="/quests" className="btn-sage btn-sm">퀘스트</Link><Link href="/village" className="btn-gold btn-sm">온라인 마을</Link></div>
                </div>
              )}
              <div className="flex gap-2 mt-3">
                <button className="btn-cream btn-sm flex-1" onClick={() => setStep("type")}>← 이전</button>
                <button className="btn-brick btn-sm flex-1" disabled={!enough} onClick={() => { sfx.tap(); setOrder([]); setStep("mix"); }}>다음: 항아리에 담기 →</button>
              </div>
            </div>
          )}

          {step === "mix" && type && (
            <div>
              <h3 className="font-game text-xl text-wood-dark">재료를 항아리에 담아요</h3>
              <p className="text-sm text-wood">재료를 눌러서(또는 끌어다) 항아리에 넣으세요. 넣는 순서에 따라 결과가 달라져요!</p>
              <div className="grid sm:grid-cols-2 gap-4 mt-3 items-center">
                <KitchenScene className="pt-8 pb-3">
                <div className="relative mx-auto w-48 h-56"
                  onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); add(e.dataTransfer.getData("text/plain")); }}>
                  {dropping && <span className="absolute left-1/2 -translate-x-1/2 top-6 text-4xl anim-drop z-10"><Ico name={dropping === "main" ? ITEM_ICON[type.main] : ORDER_LABEL[dropping].icon} size={44} /></span>}
                  <div className={dropping ? "anim-shake w-full h-full" : "w-full h-full anim-squish"}>
                    <JarArt fill={order.length / 3 * 0.85} color={type.color} body={jarSkin.body} rim={jarSkin.rim} face={order.length === 3 ? "happy" : "idle"} />
                  </div>
                </div>
                </KitchenScene>
                <div>
                  <div className="grid grid-cols-3 gap-2">
                    {["main", "salt", "topsalt"].map((k) => (
                      <button key={k} draggable={!order.includes(k)} onDragStart={(e) => e.dataTransfer.setData("text/plain", k)}
                        disabled={order.includes(k)} onClick={() => add(k)}
                        className="btn-cream flex-col !gap-0 !py-2 cursor-grab">
                        <Ico name={k === "main" ? ITEM_ICON[type.main] : ORDER_LABEL[k].icon} size={38} />
                        <span className="text-sm">{k === "main" ? ITEMS[type.main].name : ORDER_LABEL[k].label}</span>
                        {order.includes(k) && <span className="text-xs text-sage">{order.indexOf(k) + 1}번째</span>}
                      </button>
                    ))}
                  </div>
                  <div className="mt-4">
                    <label className="font-game text-wood-dark flex justify-between"><span className="flex items-center gap-1"><Ico name="salt" size={18} />소금 비율 (게임 수치)</span><span className="text-brick">{ratio}%</span></label>
                    <input type="range" min={5} max={60} value={ratio} onChange={(e) => setRatio(Number(e.target.value))} className="w-full accent-brick" aria-label="소금 비율" />
                    <div className="flex justify-between text-[11px] text-wood"><span>싱겁게</span><span>장인의 감: {type.sweetSpot[0]}~{type.sweetSpot[1]}% 근처?</span><span>짜게</span></div>
                  </div>
                  <p className="text-xs text-wood mt-2">장인의 귀띔(게임 규칙): {IDEAL_ORDER.map((o) => ORDER_LABEL[o].tip).join(" → ")}</p>
                  {order.length > 0 && <button className="text-xs underline text-wood mt-1" onClick={() => setOrder([])}>↺ 다시 담기</button>}
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <button className="btn-cream btn-sm flex-1" onClick={() => setStep("gather")}>← 이전</button>
                <button className="btn-brick btn-sm flex-1" disabled={order.length < 3} onClick={() => { sfx.tap(); setStep("seal"); }}>다음: 뚜껑 덮기 →</button>
              </div>
            </div>
          )}

          {step === "seal" && type && (
            <div className="text-center">
              <h3 className="font-game text-xl text-wood-dark">항아리를 고르고 봉해요</h3>
              <KitchenScene className="mt-2 pt-6 pb-2"><div className="w-40 h-48 mx-auto anim-idle"><JarArt fill={0.85} color={type.color} body={jarSkin.body} rim={jarSkin.rim} sealed face="happy" /></div></KitchenScene>
              <div className="flex justify-center gap-2 flex-wrap mt-2">
                {JAR_SKINS.map((s) => {
                  const locked = alv < s.unlock;
                  return (
                    <button key={s.id} disabled={locked} onClick={() => setSkin(s.id)}
                      className={`rounded-xl border-2 px-2 py-1 text-sm font-game ${skin === s.id ? "border-brick bg-gold/40" : "border-wood/30 bg-cream"} ${locked ? "opacity-50" : ""}`}>
                      <span className="inline-block w-3 h-3 rounded-full mr-1 align-middle" style={{ background: s.body }} />{s.name}{locked && ` · Lv.${s.unlock}`}
                    </button>
                  );
                })}
              </div>
              <p className="text-sm text-wood mt-3">숙성 시간: 게임 시간 {type.agingMinutes}분 · 다 되면 공방에서 뚜껑을 열 수 있어요.</p>
              <div className="flex gap-2 mt-4">
                <button className="btn-cream btn-sm flex-1" onClick={() => setStep("mix")}>← 이전</button>
                <button className="btn-brick flex-1" onClick={seal}><Ico name="jar" size={22} />숙성 시작</button>
              </div>
            </div>
          )}
        </section>
      )}

      <Modal open={!!result} onClose={() => setResult(null)} label="젓갈 완성">
        {result && (() => {
          const t = JTYPE[result.typeId]; const g = GRADES.find((x) => x.name === result.grade)!;
          return (
            <div className="p-5 text-center">
              <p className="font-game text-brick">숙성 완료!</p>
              <div className="w-36 h-44 mx-auto anim-pop"><JarArt fill={0.9} color={t.color} face="happy" body={JAR_SKINS.find((s) => s.id === result.jarSkin)?.body} /></div>
              <h2 className="font-story font-bold text-2xl text-wood-dark mt-2">{result.grade}</h2>
              <p className="font-game text-wood">{state.player.name}의 {t.name}</p>
              <p className="text-2xl mt-1"><Stars n={g.stars} /></p>
              <p className="text-sm text-wood mt-2">게임 점수 {result.score}점 · 소금 비율 {result.ratio}% · 순서 {result.order.map((o) => ORDER_LABEL[o].label).join("→")}</p>
              <p className="text-[11px] text-wood/80 mt-2">등급은 게임 내 재료 선택과 순서로 정해지는 게임 결과예요.</p>
              <button className="btn-sage w-full mt-4" onClick={() => setResult(null)}>젓갈 도감에 저장!</button>
            </div>
          );
        })()}
      </Modal>
      <NpcDialog npcId={npc} onClose={() => setNpc(null)} />
    </main>
  );
}
