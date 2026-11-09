"use client";
// 화면 전체에 깔리는 몽환적 분위기: 흐르는 안개 · 떨어지는 매화 꽃잎 · 금빛 입자
// 움직임 줄이기 설정(html[data-motion="reduced"])이면 숨겨집니다.
import { useMemo } from "react";

export default function Atmosphere({ density = 1 }: { density?: number }) {
  const petals = useMemo(() => Array.from({ length: Math.round(9 * density) }).map((_, i) => ({
    left: (i * 37 + 11) % 100, delay: (i * 2.7) % 18, dur: 16 + ((i * 5) % 10), drift: ((i % 3) - 1) * 14 + 8, size: 9 + (i % 4) * 3,
  })), [density]);
  const motes = useMemo(() => Array.from({ length: Math.round(10 * density) }).map((_, i) => ({ left: (i * 23 + 7) % 100, top: 40 + ((i * 17) % 55), delay: (i * 0.9) % 6 })), [density]);
  return (
    <div className="atmosphere fixed inset-0 -z-10 pointer-events-none overflow-hidden" aria-hidden>
      {/* 안개 띠 */}
      <svg className="absolute -left-[15%] top-[8%] w-[130%] h-[30vh] opacity-50 anim-fog" viewBox="0 0 1000 200" preserveAspectRatio="none">
        <g filter="url(#soft-fog)" fill="#F2E7D0"><ellipse cx="200" cy="100" rx="260" ry="34" /><ellipse cx="620" cy="80" rx="300" ry="28" /><ellipse cx="900" cy="120" rx="200" ry="24" /></g>
      </svg>
      <svg className="absolute -left-[15%] bottom-[6%] w-[130%] h-[30vh] opacity-45 anim-fog2" viewBox="0 0 1000 200" preserveAspectRatio="none">
        <g filter="url(#soft-fog)" fill="#E8D8B8"><ellipse cx="300" cy="110" rx="320" ry="38" /><ellipse cx="780" cy="90" rx="280" ry="30" /></g>
      </svg>
      {/* 매화 꽃잎 */}
      {petals.map((p, i) => (
        <svg key={i} viewBox="0 0 20 20" width={p.size} height={p.size} className="absolute top-0"
          style={{ left: `${p.left}%`, animation: `petal ${p.dur}s linear ${p.delay}s infinite`, ["--drift" as string]: `${p.drift}vw`, opacity: 0 }}>
          <path d="M10 1 Q17 6 10 19 Q3 6 10 1Z" fill="#D9A79B" opacity=".85" />
          <path d="M10 4 V15" stroke="#963F38" strokeWidth=".6" opacity=".4" />
        </svg>
      ))}
      {/* 금빛 입자 */}
      {motes.map((m, i) => (
        <span key={i} className="absolute w-1.5 h-1.5 rounded-full anim-float" style={{ left: `${m.left}%`, top: `${m.top}%`, animationDelay: `${m.delay}s`, background: "radial-gradient(#E6CB8E, transparent 70%)" }} />
      ))}
    </div>
  );
}
