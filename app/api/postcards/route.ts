import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { getUser } from "@/lib/supabase/server";
import { getServiceSupabase } from "@/lib/supabase/admin";
import { rateLimit } from "@/lib/ratelimit";
import { LOC } from "@/lib/data/locations";

export const dynamic = "force-dynamic";
const MAX_BYTES = 3 * 1024 * 1024;
const BUCKET = "postcards";

function isPng(b: Uint8Array) { return b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47; }

export async function GET() {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "로그인이 필요해요" }, { status: 401 });
  const sb = getServiceSupabase();
  const { data, error } = await sb.from("postcards").select("id,location_id,image_path,is_public,created_at,message").eq("user_id", user.id).order("created_at", { ascending: false }).limit(60);
  if (error) return NextResponse.json({ error: "불러오기 실패" }, { status: 500 });
  const paths = data.map((p) => p.image_path);
  const signed = paths.length ? (await sb.storage.from(BUCKET).createSignedUrls(paths, 3600)).data ?? [] : [];
  return NextResponse.json({ postcards: data.map((p, i) => ({ ...p, url: signed[i]?.signedUrl ?? "" })) });
}

export async function POST(req: Request) {
  const user = await getUser();
  if (!user) return NextResponse.json({ ok: false, error: "로그인이 필요해요" }, { status: 401 });
  if (!rateLimit(`pc:${user.id}`, 10)) return NextResponse.json({ ok: false, error: "잠시 후 다시 시도하세요" }, { status: 429 });
  const fd = await req.formData().catch(() => null);
  const file = fd?.get("image");
  const locationId = String(fd?.get("location_id") ?? "");
  const usesPhoto = fd?.get("uses_user_photo") === "true", consent = fd?.get("photo_consent") === "true";
  if (!(file instanceof Blob) || !LOC[locationId]) return NextResponse.json({ ok: false, error: "잘못된 요청" }, { status: 400 });
  if (usesPhoto && !consent) return NextResponse.json({ ok: false, error: "사진 사용 동의가 필요해요" }, { status: 400 });
  if (file.size > MAX_BYTES) return NextResponse.json({ ok: false, error: "이미지가 너무 커요 (최대 3MB)" }, { status: 413 });
  const bytes = new Uint8Array(await file.arrayBuffer());
  if (!isPng(bytes)) return NextResponse.json({ ok: false, error: "PNG 이미지만 저장할 수 있어요" }, { status: 415 });

  const sb = getServiceSupabase();
  const visit = await sb.from("location_visits").select("location_id").eq("user_id", user.id).eq("location_id", locationId).maybeSingle();
  if (!visit.data) return NextResponse.json({ ok: false, error: "방문 인증한 장소에서만 엽서를 저장할 수 있어요" }, { status: 403 });

  const path = `${user.id}/${randomUUID()}.png`;
  const up = await sb.storage.from(BUCKET).upload(path, bytes, { contentType: "image/png", upsert: false });
  if (up.error) return NextResponse.json({ ok: false, error: "업로드 실패" }, { status: 500 });
  const ins = await sb.from("postcards").insert({
    user_id: user.id, location_id: locationId, template: String(fd?.get("template") ?? "classic").slice(0, 20),
    image_path: path, message: String(fd?.get("message") ?? "").slice(0, 40),
    uses_user_photo: usesPhoto, photo_consent: consent, is_public: fd?.get("is_public") === "true",
  }).select("id").single();
  if (ins.error) { await sb.storage.from(BUCKET).remove([path]); return NextResponse.json({ ok: false, error: "저장 실패" }, { status: 500 }); }
  return NextResponse.json({ ok: true, id: ins.data.id });
}

export async function PATCH(req: Request) {
  const user = await getUser();
  if (!user) return NextResponse.json({ ok: false }, { status: 401 });
  const id = new URL(req.url).searchParams.get("id");
  const body = (await req.json().catch(() => ({}))) as { is_public?: boolean };
  if (!id || typeof body.is_public !== "boolean") return NextResponse.json({ ok: false }, { status: 400 });
  const { error } = await getServiceSupabase().from("postcards").update({ is_public: body.is_public }).eq("id", id).eq("user_id", user.id);
  return NextResponse.json({ ok: !error });
}

export async function DELETE(req: Request) {
  const user = await getUser();
  if (!user) return NextResponse.json({ ok: false }, { status: 401 });
  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ ok: false }, { status: 400 });
  const sb = getServiceSupabase();
  const { data } = await sb.from("postcards").select("image_path").eq("id", id).eq("user_id", user.id).maybeSingle();
  if (!data) return NextResponse.json({ ok: false }, { status: 404 });
  await sb.storage.from(BUCKET).remove([data.image_path]);
  await sb.from("postcards").delete().eq("id", id).eq("user_id", user.id);
  return NextResponse.json({ ok: true });
}
