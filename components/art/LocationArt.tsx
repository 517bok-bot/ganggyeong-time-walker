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

/** 장소 상세 그림: 3D 미니어처로 구운 장소 모습 (분위기 표현, 실제 외관과 다를 수 있음) */
export function LocationScene({ id, name }: { id: string; name: string }) {
  const a = LOCATION_ART[id];
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={a?.image ?? `/world/loc-${id}.webp`} alt={`${name} 미니어처 (분위기 표현)`} className="w-full aspect-[16/10] object-cover rounded-2xl block" />;
}
