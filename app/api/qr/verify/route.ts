import { NextResponse } from "next/server";
import { verifyQr } from "@/lib/qr";
import { rateLimit, clientKey } from "@/lib/ratelimit";

export async function POST(req: Request) {
  if (!rateLimit(`qr:${clientKey(req)}`, 30)) return NextResponse.json({ ok: false, reason: "요청이 너무 많아요. 잠시 후 다시 시도하세요." }, { status: 429 });
  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ ok: false, reason: "잘못된 요청" }, { status: 400 }); }
  const payload = typeof (body as { payload?: unknown })?.payload === "string" ? (body as { payload: string }).payload : "";
  if (!payload || payload.length > 500) return NextResponse.json({ ok: false, reason: "QR 내용이 비어 있어요" }, { status: 400 });
  const r = verifyQr(payload);
  // 2단계: 여기서 Supabase에 (user_id, location_id) UNIQUE 로 location_visits 를 기록하고 보상을 지급합니다.
  return NextResponse.json(r, { status: r.ok ? 200 : 422 });
}
