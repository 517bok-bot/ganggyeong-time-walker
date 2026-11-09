import { NextResponse } from "next/server";
import { getUser } from "@/lib/supabase/server";
import { getServiceSupabase } from "@/lib/supabase/admin";
import { rateLimit } from "@/lib/ratelimit";

export const dynamic = "force-dynamic";
const AUTO_HIDE = 3; // 서로 다른 신고 3건이면 관리자 검토 전까지 자동으로 숨김

export async function POST(req: Request) {
  const user = await getUser();
  if (!user) return NextResponse.json({ ok: false, error: "로그인이 필요해요" }, { status: 401 });
  if (!rateLimit(`report:${user.id}`, 10)) return NextResponse.json({ ok: false, error: "잠시 후 다시 시도하세요" }, { status: 429 });
  const b = (await req.json().catch(() => null)) as { id?: string; reason?: string } | null;
  if (!b?.id) return NextResponse.json({ ok: false }, { status: 400 });
  const sb = getServiceSupabase();
  const dup = await sb.from("reports").select("id").eq("reporter_id", user.id).eq("target_table", "letters").eq("target_id", b.id).maybeSingle();
  if (dup.data) return NextResponse.json({ ok: true, already: true });
  await sb.from("reports").insert({ reporter_id: user.id, target_table: "letters", target_id: b.id, reason: String(b.reason ?? "부적절한 내용").slice(0, 100) });
  const { data: all } = await sb.from("reports").select("reporter_id").eq("target_table", "letters").eq("target_id", b.id).limit(100);
  const count = new Set((all ?? []).map((r) => r.reporter_id)).size;
  await sb.from("letters").update({ report_count: count, ...(count >= AUTO_HIDE ? { is_hidden: true } : {}) }).eq("id", b.id);
  return NextResponse.json({ ok: true });
}
