// 목판화풍 근대 건축 삽화 (먹선 + 평면 채색 + 결 텍스처 + 불 켜진 창)
// ※ 실제 건물의 정밀 재현이 아닌 분위기 삽화입니다. 공식 사진 기반 일러스트가 준비되면
//   components/art/LocationArt.tsx 의 장소별 설정만 바꿔 교체할 수 있습니다.
import React from "react";

export type BuildingStyle = "western" | "hanok" | "shop" | "tower" | "brick" | "lighthouse" | "station";

const K = "#39332F";
const SW = 2;
const ROOF_TILE = "#2F3B3B";

function Win({ x, y, w = 16, h = 20, lit = true, arch = false, k }: { x: number; y: number; w?: number; h?: number; lit?: boolean; arch?: boolean; k?: React.Key }) {
  const d = arch ? `M${x} ${y + h} V${y + w / 2} a${w / 2} ${w / 2} 0 0 1 ${w} 0 V${y + h} Z` : `M${x} ${y}h${w}v${h}h${-w}Z`;
  return (
    <g key={k}>
      <path d={d} fill={lit ? "url(#gr-window)" : "#3B5659"} stroke={K} strokeWidth={1.6} />
      <path d={`M${x + w / 2} ${y + (arch ? w / 2 - 2 : 0)} v${h - (arch ? w / 2 - 2 : 0)} M${x} ${y + h * 0.55} h${w}`} stroke={K} strokeWidth={1} />
    </g>
  );
}

/** 휘어진 기와지붕 */
function TileRoof({ x, y, w, h }: { x: number; y: number; w: number; h: number }) {
  const d = `M${x - 12} ${y + h} Q${x + w * 0.15} ${y + h * 0.82} ${x + w * 0.2} ${y} H${x + w * 0.8} Q${x + w * 0.85} ${y + h * 0.82} ${x + w + 12} ${y + h} Q${x + w / 2} ${y + h * 0.78} ${x - 12} ${y + h}Z`;
  return (
    <g>
      <path d={d} fill={ROOF_TILE} stroke={K} strokeWidth={SW} strokeLinejoin="round" />
      <path d={d} fill="url(#pt-tile)" />
      <path d={`M${x + w * 0.18} ${y} H${x + w * 0.82}`} stroke="#E8D8B8" strokeWidth={2.4} opacity={0.5} />
    </g>
  );
}

export function Building({ w = 160, h = 150, style = "shop", wall, roof, sign, x = 0, y = 0, lit = true }:
  { w?: number; h?: number; style?: BuildingStyle; wall?: string; roof?: string; sign?: string; x?: number; y?: number; lit?: boolean }) {
  let body: React.ReactNode;
  const base = (fill: string, top: number, tex: string) => (
    <g>
      <rect x={0} y={top} width={w} height={h - top} fill={fill} stroke={K} strokeWidth={SW} />
      <rect x={0} y={top} width={w} height={h - top} fill={tex} />
    </g>
  );
  if (style === "hanok" || style === "shop") {
    const top = h * 0.36;
    body = (
      <g>
        {base(wall ?? "#E2D3B2", top, "url(#pt-grain)")}
        {/* 기둥 */}
        {[0, 0.33, 0.66, 1].map((p, i) => <rect key={i} x={Math.min(w - 6, p * w - (p ? 3 : 0))} y={top} width={6} height={h - top} fill="#5A4033" stroke={K} strokeWidth={1} />)}
        {/* 창호 */}
        {[0.06, 0.39, 0.72].map((p, i) => (
          <g key={i}><rect x={p * w + 4} y={top + 10} width={w * 0.24} height={(h - top) * 0.45} fill={lit && i !== 1 ? "#EBD3A0" : "#E8D8B8"} stroke={K} strokeWidth={1.4} />
            <rect x={p * w + 4} y={top + 10} width={w * 0.24} height={(h - top) * 0.45} fill="url(#pt-lattice)" /></g>
        ))}
        {style === "shop" && (
          <g>
            <path d={`M-4 ${top + 4} H${w + 4} L${w - 2} ${top + 18} H2Z`} fill={roof ?? "#963F38"} stroke={K} strokeWidth={1.4} />
            {Array.from({ length: Math.floor(w / 18) }).map((_, i) => <path key={i} d={`M${i * 18 + 9} ${top + 4} v14`} stroke="#E8D8B8" strokeWidth={1} opacity={0.5} />)}
          </g>
        )}
        <rect x={w * 0.42} y={h - (h - top) * 0.42} width={w * 0.16} height={(h - top) * 0.42} fill="#3B2C24" stroke={K} strokeWidth={1.4} />
        <TileRoof x={0} y={h * 0.08} w={w} h={top - h * 0.08 + 6} />
      </g>
    );
  } else if (style === "lighthouse") {
    body = (
      <g>
        <path d={`M${w * 0.3} ${h} L${w * 0.4} ${h * 0.22} H${w * 0.6} L${w * 0.7} ${h}Z`} fill={wall ?? "#E2D3B2"} stroke={K} strokeWidth={SW} />
        {[0.42, 0.62, 0.82].map((p, i) => <path key={i} d={`M${w * (0.36 - p * 0.05 + 0.04)} ${h * p} H${w * (0.64 + p * 0.05 - 0.04)}`} stroke="#963F38" strokeWidth={7} />)}
        <rect x={w * 0.37} y={h * 0.1} width={w * 0.26} height={h * 0.12} fill={lit ? "url(#gr-window)" : "#3B5659"} stroke={K} strokeWidth={SW} />
        <path d={`M${w * 0.33} ${h * 0.1} L${w / 2} ${-6} L${w * 0.67} ${h * 0.1}Z`} fill={roof ?? ROOF_TILE} stroke={K} strokeWidth={SW} />
        {lit && <path d={`M${w / 2} ${h * 0.16} L${w * 1.6} ${h * 0.02} L${w * 1.6} ${h * 0.3}Z`} fill="#F3D896" opacity={0.18} />}
        <rect x={w * 0.45} y={h * 0.86} width={w * 0.1} height={h * 0.14} fill="#3B2C24" stroke={K} strokeWidth={1.4} />
      </g>
    );
  } else if (style === "tower") {
    body = (
      <g>
        {base(wall ?? "#DCCBA6", h * 0.3, "url(#pt-grain)")}
        <rect x={w * 0.28} y={h * 0.08} width={w * 0.44} height={h * 0.24} fill={wall ?? "#DCCBA6"} stroke={K} strokeWidth={SW} />
        <path d={`M${w * 0.22} ${h * 0.1} L${w / 2} ${-4} L${w * 0.78} ${h * 0.1}Z`} fill={roof ?? "#263D40"} stroke={K} strokeWidth={SW} />
        <circle cx={w / 2} cy={h * 0.19} r={w * 0.08} fill="#E8D8B8" stroke={K} strokeWidth={1.6} />
        <path d={`M${w / 2} ${h * 0.19} v${-w * 0.05} M${w / 2} ${h * 0.19} h${w * 0.04}`} stroke={K} strokeWidth={1.4} />
        <rect x={-4} y={h * 0.3} width={w + 8} height={7} fill="#263D40" stroke={K} strokeWidth={1.4} />
        {[0.08, 0.3, 0.56, 0.78].map((p, i) => <Win key={i} k={i} x={w * p} y={h * 0.4} w={w * 0.14} h={h * 0.16} arch lit={lit && i % 2 === 0} />)}
        {[0.08, 0.78].map((p, i) => <Win key={`b${i}`} x={w * p} y={h * 0.66} w={w * 0.14} h={h * 0.18} lit={lit && i === 1} />)}
        <path d={`M${w * 0.34} ${h} V${h * 0.74} a${w * 0.16} ${w * 0.16} 0 0 1 ${w * 0.32} 0 V${h}`} fill="#963F38" stroke={K} strokeWidth={SW} />
      </g>
    );
  } else if (style === "station") {
    body = (
      <g>
        {base(wall ?? "#E2D3B2", h * 0.45, "url(#pt-grain)")}
        <path d={`M-10 ${h * 0.2} H${w + 10} V${h * 0.32} H-10Z`} fill={roof ?? "#963F38"} stroke={K} strokeWidth={SW} />
        {[0.05, 0.92].map((p, i) => <rect key={i} x={w * p} y={h * 0.32} width={6} height={h * 0.68} fill="#5A4033" stroke={K} strokeWidth={1} />)}
        {[0.2, 0.42, 0.64].map((p, i) => <Win key={i} x={w * p} y={h * 0.55} w={w * 0.16} h={h * 0.22} lit={lit && i !== 1} />)}
      </g>
    );
  } else {
    // brick / western: 2층 근대 건물
    const isBrick = style === "brick";
    const top = h * 0.18;
    const n = Math.max(2, Math.floor(w / 36));
    body = (
      <g>
        {base(wall ?? (isBrick ? "#8C4A3B" : "#E2D3B2"), top, isBrick ? "url(#pt-brick)" : "url(#pt-grain)")}
        <rect x={-5} y={top - 8} width={w + 10} height={10} fill={roof ?? "#263D40"} stroke={K} strokeWidth={1.6} />
        {!isBrick && Array.from({ length: Math.floor(w / 12) }).map((_, i) => <rect key={i} x={4 + i * 12} y={top - 18} width={4} height={10} fill="#E2D3B2" stroke={K} strokeWidth={1} />)}
        {!isBrick && <path d={`M-5 ${top - 18} h${w + 10}`} stroke={K} strokeWidth={SW} />}
        <path d={`M0 ${top + (h - top) / 2} h${w}`} stroke={K} strokeWidth={1.4} />
        {Array.from({ length: n }).map((_, i) => {
          const wx = (w / n) * i + (w / n - 16) / 2;
          return <Win key={`u${i}`} k={`u${i}`} x={wx} y={top + 12} w={16} h={Math.min(24, (h - top) / 2 - 20)} arch={isBrick} lit={lit && (i * 7) % 3 !== 0} />;
        })}
        {Array.from({ length: n }).map((_, i) => {
          const wx = (w / n) * i + (w / n - 16) / 2;
          const fy = top + (h - top) / 2;
          if (i === Math.floor(n / 2)) return <path key={`d${i}`} d={`M${wx - 2} ${h} v-${(h - top) / 2 - 10} a10 10 0 0 1 20 0 v${(h - top) / 2 - 10}`} fill="#963F38" stroke={K} strokeWidth={1.6} />;
          return <Win key={`l${i}`} k={`l${i}`} x={wx} y={fy + 10} w={16} h={Math.min(24, (h - top) / 2 - 20)} lit={lit && i % 2 === 1} />;
        })}
        {isBrick && <path d={`M0 ${top} h${w}`} stroke="#E2D3B2" strokeWidth={3} />}
      </g>
    );
  }
  return (
    <g transform={`translate(${x} ${y})`}>
      {body}
      {sign && (
        <g>
          <rect x={w / 2 - sign.length * 7.5 - 10} y={h * 0.22 + 2} width={sign.length * 15 + 20} height={22} fill="#263D40" stroke="#B58B48" strokeWidth={1.6} />
          <text x={w / 2} y={h * 0.22 + 18} textAnchor="middle" fontSize={13} fill="#E6CB8E" fontFamily="'Nanum Myeongjo', serif" fontWeight={700}>{sign}</text>
        </g>
      )}
    </g>
  );
}

/** (호환용) 옛 표지 장면 — 메인은 components/art/HeroScene.tsx 사용 */
export function CoverScene() { return null; }
