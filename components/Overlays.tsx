"use client";
// 알림(한지 쪽지)과 캐릭터 발견 연출(달빛 속 족자 + 붉은 인장)
import { useEffect, useRef } from "react";
import { fx, haptic } from "@/lib/fx";
import { useGame } from "@/lib/game";
import { RARITY_STYLE } from "@/lib/data/characters";
import { useContent } from "@/lib/content";
import { CharacterArt } from "./Characters";
import { Ico } from "./art/Icons";
import { sfx } from "@/lib/sfx";

const GLOW: Record<string, string> = { N: "#9CC5B4", R: "#A9C8E0", SR: "#F3D896", SSR: "#F7B7A3" };
const EMOJI_ICON: Record<string, string> = { "✨": "star", "🎁": "gift", "🎉": "star", "🏅": "star", "🏺": "jar", "🐾": "paw", "💌": "letter", "💎": "star", "📜": "scroll", "⚠️": "warn", "ℹ️": "plum", "📡": "compass", "🎬": "album", "🧺": "basket", "🍶": "jar", "📮": "letter", "🏮": "lantern" };
const toastIcon = (i?: string) => (!i ? "plum" : EMOJI_ICON[i] ?? (/^[a-z]+$/.test(i) ? i : "plum"));

export default function Overlays() {
  const { toasts, collectQueue, dismissCollect, state } = useGame();
  const { CHAR } = useContent();
  const current = collectQueue[0];
  const c = current ? CHAR[current] : null;

  const heroRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!c) return;
    haptic([10, 60, 10]);
    const t = [
      setTimeout(() => { sfx.open(); }, 200),
      setTimeout(() => {
        if (c.kind === "cat") sfx.meow();
        sfx.collect(); haptic([25, 40, 40]);
        const r = heroRef.current?.getBoundingClientRect();
        if (r) fx.burst(r.left + r.width / 2, r.top + r.height / 2, { big: true, color: GLOW[c.rarity] });
      }, 1050),
      setTimeout(() => sfx.stamp(), 2000),
    ];
    return () => t.forEach(clearTimeout);
  }, [c]);

  return (
    <>
      <div className="fixed top-[calc(max(12px,env(safe-area-inset-top))+124px)] inset-x-0 z-[60] flex flex-col items-center gap-2 pointer-events-none px-4" aria-live="polite">
        {toasts.slice(-3).map((t) => (
          <div key={t.id} className="anim-toast pl-2 pr-4 py-1.5 flex items-center gap-2 max-w-sm rounded-full font-game font-bold text-[14px] text-hanji-light bg-sumi/90 border border-antique/70 shadow-card backdrop-blur-sm">
            <span className="grid place-items-center w-7 h-7 rounded-full bg-hanji-light shrink-0"><Ico name={toastIcon(t.icon)} size={20} /></span><span className="leading-snug">{t.text}</span>
          </div>
        ))}
      </div>

      {c && (
        <div key={c.id} className="fixed inset-0 z-[70] grid place-items-center p-4 overflow-hidden anim-fade" role="dialog" aria-modal aria-label="캐릭터 발견" onClick={dismissCollect}
          style={{ background: "radial-gradient(ellipse at 50% 40%, #2C4649 0%, #121F21 75%)" }}>
          {/* 빛기둥 */}
          <div className="absolute left-1/2 bottom-0 -translate-x-1/2 w-[220px] h-[85%] anim-beam pointer-events-none"
            style={{ background: `linear-gradient(to top, ${GLOW[c.rarity]}, transparent 85%)`, filter: "blur(18px)" }} />
          <svg viewBox="-100 -100 200 200" className="absolute left-1/2 top-[34%] w-[520px] h-[520px] -translate-x-1/2 -translate-y-1/2 anim-rays pointer-events-none opacity-60" aria-hidden>
            {Array.from({ length: 18 }, (_, i) => <path key={i} d="M-5 -24 L0 -98 L5 -24Z" fill={GLOW[c.rarity]} opacity=".5" transform={`rotate(${i * 20})`} />)}
          </svg>
          <svg className="absolute bottom-0 left-0 w-full h-1/3 opacity-50 anim-fog pointer-events-none" viewBox="0 0 1000 200" preserveAspectRatio="none" aria-hidden>
            <g filter="url(#soft-fog)" fill="#E8D8B8" opacity=".5"><ellipse cx="250" cy="150" rx="320" ry="40" /><ellipse cx="760" cy="120" rx="300" ry="34" /></g>
          </svg>
          <div className="relative w-full max-w-sm text-center" onClick={(e) => e.stopPropagation()}>
            <p className="relative font-game font-bold tracking-[.35em] text-antique-light text-xs anim-rise">{c.rarity} · 새로운 인연</p>
            <div ref={heroRef} className="relative mx-auto mt-2 w-52 h-56 anim-reveal">
              <CharacterArt id={c.id} mood="wave" className="w-full h-full anim-idle drop-shadow-[0_0_24px_rgba(243,216,150,.45)]" />
            </div>
            <div className="relative paper mt-1 p-5 anim-card-up" style={{ animationDelay: "1.35s" }}>
              <div className="flex justify-center gap-1.5 mb-1">
                <span className={`chip ${RARITY_STYLE[c.rarity]}`}>{c.rarity}</span>
                {c.family && <span className="chip bg-hanji text-sumi">{c.family}</span>}
                <span className="chip bg-teal text-hanji-light">{state.characters[c.id]?.method === "online" ? "온라인 발견" : "현장 발견"}</span>
              </div>
              <h2 className="font-story text-4xl text-sumi">{c.name}</h2>
              <p className="text-sm text-sumi-light">{c.role}</p>
              {c.quote && c.quote !== "…" && <p className="mt-2 font-game font-bold text-vermilion">“{c.quote}”</p>}
              <div className="absolute -right-4 -top-7 anim-stamp" style={{ animationDelay: "1.9s" }}>
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
