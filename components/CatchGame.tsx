"use client";
// 시간 조각 붙잡기: 줄어드는 금빛 고리가 조각에 겹칠 때 톡! (실패 없이 누구나 잡을 수 있게, 타이밍은 칭찬만 달라짐)
import { useEffect, useRef, useState } from "react";
import type { SparkInfo } from "@/lib/data/sparks";
import { PICNIC } from "@/lib/data/picnic";
import { ITEMS } from "@/lib/data/jeotgal";
import { Ico } from "./art/Icons";
import { sfx } from "@/lib/sfx";
import { fx, haptic } from "@/lib/fx";
import { Portal } from "./ui";

const PERIOD = 1500; // 고리 한 번 줄어드는 시간(ms)

export function SparkGem({ kind, size = 44 }: { kind: SparkInfo["kind"]; size?: number }) {
  const c = kind === "golden" ? ["#FFF1B8", "#E2B85C", "#9C7330"] : kind === "picnic" ? ["#FDE2D6", "#D9806F", "#963F38"] : kind === "shrimp" ? ["#FFE0D0", "#E99A7C", "#A0523A"] : kind === "salt" ? ["#FFFFFF", "#D8E4E6", "#7E9496"] : ["#E9F4EE", "#9CC5B4", "#3E6E64"];
  return (
    <svg viewBox="-24 -24 48 48" width={size} height={size} aria-hidden className="overflow-visible">
      <circle r="22" fill={c[1]} opacity=".25" className="anim-glow" />
      <g className="spark-spin">
        <path d="M0 -18 L5 -5 L18 0 L5 5 L0 18 L-5 5 L-18 0 L-5 -5Z" fill={c[1]} stroke={c[2]} strokeWidth="1.6" strokeLinejoin="round" />
        <path d="M0 -18 L5 -5 L0 0Z M18 0 L5 5 L0 0Z" fill={c[0]} opacity=".9" />
      </g>
      <circle r="4" fill="#fff" opacity=".9" />
    </svg>
  );
}

export function sparkPrize(info: SparkInfo) {
  if (info.picnic) return { icon: info.picnic, text: `소풍 보따리: ${PICNIC[info.picnic]?.name}` };
  if (info.items) { const k = Object.keys(info.items)[0]; return { icon: k, text: `${ITEMS[k]?.name ?? k} 1개` }; }
  return { icon: "hourglass", text: info.kind === "golden" ? "반짝이는 황금 조각!" : "시간의 기운이 모였어요" };
}

export default function CatchGame({ info, onCatch, onClose }: { info: SparkInfo | null; onCatch: () => Promise<SparkInfo | null>; onClose: () => void }) {
  const t0 = useRef(0);
  const [phase, setPhase] = useState<"aim" | "dodge" | "caught">("aim");
  const [grade, setGrade] = useState("");
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [prize, setPrize] = useState<SparkInfo | null>(null);
  const tries = useRef(0);
  const gem = useRef<HTMLDivElement>(null);

  useEffect(() => { if (info) { t0.current = performance.now(); setPhase("aim"); setGrade(""); setPos({ x: 0, y: 0 }); setPrize(null); tries.current = 0; sfx.open(); } }, [info]);
  if (!info) return null;

  const tap = async () => {
    if (phase !== "aim") return;
    // 고리 크기: 2.6 → 0.55 로 반복. 1.0 근처가 '딱 맞음'
    const p = ((performance.now() - t0.current) % PERIOD) / PERIOD;
    const scale = 2.6 - 2.05 * p;
    const diff = Math.abs(scale - 1);
    if (diff > 0.6 && tries.current === 0) {
      tries.current++;
      setPhase("dodge"); sfx.boing(); haptic(20);
      setPos({ x: (Math.random() > .5 ? 1 : -1) * (50 + Math.random() * 40), y: -30 - Math.random() * 40 });
      setTimeout(() => { t0.current = performance.now(); setPhase("aim"); }, 650);
      return;
    }
    const g = diff < 0.15 ? "완벽해요!" : diff < 0.35 ? "좋아요!" : "붙잡았다!";
    setGrade(g); setPhase("caught");
    sfx.collect(); haptic([15, 30, 25]);
    const r = gem.current?.getBoundingClientRect();
    if (r) fx.burst(r.left + r.width / 2, r.top + r.height / 2, { big: diff < 0.15, color: info.kind === "golden" ? "#F3D896" : undefined });
    const got = await onCatch();
    setPrize(got);
  };

  const pr = prize ? sparkPrize(prize) : null;
  return (<Portal>
    <div className="fixed inset-0 z-[72] grid place-items-center anim-fade" role="dialog" aria-modal aria-label="시간 조각 붙잡기"
      style={{ background: "radial-gradient(circle at 50% 45%, rgba(38,61,64,.55), rgba(20,32,34,.9))" }} onPointerDown={tap}>
      <p className="absolute top-[16%] inset-x-0 text-center font-story text-hanji-light text-2xl px-6" style={{ textShadow: "0 2px 0 rgba(0,0,0,.4)" }}>
        {phase === "caught" ? grade : phase === "dodge" ? "앗, 도망갔다!" : info.name}
      </p>
      {phase !== "caught" && <p className="absolute top-[16%] mt-10 inset-x-0 text-center font-game text-hanji/80 text-sm">금빛 고리가 조각에 겹칠 때 화면을 톡!</p>}
      <div className="relative w-56 h-56 grid place-items-center">
        {phase === "aim" && (
          <div className="absolute inset-[22%] pointer-events-none" style={{ transform: `translate(${pos.x}px, ${pos.y}px)` }}>
            <div key={t0.current} className="w-full h-full rounded-full border-[3px] border-antique-light"
              style={{ animation: `catch-ring ${PERIOD}ms linear infinite`, boxShadow: "0 0 18px rgba(243,216,150,.8), inset 0 0 12px rgba(243,216,150,.5)" }} />
          </div>
        )}
        <div className="absolute inset-[22%] rounded-full border border-dashed border-hanji/40 pointer-events-none" style={{ transform: `translate(${pos.x}px, ${pos.y}px)`, transition: "transform .45s var(--spring)" }} />
        <div ref={gem} className={phase === "caught" ? "transition-all duration-500 scale-0 opacity-0" : "spark-float"} style={{ transform: `translate(${pos.x}px, ${pos.y}px)`, transition: "transform .45s var(--spring)" }}>
          <SparkGem kind={info.kind} size={110} />
        </div>
      </div>
      {phase === "caught" && (
        <div className="absolute bottom-[18%] inset-x-6 max-w-sm mx-auto paper p-4 text-center anim-card-up" onPointerDown={(e) => e.stopPropagation()}>
          {pr ? (
            <>
              <div className="flex items-center justify-center gap-3"><Ico name={pr.icon} size={44} /><div className="text-left"><p className="font-story text-xl text-sumi">{prize!.name}</p><p className="text-sm font-game font-bold text-sumi-light">{pr.text}</p></div></div>
              <p className="text-sm font-game text-antique-dark mt-1">+{prize!.exp} EXP · 엽전 {prize!.coins}</p>
            </>
          ) : <p className="font-game text-sumi">기록하는 중…</p>}
          <button className="btn-sage w-full mt-3" onClick={onClose} disabled={!prize}>계속 걷기</button>
        </div>
      )}
    </div>
  </Portal>);
}
