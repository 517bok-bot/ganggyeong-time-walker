// 박물도감 수집 카드: 고서 한 장 + 이중 괘선 + 삽화 + 붉은 수집 인장
import React from "react";

export function SpecimenCard({ no, title, subtitle, art, collected, stamp = "수집", footer, onClick, tone = "teal", rarity }:
  { no: number | string; title: string; subtitle?: string; art: React.ReactNode; collected: boolean; stamp?: string; footer?: React.ReactNode; onClick?: () => void; tone?: "teal" | "dream" | "jade"; rarity?: React.ReactNode }) {
  const bg = { teal: "#263D40", dream: "#4A3A52", jade: "#566A53" }[tone];
  const Tag = onClick ? "button" : "div";
  return (
    <Tag onClick={onClick} className={`relative text-left w-full p-2 bg-hanji-light border border-sumi/70 transition-transform ${onClick ? "hover:-translate-y-0.5" : ""} ${collected ? "" : "opacity-90"}`}
      style={{ backgroundImage: "var(--fiber), var(--grain)", boxShadow: "inset 0 0 0 3px #F2E7D0, inset 0 0 0 4px rgba(150,63,56,.5), 0 8px 18px -12px rgba(38,61,64,.6)" }}>
      <div className="flex items-center justify-between px-1">
        <span className="font-game font-bold text-[11px] text-vermilion tracking-widest">第 {String(no).padStart(2, "0")}</span>
        {rarity}
      </div>
      {/* 삽화 칸: 달과 구름이 있는 남색 바탕 */}
      <div className="relative mt-1 aspect-square overflow-hidden border border-sumi" style={{ background: collected ? `radial-gradient(circle at 70% 28%, #EFE2C2 0 14%, rgba(239,226,194,.18) 15% 30%, transparent 31%), ${bg}` : "#D6C29C" }}>
        {collected && (
          <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full opacity-50" aria-hidden>
            <path d="M6 78 q8 -8 16 0 q8 -8 16 0 M58 88 q8 -8 16 0 q8 -8 16 0" fill="none" stroke="#E8D8B8" strokeWidth="1.2" />
            <path d="M0 96 Q50 84 100 96 V100 H0Z" fill="#E8D8B8" opacity=".35" />
          </svg>
        )}
        <div className="absolute inset-[8%]">{art}</div>
      </div>
      <p className="font-story text-lg text-sumi mt-1.5 px-1 truncate">{title}</p>
      {subtitle && <p className="text-[11px] text-sumi-light px-1 truncate">{subtitle}</p>}
      {footer && <div className="px-1 mt-0.5 text-[10px] text-sumi-light">{footer}</div>}
      {collected && <span className="absolute right-2 bottom-2 seal w-11 h-11 text-[13px] rotate-[-9deg] opacity-90">{stamp}</span>}
    </Tag>
  );
}
