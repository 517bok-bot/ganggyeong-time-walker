// 강경근대거리 · 강경구락부 장소 데이터
// ─────────────────────────────────────────────────────────────
// 출처: 사용자 제공 「강경근대거리 안내도」(사진 5)에서 판독한 번호·명칭만 사용했습니다.
// - mapX/mapY: 안내도 이미지(1376px 기준)의 마커 위치를 옮긴 일러스트 지도 좌표입니다.
//   (7·8·10·11번은 마커가 겹치지 않도록 수십 px 정도 조정)
// - gps: 개별 건물의 위도·경도는 공식 자료로 검증하지 못해 null 로 두었습니다.
//        관리자가 실측/공식 좌표를 입력해야 GPS 인증이 활성화됩니다 (QR 인증은 즉시 사용 가능).
// - note: 안내도에 괄호로 함께 표기된 내용입니다.
// - 장소의 역사·운영 정보는 아직 검증되지 않아 기록하지 않았습니다 (historyStatus).
// - gameRole: 게임 기획상 부여한 역할로 실제 정보가 아닌 "게임 설정"입니다.

export type Zone = "street" | "club";

export interface GameLocation {
  id: string;
  no: number;
  name: string;
  note?: string;
  zone: Zone;
  /** true = 안내도에 표기된 실제 장소 */
  real: boolean;
  mapX: number;
  mapY: number;
  gps: { lat: number; lng: number; radiusM: number } | null;
  historyStatus: "pending" | "approved";
  gameRole?: string;
  characterIds?: string[];
  npcId?: string;
  reward: { exp: number; coins: number; items?: Record<string, number> };
  /** 관리자 입력 (DB) */
  photoUrl?: string | null;
  description?: string | null;
  history?: string | null;
}

const R = (exp = 30, coins = 10, items?: Record<string, number>) => ({ exp, coins, items });

export const LOCATIONS: GameLocation[] = [
  { id: "welcome-center", no: 1, name: "웰컴센터", zone: "street", real: true, mapX: 410, mapY: 962, gps: null, historyStatus: "pending",
    gameRole: "타임워커 여정의 출발점. 베리쥬가 여행단 합류를 기다리는 곳 (게임 설정)", characterIds: ["berijyu"], npcId: "guide", reward: R(40, 20, { salt: 2 }) },
  { id: "music-library", no: 2, name: "음악도서관", zone: "street", real: true, mapX: 380, mapY: 827, gps: null, historyStatus: "pending", reward: R() },
  { id: "tailor", no: 3, name: "양장점", zone: "street", real: true, mapX: 390, mapY: 690, gps: null, historyStatus: "pending", reward: R() },
  { id: "dance-hall", no: 4, name: "딴스홀", zone: "street", real: true, mapX: 372, mapY: 548, gps: null, historyStatus: "pending", reward: R() },
  { id: "memory-lighthouse", no: 5, name: "기억의 등대", zone: "street", real: true, mapX: 390, mapY: 437, gps: null, historyStatus: "pending",
    gameRole: "수수께끼의 아빠 고양이 강이가 머무는 곳 (게임 설정)", characterIds: ["kangi"], reward: R(50, 15) },
  { id: "cinema", no: 6, name: "강경씨네마", zone: "street", real: true, mapX: 390, mapY: 328, gps: null, historyStatus: "pending", reward: R() },
  { id: "photo-studio", no: 7, name: "갱갱사진관", zone: "street", real: true, mapX: 425, mapY: 232, gps: null, historyStatus: "pending",
    gameRole: "옛날 사진사 NPC 은솔이 기다리는 곳 (게임 설정)", npcId: "photographer", reward: R() },
  { id: "donkatsu", no: 8, name: "강경돈까스", zone: "street", real: true, mapX: 395, mapY: 128, gps: null, historyStatus: "pending", reward: R(30, 10, { anchovy: 1 }) },
  { id: "gallery", no: 9, name: "강경화랑", zone: "street", real: true, mapX: 588, mapY: 162, gps: null, historyStatus: "pending",
    gameRole: "대추삼형제 첫째의 발견 장소 (게임 설정)", characterIds: ["daechu-1"], reward: R() },
  { id: "dammi", no: 10, name: "담미", zone: "street", real: true, mapX: 660, mapY: 262, gps: null, historyStatus: "pending", reward: R() },
  { id: "milmyeon", no: 11, name: "백년가야밀면", zone: "street", real: true, mapX: 572, mapY: 350, gps: null, historyStatus: "pending", reward: R(30, 10, { shrimp: 1 }) },
  { id: "honggyori", no: 12, name: "홍교리", zone: "street", real: true, mapX: 588, mapY: 448, gps: null, historyStatus: "pending",
    gameRole: "대추삼형제 둘째의 발견 장소 (게임 설정)", characterIds: ["daechu-2"], reward: R() },
  { id: "bookshop", no: 13, name: "홍인책방", note: "멜랑이", zone: "street", real: true, mapX: 601, mapY: 591, gps: null, historyStatus: "pending", reward: R() },
  { id: "romance-square", no: 14, name: "랑만광장", note: "야간 미디어 파사드", zone: "street", real: true, mapX: 679, mapY: 690, gps: null, historyStatus: "pending",
    gameRole: "대추삼형제 막내의 발견 장소 · 공동 항아리 이벤트 광장 (게임 설정)", characterIds: ["daechu-3"], reward: R(40, 15) },
  { id: "daecheong", no: 15, name: "대청상회", note: "깜뚜누들", zone: "street", real: true, mapX: 567, mapY: 716, gps: null, historyStatus: "pending",
    gameRole: "간식 냄새를 따라온 아기 고양이 콩이의 발견 장소 (게임 설정)", characterIds: ["kongi"], reward: R(50, 15) },
  { id: "gwangshin", no: 16, name: "광신석유", note: "갱갱", zone: "street", real: true, mapX: 575, mapY: 808, gps: null, historyStatus: "pending",
    gameRole: "엄마 고양이 갱이가 쉬어가는 곳 (게임 설정)", characterIds: ["kaengi"], reward: R(50, 15) },
  { id: "workation", no: 17, name: "워케이션", zone: "street", real: true, mapX: 590, mapY: 1027, gps: null, historyStatus: "pending", reward: R() },
  { id: "ganggyeong-gwan", no: 18, name: "강경관", note: "여행자라운지", zone: "street", real: true, mapX: 651, mapY: 963, gps: null, historyStatus: "pending",
    gameRole: "시간 우체부 NPC 포포가 머무는 여행자 라운지 (게임 설정)", npcId: "postman", reward: R() },
  { id: "modern-store", no: 19, name: "강경모던상회", zone: "club", real: true, mapX: 860, mapY: 690, gps: null, historyStatus: "pending",
    gameRole: "안내도 힌트: \"강경모던상회에 가면 고양이 가족을 만날 수 있을지도…?\" — 고양이 가족 재회 장소", npcId: "merchant", reward: R(60, 25) },
  { id: "coffee-interview", no: 20, name: "커피인터뷰", zone: "club", real: true, mapX: 1108, mapY: 862, gps: null, historyStatus: "pending",
    gameRole: "스윗포가 쉬어가는 곳 (게임 설정)", characterIds: ["sweetpo"], reward: R(50, 15) },
  { id: "hotel-west", no: 21, name: "강경호텔", note: "서양식", zone: "club", real: true, mapX: 1016, mapY: 814, gps: null, historyStatus: "pending", reward: R() },
  { id: "hotel-east", no: 22, name: "강경호텔", note: "동양식", zone: "club", real: true, mapX: 1052, mapY: 714, gps: null, historyStatus: "pending", reward: R() },
  { id: "hotel-family", no: 23, name: "강경호텔", note: "가족실", zone: "club", real: true, mapX: 1141, mapY: 672, gps: null, historyStatus: "pending", reward: R() },
  { id: "hana-donkatsu", no: 24, name: "하나네돈까스", zone: "club", real: true, mapX: 1177, mapY: 755, gps: null, historyStatus: "pending", reward: R() },
];

/** 언론 보도(2025~2026 강경근대거리 개관·스탬프투어 기사)와 현장 사진으로 확인한 실제 정보.
 *  운영 내용은 바뀔 수 있으니 현장·논산시 안내를 우선합니다. */
const FACTS: Record<string, string> = {
  "welcome-center": "강경근대거리 초입의 안내소(案內所 · Welcome Center). 붉은 벽돌 단층 건물에 전구를 두른 노란 간판이 걸려 있고, 강경과 논산의 관광 정보를 한눈에 안내해요.",
  "music-library": "‘江景音樂圖書館’ 세로 간판이 걸린 2층 붉은 벽돌 건물. 피아노와 재즈, 명화 미디어아트로 근대의 감성을 느끼는 공간이에요. 거리 신문에는 ‘손 하나 대지 않고 울려 퍼지는 피아노 선율’로 소개돼요.",
  tailor: "베이지 석재 벽에 마름모 한자 현판 ‘裕昌商會’가 걸린 건물. AR 가상 피팅과 시대별 메이크업으로 근대의 옷차림을 직접 입어 보는 체험 공간이에요.",
  "dance-hall": "사교댄스와 게임으로 그 시절의 문화를 즐겨 보는 체험 공간이에요.",
  "memory-lighthouse": "짙은 초록 주물 기둥에 LED 화면을 두른 거리의 상징물. 금빛 ‘THE LIGHTHOUSE OF MEMORY’ 띠 아래로 강경의 옛 기억과 내일의 이야기가 흘러가요.",
  cinema: "미디어아트와 AI 포토 체험으로 강경의 과거와 현재를 색다르게 만나는 공간이에요.",
  "photo-studio": "곡선 박공의 흰 3층 건물에 초록 액자 간판 ‘美光寫眞館’이 걸린 사진관. AI 포토 체험으로 근대풍 기념사진을 남길 수 있어요.",
  gwangshin: "기와 차양을 두른 짙은 목조 2층 건물에 ‘光信石油’·‘江景石油’·Ford 간판이 걸려 있고, 앞에는 빨강·청록 옛 주유기 두 대가 서 있어요.",
  daecheong: "회청색 미장 벽에 금테 현판 ‘大成商會’가 걸린 근대 상점. 옆 가게에는 ‘典當舖’ 간판이 보여요.",
  "romance-square": "마술·인형극·재즈·근대음악 공연이 열리는 야외 무대. 강경국가유산야행 때는 ‘강경 풍류 예인쇼’가 열렸어요.",
  "modern-store": "논산여행단 굿즈 전시와 클래식카 포토존이 있는 팝업 상점. 체험 공간 8곳의 스탬프를 모아 오면 굿즈를 받을 수 있어요 (스탬프투어 매일 10:00~17:30).",
  "ganggyeong-gwan": "‘江景舘’ 글씨와 손그림 영화 간판, 청록 창틀이 눈에 띄는 근대풍 극장 건물이에요.",
};
for (const l of LOCATIONS) if (!l.description && FACTS[l.id]) l.description = FACTS[l.id];


export const LOC = Object.fromEntries(LOCATIONS.map((l) => [l.id, l])) as Record<string, GameLocation>;

export const locLabel = (l: GameLocation) => (l.note ? `${l.name}(${l.note})` : l.name);

/** 안내도에 표기된 주소 · 연락처 (사진 5 판독) */
export const DISTRICT_INFO = {
  name: "강경근대거리 · 강경구락부",
  address: "충청남도 논산시 강경읍 옥녀봉로 30-5",
  addressOnMap: "충남 논산시 강경읍 중앙리 40-2 (안내도의 지번 표기)",
  parking: "인근 공용주차장 이용 (안내도 표기)",
  guideReservation: "문화관광해설사 예약 041-746-5405 (논산시청 관광과)",
  walkway: "감성산책로 (고보 라이트 길) — 옛 강경 포구 장터의 고양이 이야기를 주제로 한 야간 산책로",
  hours: "전시·체험 시설 매일 10:00~18:00 (강경국가유산야행 기간 22:00까지)",
  night: "해가 지면 영란등·미디어퍼사드·고보라이트가 거리를 밝혀요",
  history: "조선 후기 강경포는 원산과 함께 2대 포구, 강경장은 평양장·대구장과 함께 3대 시장으로 불렸어요",
  /** 강경읍 일대 근사 중심 좌표 — 지도 표시용, 공식 검증 필요 */
  approxCenter: { lat: 36.1586, lng: 127.0136 },
};

/** 추천 탐험 동선 (안내도의 도로 흐름을 따라 남→북→동 순서로 구성한 게임 동선) */
export const RECOMMENDED_ROUTE = [
  "welcome-center", "music-library", "tailor", "dance-hall", "memory-lighthouse", "cinema", "photo-studio",
  "gallery", "milmyeon", "honggyori", "bookshop", "daecheong", "gwangshin", "romance-square", "modern-store",
];
