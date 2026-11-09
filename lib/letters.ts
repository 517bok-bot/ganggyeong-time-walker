// 시간 우체국 공통: 편지 검사 규칙과 예시 편지
export const LETTER_MAX = 300;
export const OPEN_OPTIONS = [
  { id: "now", label: "바로 공개", days: 0 },
  { id: "month", label: "한 달 뒤", days: 30 },
  { id: "year", label: "일 년 뒤", days: 365 },
] as const;

/** 개인정보·링크 차단 (전화번호, 이메일, 주소 링크) */
export function letterProblem(body: string): string | null {
  const t = body.trim();
  if (t.length < 5) return "다섯 글자 이상 적어 주세요";
  if (t.length > LETTER_MAX) return `${LETTER_MAX}자까지 쓸 수 있어요`;
  if (/(01[016789]|0\d{1,2})[-.\s]?\d{3,4}[-.\s]?\d{4}/.test(t)) return "전화번호 같은 개인정보는 쓸 수 없어요";
  if (/[\w.+-]+@[\w-]+\.[\w.]+/.test(t)) return "이메일 주소는 쓸 수 없어요";
  if (/https?:\/\/|www\./i.test(t)) return "링크는 붙일 수 없어요";
  return null;
}

export interface LetterView { id: string; body: string; nickname: string; stamp: string; openAt: string; createdAt: string; isPublic?: boolean; sample?: boolean; mine?: boolean }

/** 로컬 모드에서 보여주는 예시 편지 (실제 이용자가 쓴 편지가 아님) */
export const SAMPLE_LETTERS: LetterView[] = [
  { id: "sample-1", nickname: "시간 우체부 포포", stamp: "ganggyeong-gwan", openAt: "2026-01-01", createdAt: "2026-01-01", sample: true,
    body: "이 우체국에 처음 온 여행자에게. 여기 놓인 편지들은 먼저 강경을 걸은 사람들이 남긴 거예요. 당신도 다음 사람을 위해 한 줄 남겨 주세요." },
  { id: "sample-2", nickname: "예시 편지", stamp: "romance-square", openAt: "2026-01-01", createdAt: "2026-01-01", sample: true,
    body: "해 질 녘에 랑만광장에서 안내도를 다시 펼쳐 보세요. 오늘 걸은 길이 한눈에 보일 거예요." },
  { id: "sample-3", nickname: "예시 편지", stamp: "modern-store", openAt: "2026-01-01", createdAt: "2026-01-01", sample: true,
    body: "고양이 가족을 아직 다 못 찾았다면, 서두르지 마세요. 다음에 올 이유가 하나 생긴 거니까요." },
];
