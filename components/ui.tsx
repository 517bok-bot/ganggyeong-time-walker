"use client";
import Link from "next/link";
import { createPortal } from "react-dom";
import { useEffect, useState } from "react";

/** 화면 최상단(body)으로 띄워 페이지 전환 효과·쌓임 순서의 영향을 받지 않게 */
export function Portal({ children }: { children: React.ReactNode }) {
  const [el, setEl] = useState<HTMLElement | null>(null);
  useEffect(() => setEl(document.body), []);
  return el ? createPortal(children, el) : null;
}
import { useGame, expToNext } from "@/lib/game";
import { WalkerArt } from "./Characters";
import { Ico } from "./art/Icons";
import { HouseEmblem, HOUSE, rankTitle } from "./art/Houses";

/** 여행자 명패: 달 모양 초상 + 이름 + 먹 붓질 경험치 + 엽전 */
export function Hud() {
  const { state } = useGame();
  const p = state.player;
  const need = expToNext(p.level);
  return (
    <div className="silk-frame"><div className="paper flex items-center gap-3 px-4 py-2.5">
      <Link href="/wardrobe" className="relative w-12 h-12 shrink-0 rounded-full border-2 border-sumi bg-hanji overflow-hidden" aria-label="옷장">
        <span className="absolute inset-0" style={{ background: "radial-gradient(circle at 50% 40%, #EFE2C2, #D6C29C)" }} />
        <span className="absolute inset-x-1 -bottom-1 h-12"><WalkerArt avatar={p.avatar} /></span>
      </Link>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 min-w-0">
          {p.house && <HouseEmblem id={p.house} size={22} />}
          <span className="seal px-1.5 h-6 text-[13px] shrink-0">Lv.{p.level}</span>
          <span className="truncate font-story text-lg text-sumi">{p.name}</span>
          <span className="hidden sm:inline text-xs font-game font-bold text-antique-dark truncate">{p.house ? `${HOUSE[p.house]?.name} · ` : ""}{rankTitle(p.level)}</span>
        </div>
        <div className="mt-1 h-2.5 relative" title={`${p.exp}/${need} 경험`}>
          <svg viewBox="0 0 200 10" preserveAspectRatio="none" className="absolute inset-0 w-full h-full">
            <path d="M2 5 Q50 3 100 5 T198 5" stroke="#D6C29C" strokeWidth="6" strokeLinecap="round" fill="none" />
          </svg>
          <svg viewBox="0 0 200 10" preserveAspectRatio="none" className="absolute inset-0 h-full transition-all" style={{ width: `${Math.max(4, (p.exp / need) * 100)}%` }}>
            <path d="M2 5 Q50 2.5 100 5 T198 5" stroke="#263D40" strokeWidth="6.5" strokeLinecap="round" fill="none" filter="url(#ink-bleed)" />
          </svg>
        </div>
      </div>
      <div className="flex items-center gap-1 font-game font-bold text-sumi pl-2 border-l border-sumi/30">
        <span data-fx-target="coin" className="inline-flex"><Ico name="coin" size={22} /></span>{p.coins}
      </div>
    </div></div>
  );
}

/** 화면 제목: 명조 큰 제목 + 붉은 낙관 + 먹선 */
export function PageHeader({ title, sub, right, seal }: { title: string; sub?: string; right?: React.ReactNode; seal?: string }) {
  return (
    <header className="pl-1 pr-14 pt-[max(20px,env(safe-area-inset-top))] pb-3">
      <div className="flex items-end justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <div className="min-w-0">
            <h1 className="font-story text-[30px] leading-tight text-sumi">{title}</h1>
            {sub && <p className="text-sumi-light text-sm mt-0.5">{sub}</p>}
          </div>
        </div>
        {right}
      </div>
    </header>
  );
}

export function DemoBadge({ children = "데모" }: { children?: React.ReactNode }) {
  return <span className="demo-badge" title="서버 미연결 · 시연용 기능">{children}</span>;
}

/** 두루마리처럼 펼쳐지는 창 */
export function Modal({ open, onClose, children, label }: { open: boolean; onClose: () => void; children: React.ReactNode; label: string }) {
  if (!open) return null;
  return (<Portal>
    <div className="fixed inset-0 z-50 grid place-items-end sm:place-items-center p-3" role="dialog" aria-modal aria-label={label} onClick={onClose}
      style={{ background: "rgba(30,38,44,.55)", backdropFilter: "blur(3px)" }}>
      <div className="relative w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <div className="card anim-sheet sm:anim-pop max-h-[84dvh] overflow-y-auto">{children}</div>
        <button onClick={onClose} aria-label="닫기" className="absolute -top-3 -right-1 z-20 w-9 h-9 rounded-full bg-white text-sumi font-bold shadow-card grid place-items-center">✕</button>
      </div>
    </div>
  </Portal>);
}

export function Stars({ n, max = 4 }: { n: number; max?: number }) {
  return <span className="tracking-tight" aria-label={`${n}개 중 ${max}`}><span className="text-antique">{"★".repeat(n)}</span><span className="text-sumi/20">{"★".repeat(max - n)}</span></span>;
}

/** 아래에서 올라오는 시트 (모바일 한 손 조작) */
export function Sheet({ open, onClose, children, label }: { open: boolean; onClose: () => void; children: React.ReactNode; label: string }) {
  if (!open) return null;
  return (<Portal>
    <div className="fixed inset-0 z-50 flex items-end justify-center anim-fade" role="dialog" aria-modal aria-label={label} onClick={onClose}
      style={{ background: "linear-gradient(to top, rgba(26,43,45,.7), rgba(26,43,45,.15))" }}>
      <div className="relative w-full max-w-lg anim-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="card !rounded-b-none max-h-[82dvh] overflow-y-auto pb-[env(safe-area-inset-bottom)]">
          <button onClick={onClose} aria-label="닫기" className="sticky top-0 z-10 block w-full pt-2 pb-1"><span className="block mx-auto w-12 h-1.5 rounded-full bg-sumi/30" /></button>
          {children}
        </div>
      </div>
    </div>
  </Portal>);
}

/** 지도 위 작은 명패: 초상 + 레벨 고리 + 엽전 */
export function MiniHud() {
  const { state } = useGame();
  const p = state.player;
  const need = expToNext(p.level);
  const pct = Math.min(1, p.exp / need);
  const C = 2 * Math.PI * 25;
  return (
    <div className="flex items-center gap-2 pr-3 pl-1 py-1 rounded-full bg-[#FFFDF8]/95 shadow-card">
      <Link href="/me" className="relative w-14 h-14 shrink-0" aria-label={`내 공간 · Lv.${p.level}`}>
        <svg viewBox="0 0 56 56" className="absolute inset-0 -rotate-90"><circle cx="28" cy="28" r="25" fill="#E8D8B8" stroke="#D6C29C" strokeWidth="4" />
          <circle cx="28" cy="28" r="25" fill="none" stroke="#263D40" strokeWidth="4" strokeLinecap="round" strokeDasharray={`${C * pct} ${C}`} style={{ transition: "stroke-dasharray .8s var(--out)" }} /></svg>
        <span className="absolute inset-[5px] rounded-full overflow-hidden"><span className="absolute inset-x-0 -bottom-1 h-[52px]"><WalkerArt avatar={p.avatar} /></span></span>
        <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 seal px-1.5 h-5 text-[11px] whitespace-nowrap">Lv.{p.level}</span>
      </Link>
      <div className="min-w-0">
        <p className="font-story text-[15px] text-sumi leading-none truncate max-w-[96px]">{p.name}</p>
        <p className="flex items-center gap-1 font-game font-bold text-sumi text-sm mt-1"><span data-fx-target="coin" className="inline-flex"><Ico name="coin" size={18} /></span>{p.coins}</p>
      </div>
    </div>
  );
}
