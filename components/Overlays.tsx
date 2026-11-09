"use client";
// 알림(한지 쪽지)과 캐릭터 발견 연출(달빛 속 족자 + 붉은 인장)
import { useEffect } from "react";
import { useGame } from "@/lib/game";
import { RARITY_STYLE } from "@/lib/data/characters";
import { useContent } from "@/lib/content";
import { CharacterArt } from "./Characters";
import { Ico } from "./art/Icons";
import { sfx } from "@/lib/sfx";

export default function Overlays() {
  const { toasts, collectQueue, dismissCollect, state } = useGame();
  const { CHAR } = useContent();
  const current = collectQueue[0];
  const c = current ? CHAR[current] : null;

  useEffect(() => {
    if (!c) return;
    if (c.kind === "cat") sfx.meow();
    setTimeout(() => sfx.collect(), 250);
    setTimeout(() => sfx.stamp(), 900);
  }, [c]);

  return (
    <>
      <div className="fixed top-3 inset-x-0 z-[60] flex flex-col items-center gap-2 pointer-events-none px-3" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className="paper anim-rise px-4 py-2 flex items-center gap-2 max-w-md font-game font-bold text-sumi">
            <Ico name={t.icon ?? "plum"} size={24} />{t.text}
          </div>
        ))}
      </div>

      {c && (
        <div className="fixed inset-0 z-[70] grid place-items-center p-4 overflow-hidden" role="dialog" aria-modal aria-label="캐릭터 발견" onClick={dismissCollect}
          style={{ background: "radial-gradient(ellipse at 50% 35%, #3B5659 0%, #1A2B2D 70%)" }}>
          {/* 달무리와 안개 */}
          <div className="absolute left-1/2 top-[28%] -translate-x-1/2 -translate-y-1/2 w-[440px] h-[440px] rounded-full anim-glow pointer-events-none"
            style={{ background: "radial-gradient(circle, rgba(239,226,194,.55) 0%, rgba(239,226,194,.18) 45%, transparent 70%)" }} />
          <svg className="absolute bottom-0 left-0 w-full h-1/3 opacity-60 anim-fog pointer-events-none" viewBox="0 0 1000 200" preserveAspectRatio="none" aria-hidden>
            <g filter="url(#soft-fog)" fill="#E8D8B8" opacity=".5"><ellipse cx="250" cy="150" rx="320" ry="40" /><ellipse cx="760" cy="120" rx="300" ry="34" /></g>
          </svg>
          <div className="relative w-full max-w-sm text-center" onClick={(e) => e.stopPropagation()}>
            <p className="relative font-story text-2xl text-hanji-light anim-ink">달빛 아래, 새로운 인연</p>
            <div className="relative mx-auto mt-2 w-48 h-52 anim-pop">
              <CharacterArt id={c.id} mood="wave" className="w-full h-full anim-idle" />
              {[0, 1, 2, 3, 4].map((i) => (
                <span key={i} className="absolute anim-sparkle" style={{ left: `${[6, 84, 14, 80, 46][i]}%`, top: `${[12, 6, 72, 66, -4][i]}%`, animationDelay: `${i * 0.35}s` }}><Ico name="plum" size={16} /></span>
              ))}
            </div>
            <div className="relative paper mt-1 p-5 anim-unfold">
              <div className="flex justify-center gap-1.5 mb-1">
                <span className={`chip ${RARITY_STYLE[c.rarity]}`}>{c.rarity}</span>
                {c.family && <span className="chip bg-hanji text-sumi">{c.family}</span>}
                <span className="chip bg-teal text-hanji-light">{state.characters[c.id]?.method === "online" ? "온라인 발견" : "현장 발견"}</span>
              </div>
              <h2 className="font-story text-4xl text-sumi">{c.name}</h2>
              <p className="text-sm text-sumi-light">{c.role}</p>
              {c.quote && c.quote !== "…" && <p className="mt-2 font-game font-bold text-vermilion">“{c.quote}”</p>}
              <div className="absolute -right-4 -top-7 anim-stamp">
                <div className="seal w-20 h-20 text-lg leading-tight rotate-[-6deg]"><span>도감<br />등록</span></div>
              </div>
              <button className="btn-sage w-full mt-4" onClick={() => { sfx.tap(); dismissCollect(); }}>인연을 기록하다</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
