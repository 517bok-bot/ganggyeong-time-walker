import { NextResponse } from "next/server";
import { getUser } from "@/lib/supabase/server";
import { loadSave, resetSave } from "@/lib/server-game";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "로그인이 필요해요" }, { status: 401 });
  try {
    const { state, version } = await loadSave(user.id);
    return NextResponse.json({ state, version });
  } catch (e) {
    console.error("[game/state]", e);
    return NextResponse.json({ error: "기록을 불러오지 못했어요" }, { status: 500 });
  }
}

/** 내 게임 기록 초기화 (계정은 유지) */
export async function DELETE() {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "로그인이 필요해요" }, { status: 401 });
  try { return NextResponse.json({ state: await resetSave(user.id) }); }
  catch (e) { console.error("[game/reset]", e); return NextResponse.json({ error: "초기화 실패" }, { status: 500 }); }
}
