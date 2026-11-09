// 3단계: 타임워커 의상·액세서리 (게임 창작 아이템)
export type Slot = "hat" | "neck" | "face" | "outfit" | "prop";
export interface Wear { id: string; name: string; slot: Slot; price: number; level: number; emoji: string; desc: string }

export const WEARS: Wear[] = [
  { id: "hat-fedora", name: "근대 중절모", slot: "hat", price: 0, level: 1, emoji: "🎩", desc: "타임워커의 기본 모자" },
  { id: "hat-straw", name: "금강 밀짚모자", slot: "hat", price: 60, level: 2, emoji: "👒", desc: "강바람에 어울리는 밀짚모자" },
  { id: "hat-beret", name: "화가의 베레모", slot: "hat", price: 90, level: 3, emoji: "🎨", desc: "화랑 산책에 어울리는 베레모" },
  { id: "hat-cat", name: "고양이 귀 모자", slot: "hat", price: 150, level: 4, emoji: "🐱", desc: "고양이 가족과 한 팀이 된 증표" },
  { id: "neck-scarf", name: "벽돌빛 머플러", slot: "neck", price: 40, level: 1, emoji: "🧣", desc: "따뜻한 벽돌색 머플러" },
  { id: "neck-bow", name: "나비넥타이", slot: "neck", price: 70, level: 2, emoji: "🎀", desc: "딴스홀에 갈 때는 이것!" },
  { id: "neck-apron", name: "젓갈 장인 앞치마", slot: "neck", price: 120, level: 3, emoji: "🥼", desc: "항아리를 다루는 장인의 앞치마" },
  { id: "face-glasses", name: "동그란 안경", slot: "face", price: 50, level: 1, emoji: "👓", desc: "옛 사진관 주인처럼" },
  { id: "face-mono", name: "금테 외눈 안경", slot: "face", price: 130, level: 4, emoji: "🧐", desc: "시간 여행자의 품격" },
  // ── 근대거리 의상 (1920~30년대 분위기의 창작 의상) ──
  { id: "hat-cloche", name: "모던걸 클로슈", slot: "hat", price: 80, level: 2, emoji: "👒", desc: "종 모양 챙 모자, 근대거리의 멋쟁이" },
  { id: "hat-gat", name: "흑립(갓)", slot: "hat", price: 110, level: 3, emoji: "🎩", desc: "선비의 검은 갓" },
  { id: "outfit-suit", name: "개화기 양복", slot: "outfit", price: 100, level: 2, emoji: "🧥", desc: "조끼와 넥타이를 갖춘 모던보이 차림" },
  { id: "outfit-dress", name: "모던걸 원피스", slot: "outfit", price: 100, level: 2, emoji: "👗", desc: "세일러 깃이 달린 근대 원피스" },
  { id: "outfit-hanbok", name: "색동 저고리", slot: "outfit", price: 120, level: 3, emoji: "👘", desc: "다섯 빛깔 소매의 고운 한복" },
  { id: "outfit-academy", name: "별자리 도포", slot: "outfit", price: 180, level: 4, emoji: "🧙", desc: "금실 별자리가 수놓인 타임워커의 도포" },
  // ── 소품 ──
  { id: "prop-parasol", name: "레이스 양산", slot: "prop", price: 60, level: 1, emoji: "☂️", desc: "근대거리 산책에 어울리는 양산" },
  { id: "prop-trunk", name: "가죽 트렁크", slot: "prop", price: 70, level: 2, emoji: "🧳", desc: "강경역으로 떠나는 여행 가방" },
  { id: "prop-camera", name: "주름 사진기", slot: "prop", price: 90, level: 2, emoji: "📷", desc: "갱갱사진관 앞에서 찰칵" },
  { id: "prop-fan", name: "태극 부채", slot: "prop", price: 50, level: 1, emoji: "🪭", desc: "여름밤 강바람과 함께" },
  { id: "prop-lantern", name: "청사초롱", slot: "prop", price: 80, level: 3, emoji: "🏮", desc: "달밤 골목을 밝히는 초롱" },
  { id: "prop-compass", name: "시간 나침반", slot: "prop", price: 200, level: 5, emoji: "🧭", desc: "시간의 종이 내린 마법 나침반. 기억이 있는 곳을 가리켜요" },
];
export const WEAR = Object.fromEntries(WEARS.map((w) => [w.id, w])) as Record<string, Wear>;
