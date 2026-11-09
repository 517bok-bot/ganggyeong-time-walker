import "server-only";
// 간단한 메모리 기반 요청 제한 (1단계용). 서버리스/다중 인스턴스 환경에서는
// 2단계에서 Supabase 테이블 또는 Upstash 등 공유 저장소 기반으로 교체합니다.
const hits = new Map<string, { n: number; reset: number }>();
export function rateLimit(key: string, limit = 20, windowMs = 60_000) {
  const now = Date.now();
  const h = hits.get(key);
  if (!h || h.reset < now) { hits.set(key, { n: 1, reset: now + windowMs }); return true; }
  h.n++;
  return h.n <= limit;
}
export function clientKey(req: Request) {
  return req.headers.get("x-forwarded-for")?.split(",")[0].trim() || req.headers.get("x-real-ip") || "local";
}
