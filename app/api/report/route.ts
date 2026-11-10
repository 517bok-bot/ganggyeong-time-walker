import { NextResponse } from "next/server";
import { clientKey, rateLimit } from "@/lib/ratelimit";
import { getServiceSupabase } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

/** 오류 신고·의견: 서버 로그(Vercel 로그)에 남기고, Supabase가 설정돼 있으면 reports 표에도 저장합니다. 개인정보는 받지 않아요. */
export async function POST(req: Request) {
  if (!rateLimit(`report:${clientKey(req)}`, 5, 10 * 60_000)) return NextResponse.json({ ok: false, error: "잠시 후 다시 보내 주세요" }, { status: 429 });
  const body = (await req.json().catch(() => null)) as { kind?: string; message?: string; page?: string } | null;
  const message = String(body?.message ?? "").trim().slice(0, 1000);
  if (message.length < 2) return NextResponse.json({ ok: false, error: "내용을 적어 주세요" }, { status: 400 });
  const kind = ["bug", "idea", "info"].includes(String(body?.kind)) ? String(body?.kind) : "bug";
  const page = String(body?.page ?? "").slice(0, 120);
  const ua = (req.headers.get("user-agent") ?? "").slice(0, 200);
  console.log("[report]", JSON.stringify({ kind, page, message, ua, at: new Date().toISOString() }));
  if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
    try { await getServiceSupabase().from("reports").insert({ kind, page, message, user_agent: ua }); } catch (e) { console.error("[report] db", e); }
  }
  return NextResponse.json({ ok: true });
}
