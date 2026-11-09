import { NextResponse } from "next/server";
import { rateLimit, clientKey } from "@/lib/ratelimit";
import { getLocationsServer } from "@/lib/content-server";
import { checkGps } from "@/lib/geo";

// 로컬 모드용 GPS 확인. 서버 모드에서는 /api/game/action 이 같은 검사를 하고 보상까지 처리합니다.
export async function POST(req: Request) {
  if (!rateLimit(`gps:${clientKey(req)}`, 30)) return NextResponse.json({ ok: false, reason: "요청이 너무 많아요" }, { status: 429 });
  const b = (await req.json().catch(() => null)) as { locationId?: string; lat?: number; lng?: number; accuracy?: number } | null;
  if (!b || typeof b.locationId !== "string") return NextResponse.json({ ok: false, reason: "잘못된 요청" }, { status: 400 });
  const loc = (await getLocationsServer()).find((l) => l.id === b.locationId);
  const r = checkGps(loc, { lat: b.lat, lng: b.lng, accuracy: b.accuracy });
  return NextResponse.json(r.ok ? { ok: true, locationId: b.locationId, distance: r.distance } : r, { status: r.ok ? 200 : 422 });
}
