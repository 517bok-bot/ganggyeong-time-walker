// 개인정보처리방침 (요약). 운영 형태가 바뀌면 함께 고칩니다.
import Link from "next/link";

export const metadata = { title: "개인정보처리방침 · 강경 타임워커" };

const S = ({ t, children }: { t: string; children: React.ReactNode }) => (
  <section className="card p-4 mt-3 text-sm leading-relaxed text-sumi"><h2 className="font-game font-bold text-base mb-1">{t}</h2>{children}</section>
);

export default function Privacy() {
  return (
    <main className="px-4 pt-[max(20px,env(safe-area-inset-top))] pb-8">
      <h1 className="font-story text-[28px] text-sumi">개인정보처리방침</h1>
      <p className="text-sm text-sumi-light mt-1">강경 타임워커는 개인정보를 최소한으로만 다룹니다. (시행일: 2026년 11월)</p>
      <S t="1. 로그인 없이 쓰면">게임 기록(도장·캐릭터·이야기 진행)은 <b>이 휴대폰의 브라우저 안에만</b> 저장돼요. 서버로 보내지 않으며, 브라우저 기록을 지우면 함께 지워져요.</S>
      <S t="2. 위치 정보">GPS 인증과 실제 걸음 모드를 켤 때만 위치를 써요. 위치는 장소와의 거리 확인과 지도 표시에만 쓰고 <b>저장하거나 서버에 기록하지 않아요</b>. GPS 인증 시 거리 확인을 위해 서버에 한 번 보내지만 남기지 않아요. 위치 권한은 언제든 휴대폰 설정에서 끌 수 있어요.</S>
      <S t="3. 카메라와 사진">캐릭터 엽서를 만들 때만 카메라를 써요. 찍은 사진과 엽서는 <b>휴대폰 안에서만</b> 만들어지고 서버로 올라가지 않아요. 실물 인쇄를 원하면 직접 상회에 사진을 보내 주세요.</S>
      <S t="4. 로그인해서 쓰면 (선택)">기록을 여러 기기에서 이어 하고 싶을 때만 로그인할 수 있어요. 이때 이메일(또는 게스트 식별자)과 게임 기록을 서버(Supabase)에 저장하고, 회원 탈퇴 시 즉시 삭제해요. 만 14세 미만은 보호자 동의 후 로그인해 주세요.</S>
      <S t="5. 오류 신고·엽서 쿠폰">오류 신고에는 적은 내용, 화면 주소, 브라우저 종류만 저장해요. 엽서 쿠폰은 6자리 쿠폰 번호와 사용 시각만 기록해 중복 사용을 막아요. 이름·연락처는 받지 않아요.</S>
      <S t="6. 보관과 문의">위 기록은 서비스 운영 기간 동안 보관하고, 운영을 마치면 지체 없이 삭제해요. 문의는 앱의 ‘오류 신고 · 의견 보내기’로 남겨 주세요.</S>
      <Link href="/terms" className="btn-soft btn-sm w-full mt-4">이용약관 보기</Link>
    </main>
  );
}
