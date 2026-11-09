"use client";
// 하단 메뉴: 옻칠한 청록 목판 위의 다섯 칸. 가운데 '지도'는 붉은 인장 단추로 크게.
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useGame } from "@/lib/game";
import { chapterProgress, currentChapter } from "@/lib/data/story";
import { Ico } from "./art/Icons";
import { haptic } from "@/lib/fx";

const TABS = [
  { href: "/", label: "첫 장", icon: "home" },
  { href: "/story", label: "이야기", icon: "scroll" },
  { href: "/explore", label: "지도", icon: "map", main: true },
  { href: "/dex", label: "도감", icon: "book" },
  { href: "/me", label: "내 공간", icon: "pouch" },
];

export default function BottomNav() {
  const path = usePathname();
  const { state } = useGame();
  const cur = currentChapter(state);
  const badge = cur && chapterProgress(cur, state).complete ? 1 : 0;
  if (path.startsWith("/admin")) return null;
  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 pb-[max(8px,env(safe-area-inset-bottom))] px-3 pointer-events-none" aria-label="주 메뉴">
      <div className="relative mx-auto max-w-md h-[66px] pointer-events-auto rounded-[26px] flex items-stretch"
        style={{ background: "rgba(255,253,248,.96)", backdropFilter: "blur(10px)", boxShadow: "0 1px 0 #fff inset, 0 14px 30px -10px rgba(57,51,47,.45), 0 2px 6px rgba(57,51,47,.12)" }}>
        {TABS.map((t) => {
          const active = t.href === "/" ? path === "/" : path.startsWith(t.href);
          if (t.main) return (
            <Link key={t.href} href={t.href} aria-current={active ? "page" : undefined} onClick={() => haptic(10)} aria-label="탐험 지도"
              className="relative flex-1 flex justify-center">
              <span className={`absolute -top-6 w-[68px] h-[68px] rounded-full grid place-items-center text-hanji-light transition-transform duration-300 active:scale-90 ${active ? "scale-105" : ""}`}
                style={{ background: "linear-gradient(#C35A4F, #963F38)", boxShadow: "inset 0 3px 0 rgba(255,255,255,.28), 0 5px 0 #6E2A24, 0 12px 22px -6px rgba(150,63,56,.6), 0 0 0 5px rgba(255,253,248,.96)", transitionTimingFunction: "var(--spring)" }}>
                <span className="flex flex-col items-center"><Ico name="map" size={30} /><span className="text-[11px] font-game font-bold -mt-0.5">지도</span></span>
              </span>
            </Link>
          );
          return (
            <Link key={t.href} href={t.href} aria-current={active ? "page" : undefined} onClick={() => haptic(8)}
              className="relative flex-1 flex flex-col items-center justify-center gap-0.5 active:scale-90 transition-transform" style={{ transitionTimingFunction: "var(--spring)" }}>
              <span className={`grid place-items-center w-10 h-8 rounded-full transition-all duration-300 ${active ? "bg-vermilion/12 -translate-y-0.5" : "opacity-70"}`} style={{ transitionTimingFunction: "var(--spring)" }}>
                <Ico name={t.icon} size={24} />
              </span>
              <span className={`text-[11px] font-game font-bold ${active ? "text-vermilion" : "text-sumi-light"}`}>{t.label}</span>
              {t.href === "/story" && badge > 0 && <span className="seal seal-round absolute top-1 right-[18%] w-5 h-5 text-[11px] anim-pop">!</span>}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
