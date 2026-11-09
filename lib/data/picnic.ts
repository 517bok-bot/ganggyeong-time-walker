// 소풍 아이템 (게임 창작 아이템) — 장소 방문·온라인 마을·퀘스트로 모아 '소풍 펼치기'에 씁니다.
export type PicnicKind = "food" | "gear";
export interface PicnicItem { id: string; name: string; kind: PicnicKind; desc: string }

export const PICNIC_ITEMS: PicnicItem[] = [
  { id: "riceball", name: "주먹밥", kind: "food", desc: "소풍의 기본, 꼭꼭 뭉친 주먹밥" },
  { id: "injeolmi", name: "인절미", kind: "food", desc: "콩고물 듬뿍 쫀득한 떡" },
  { id: "sikhye", name: "식혜", kind: "food", desc: "살얼음 동동 시원한 식혜" },
  { id: "cider", name: "유리병 사이다", kind: "food", desc: "옛날 유리병에 담긴 톡 쏘는 사이다" },
  { id: "strawberry", name: "논산 딸기", kind: "food", desc: "베리쥬가 좋아할 새빨간 딸기" },
  { id: "jujube", name: "연산 대추", kind: "food", desc: "대추삼형제의 고향에서 온 대추" },
  { id: "redbean", name: "단팥빵", kind: "food", desc: "근대 빵집 진열장의 둥근 단팥빵" },
  { id: "yakgwa", name: "약과", kind: "food", desc: "꿀 발라 반짝이는 꽃 모양 과자" },
  { id: "mat", name: "돗자리", kind: "gear", desc: "강가에 펼칠 왕골 돗자리" },
  { id: "basket", name: "소풍 바구니", kind: "gear", desc: "대나무로 엮은 도시락 바구니" },
  { id: "pinwheel", name: "바람개비", kind: "gear", desc: "강바람에 빙글빙글" },
  { id: "kite", name: "방패연", kind: "gear", desc: "금강 위로 높이 띄우는 연" },
];
export const PICNIC = Object.fromEntries(PICNIC_ITEMS.map((p) => [p.id, p])) as Record<string, PicnicItem>;

/** 장소 방문 시 얻는 소풍 아이템 (장소마다 하나, 게임 설정) */
const ORDER = ["mat", "riceball", "basket", "injeolmi", "sikhye", "cider", "strawberry", "jujube", "redbean", "yakgwa", "pinwheel", "kite"];
export const LOCATION_PICNIC = (locNo: number) => ORDER[(locNo - 1) % ORDER.length];

/** 온라인 마을의 반짝이는 보따리 6곳 (x 좌표, 아이템) */
export const VILLAGE_PICNIC_SPOTS: { key: string; x: number; item: string }[] = [
  { key: "picnic:1", x: 360, item: "mat" }, { key: "picnic:2", x: 760, item: "basket" }, { key: "picnic:3", x: 1180, item: "riceball" },
  { key: "picnic:4", x: 1630, item: "sikhye" }, { key: "picnic:5", x: 2080, item: "injeolmi" }, { key: "picnic:6", x: 2620, item: "kite" },
];

export const PICNIC_FOOD_NEED = 3;
