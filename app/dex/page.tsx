"use client";
// 강경 박물도감: 고서 수집첩 형식 (삽화 카드 · 붉은 수집 인장 · 책장 넘김)
import { useState } from "react";
import Link from "next/link";
import { useGame } from "@/lib/game";
import { RARITY_STYLE, type GameCharacter } from "@/lib/data/characters";
import { locLabel } from "@/lib/data/locations";
import { useContent } from "@/lib/content";
import { NPCS } from "@/lib/data/npcs";
import { JEOTGAL_TYPES, JTYPE } from "@/lib/data/jeotgal";
import { PageHeader, Hud, Modal } from "@/components/ui";
import { CharacterArt, NpcArt } from "@/components/Characters";
import { JarArt } from "@/components/Jar";
import { SpecimenCard } from "@/components/art/Specimen";
import { LocationScene } from "@/components/art/LocationArt";
import { Building } from "@/components/Building";
import { LOCATION_ART } from "@/components/art/LocationArt";
import { Ico } from "@/components/art/Icons";
import { sfx } from "@/lib/audio";

const TABS = [
  ["chars", "친구", "paw"], ["places", "명소", "pin"], ["history", "옛이야기", "scroll"], ["achv", "배지", "star"],
] as const;
type Tab = (typeof TABS)[number][0];
const d = (t: number) => new Date(t).toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric" });

export default function Dex() {
  const { state } = useGame();
  const { characters: CHARACTERS, locations: LOCATIONS, LOC, knowledge: KNOWLEDGE } = useContent();
  const [tab, setTab] = useState<Tab>("chars");
  const [sel, setSel] = useState<GameCharacter | null>(null);
  const [selLoc, setSelLoc] = useState<string | null>(null);
  const charFound = CHARACTERS.filter((c) => state.characters[c.id]).length;
  const total = CHARACTERS.length + LOCATIONS.length + KNOWLEDGE.length;
  const got = charFound + Object.keys(state.visits).length + state.knowledgeRead.length;

  return (
    <main className="px-3">
      <PageHeader title="강경 박물도감" seal="도감" sub="그림 속 거리에서 모은 인연과 기억의 수집첩"
        right={<div className="text-right"><p className="font-story text-3xl text-vermilion">{Math.round((got / total) * 100)}%</p><p className="text-xs text-sumi-light">{got}/{total}</p></div>} />
      <Hud />

      {/* 책갈피 탭 */}
      <div className="flex gap-1.5 mt-4 overflow-x-auto no-scrollbar pb-1">
        {TABS.map(([k, l, icon]) => (
          <button key={k} data-nosfx onClick={() => { sfx.page(); setTab(k); }} aria-pressed={tab === k}
            className={`shrink-0 flex items-center gap-1 px-3 pt-2 pb-3 border border-sumi/60 font-game font-bold text-sm transition-transform ${tab === k ? "bg-vermilion text-hanji-light -translate-y-0" : "bg-hanji-light text-sumi translate-y-1"}`}
            style={{ clipPath: "polygon(0 0,100% 0,100% 82%,50% 100%,0 82%)", backgroundImage: "var(--fiber)" }}>
            <Ico name={icon} size={20} />{l}
          </button>
        ))}
      </div>

      <section key={tab} className="paper p-4 mt-1 anim-flip">
        {tab === "chars" && (
          <>
            <Progress label="인연 수집" a={charFound} b={CHARACTERS.length} />
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
              {CHARACTERS.map((c, i) => {
                const f = state.characters[c.id];
                return (
                  <SpecimenCard key={c.id} no={i + 1} collected={!!f} onClick={() => { sfx.page(); setSel(c); }}
                    tone={c.rarity === "SR" ? "dream" : c.kind === "cat" ? "teal" : "jade"}
                    rarity={<span className={`chip !text-[10px] ${RARITY_STYLE[c.rarity]}`}>{c.rarity}</span>}
                    title={f ? c.name : "미상(未詳)"} subtitle={f ? c.role : c.family ?? "아직 만나지 못한 인연"}
                    footer={f ? <>{d(f.at)} · {f.method === "online" ? "온라인" : "현장"}</> : null}
                    art={<CharacterArt id={c.id} silhouette={!f} mood={f ? "happy" : "idle"} className={`w-full h-full ${f ? "anim-idle" : ""}`} />} />
                );
              })}
            </div>
          </>
        )}

        {tab === "places" && (
          <>
            <Progress label="명소 방문" a={Object.keys(state.visits).length} b={LOCATIONS.length} />
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
              {LOCATIONS.map((l) => {
                const v = state.visits[l.id];
                const a = LOCATION_ART[l.id];
                return (
                  <SpecimenCard key={l.id} no={l.no} collected={!!v} stamp="방문" onClick={() => { sfx.page(); setSelLoc(l.id); }}
                    title={l.name} subtitle={l.note ? `(${l.note}) · ${l.zone === "street" ? "근대거리" : "구락부"}` : l.zone === "street" ? "강경근대거리" : "강경구락부"}
                    footer={v ? <>{d(v.at)} · {v.method.toUpperCase()} 인증</> : state.villageFound.includes(`place:${l.id}`) ? "온라인으로 엿봄" : "안개 속"}
                    art={<svg viewBox={`-10 -10 ${(a?.w ?? 140) + 20} ${(a?.h ?? 120) + 14}`} className={`w-full h-full ${v ? "" : "opacity-40 blur-[1px]"}`}><Building w={a?.w ?? 140} h={a?.h ?? 120} style={a?.style ?? "shop"} wall={a?.wall} roof={a?.roof} lit={!!v} /></svg>} />
                );
              })}
            </div>
          </>
        )}

        {tab === "history" && (
          <div className="space-y-3">
            {KNOWLEDGE.map((k, i) => {
              const r = state.knowledgeRead.includes(k.id);
              return (
                <details key={k.id} className="border border-sumi/50 bg-hanji p-3" style={{ backgroundImage: "var(--fiber)" }}>
                  <summary className="font-story text-lg text-sumi cursor-pointer flex items-center gap-2">
                    <span className={`seal w-7 h-7 text-xs ${r ? "" : "!bg-transparent !text-sumi/50 !shadow-none border border-sumi/30"}`}>{i + 1}</span>
                    {r ? k.title : "아직 듣지 못한 옛이야기"}
                  </summary>
                  {r ? (
                    <div className="text-sm text-sumi mt-2 leading-relaxed"><p>{k.body}</p>{k.caveat && <p className="text-xs mt-1 text-sumi-light">※ {k.caveat}</p>}
                      <p className="text-xs mt-1 text-sumi-light">출처: {k.sources.map((s) => s.url ? <a key={s.label} className="underline mr-2" href={s.url} target="_blank" rel="noreferrer">{s.label}</a> : <span key={s.label} className="mr-2">{s.label}</span>)}</p></div>
                  ) : <p className="text-sm text-sumi-light mt-2">마을 사람들(NPC)과 이야기를 나누면 이 장이 채워집니다.</p>}
                </details>
              );
            })}
          </div>
        )}

        {tab === "achv" && (
          Object.keys(state.achievements).length === 0 ? <p className="text-sumi-light">아직 배지가 없어요. 이야기를 진행하면 배지를 받아요.</p> : (
            <ul className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {Object.entries(state.achievements).map(([k, at]) => (
                <li key={k} className="text-center anim-pop">
                  <div className="mx-auto seal seal-round w-24 h-24 text-sm leading-tight p-3">{k === "cat-family" ? "고양이 가족 완성" : k.replace("badge:", "")}</div>
                  <p className="text-[11px] text-sumi-light mt-1">{d(at)}</p>
                </li>
              ))}
            </ul>
          )
        )}
      </section>

      <Modal open={!!sel} onClose={() => setSel(null)} label="인연 상세">
        {sel && (() => {
          const f = state.characters[sel.id];
          return (
            <div className="p-5">
              <div className="relative mx-auto w-44 h-48 border border-sumi" style={{ background: f ? "radial-gradient(circle at 70% 28%, #EFE2C2 0 14%, rgba(239,226,194,.18) 15% 30%, transparent 31%), #263D40" : "#D6C29C" }}>
                <CharacterArt id={sel.id} silhouette={!f} mood={f ? "wave" : "idle"} className={`absolute inset-3 ${f ? "anim-idle" : ""}`} />
              </div>
              <div className="flex justify-center gap-1 mt-2"><span className={`chip ${RARITY_STYLE[sel.rarity]}`}>{sel.rarity}</span>{sel.family && <span className="chip bg-hanji text-sumi">{sel.family}</span>}</div>
              <h2 className="font-story text-3xl text-sumi text-center mt-1">{f ? sel.name : "미상(未詳)"} {f && sel.roman && <span className="text-base text-sumi-light font-game">{sel.roman}</span>}</h2>
              <div className="ink-rule my-2" />
              {f ? (
                <div className="text-sm mt-2 space-y-2 text-sumi">
                  {sel.quote !== "…" && <p className="font-game font-bold text-vermilion text-center">“{sel.quote}”</p>}
                  <p><b className="font-game">역할</b> {sel.role}</p>
                  {sel.personality.length > 0 && <p><b className="font-game">성격</b> {sel.personality.map((p) => <span key={p} className="chip bg-hanji text-sumi mr-1">#{p}</span>)}</p>}
                  <p><b className="font-game">좋아하는 것</b> {sel.likes}</p>
                  <p className="border-l-2 border-vermilion pl-3 leading-relaxed">{sel.story}</p>
                  <p><b className="font-game">만난 곳</b> {f.place} · {d(f.at)}</p>
                  <p className="text-[11px] text-sumi-light">설정 출처: {sel.source}{sel.uncertain && ` · ${sel.uncertain}`}</p>
                </div>
              ) : (
                <div className="text-sm mt-2 space-y-2 text-center text-sumi">
                  <p className="text-sumi-light">아직 만나지 못한 인연입니다.</p>
                  <p><b className="font-game">현장</b> {sel.howToGet}</p>
                  <p><b className="font-game">온라인</b> {sel.onlineHint}</p>
                </div>
              )}
              <p className="text-[10px] text-sumi-light/80 mt-3">논산시 지역 캐릭터 · 논산시 사업 협의에 따라 사용</p>
            </div>
          );
        })()}
      </Modal>

      <Modal open={!!selLoc} onClose={() => setSelLoc(null)} label="명소 상세">
        {selLoc && LOC[selLoc] && (
          <div className="p-4">
            <LocationScene id={selLoc} name={LOC[selLoc].name} />
            <h2 className="font-story text-3xl text-sumi mt-3">{LOC[selLoc].no}. {locLabel(LOC[selLoc])}</h2>
            <p className="text-sm text-sumi-light">{LOC[selLoc].zone === "street" ? "강경근대거리" : "강경구락부"} · 안내도 표기 장소</p>
            {LOC[selLoc].description && <p className="text-sm text-sumi mt-2">{LOC[selLoc].description}</p>}
            {LOC[selLoc].historyStatus === "approved" && LOC[selLoc].history
              ? <p className="text-sm text-sumi mt-2 border-l-2 border-vermilion pl-3 whitespace-pre-line">{LOC[selLoc].history}</p>
              : <p className="text-sm text-sumi-light mt-2">역사 정보는 공식 자료 확인 후 기록됩니다.</p>}
            <Link href="/explore" className="btn-sage btn-sm w-full mt-4"><Ico name="map" size={20} />지도에서 보기</Link>
          </div>
        )}
      </Modal>
    </main>
  );
}

function Progress({ label, a, b }: { label: string; a: number; b: number }) {
  return (
    <div className="flex items-center gap-3">
      <span className="font-game font-bold text-sumi shrink-0">{label}</span>
      <span className="flex-1 h-2 bg-hanji-dark"><span className="block h-full bg-vermilion" style={{ width: `${(a / b) * 100}%` }} /></span>
      <span className="font-story text-lg text-vermilion">{a}/{b}</span>
    </div>
  );
}
