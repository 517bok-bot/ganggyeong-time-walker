import { NextResponse } from "next/server";
import { clientKey, rateLimit } from "@/lib/ratelimit";
import { getServiceSupabase } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

const LIMIT = Number(process.env.COUPON_LIMIT ?? 300);
const useDb = () => !!(process.env.SUPABASE_SERVICE_ROLE_KEY && process.env.NEXT_PUBLIC_SUPABASE_URL);

/** 남은 수량 (DB가 있을 때만 셀 수 있어요) */
export async function GET() {
  if (!useDb()) return NextResponse.json({ ok: true, limit: LIMIT, used: null });
  const { count } = await getServiceSupabase().from("coupon_redemptions").select("code", { count: "exact", head: true });
  return NextResponse.json({ ok: true, limit: LIMIT, used: count ?? 0 });
}

/** 강경모던상회 직원이 쿠폰을 '사용 완료' 처리: 직원 비밀번호(COUPON_STAFF_PIN) 확인 → 1회용 번호 기록 */
export async function POST(req: Request) {
  if (!rateLimit(`coupon:${clientKey(req)}`, 10, 10 * 60_000)) return NextResponse.json({ ok: false, error: "잠시 후 다시 시도해 주세요" }, { status: 429 });
  const pin = process.env.COUPON_STAFF_PIN;
  if (!pin) return NextResponse.json({ ok: false, error: "직원 비밀번호가 아직 설정되지 않았어요 (운영자 설정 필요)" }, { status: 503 });
  const body = (await req.json().catch(() => null)) as { code?: string; pin?: string } | null;
  const code = String(body?.code ?? "");
  if (!/^[A-Z0-9]{6}$/.test(code)) return NextResponse.json({ ok: false, error: "쿠폰 번호가 올바르지 않아요" }, { status: 400 });
  if (String(body?.pin ?? "") !== pin) return NextResponse.json({ ok: false, error: "직원 비밀번호가 맞지 않아요" }, { status: 403 });
  if (useDb()) {
    const db = getServiceSupabase();
    const { count } = await db.from("coupon_redemptions").select("code", { count: "exact", head: true });
    if ((count ?? 0) >= LIMIT) return NextResponse.json({ ok: false, error: `선착순 ${LIMIT}장이 모두 소진됐어요` }, { status: 410 });
    const { error } = await db.from("coupon_redemptions").insert({ code });
    if (error) return NextResponse.json({ ok: false, error: error.code === "23505" ? "이미 사용한 쿠폰이에요" : "기록에 실패했어요" }, { status: error.code === "23505" ? 409 : 500 });
    return NextResponse.json({ ok: true, used: (count ?? 0) + 1, limit: LIMIT });
  }
  console.log("[coupon] redeemed", code, new Date().toISOString());
  return NextResponse.json({ ok: true, used: null, limit: LIMIT });
}
