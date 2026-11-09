"use client";
// 온라인 강경마을 배경 (밤하늘·초롱·건물·땅). 건물은 안내도 장소의 분위기를 옮긴 창작 일러스트입니다.
import { memo } from "react";
import { Building } from "./Building";
import { PLACES, WORLD_W, GROUND } from "@/lib/data/village";

function VillageBackdrop() {
  return (
    <svg width={WORLD_W} height={440} className="absolute inset-0">
      <defs>
        <linearGradient id="vsky" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#1A2B2D" /><stop offset=".55" stopColor="#3B5659" /><stop offset="1" stopColor="#B5A787" /></linearGradient>
        <filter id="vwc"><feTurbulence baseFrequency=".025" numOctaves="2" seed="7" /><feDisplacementMap in="SourceGraphic" scale="4" /></filter>
      </defs>
      <rect width={WORLD_W} height={440} fill="url(#vsky)" />
      {[400, 1500, 2500].map((mx) => <g key={mx}><circle cx={mx} cy={80} r={70} fill="#EFE2C2" opacity=".1" /><circle cx={mx} cy={80} r={30} fill="#EFE2C2" /></g>)}
      {Array.from({ length: 9 }).map((_, i) => (
        <g key={i} fill="#E8D8B8" opacity=".55"><ellipse cx={180 + i * 330} cy={60 + (i % 3) * 18} rx={56} ry={14} /><ellipse cx={220 + i * 330} cy={50 + (i % 3) * 18} rx={36} ry={14} /></g>
      ))}
      {/* 별과 별자리 */}
      <g fill="#F3E7C4">{Array.from({ length: 70 }).map((_, i) => <circle key={i} cx={(i * 211) % WORLD_W} cy={20 + ((i * 97) % 170)} r={i % 7 === 0 ? 2.2 : 1.2} opacity={0.4 + (i % 5) * 0.12} className={i % 6 === 0 ? "anim-glow" : ""} style={{ animationDelay: `${(i % 9) * 0.4}s` }} />)}</g>
      {/* 먼 기와 지붕 실루엣 */}
      <path d={`M0 260 ${Array.from({ length: 29 }).map((_, i) => `L${i * 100 + 20} 260 Q${i * 100 + 50} ${228 - (i % 3) * 10} ${i * 100 + 80} 260`).join(" ")} L2900 260 V300 H0Z`} fill="#2B3F42" opacity=".7" />
      {/* 초롱 줄 */}
      {Array.from({ length: 7 }).map((_, k) => {
        const x0 = 120 + k * 400, x1 = x0 + 360, y0 = 140;
        return (
          <g key={k}>
            <path d={`M${x0} ${y0} Q${(x0 + x1) / 2} ${y0 + 60} ${x1} ${y0}`} stroke="#1A2B2D" strokeWidth="1.6" fill="none" />
            {[0.15, 0.32, 0.5, 0.68, 0.85].map((t, j) => {
              const x = x0 + (x1 - x0) * t, y = y0 + 120 * t * (1 - t);
              return <g key={j} transform={`translate(${x} ${y})`}><path d="M0 0 v6" stroke="#1A2B2D" strokeWidth="1.2" /><ellipse cy="16" rx="13" ry="14" fill="#F3D896" opacity=".25" className="anim-glow" style={{ animationDelay: `${(j + k) * 0.3}s` }} /><ellipse cy="15" rx="8" ry="10" fill={j % 2 ? "#C83A35" : "#2E5C9A"} stroke="#1A2B2D" strokeWidth="1" /><path d="M-8 15 h16" stroke="#F3D896" strokeWidth=".8" opacity=".6" /></g>;
            })}
          </g>
        );
      })}
      <path d={`M0 250 ${Array.from({ length: 30 }).map((_, i) => `Q${i * 100 + 50} ${215 + (i % 2) * 20} ${(i + 1) * 100} 240`).join(" ")} V${GROUND} H0Z`} fill="#65516F" opacity=".6" />
      {/* 강경포구 (가상 재현) */}
      <rect x={2560} y={GROUND - 30} width={WORLD_W - 2560} height={140} fill="#3B5659" />
      <g className="anim-idle"><path d="M2640 300 h120 l-20 22 h-80z" fill="#5A4033" stroke="#39332F" strokeWidth="2.4" /><path d="M2700 300 v-70 l40 60z" fill="#F2E7D0" stroke="#39332F" strokeWidth="2" /></g>
      <g filter="url(#vwc)">
        {PLACES.map((p) => <Building key={p.key} x={p.x} y={GROUND - p.h} w={p.w} h={p.h} style={p.style} wall={p.wall} roof={p.roof} sign={p.label} />)}
      </g>
      <rect y={GROUND} width={2560} height={140} fill="#C4AC80" />
      <rect y={GROUND} width={2560} height={140} fill="url(#pt-grain)" />
      <path d={`M0 ${GROUND} H2560`} stroke="#39332F" strokeWidth="2.4" />
      <g stroke="#8A6731" strokeWidth="2" opacity=".55">{Array.from({ length: 60 }).map((_, i) => <path key={i} d={`M${i * 44} ${GROUND + 60} h26`} />)}</g>
      {/* 장소 이름표: 실제/가상 구분 */}
      {PLACES.map((p) => (
        <g key={`t${p.key}`} transform={`translate(${p.x + p.w / 2} ${GROUND + 22})`}>
          <rect x={-34} y={-12} width={68} height={20} rx={2} fill={p.real ? "#263D40" : "#65516F"} stroke="#B58B48" strokeWidth={1} />
          <text textAnchor="middle" y={3} fontSize="12" fill="#E8D8B8" fontFamily="'Nanum Myeongjo', serif" fontWeight={700}>{p.real ? "실제 장소" : "가상 장소"}</text>
        </g>
      ))}
      {[230, 600, 1000, 1440, 1850, 2310].map((lx) => (
        <g key={lx}><path d={`M${lx} ${GROUND} v-80`} stroke="#39332F" strokeWidth="3" /><circle cx={lx} cy={GROUND - 84} r={9} fill="#F3D896" stroke="#39332F" strokeWidth="2" /></g>
      ))}
      <text x={2700} y={GROUND + 60} textAnchor="middle" fontFamily="'Nanum Myeongjo', serif" fontWeight={700} fontSize="18" fill="#1A2B2D">강경포구 (가상 재현)</text>
    </svg>
  );
}
export default memo(VillageBackdrop);
