import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

// Supabase 세션 쿠키 갱신. Supabase 미설정(로컬 모드)이면 아무것도 하지 않습니다.
export async function middleware(req: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL, key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  let res = NextResponse.next({ request: req });
  if (!url || !key) return res;
  const sb = createServerClient(url, key, {
    cookies: {
      getAll: () => req.cookies.getAll(),
      setAll: (list) => {
        list.forEach(({ name, value }) => req.cookies.set(name, value));
        res = NextResponse.next({ request: req });
        list.forEach(({ name, value, options }) => res.cookies.set(name, value, options));
      },
    },
  });
  await sb.auth.getUser();
  return res;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|icon.svg|manifest.webmanifest|.*\\.(?:png|jpg|svg|webp)$).*)"],
};
