"use client";
// 이야기: 「멈춘 시간의 포구」 여섯 장. 지금 할 일과 지난 장면 다시 보기.
import Link from "next/link";
import { useState } from "react";
import { useGame } from "@/lib/game";
import { CHAPTERS, chapterProgress, currentChapter, type Chapter } from "@/lib/data/story";
import StoryPlayer from "@/components/StoryPlayer";
import { Ico } from "@/components/art/Icons";

export default function Story() {
  const { state } = useGame();
  const cur = currentChapter(state);
  const [play, setPlay] = useState<{ ch: Chapter; part: "intro" | "outro" } | null>(null);
  return (
    <main className="px-4 pt-[max(20px,env(safe-area-inset-top))]">
      <header className="pr-12">
        <p className="text-[12px] font-game font-bold text-vermilion tracking-widest">메인 이야기</p>
        <h1 className="font-story text-[32px] text-sumi leading-tight">멈춘 시간의 포구</h1>
        <p className="text-sm text-sumi-light mt-1">시간의 종을 고치고, 흩어진 고양이 가족을 다시 만나게 해 주세요.</p>
      </header>
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
                    <button className="btn-soft btn-sm" onClick={() => setPlay({ ch: c, part: p.claimed ? "outro" : "intro" })}>장면 다시 보기</button>
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
