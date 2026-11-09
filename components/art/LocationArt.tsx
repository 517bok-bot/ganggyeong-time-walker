// 장소별 건축 삽화 설정 — 공식 사진 기반 삽화가 준비되면 image 에 경로를 넣어 교체합니다.
// (안내도에 표시된 장소의 '분위기'를 그린 창작 삽화이며 실제 외관과 다를 수 있습니다)
import { Building, type BuildingStyle } from "../Building";

export interface LocArt { style: BuildingStyle; wall?: string; roof?: string; w: number; h: number; image?: string }

export const LOCATION_ART: Record<string, LocArt> = {
  "welcome-center": { style: "western", wall: "#E2D3B2", roof: "#263D40", w: 150, h: 130 },
  "music-library": { style: "brick", wall: "#8C4A3B", roof: "#263D40", w: 150, h: 150 },
  tailor: { style: "shop", roof: "#65516F", w: 140, h: 120 },
  "dance-hall": { style: "western", wall: "#D9C7A0", roof: "#65516F", w: 160, h: 130 },
  "memory-lighthouse": { style: "lighthouse", w: 110, h: 190 },
  cinema: { style: "tower", wall: "#D6C29C", roof: "#963F38", w: 150, h: 170 },
  "photo-studio": { style: "tower", wall: "#E2D3B2", roof: "#263D40", w: 140, h: 160 },
  donkatsu: { style: "shop", roof: "#963F38", w: 140, h: 115 },
  gallery: { style: "hanok", w: 150, h: 125 },
  dammi: { style: "shop", roof: "#748A70", w: 130, h: 115 },
  milmyeon: { style: "hanok", wall: "#D9C7A0", w: 150, h: 120 },
  honggyori: { style: "brick", wall: "#7A4337", roof: "#748A70", w: 150, h: 145 },
  bookshop: { style: "western", wall: "#E2D3B2", roof: "#963F38", w: 140, h: 140 },
  "romance-square": { style: "station", roof: "#65516F", w: 170, h: 100 },
  daecheong: { style: "shop", roof: "#B58B48", w: 140, h: 120 },
  gwangshin: { style: "station", roof: "#963F38", w: 160, h: 115 },
  workation: { style: "brick", wall: "#8C4A3B", roof: "#39332F", w: 140, h: 130 },
  "ganggyeong-gwan": { style: "western", wall: "#E8D8B8", roof: "#263D40", w: 160, h: 140 },
  "modern-store": { style: "western", wall: "#DCCBA6", roof: "#963F38", w: 160, h: 150 },
  "coffee-interview": { style: "hanok", wall: "#E2D3B2", w: 140, h: 120 },
  "hotel-west": { style: "brick", wall: "#8C4A3B", roof: "#263D40", w: 150, h: 150 },
  "hotel-east": { style: "hanok", wall: "#E8D8B8", w: 160, h: 125 },
  "hotel-family": { style: "hanok", wall: "#D9C7A0", w: 140, h: 120 },
  "hana-donkatsu": { style: "shop", roof: "#263D40", w: 140, h: 115 },
};

/** 지도 위 작은 건물 그림 */
export function LocationGlyph({ id, scale = 0.42 }: { id: string; scale?: number }) {
  const a = LOCATION_ART[id] ?? { style: "shop" as const, w: 140, h: 120 };
  return (
    <g transform={`scale(${scale}) translate(${-a.w / 2} ${-a.h})`}>
      {a.image ? <image href={a.image} width={a.w} height={a.h} preserveAspectRatio="xMidYMax meet" />
        : <Building w={a.w} h={a.h} style={a.style} wall={a.wall} roof={a.roof} lit={false} />}
    </g>
  );
}

/** 장소 상세의 펼쳐지는 삽화 (달밤 하늘 + 건물 + 안개) */
export function LocationScene({ id, name }: { id: string; name: string }) {
  const a = LOCATION_ART[id] ?? { style: "shop" as const, w: 140, h: 120 };
  const k = 230 / Math.max(a.w, a.h * 1.1);
  return (
    <svg viewBox="0 0 400 250" className="w-full h-auto block" role="img" aria-label={`${name} 삽화 (분위기 표현)`}>
      <defs>
        <linearGradient id={`ls-${id}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#263D40" /><stop offset=".7" stopColor="#5E6F68" /><stop offset="1" stopColor="#C9B994" /></linearGradient>
      </defs>
      <rect width="400" height="250" fill={`url(#ls-${id})`} />
      <circle cx="320" cy="62" r="34" fill="#EFE2C2" opacity=".95" />
      <circle cx="320" cy="62" r="60" fill="#EFE2C2" opacity=".12" className="anim-glow" />
      <path d="M0 170 Q80 130 160 160 Q240 120 320 155 Q370 140 400 150 V250 H0Z" fill="#65516F" opacity=".45" />
      <g transform={`translate(${200 - (a.w * k) / 2} ${214 - a.h * k}) scale(${k})`}>
        {a.image ? <image href={a.image} width={a.w} height={a.h} preserveAspectRatio="xMidYMax meet" />
          : <Building w={a.w} h={a.h} style={a.style} wall={a.wall} roof={a.roof} />}
      </g>
      <rect y="212" width="400" height="38" fill="#C4AC80" stroke="#39332F" strokeWidth="2" />
      <ellipse cx="200" cy="230" rx="260" ry="16" fill="#E8D8B8" opacity=".5" filter="url(#soft-fog)" className="anim-fog" />
      <rect x="3" y="3" width="394" height="244" fill="none" stroke="#39332F" strokeWidth="3" />
    </svg>
  );
}
