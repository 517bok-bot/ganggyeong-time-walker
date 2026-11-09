import type { BuildingStyle } from "@/components/Building";

// 온라인 강경마을 — 실제 장소(안내도 표기)와 가상 장소를 한 줄 거리로 재구성한 2D 마을.
// real=true: 안내도에 있는 실제 장소를 '분위기'로 그린 것 / real=false: 게임용 가상 장소
export interface Place {
  key: string; x: number; w: number; h: number; label: string; real: boolean; style: BuildingStyle;
  wall?: string; roof?: string; npcId?: string;
  hidden?: { charId: string; dx: number; dy: number };
  desc: string;
}
export const WORLD_W = 2900, GROUND = 330;
export const PLACES: Place[] = [
  { key: "welcome-center", x: 60, w: 150, h: 130, label: "웰컴센터", real: true, style: "shop", roof: "#263D40", npcId: "guide",
    hidden: { charId: "berijyu", dx: 168, dy: 40 }, desc: "타임워커 여행의 출발점이에요." },
  { key: "music-library", x: 260, w: 150, h: 170, label: "음악도서관", real: true, style: "brick", wall: "#8C4A3B", roof: "#39332F", desc: "붉은 벽돌 건물이 인상적인 곳." },
  { key: "memory-lighthouse", x: 450, w: 120, h: 200, label: "기억의 등대", real: true, style: "lighthouse",
    hidden: { charId: "kangi", dx: 40, dy: -150 }, desc: "오래된 기억이 빛나는 등대." },
  { key: "photo-studio", x: 620, w: 150, h: 170, label: "갱갱사진관", real: true, style: "tower", npcId: "photographer", desc: "옛날 사진사 은솔이 기다리고 있어요." },
  { key: "gallery", x: 820, w: 150, h: 140, label: "강경화랑", real: true, style: "hanok",
    hidden: { charId: "daechu-1", dx: 120, dy: 60 }, desc: "그림과 이야기가 걸려 있는 화랑." },
  { key: "honggyori", x: 1020, w: 150, h: 160, label: "홍교리", real: true, style: "brick", wall: "#8C4A3B", roof: "#263D40",
    hidden: { charId: "daechu-2", dx: 20, dy: 20 }, desc: "창가에 무언가 반짝여요." },
  { key: "romance-square", x: 1220, w: 200, h: 90, label: "랑만광장", real: true, style: "station", roof: "#B58B48",
    hidden: { charId: "daechu-3", dx: 180, dy: 70 }, desc: "밤에는 미디어 파사드가 빛나는 광장 (안내도 표기)." },
  { key: "daecheong", x: 1470, w: 150, h: 140, label: "대청상회", real: true, style: "shop", roof: "#963F38",
    hidden: { charId: "kongi", dx: -20, dy: 70 }, desc: "어디선가 맛있는 냄새가 솔솔~" },
  { key: "gwangshin", x: 1670, w: 160, h: 130, label: "광신석유", real: true, style: "station", roof: "#963F38",
    hidden: { charId: "kaengi", dx: 100, dy: 60 }, desc: "간판 아래 그늘이 시원해 보여요." },
  { key: "modern-store", x: 1880, w: 170, h: 160, label: "강경모던상회", real: true, style: "western", npcId: "merchant",
    desc: "안내도 힌트: 고양이 가족을 만날 수 있을지도…?" },
  { key: "v-market", x: 2110, w: 180, h: 120, label: "젓갈시장", real: false, style: "shop", roof: "#263D40", npcId: "artisan", desc: "항아리가 가득한 가상 시장. 젓갈 장인 덕배의 공방이 있어요." },
  { key: "v-post", x: 2340, w: 150, h: 150, label: "시간 우체국", real: false, style: "western", wall: "#E8D4A4", npcId: "postman",
    hidden: { charId: "sweetpo", dx: 175, dy: 80 }, desc: "과거와 미래로 편지를 보내는 가상 우체국." },
];
export const TREASURE_X = 2700;


/** 온라인 마을에서 얻는 보상 — 서버·클라이언트가 같은 표를 사용합니다 (클라이언트가 보상 값을 보내지 않음) */
export const VILLAGE_REWARDS = {
  place: { exp: 10, coins: 5 },
  treasure: { exp: 50, coins: 30, items: { salt: 3, sincerity: 1 } as Record<string, number> },
  reunion: { exp: 30, coins: 20 },
};
export const VILLAGE_TREASURES = ["treasure:port"];
export const ONLINE_CHARACTERS = Object.fromEntries(PLACES.filter((p) => p.hidden).map((p) => [p.hidden!.charId, p.label]));
