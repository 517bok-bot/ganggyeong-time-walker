"use client";
// 전통 문양 띠 · 반딧불 · 금박 장식
import { useMemo } from "react";

/** 회문(回紋) 띠: 금선 번개무늬 */
export function MeanderBand({ className = "", color = "#B58B48", bg = "#263D40" }: { className?: string; color?: string; bg?: string }) {
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24'><rect width='24' height='24' fill='${bg}'/><path d='M2 22V2h20v16H8V8h8v6' fill='none' stroke='${color}' stroke-width='2'/></svg>`;
  return <div className={`h-5 border-y border-antique-dark ${className}`} style={{ backgroundImage: `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}")`, backgroundSize: "20px 20px" }} aria-hidden />;
}

/** 구름 매듭(여의두) 모서리 장식 */
export function CloudCorner({ className = "", flip = false }: { className?: string; flip?: boolean }) {
  return (
    <svg viewBox="0 0 60 60" className={className} style={{ transform: flip ? "scaleX(-1)" : undefined }} aria-hidden>
      <path d="M4 56 V20 Q4 4 20 4 H56" fill="none" stroke="#B58B48" strokeWidth="2.4" />
      <path d="M12 30 q0 -12 10 -12 q8 0 8 8 q0 6 -6 6 q-4 0 -4 -4" fill="none" stroke="#B58B48" strokeWidth="2" strokeLinecap="round" />
      <circle cx="4" cy="56" r="2.5" fill="#B58B48" /><circle cx="56" cy="4" r="2.5" fill="#B58B48" />
    </svg>
  );
}

/** 반딧불: 천천히 떠다니며 깜빡이는 빛 */
export function Fireflies({ count = 18 }: { count?: number }) {
  const flies = useMemo(() => Array.from({ length: count }).map((_, i) => ({
    left: (i * 53 + 7) % 100, top: 35 + ((i * 29) % 60), dur: 5 + (i % 5), delay: (i * 0.7) % 6, size: 3 + (i % 3),
  })), [count]);
  return (
    <div className="atmosphere absolute inset-0 pointer-events-none overflow-hidden" aria-hidden>
      {flies.map((f, i) => (
        <span key={i} className="absolute rounded-full" style={{
          left: `${f.left}%`, top: `${f.top}%`, width: f.size, height: f.size,
          background: "radial-gradient(circle, #FFF6B0 0%, #E6E07A 40%, rgba(214,220,110,0) 70%)",
          boxShadow: "0 0 10px 3px rgba(230,224,122,.55)",
          animation: `firefly ${f.dur}s ease-in-out ${f.delay}s infinite alternate, glow ${2 + (i % 3)}s ease-in-out ${f.delay}s infinite`,
        }} />
      ))}
    </div>
  );
}
