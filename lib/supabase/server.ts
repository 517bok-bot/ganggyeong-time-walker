import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { SUPABASE_ANON_KEY, SUPABASE_URL, supabaseConfigured } from "./config";

/** 요청 쿠키의 세션으로 동작하는 Supabase 클라이언트 (RLS 적용) */
export async function getServerSupabase() {
  if (!supabaseConfigured()) return null;
  const store = await cookies();
  return createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll: () => store.getAll(),
      setAll: (list) => {
        try { list.forEach(({ name, value, options }) => store.set(name, value, options)); } catch { /* 서버 컴포넌트에서는 무시 (middleware가 갱신) */ }
      },
    },
  });
}

/** 현재 로그인 사용자 (서버에서 Auth 서버로 토큰을 검증) */
export async function getUser() {
  const sb = await getServerSupabase();
  if (!sb) return null;
  const { data } = await sb.auth.getUser();
  return data.user ?? null;
}
