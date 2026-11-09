import { NextResponse } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { getServerSupabase } from "@/lib/supabase/server";

// 이메일 로그인 링크 처리 (PKCE code 또는 token_hash 방식 모두 지원)
export async function GET(req: Request) {
  const url = new URL(req.url);
  const sb = await getServerSupabase();
  const next = url.searchParams.get("next");
  const dest = next && next.startsWith("/") && !next.startsWith("//") ? next : "/me";
  if (sb) {
    const code = url.searchParams.get("code");
    const tokenHash = url.searchParams.get("token_hash");
    const type = url.searchParams.get("type") as EmailOtpType | null;
    const { error } = code ? await sb.auth.exchangeCodeForSession(code)
      : tokenHash && type ? await sb.auth.verifyOtp({ token_hash: tokenHash, type })
      : { error: new Error("missing code") };
    if (!error) return NextResponse.redirect(new URL(dest, url.origin));
  }
  return NextResponse.redirect(new URL("/login?error=link", url.origin));
}
