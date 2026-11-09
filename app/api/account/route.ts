import { NextResponse } from "next/server";
import { getUser } from "@/lib/supabase/server";
import { getServiceSupabase } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

/** 회원 탈퇴: 엽서 파일 삭제 후 계정 삭제 (모든 게임 기록은 FK cascade 로 함께 삭제) */
export async function DELETE() {
  const user = await getUser();
  if (!user) return NextResponse.json({ ok: false }, { status: 401 });
  const sb = getServiceSupabase();
  const files = await sb.storage.from("postcards").list(user.id, { limit: 1000 });
  if (files.data?.length) await sb.storage.from("postcards").remove(files.data.map((f) => `${user.id}/${f.name}`));
  const { error } = await sb.auth.admin.deleteUser(user.id);
  if (error) { console.error("[account/delete]", error); return NextResponse.json({ ok: false, error: "탈퇴 처리 실패" }, { status: 500 }); }
  return NextResponse.json({ ok: true });
}
