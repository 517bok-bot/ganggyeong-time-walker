import "server-only";
import { supabaseConfigured } from "./supabase/config";
import { getUser } from "./supabase/server";
import { getServiceSupabase } from "./supabase/admin";

export type AdminCtx =
  | { ok: true; mode: "supabase"; userId: string; email: string | null }
  | { ok: true; mode: "dev" } // Supabase 미설정 + 개발 서버: 읽기 전용 미리보기
  | { ok: false; reason: "login" | "forbidden" };

/** 관리자 권한 확인. 모든 관리자 페이지와 서버 액션에서 매번 호출합니다. */
export async function checkAdmin(): Promise<AdminCtx> {
  // Supabase 미연결: 개발 서버 또는 발표·시연용 배포(ADMIN_DEMO=true)에서만 읽기 전용 관리자(QR 인쇄 등) 허용
  if (!supabaseConfigured()) return process.env.NODE_ENV !== "production" || process.env.ADMIN_DEMO === "true" ? { ok: true, mode: "dev" } : { ok: false, reason: "forbidden" };
  const user = await getUser();
  if (!user) return { ok: false, reason: "login" };
  const allow = (process.env.ADMIN_EMAILS ?? "").split(",").map((s) => s.trim().toLowerCase()).filter(Boolean);
  if (user.email && allow.includes(user.email.toLowerCase())) return { ok: true, mode: "supabase", userId: user.id, email: user.email };
  const { data } = await getServiceSupabase().from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (data && (data.role === "admin" || data.role === "editor")) return { ok: true, mode: "supabase", userId: user.id, email: user.email ?? null };
  return { ok: false, reason: "forbidden" };
}

/** 서버 액션용: 쓰기 권한이 없으면 예외 */
export async function requireAdminWrite() {
  const a = await checkAdmin();
  if (!a.ok || a.mode !== "supabase") throw new Error("관리자 권한이 필요합니다 (Supabase 연결 필요)");
  return a;
}
