import { NextResponse } from "next/server";
import { getUser } from "@/lib/supabase/server";
import { getServiceSupabase } from "@/lib/supabase/admin";
import { rateLimit } from "@/lib/ratelimit";
import { LOC } from "@/lib/data/locations";
import { OPEN_OPTIONS, letterProblem, type LetterView } from "@/lib/letters";

export const dynamic = "force-dynamic";

type Row = { id: string; sender_id: string; body: string; nickname: string | null; stamp: string | null; open_at: string; created_at: string; is_public: boolean };
const view = (r: Row, mine: boolean): LetterView => ({ id: r.id, body: r.body, nickname: r.nickname ?? "여행자", stamp: r.stamp ?? "welcome-center", openAt: r.open_at, createdAt: r.created_at, isPublic: r.is_public, mine });

/** 다른 여행자의 공개 편지(열람 시점이 지난 것) + 내 편지 */
export async function GET() {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "로그인이 필요해요" }, { status: 401 });
  const sb = getServiceSupabase();
  const now = new Date().toISOString();
  const [others, mine] = await Promise.all([
    sb.from("letters").select("id,sender_id,body,nickname,stamp,open_at,created_at,is_public").eq("is_public", true).eq("is_hidden", false).lte("open_at", now).neq("sender_id", user.id).order("open_at", { ascending: false }).limit(30),
    sb.from("letters").select("id,sender_id,body,nickname,stamp,open_at,created_at,is_public").eq("sender_id", user.id).order("created_at", { ascending: false }).limit(50),
  ]);
  const pool = (others.data ?? []) as Row[];
  const pick = pool.sort(() => Math.random() - 0.5).slice(0, 8);
  return NextResponse.json({ others: pick.map((r) => view(r, false)), mine: ((mine.data ?? []) as Row[]).map((r) => view(r, true)) });
}

export async function POST(req: Request) {
  const user = await getUser();
  if (!user) return NextResponse.json({ ok: false, error: "로그인이 필요해요" }, { status: 401 });
  if (!rateLimit(`letter:${user.id}`, 5, 10 * 60_000)) return NextResponse.json({ ok: false, error: "편지는 10분에 5통까지 보낼 수 있어요" }, { status: 429 });
  const b = (await req.json().catch(() => null)) as { body?: string; open?: string; isPublic?: boolean; stamp?: string; nickname?: string } | null;
  const body = String(b?.body ?? "");
  const problem = letterProblem(body);
  if (problem) return NextResponse.json({ ok: false, error: problem }, { status: 422 });
  const opt = OPEN_OPTIONS.find((o) => o.id === b?.open) ?? OPEN_OPTIONS[0];
  const sb = getServiceSupabase();
  // 우표는 방문 인증한 장소의 것만 사용 가능
  let stamp = "welcome-center";
  if (b?.stamp && LOC[b.stamp]) {
    const v = await sb.from("location_visits").select("location_id").eq("user_id", user.id).eq("location_id", b.stamp).maybeSingle();
    if (v.data) stamp = b.stamp;
  }
  const { data, error } = await sb.from("letters").insert({
    sender_id: user.id, body: body.trim(), nickname: String(b?.nickname ?? "여행자").replace(/[<>]/g, "").slice(0, 12) || "여행자",
    stamp, is_public: !!b?.isPublic, open_at: new Date(Date.now() + opt.days * 86400_000).toISOString(),
  }).select("id").single();
  if (error) return NextResponse.json({ ok: false, error: "편지를 부치지 못했어요" }, { status: 500 });
  return NextResponse.json({ ok: true, id: data.id });
}

export async function DELETE(req: Request) {
  const user = await getUser();
  if (!user) return NextResponse.json({ ok: false }, { status: 401 });
  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ ok: false }, { status: 400 });
  await getServiceSupabase().from("letters").delete().eq("id", id).eq("sender_id", user.id);
  return NextResponse.json({ ok: true });
}
