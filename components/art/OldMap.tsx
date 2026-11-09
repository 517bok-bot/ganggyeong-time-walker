"use client";
// 고지도풍 탐험 지도
// - 장소 좌표(mapX/mapY)는 강경근대거리 안내도의 배치를 그대로 옮긴 '그림 좌표'입니다.
// - 실제 위치 인증(GPS)은 이 좌표를 쓰지 않고, 관리자가 등록한 위경도(gps)만 사용합니다.
import type { GameLocation } from "@/lib/data/locations";
import type { GameState } from "@/lib/types";
import { CharacterSvg } from "../Characters";
import { LocationGlyph } from "./LocationArt";

const K = "#39332F", V = "#963F38";

/** 고지도식 산: 녹청 바림 봉우리 + 먹선 결 */
function Peak({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M-40 20 L-22 -8 L-12 4 L0 -30 L12 0 L22 -10 L40 20 Z" fill="url(#om-peak)" stroke={K} strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M0 -28 Q-4 -6 -8 18 M0 -26 Q5 -4 8 18 M-22 -6 Q-24 6 -26 18 M22 -8 Q24 6 26 18" stroke="#3F5A3D" strokeWidth="1" fill="none" opacity=".7" />
    </g>
  );
}
const MOUNTAINS: [number, number, number][] = [
  [270, 90, 1], [330, 76, 1.3], [400, 92, 1], [460, 80, 1.1], [560, 74, .9], [640, 82, 1], [740, 78, 1.2], [820, 88, .9], [900, 76, 1.1], [980, 86, 1], [1060, 78, 1.2], [1150, 90, 1.1], [1240, 80, 1.3], [1310, 96, 1],
  [270, 170, 1.1], [276, 260, .9], [1300, 330, 1.1], [1260, 400, .9], [1310, 960, 1.2], [1250, 1060, 1], [1180, 1100, 1.1], [270, 1100, .9], [1310, 1100, 1],
];
const TREES: [number, number][] = [[300, 360], [292, 520], [300, 860], [800, 300], [760, 470], [1200, 470], [1050, 1060], [880, 1090], [1300, 720]];

export const MAP_BOX = { x: 230, y: 40, w: 1120, h: 1100 };

export default function OldMap({ locations, state, show, selId, onSelect, routePts, className = "min-w-[620px] w-full h-auto block", style }: {
  locations: GameLocation[]; state: GameState; show: { route: boolean; chars: boolean; npcs: boolean };
  selId?: string; onSelect: (l: GameLocation) => void; routePts: string; className?: string; style?: React.CSSProperties;
}) {
  return (
    <svg viewBox="230 40 1120 1100" className={className} style={style} role="img" aria-label="강경근대거리 고지도풍 탐험 지도">
      <defs>
        <linearGradient id="om-peak" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#5E7F5A" /><stop offset=".6" stopColor="#8FA77A" /><stop offset="1" stopColor="#C9C58E" /></linearGradient>
        <radialGradient id="om-vignette" cx="50%" cy="50%" r="70%"><stop offset=".6" stopColor="#E8D8B8" stopOpacity="0" /><stop offset="1" stopColor="#8A6731" stopOpacity=".35" /></radialGradient>
      </defs>
      {/* 바탕 한지 */}
      <rect x="230" y="40" width="1120" height="1100" fill="#E7D3A2" />
      <rect x="230" y="40" width="1120" height="1100" fill="url(#pt-hatch)" opacity=".25" />
      <rect x="230" y="40" width="1120" height="1100" fill="url(#pt-grain)" />
      {/* 산줄기 (고지도식 · 장식이며 위치 정보 아님) */}
      {MOUNTAINS.map(([x, y, sc], i) => <Peak key={i} x={x} y={y} s={sc} />)}
      {/* 숲 */}
      {TREES.map(([x, y], i) => <g key={i}>{[0, 1, 2].map((j) => <circle key={j} cx={x + j * 9 - 9} cy={y - (j % 2) * 6} r="7" fill="#7E9A6A" stroke="#4E6A45" strokeWidth="1" />)}</g>)}
      {/* 근대거리 구역: 노란 바림 */}
      <path d="M345 105 L705 105 L718 600 L770 780 L705 1078 L345 1078 Z" fill="#E9C964" opacity=".28" stroke="#B58B48" strokeWidth="2" strokeDasharray="2 7" strokeLinecap="round" />
      {/* 강경구락부 구역: 옥색 바림 */}
      <path d="M860 615 L1290 500 L1320 830 L1010 985 Z" fill="#E9C964" opacity=".42" stroke="#8A6731" strokeWidth="2.4" />
      {/* 길: 고지도식 붉은 겹선 */}
      <g fill="none" strokeLinecap="round">
        {["M508 40 L482 1140", "M482 1060 L1340 600", "M650 410 L870 590 L1340 440"].map((d, i) => (
          <g key={i}><path d={d} stroke="#F2E7D0" strokeWidth={i === 0 ? 34 : 26} /><path d={d} stroke={V} strokeWidth={i === 0 ? 34 : 26} opacity=".22" />
            <path d={d} stroke={V} strokeWidth="1.6" strokeDasharray="1 0" opacity=".7" transform="translate(0 0)" /></g>
        ))}
      </g>
      {/* 감성산책로: 금빛 점선 */}
      <path d="M320 1010 Q290 820 330 620 Q300 420 330 230" fill="none" stroke="#B58B48" strokeWidth="4" strokeDasharray="1 12" strokeLinecap="round" />
      <text x="290" y="640" fontSize="20" fill="#8A6731" fontFamily="'Nanum Myeongjo', serif" fontWeight="700" transform="rotate(-90 290 640)">감성산책로 · 고보 라이트 길</text>
      {/* 구역 이름: 세로 현판 */}
      <g fontFamily="'Song Myung', serif" fill="#F2E7D0">
        <rect x="372" y="955" width="52" height="170" fill="#263D40" stroke="#B58B48" strokeWidth="2" />
        <text x="398" y="985" fontSize="26" textAnchor="middle" writingMode="vertical-rl" style={{ writingMode: "vertical-rl" } as React.CSSProperties}>강경근대거리</text>
        <rect x="1196" y="880" width="52" height="150" fill="#263D40" stroke="#B58B48" strokeWidth="2" />
        <text x="1222" y="910" fontSize="26" textAnchor="middle" style={{ writingMode: "vertical-rl" } as React.CSSProperties}>강경구락부</text>
      </g>
      {/* 방위표 (윤도) */}
      <g transform="translate(1250 230)">
        <circle r="54" fill="#F2E7D0" stroke={K} strokeWidth="2" />
        <circle r="44" fill="none" stroke="#B58B48" strokeWidth="1.5" />
        <path d="M0 -40 L9 0 L0 40 L-9 0Z" fill={V} stroke={K} strokeWidth="1.5" /><path d="M0 -40 L9 0 H-9Z" fill="#263D40" />
        <text y="-60" textAnchor="middle" fontSize="22" fontFamily="'Song Myung', serif" fill={K}>북</text>
      </g>
      {/* 추천 동선 */}
      {show.route && <polyline points={routePts} fill="none" stroke={V} strokeWidth="4" strokeDasharray="2 12" strokeLinecap="round" strokeLinejoin="round" opacity=".85" />}

      {/* 장소 */}
      {locations.map((l) => {
        const v = !!state.visits[l.id];
        const isSel = selId === l.id;
        const chars = l.characterIds ?? [];
        return (
          <g key={l.id} transform={`translate(${l.mapX} ${l.mapY})`} className="cursor-pointer" onClick={() => onSelect(l)}
            role="button" tabIndex={0} aria-label={`${l.no}번 ${l.name}${l.note ? `(${l.note})` : ""} ${v ? "방문 완료" : "미방문"}`}
            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") onSelect(l); }}>
            {isSel && <circle r="58" cy="-14" fill="none" stroke="#B58B48" strokeWidth="4" className="anim-ring" style={{ transformOrigin: "0px -14px" }} />}
            <g transform="translate(0 6)"><LocationGlyph id={l.id} scale={0.4} /></g>
            {/* 미방문: 옅은 안개 */}
            {!v && <g opacity=".35" className="anim-glow" style={{ animationDuration: "7s" }}><ellipse cx="0" cy="-30" rx="40" ry="14" fill="#F2E7D0" filter="url(#soft-fog)" /></g>}
            {/* 장소 고유 원형 인장: 이름 첫 글자 + 번호 */}
            <g transform="translate(-36 -50)">
              <circle r="21" fill={v ? V : "#F2E7D0"} stroke={V} strokeWidth="2.6" filter="url(#seal-rough)" />
              <circle r="16.5" fill="none" stroke={v ? "#F2E7D0" : V} strokeWidth="1" opacity=".85" />
              <text y="5" textAnchor="middle" fontSize="17" fontFamily="'Song Myung', serif" fill={v ? "#F2E7D0" : V}>{l.name[0]}</text>
              <text y="15" textAnchor="middle" fontSize="7" fontFamily="'Nanum Myeongjo', serif" fontWeight="800" fill={v ? "#F2E7D0" : V}>{l.no}</text>
            </g>
            {/* 방문 도장 */}
            {v && (
              <g transform="translate(26 -4) rotate(-12)"><g className="anim-pop">
                <circle r="17" fill="none" stroke={V} strokeWidth="2.6" filter="url(#seal-rough)" />
                <text y="6" textAnchor="middle" fontSize="15" fontFamily="'Song Myung', serif" fill={V}>방문</text>
              </g></g>
            )}
            <text y="34" textAnchor="middle" fontSize="18" fontFamily="'Nanum Myeongjo', serif" fontWeight="800" fill={K} paintOrder="stroke" stroke="#E8D8B8" strokeWidth="5">{l.name}</text>
            {show.chars && chars.map((cid, i) => (
              <g key={cid} transform={`translate(${36 + i * 30} -62)`}>
                <circle r="17" fill="#F2E7D0" stroke={K} strokeWidth="1.8" />
                {state.characters[cid]
                  ? <CharacterSvg id={cid} box={{ x: -15, y: -16, width: 30, height: 33 }} />
                  : <g transform="translate(-11 -11) scale(.7)"><path d="M16 24 m-6 0 a6 5 0 1 0 12 0 a6 5 0 1 0 -12 0M9 14a2.4 3.2 0 1 0 .1 0M14 10a2.4 3.2 0 1 0 .1 0M19.5 10a2.4 3.2 0 1 0 .1 0M24 14a2.4 3.2 0 1 0 .1 0" fill={K} /></g>}
              </g>
            ))}
            {show.npcs && l.npcId && (
              <g transform="translate(-70 -18)">
                <path d="M0 -14 V-8" stroke={K} strokeWidth="1.6" />
                <path d="M-7 -8 Q-9 0 -7 8 H7 Q9 0 7 -8Z" fill={V} stroke={K} strokeWidth="1.4" />
                <path d="M-8 0 H8" stroke="#263D40" strokeWidth="3" />
                <circle r="13" fill="#F3D896" opacity=".25" className="anim-glow" />
              </g>
            )}
          </g>
        );
      })}
      {/* 지도 테두리 */}
      <rect x="236" y="46" width="1108" height="1088" fill="url(#om-vignette)" pointerEvents="none" />
      <rect x="240" y="50" width="1100" height="1080" fill="none" stroke={K} strokeWidth="4" />
      <rect x="252" y="62" width="1076" height="1056" fill="none" stroke={V} strokeWidth="1.5" />
    </svg>
  );
}
