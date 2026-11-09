"use client";
// 하단 메뉴: 청록 목판 위에 걸린 한지 표찰 (현재 위치는 붉은 인장)
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useGame, claimableCount } from "@/lib/game";
import { Ico } from "./art/Icons";

const TABS = [
  { href: "/", label: "첫 장", icon: "home" },
  { href: "/explore", label: "탐험", icon: "map" },
  { href: "/quests", label: "퀘스트", icon: "scroll" },
  { href: "/dex", label: "도감", icon: "book" },
  { href: "/me", label: "내 공간", icon: "pouch" },
];

export default function BottomNav() {
  const path = usePathname();
  const { state } = useGame();
  const badge = claimableCount(state);
  if (path.startsWith("/admin")) return null;
  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 pb-[env(safe-area-inset-bottom)]" aria-label="주 메뉴">
      <div className="mx-auto max-w-lg relative px-2 pb-2">
        {/* 목판 걸이대 */}
        <div className="absolute left-2 right-2 top-3 h-3 rounded-[2px] bg-teal border border-sumi-dark" style={{ backgroundImage: "var(--woodgrain)" }} />
        <div className="relative flex justify-around gap-1 px-2">
          {TABS.map((t) => {
            const active = t.href === "/" ? path === "/" : path.startsWith(t.href);
            return (
              <Link key={t.href} href={t.href} aria-current={active ? "page" : undefined}
                className={`relative flex flex-col items-center w-[19%] pt-2 pb-1.5 transition-transform ${active ? "translate-y-1" : "hover:translate-y-0.5"}`}>
                <span className="absolute -top-0.5 w-1 h-3 bg-antique-dark" />
                <span className={`relative flex flex-col items-center w-full pt-2 pb-1 border ${active ? "bg-vermilion border-vermilion-dark text-hanji-light" : "bg-hanji-light border-sumi/60 text-sumi"}`}
                  style={{ backgroundImage: "var(--fiber)", clipPath: "polygon(0 0,100% 0,100% 86%,50% 100%,0 86%)", boxShadow: active ? "inset 0 0 0 2px #963F38, inset 0 0 0 3px rgba(242,231,208,.7)" : undefined }}>
                  <Ico name={t.icon} size={26} />
                  <span className="text-[12px] font-game font-bold mt-0.5 mb-1.5">{t.label}</span>
                </span>
                {t.href === "/quests" && badge > 0 && (
                  <span className="seal seal-round absolute top-0 right-0 w-5 h-5 text-[11px]">{badge}</span>
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
