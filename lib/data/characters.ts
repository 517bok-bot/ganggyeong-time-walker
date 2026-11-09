// 지역 캐릭터 데이터
// ─────────────────────────────────────────────────────────────
// 출처: 사용자 제공 사진 1·2(캐릭터 전시 안내판), 사진 5(안내도 '특별수배' 박스)에서 판독한 문구.
// 권리: 강이·갱이·콩이·베리쥬·대추삼형제·스윗포는 논산시 지역 캐릭터이며,
//   논산시 사업 프로그램 협의에 따라 사용합니다 (운영자 확인, 2026-11).
//   화면의 그림은 공식 디자인의 특징을 유지한 민화풍 재해석본(components/art/Painted.tsx)입니다.
// quote/story 는 안내판 원문을 옮긴 것이며, 판독이 불확실한 부분은 uncertain 에 기록했습니다.

export type Rarity = "N" | "R" | "SR" | "SSR";
export type CharacterKind = "cat" | "berry" | "daechu" | "sweetpo";

export interface GameCharacter {
  id: string;
  name: string;
  roman?: string;
  kind: CharacterKind;
  family?: string;
  role: string;
  quote: string;
  personality: string[];
  likes: string;
  story: string;
  source: string;
  uncertain?: string;
  rarity: Rarity;
  locationId?: string;
  howToGet: string;
  onlineHint: string;
  /** 관리자 입력 (DB): 공식 원화 URL 과 사용 허가 상태 */
  imageUrl?: string | null;
  licenseStatus?: "permission_required" | "approved";
}

export const CHARACTERS: GameCharacter[] = [
  {
    id: "kangi", name: "강이", kind: "cat", family: "고양이 가족", role: "아빠 고양이",
    quote: "나이? 그건 비밀이라냥",
    personality: ["미스터리", "느긋함"],
    likes: "강경의 오래된 골목 (게임 설정)",
    story: "강경이 활기차던 시절부터 살아온 미스터리한 고양이.",
    source: "안내도 '특별수배' 박스",
    rarity: "SR", locationId: "memory-lighthouse",
    howToGet: "기억의 등대 방문 인증 (GPS/QR)",
    onlineHint: "온라인 마을: 오래된 등대 근처 지붕 위를 살펴보세요.",
  },
  {
    id: "kaengi", name: "갱이", roman: "Kaengi", kind: "cat", family: "고양이 가족", role: "엄마 고양이",
    quote: "잠깐 쉬어가도 괜찮아! 여행은 여유가 있어야 하잖아",
    personality: ["ENFJ", "편안한", "포근한"],
    likes: "여유로운 여행, 강경에서의 휴식",
    story: "이름 없이 도시를 떠돌던 갱이는 강경에서 강이를 만나 처음으로 자신의 이름을 받게 된다. 그 순간부터 갱이에게 강경은 머물고 싶은 곳이 되었고 자연스럽게 강경의 따뜻한 주민이 되었다.",
    source: "캐릭터 전시 안내판 (사진 1)",
    uncertain: "해시태그 중 네 번째 항목은 판독이 어려워 생략했습니다.",
    rarity: "R", locationId: "gwangshin",
    howToGet: "광신석유(갱갱) 방문 인증 (GPS/QR)",
    onlineHint: "온라인 마을: 주유소 간판 아래 그늘에서 쉬고 있어요.",
  },
  {
    id: "kongi", name: "콩이", roman: "kongi", kind: "cat", family: "고양이 가족", role: "아기 고양이",
    quote: "저쪽으로 가면 정말 맛있는 냄새가 나!",
    personality: ["ENFP", "애교쟁이", "간식러버"],
    likes: "간식, 맛있는 냄새",
    story: "강경 근대거리에서 태어난 귀여운 먹보 아기 고양이! 청년창업 가게에서 받은 간식에 반해, 그 순간부터 '간식러버'가 되었다. 냄새를 잘 맡아, 맛있는 간식이 있는 곳이면 어디든 찾아간다.",
    source: "캐릭터 전시 안내판 (사진 1·2)",
    uncertain: "해시태그 중 두 번째 항목은 판독이 어려워 생략했습니다.",
    rarity: "R", locationId: "daecheong",
    howToGet: "대청상회(깜뚜누들) 방문 인증 (GPS/QR)",
    onlineHint: "온라인 마을: 맛있는 냄새가 나는 가게 앞 화분 뒤!",
  },
  {
    id: "berijyu", name: "베리쥬", roman: "Berijyu", kind: "berry", family: "논산 여행단", role: "딸기 여행가",
    quote: "논산엔 아직 우리가 안 가본 곳이 더 많아!",
    personality: ["ESFJ", "텐션UP", "탐험가", "상큼발랄"],
    likes: "새로운 장소, 여행",
    story: "논산의 딸기밭에서 태어난 베리쥬는 언제나 새로운 장소를 궁금해한다. 논산 곳곳을 여행하며 둘러보는 것이 꿈이었던 베리쥬는 고양이 가족을 만나 꿈을 이루기 위해 '논산 여행단'에 합류하게 된다.",
    source: "캐릭터 전시 안내판 (사진 1·2)",
    rarity: "R", locationId: "welcome-center",
    howToGet: "웰컴센터 방문 인증 (GPS/QR)",
    onlineHint: "온라인 마을: 마을 입구 안내판 옆에서 손을 흔들고 있어요.",
  },
  {
    id: "daechu-1", name: "대추삼형제 · 첫째", roman: "Daechu Bros", kind: "daechu", family: "대추삼형제", role: "말린 대추 맏형",
    quote: "셋이 있으면 논산 어디든 축제같아!",
    personality: ["듬직함", "이야기꾼"],
    likes: "연산의 옛이야기",
    story: "연산 대추밭에서 함께 자란 대추삼형제는 숙성도에 따라 모습과 성격이 달라졌다. 첫째는 항상 같은 자리를 지키며 말린 대추가 되었고, 오래된 연산의 이야기를 잘 알고 있다.",
    source: "캐릭터 전시 안내판 (사진 1)",
    uncertain: "형제별 개별 이름은 사진 해상도가 낮아 판독하지 못했습니다. 공식 자료 확인 후 등록하세요.",
    rarity: "N", locationId: "gallery",
    howToGet: "강경화랑 방문 인증 (GPS/QR)",
    onlineHint: "온라인 마을: 화랑 액자 사이에 숨어 있어요.",
  },
  {
    id: "daechu-2", name: "대추삼형제 · 둘째", roman: "Daechu Bros", kind: "daechu", family: "대추삼형제", role: "차분한 중재자",
    quote: "셋이 있으면 논산 어디든 축제같아!",
    personality: ["차분함", "중재 능력"],
    likes: "형제들과 함께하는 시간",
    story: "연산 대추밭에서 함께 자란 대추삼형제의 둘째. 차분한 중재 능력으로 형제 사이를 이어준다.",
    source: "캐릭터 전시 안내판 (사진 1)",
    uncertain: "개별 이름 미판독.",
    rarity: "N", locationId: "honggyori",
    howToGet: "홍교리 방문 인증 (GPS/QR)",
    onlineHint: "온라인 마을: 붉은 벽돌 건물 창가.",
  },
  {
    id: "daechu-3", name: "대추삼형제 · 막내", roman: "Daechu Bros", kind: "daechu", family: "대추삼형제", role: "발랄한 막내",
    quote: "셋이 있으면 논산 어디든 축제같아!",
    personality: ["산뜻함", "발랄함"],
    likes: "축제, 신나는 일",
    story: "연산 대추밭에서 함께 자란 대추삼형제의 막내. 산뜻하고 발랄한 에너지가 넘친다.",
    source: "캐릭터 전시 안내판 (사진 1)",
    uncertain: "개별 이름 미판독.",
    rarity: "N", locationId: "romance-square",
    howToGet: "랑만광장 방문 인증 (GPS/QR)",
    onlineHint: "온라인 마을: 광장 가로등 아래.",
  },
  {
    id: "sweetpo", name: "스윗포", kind: "sweetpo", family: "논산 여행단", role: "논산 지역 캐릭터",
    quote: "…",
    personality: [],
    likes: "공식 설정 확인 후 등록",
    story: "포스터(사진 4)에 고양이 가족, 베리쥬, 대추삼형제와 함께 등장하는 자주색 캐릭터. 이름은 운영자 확인으로 '스윗포'로 등록했으며, 성격·이야기 등 상세 설정은 공식 자료 확인 후 관리자 페이지에서 채웁니다.",
    source: "포스터 (사진 4) · 이름: 운영자 확인",
    uncertain: "대사·성격·배경 이야기는 공식 자료 확인 전이라 비워 두었습니다.",
    rarity: "SR", locationId: "coffee-interview",
    howToGet: "커피인터뷰 방문 인증 (GPS/QR)",
    onlineHint: "온라인 마을: 시간 우체국 옆 우체통 근처를 살펴보세요.",
  },
];

export const CHAR = Object.fromEntries(CHARACTERS.map((c) => [c.id, c])) as Record<string, GameCharacter>;
export const CAT_FAMILY = ["kangi", "kaengi", "kongi"];
export const DAECHU_BROS = ["daechu-1", "daechu-2", "daechu-3"];

export const RARITY_STYLE: Record<Rarity, string> = {
  N: "bg-hanji-dark text-sumi",
  R: "bg-jade text-hanji-light",
  SR: "bg-dream text-hanji-light",
  SSR: "bg-antique text-sumi-dark",
};
