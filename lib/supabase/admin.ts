import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { SUPABASE_URL } from "./config";

// Service Role 클라이언트: RLS를 우회하므로 서버 코드에서만, 권한 검사 뒤에만 사용합니다.
let admin: SupabaseClient | null = null;
export function getServiceSupabase(): SupabaseClient {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!SUPABASE_URL || !key) throw new Error("SUPABASE_SERVICE_ROLE_KEY 가 설정되지 않았습니다");
  admin ??= createClient(SUPABASE_URL, key, { auth: { persistSession: false, autoRefreshToken: false } });
  return admin;
}
