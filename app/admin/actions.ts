"use server";
// 관리자 서버 액션 — 매 호출마다 권한을 다시 확인합니다.
import { revalidatePath, revalidateTag } from "next/cache";
import { requireAdminWrite } from "@/lib/admin-auth";
import { getServiceSupabase } from "@/lib/supabase/admin";
import { LOCATIONS } from "@/lib/data/locations";
import { CHARACTERS } from "@/lib/data/characters";
import { KNOWLEDGE } from "@/lib/data/knowledge";
import { NPCS } from "@/lib/data/npcs";
import { QUESTS } from "@/lib/data/quests";
import { JEOTGAL_TYPES } from "@/lib/data/jeotgal";

const str = (v: FormDataEntryValue | null, max = 4000) => (typeof v === "string" ? v.trim().slice(0, max) : "");
const numOrNull = (v: FormDataEntryValue | null) => { const s = str(v); if (!s) return null; const n = Number(s); return Number.isFinite(n) ? n : NaN; };
const IMAGE_TYPES: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };

async function uploadImage(file: FormDataEntryValue | null, prefix: string): Promise<string | null> {
  if (!(file instanceof File) || file.size === 0) return null;
  const ext = IMAGE_TYPES[file.type];
  if (!ext) throw new Error("JPG/PNG/WEBP 이미지만 올릴 수 있어요");
  if (file.size > 5 * 1024 * 1024) throw new Error("이미지는 5MB 이하만 가능해요");
  const sb = getServiceSupabase();
  const path = `${prefix}-${Date.now()}.${ext}`;
  const { error } = await sb.storage.from("content").upload(path, await file.arrayBuffer(), { contentType: file.type });
  if (error) throw new Error("업로드 실패: " + error.message);
  return sb.storage.from("content").getPublicUrl(path).data.publicUrl;
}

function done(path: string) { revalidateTag("content"); revalidatePath(path); revalidatePath("/", "layout"); }

/** 코드에 들어 있는 기본 콘텐츠를 DB에 등록 (이미 있는 행은 건드리지 않음) */
export async function seedContent() {
  await requireAdminWrite();
  const sb = getServiceSupabase();
  const opts = { onConflict: "id", ignoreDuplicates: true };
  const results = await Promise.all([
    sb.from("locations").upsert(LOCATIONS.map((l) => ({ id: l.id, map_no: l.no, name: l.name, note: l.note ?? null, zone: l.zone, is_real: l.real })), opts),
    sb.from("characters").upsert(CHARACTERS.map((c) => ({ id: c.id, name: c.name, family: c.family ?? null, role: c.role, quote: c.quote, personality: c.personality, likes: c.likes, story: c.story, rarity: c.rarity })), opts),
    sb.from("knowledge_documents").upsert(KNOWLEDGE.map((k) => ({ id: k.id, title: k.title, body: k.body, caveat: k.caveat ?? null, sources: k.sources, status: k.status })), opts),
    sb.from("npcs").upsert(NPCS.map((n) => ({ id: n.id, name: n.name, title: n.title, location_id: n.locationId ?? null, greeting: n.greeting })), opts),
    sb.from("quests").upsert(QUESTS.map((q) => ({ id: q.id, title: q.title, type: q.type, difficulty: q.difficulty, description: q.desc, reward: q.reward })), opts),
    sb.from("fermentation_recipes").upsert(JEOTGAL_TYPES.map((t) => ({ id: t.id, name: t.name, aging_minutes: t.agingMinutes, unlock_level: t.unlockLevel })), opts),
  ]);
  const err = results.find((r) => r.error)?.error;
  if (err) throw new Error("등록 실패: " + err.message);
  done("/admin");
}

export async function updateLocation(fd: FormData) {
  const a = await requireAdminWrite();
  const id = str(fd.get("id"), 64);
  const base = LOCATIONS.find((l) => l.id === id);
  if (!base) throw new Error("알 수 없는 장소");
  const lat = numOrNull(fd.get("lat")), lng = numOrNull(fd.get("lng")), radius = numOrNull(fd.get("radius_m"));
  if (Number.isNaN(lat) || Number.isNaN(lng) || (lat === null) !== (lng === null)) throw new Error("위도와 경도를 모두 숫자로 입력하거나 둘 다 비워 주세요");
  if (lat !== null && (Math.abs(lat) > 90 || Math.abs(lng!) > 180)) throw new Error("좌표 범위 오류");
  const status = str(fd.get("history_status"), 16);
  const photo = await uploadImage(fd.get("photo"), `locations/${id}`);
  const row: Record<string, unknown> = {
    id, map_no: base.no, name: base.name, note: base.note ?? null, zone: base.zone, is_real: base.real,
    lat, lng, radius_m: radius && !Number.isNaN(radius) ? Math.min(500, Math.max(10, Math.round(radius))) : 40,
    description: str(fd.get("description")) || null, history: str(fd.get("history"), 8000) || null,
    history_status: ["pending", "review", "approved"].includes(status) ? status : "pending",
    updated_by: a.userId, updated_at: new Date().toISOString(),
  };
  if (photo) row.photo_url = photo;
  if (fd.get("remove_photo") === "on") row.photo_url = null;
  const { error } = await getServiceSupabase().from("locations").upsert(row, { onConflict: "id" });
  if (error) throw new Error(error.message);
  done("/admin/locations");
}

export async function updateCharacter(fd: FormData) {
  await requireAdminWrite();
  const id = str(fd.get("id"), 64);
  const base = CHARACTERS.find((c) => c.id === id);
  if (!base) throw new Error("알 수 없는 캐릭터");
  const image = await uploadImage(fd.get("image"), `characters/${id}`);
  const license = str(fd.get("license_status"), 32);
  const row: Record<string, unknown> = {
    id, name: base.name, family: base.family ?? null, role: base.role, rarity: base.rarity,
    quote: str(fd.get("quote"), 200) || null, likes: str(fd.get("likes"), 200) || null, story: str(fd.get("story"), 2000) || null,
    personality: str(fd.get("personality"), 200).split(",").map((s) => s.trim()).filter(Boolean),
    license_status: license === "approved" ? "approved" : "permission_required", updated_at: new Date().toISOString(),
  };
  if (image) row.image_url = image;
  const { error } = await getServiceSupabase().from("characters").upsert(row, { onConflict: "id" });
  if (error) throw new Error(error.message);
  done("/admin/characters");
}

export async function upsertKnowledge(fd: FormData) {
  const a = await requireAdminWrite();
  const id = str(fd.get("id"), 64).toLowerCase().replace(/[^a-z0-9-]/g, "-");
  if (!id) throw new Error("ID가 필요해요");
  const title = str(fd.get("title"), 120), body = str(fd.get("body"), 4000);
  if (!title || !body) throw new Error("제목과 본문은 필수예요");
  const sources = str(fd.get("sources"), 2000).split("\n").map((line) => line.trim()).filter(Boolean).map((line) => {
    const [label, url = ""] = line.split("|").map((s) => s.trim());
    return { label, url: /^https?:\/\//.test(url) ? url : "" };
  });
  const status = str(fd.get("status"), 16);
  const { error } = await getServiceSupabase().from("knowledge_documents").upsert({
    id, title, body, caveat: str(fd.get("caveat"), 500) || null, sources,
    status: ["draft", "review", "approved"].includes(status) ? status : "review", updated_by: a.userId, updated_at: new Date().toISOString(),
  }, { onConflict: "id" });
  if (error) throw new Error(error.message);
  done("/admin/knowledge");
}

/** 시간 우체국 편지 검토: 숨김/복구/삭제 */
export async function moderateLetter(fd: FormData) {
  await requireAdminWrite();
  const id = str(fd.get("id"), 64), op = str(fd.get("op"), 10);
  const sb = getServiceSupabase();
  if (op === "delete") await sb.from("letters").delete().eq("id", id);
  else await sb.from("letters").update({ is_hidden: op === "hide", ...(op === "show" ? { report_count: 0 } : {}) }).eq("id", id);
  if (op === "show") await sb.from("reports").update({ status: "resolved" }).eq("target_table", "letters").eq("target_id", id);
  revalidatePath("/admin/letters");
}
