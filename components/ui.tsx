"use client";
import Link from "next/link";
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
        <Ico name="coin" size={22} />{p.coins}
      </div>
    </div></div>
  );
}

/** 화면 제목: 명조 큰 제목 + 붉은 낙관 + 먹선 */
export function PageHeader({ title, sub, right, seal }: { title: string; sub?: string; right?: React.ReactNode; seal?: string }) {
  return (
    <header className="px-4 pt-6 pb-3">
      <div className="flex items-end justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <span className="seal w-9 h-11 text-[15px] vertical shrink-0 mt-1" aria-hidden>{seal ?? title.slice(0, 2)}</span>
          <div className="min-w-0">
            <h1 className="font-story text-[34px] leading-tight text-sumi anim-ink">{title}</h1>
            {sub && <p className="text-sumi-light text-sm mt-0.5">{sub}</p>}
          </div>
        </div>
        {right}
      </div>
      <div className="ink-rule mt-2" />
    </header>
  );
}

export function DemoBadge({ children = "데모" }: { children?: React.ReactNode }) {
  return <span className="demo-badge" title="서버 미연결 · 시연용 기능">{children}</span>;
}

/** 두루마리처럼 펼쳐지는 창 */
export function Modal({ open, onClose, children, label }: { open: boolean; onClose: () => void; children: React.ReactNode; label: string }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 grid place-items-end sm:place-items-center p-3" role="dialog" aria-modal aria-label={label} onClick={onClose}
      style={{ background: "radial-gradient(ellipse at 50% 30%, rgba(38,61,64,.55), rgba(26,43,45,.82))" }}>
      <div className="relative w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <div className="h-3 mx-[-6px] rounded-full bg-teal border border-sumi-dark relative z-10" style={{ backgroundImage: "var(--woodgrain)" }} />
        <div className="silk-frame anim-unroll"><div className="paper !rounded-none max-h-[80dvh] overflow-y-auto">{children}</div></div>
        <div className="h-3 mx-[-6px] rounded-full bg-teal border border-sumi-dark relative z-10" style={{ backgroundImage: "var(--woodgrain)" }} />
        <button onClick={onClose} aria-label="닫기" className="absolute -top-3 right-2 z-20 seal seal-round w-8 h-8 text-sm">✕</button>
      </div>
    </div>
  );
}

export function Stars({ n, max = 4 }: { n: number; max?: number }) {
  return <span className="tracking-tight" aria-label={`${n}개 중 ${max}`}><span className="text-antique">{"★".repeat(n)}</span><span className="text-sumi/20">{"★".repeat(max - n)}</span></span>;
}
