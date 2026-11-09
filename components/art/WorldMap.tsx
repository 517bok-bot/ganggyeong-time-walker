"use client";
// 탐험 지도: 3D 미니어처 마을 그림(public/world/map-day.webp) 위에 장소 표시만 얹습니다.
// 그림은 지도 좌표(mapX/mapY)와 픽셀이 맞도록 구워져 있습니다 (scripts/characters3d/diorama.js).
// 실제 위치 인증(GPS)은 이 좌표를 쓰지 않고 관리자가 등록한 위경도만 씁니다.
import type { GameLocation } from "@/lib/data/locations";
import type { GameState } from "@/lib/types";
import { charImg } from "../Characters";

export default function WorldMap({ locations, state, selId, onSelect, className, style }: {
  locations: GameLocation[]; state: GameState; selId?: string; onSelect: (l: GameLocation) => void; className?: string; style?: React.CSSProperties;
}) {
  return (
    <svg viewBox="230 40 1120 1100" className={className} style={style} role="img" aria-label="강경근대거리 미니어처 지도">
      <image href="/world/map-day.webp" x="230" y="40" width="1120" height="1100" preserveAspectRatio="none" />
      {locations.map((l) => {
        const v = !!state.visits[l.id];
        const sel = selId === l.id;
        const friend = (l.characterIds ?? []).find((c) => !state.characters[c]) ?? (l.characterIds ?? [])[0];
        const met = friend ? !!state.characters[friend] : false;
        return (
          <g key={l.id} transform={`translate(${l.mapX} ${l.mapY})`} className="cursor-pointer" onClick={() => onSelect(l)}
            role="button" tabIndex={0} aria-label={`${l.no}번 ${l.name} ${v ? "방문 완료" : "미방문"}`}
            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") onSelect(l); }}>
            <rect x="-46" y="-96" width="92" height="132" fill="transparent" />
            {sel && <ellipse cx="0" cy="4" rx="56" ry="20" fill="none" stroke="#F3D896" strokeWidth="5" className="anim-ring" style={{ transformOrigin: "0px 4px" }} />}
            {/* 핀 */}
            <g transform="translate(0 -88)">
              <path d="M0 26 L-7 12 H7 Z" fill={v ? "#963F38" : "#FFFFFF"} stroke="#963F38" strokeWidth="2.5" strokeLinejoin="round" />
              <circle r="16" fill={v ? "#963F38" : "#FFFFFF"} stroke="#963F38" strokeWidth="3" />
              <text y="6" textAnchor="middle" fontSize="16" fontWeight="800" fontFamily="'Gowun Dodum', sans-serif" fill={v ? "#FFFFFF" : "#963F38"}>{v ? "✓" : l.no}</text>
            </g>
            {/* 만날 친구 */}
            {friend && met && (
              <g transform="translate(30 -96)">
                <circle r="17" fill="#FFF8EC" stroke={met ? "#748A70" : "#B58B48"} strokeWidth="2.5" />
                <image href={charImg(friend, "happy")} x="-16" y="-17" width="32" height="34" />
              </g>
            )}
            {/* 이름표 */}
            <g transform="translate(0 30)">
              <rect x={-(l.name.length * 7 + 10)} y="-12" width={l.name.length * 14 + 20} height="24" rx="12" fill="#FFFDF7" opacity=".94" stroke={v ? "#963F38" : "#39332F"} strokeOpacity=".35" strokeWidth="1.5" />
              <text y="5" textAnchor="middle" fontSize="13" fontWeight="700" fontFamily="'Gowun Dodum', sans-serif" fill="#39332F">{l.name}</text>
            </g>
          </g>
        );
      })}
    </svg>
  );
}
