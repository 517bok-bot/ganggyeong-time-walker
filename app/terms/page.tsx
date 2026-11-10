// 이용약관 (요약)
import Link from "next/link";

export const metadata = { title: "이용약관 · 강경 타임워커" };

const S = ({ t, children }: { t: string; children: React.ReactNode }) => (
  <section className="card p-4 mt-3 text-sm leading-relaxed text-sumi"><h2 className="font-game font-bold text-base mb-1">{t}</h2>{children}</section>
);

export default function Terms() {
  return (
    <main className="px-4 pt-[max(20px,env(safe-area-inset-top))] pb-8">
      <h1 className="font-story text-[28px] text-sumi">이용약관</h1>
      <p className="text-sm text-sumi-light mt-1">강경 타임워커는 강경근대거리 관광을 돕는 무료 위치 기반 게임이에요. (시행일: 2026년 11월)</p>
      <S t="1. 안전이 먼저예요">걸으면서 화면을 보지 마세요. 차도와 골목에서는 멈춰서 확인해 주세요. 어린이는 보호자와 함께 이용해 주세요. 게임 진행보다 주변 안전과 다른 방문객, 상가 영업을 우선해 주세요.</S>
      <S t="2. 게임 속 이야기">이야기의 마법 설정(시간의 종, 시간 조각 등)은 창작이에요. 역사 설명은 공개 자료를 바탕으로 쓰고 출처를 밝히지만, 정확한 내용은 현장 안내판과 강경역사관 자료를 함께 확인해 주세요.</S>
      <S t="3. 엽서 무료 인쇄">현장 도장 5개를 모으면 1회용 쿠폰이 열리고, 강경모던상회에서 선착순으로 실물 엽서를 인쇄해 드려요. 수량이 모두 소진되거나 상회 운영 시간이 아니면 인쇄할 수 없어요. 쿠폰을 고치거나 다른 사람의 화면을 쓰는 경우 인쇄를 거절할 수 있어요.</S>
      <S t="4. 캐릭터와 상호">논산시 캐릭터와 실제 상점 이름은 허락을 받은 범위에서 관광 안내 목적으로만 써요. 앱 속 그림과 글을 상업적으로 다시 쓰지 말아 주세요.</S>
      <S t="5. 서비스 변경">운영 상황에 따라 내용이 바뀌거나 잠시 멈출 수 있어요. 휴대폰에 저장된 기록이 지워지는 경우(브라우저 기록 삭제 등)는 되살릴 수 없어요.</S>
      <Link href="/privacy" className="btn-soft btn-sm w-full mt-4">개인정보처리방침 보기</Link>
    </main>
  );
}
