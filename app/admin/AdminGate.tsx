import Link from "next/link";
import { checkAdmin, type AdminCtx } from "@/lib/admin-auth";

const NAV = [
  ["/admin", "대시보드"], ["/admin/locations", "관광지"], ["/admin/characters", "캐릭터"], ["/admin/knowledge", "승인 자료"], ["/admin/letters", "편지 검토"], ["/admin/qr", "QR 코드"],
] as const;

/** 관리자 페이지 공통 틀 + 권한 검사 (페이지마다 서버에서 실행) */
export default async function AdminGate({ title, children }: { title: string; children: (ctx: Extract<AdminCtx, { ok: true }>) => React.ReactNode }) {
  const ctx = await checkAdmin();
  if (!ctx.ok) {
    return (
      <main className="p-6">
        <div className="paper p-6 max-w-md mx-auto text-center">
          <h1 className="font-game text-2xl">🔒 관리자 전용</h1>
          <p className="text-wood mt-2">{ctx.reason === "login" ? "관리자 계정으로 로그인해 주세요." : "접근 권한이 없습니다."}</p>
          {ctx.reason === "login" && <Link href="/login" className="btn-sage mt-4">로그인</Link>}
        </div>
      </main>
    );
  }
  return (
    <main className="p-4">
      <header className="flex flex-wrap items-center gap-2">
        <h1 className="font-story font-bold text-2xl text-wood-dark mr-2">관리자 · {title}</h1>
        {ctx.mode === "dev"
          ? <span className="demo-badge">개발 미리보기 (Supabase 미연결 · 읽기 전용)</span>
          : <span className="chip bg-sage text-cream">{ctx.email ?? "게스트 관리자"}</span>}
        <Link href="/" className="ml-auto btn-cream btn-sm">← 게임으로</Link>
      </header>
      <nav className="flex gap-2 mt-3 overflow-x-auto no-scrollbar">
        {NAV.map(([href, label]) => <Link key={href} href={href} className="btn-cream btn-sm shrink-0">{label}</Link>)}
      </nav>
      <div className="mt-4">{children(ctx)}</div>
    </main>
  );
}
