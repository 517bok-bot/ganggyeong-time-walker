"use client";
// 이야기: 「다시 울리는 종」 1시간 · 6곳. 지금 할 일과 지난 장면 다시 보기.
import Link from "next/link";
import { useState } from "react";
import { useGame } from "@/lib/game";
import { CHAPTERS, chapterProgress, currentChapter, type Chapter } from "@/lib/data/story";
import { LOC } from "@/lib/data/locations";
import StoryPlayer from "@/components/StoryPlayer";
import { Ico } from "@/components/art/Icons";

export default function Story() {
  const { state } = useGame();
  const cur = currentChapter(state);
  const [play, setPlay] = useState<{ ch: Chapter; part: "intro" | "arrive" | "outro" } | null>(null);
  // 집에서 받은 흐린 도장 중 이야기 장소 → 강경 방문 초대장
  const faintPlaces = CHAPTERS.filter((c) => c.place && state.visits[c.place]?.method === "online").map((c) => LOC[c.place!]?.name ?? c.place!);
  return (
    <main className="px-4 pt-[max(20px,env(safe-area-inset-top))]">
      <header className="pr-12">
        <p className="text-[12px] font-game font-bold text-vermilion tracking-widest">메인 이야기</p>
        <h1 className="font-story text-[32px] text-sumi leading-tight">다시 울리는 종</h1>
        <p className="text-sm text-sumi-light mt-1">1시간 · 6곳. 흩어진 고양이 가족을 찾고 시간의 종을 다시 울려 주세요.</p>
      </header>
      {faintPlaces.length > 0 && (
        <section className="card mt-3 p-4 border-2 border-dashed border-vermilion/60">
          <p className="text-[12px] font-game font-bold text-vermilion tracking-widest">💌 강경 방문 초대장</p>
          <p className="font-story text-xl text-sumi mt-1">흐린 도장 {faintPlaces.length}곳이 기다리고 있어요</p>
          <p className="text-sm text-sumi-light mt-1">{faintPlaces.join(" · ")}</p>
          <p className="text-sm text-sumi mt-2">강경근대거리에 와서 이 장소들의 QR을 찍으면 <b>진한 도장</b>으로 바뀌고, 현장에서만 들을 수 있는 이야기와 <b>실물 엽서 무료 인쇄</b>가 열려요.</p>
          <p className="text-xs text-sumi-light mt-2">충남 논산시 강경읍 옥녀봉로 30-5 · 웰컴센터에서 시작해요</p>
        </section>
      )}
      <ol className="mt-4 space-y-3">
        {CHAPTERS.map((c) => {
          const p = chapterProgress(c, state);
          const isCur = cur?.id === c.id;
          const locked = !p.claimed && !isCur;
          return (
            <li key={c.id} className={`card overflow-hidden ${locked ? "opacity-55" : ""} ${isCur ? "ring-2 ring-vermilion" : ""}`}>
              <div className="relative h-24">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={`/world/scene-${c.scene}.webp`} alt="" className="absolute inset-0 w-full h-full object-cover" style={{ objectPosition: "50% 40%", filter: locked ? "grayscale(.8) blur(1px)" : undefined }} />
                <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent" />
                <div className="absolute left-4 bottom-3 text-hanji-light">
                  <p className="text-[12px] font-game font-bold text-antique-light">{c.no}{p.claimed ? " · 완료" : isCur ? " · 진행 중" : ""}</p>
                  <p className="font-story text-2xl leading-tight">{locked ? "???" : c.title}</p>
                </div>
                {p.claimed && <span className="absolute right-3 top-3 w-9 h-9 rounded-full bg-vermilion text-hanji-light grid place-items-center font-bold">✓</span>}
              </div>
              {!locked && (
                <div className="p-4">
                  {isCur && (
                    <ul className="space-y-2">
                      {c.objectives.map((o) => {
                        const d = o.done(state); const [n, need] = o.count ? o.count(state) : [d ? 1 : 0, 1];
                        return (
                          <li key={o.label}>
                            <Link href={o.href} className="flex items-center gap-3">
                              <span className={`w-6 h-6 shrink-0 rounded-full grid place-items-center text-sm font-bold ${d ? "bg-jade text-white" : "bg-hanji text-sumi-light"}`}>{d ? "✓" : ""}</span>
                              <span className="flex-1 min-w-0">
                                <span className={`block font-game font-bold ${d ? "text-sumi-light line-through" : "text-sumi"}`}>{o.label}</span>
                                <span className="block text-xs text-sumi-light">{o.hint}{need > 1 ? ` · ${n}/${need}` : ""}</span>
                              </span>
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                  <div className="flex gap-2 mt-3">
                    {isCur && p.complete && <Link href="/explore" className="btn-primary btn-sm flex-1">지도에서 이야기 이어보기</Link>}
                    {isCur && !p.complete && <Link href="/explore" className="btn-primary btn-sm flex-1"><Ico name="map" size={18} />지도로 가기</Link>}
                    <button className="btn-soft btn-sm" onClick={() => setPlay({ ch: c, part: p.claimed ? (c.arrive ? "arrive" : "outro") : "intro" })}>장면 다시 보기</button>
                  </div>
                  {p.claimed && <p className="text-xs text-sumi-light mt-2">보상: +{c.reward.exp} EXP · 엽전 {c.reward.coins}{c.reward.badge ? ` · ‘${c.reward.badge}’ 배지` : ""}</p>}
                </div>
              )}
            </li>
          );
        })}
      </ol>
      <StoryPlayer chapter={play?.ch ?? null} part={play?.part ?? "intro"} onDone={() => setPlay(null)} />
    </main>
  );
}
