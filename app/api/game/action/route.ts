import { NextResponse } from "next/server";
import { getUser } from "@/lib/supabase/server";
import { runAction } from "@/lib/server-game";
import { rateLimit } from "@/lib/ratelimit";
import type { Action } from "@/lib/engine";
import type { Proof } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const user = await getUser();
  if (!user) return NextResponse.json({ ok: false, error: "로그인이 필요해요" }, { status: 401 });
  if (!rateLimit(`act:${user.id}`, 90)) return NextResponse.json({ ok: false, error: "요청이 너무 많아요. 잠시 후 다시 시도하세요." }, { status: 429 });
  const body = (await req.json().catch(() => null)) as { action?: Action; proof?: Proof } | null;
  if (!body?.action || typeof body.action.type !== "string" || JSON.stringify(body).length > 4000)
    return NextResponse.json({ ok: false, error: "잘못된 요청" }, { status: 400 });
  try {
    const { status, effects: _e, ...out } = await runAction(user.id, body.action, body.proof);
    return NextResponse.json(out, { status });
  } catch (e) {
    console.error("[game/action]", body.action.type, e);
    return NextResponse.json({ ok: false, error: "서버 오류가 발생했어요" }, { status: 500 });
  }
}
