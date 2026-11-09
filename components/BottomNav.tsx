"use client";
// 하단 메뉴: 옻칠한 청록 목판 위의 다섯 칸. 가운데 '지도'는 붉은 인장 단추로 크게.
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useGame, claimableCount } from "@/lib/game";
import { Ico } from "./art/Icons";
import { haptic } from "@/lib/fx";

const TABS = [
  { href: "/", label: "첫 장", icon: "home" },
  { href: "/quests", label: "여정", icon: "scroll" },
  { href: "/explore", label: "지도", icon: "map", main: true },
  { href: "/dex", label: "도감", icon: "book" },
  { href: "/me", label: "내 공간", icon: "pouch" },
];

export default function BottomNav() {
  const path = usePathname();
  const { state } = useGame();
  const badge = claimableCount(state);
  if (path.startsWith("/admin")) return null;
  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 pb-[max(8px,env(safe-area-inset-bottom))] px-3 pointer-events-none" aria-label="주 메뉴">
      <div className="relative mx-auto max-w-md h-[66px] pointer-events-auto rounded-[22px] border-[1.5px] border-sumi-dark flex items-stretch"
        style={{ background: "linear-gradient(#2E4A4D, #1F3335)", backgroundImage: "var(--woodgrain), linear-gradient(#2E4A4D, #1F3335)", boxShadow: "inset 0 0 0 1px rgba(181,139,72,.7), inset 0 2px 0 rgba(255,255,255,.08), 0 14px 30px -10px rgba(20,32,34,.65)" }}>
        {TABS.map((t) => {
          const active = t.href === "/" ? path === "/" : path.startsWith(t.href);
          if (t.main) return (
            <Link key={t.href} href={t.href} aria-current={active ? "page" : undefined} onClick={() => haptic(10)} aria-label="탐험 지도"
              className="relative flex-1 flex justify-center">
              <span className={`absolute -top-6 w-[68px] h-[68px] rounded-full grid place-items-center text-hanji-light transition-transform duration-300 active:scale-90 ${active ? "scale-105" : ""}`}
                style={{ background: "radial-gradient(circle at 40% 35%, #B4554C, #963F38 60%, #7A2F29)", boxShadow: "inset 0 0 0 3px #963F38, inset 0 0 0 4.5px rgba(242,231,208,.8), 0 6px 0 #5c2520, 0 10px 20px -6px rgba(0,0,0,.5)", transitionTimingFunction: "var(--spring)" }}>
                <span className="flex flex-col items-center"><Ico name="map" size={30} /><span className="text-[11px] font-game font-bold -mt-0.5">지도</span></span>
              </span>
            </Link>
          );
          return (
            <Link key={t.href} href={t.href} aria-current={active ? "page" : undefined} onClick={() => haptic(8)}
              className="relative flex-1 flex flex-col items-center justify-center gap-0.5 active:scale-90 transition-transform" style={{ transitionTimingFunction: "var(--spring)" }}>
              <span className={`grid place-items-center w-10 h-8 rounded-full transition-all duration-300 ${active ? "bg-hanji-light -translate-y-0.5" : "opacity-80"}`} style={{ transitionTimingFunction: "var(--spring)" }}>
                <Ico name={t.icon} size={24} />
              </span>
              <span className={`text-[11px] font-game font-bold ${active ? "text-antique-light" : "text-hanji/75"}`}>{t.label}</span>
              {t.href === "/quests" && badge > 0 && <span className="seal seal-round absolute top-1 right-[18%] w-5 h-5 text-[11px] anim-pop">{badge}</span>}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
