import type { GameLocation } from "./data/locations";

export function haversine(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const R = 6371000, toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat), dLng = toRad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

export const MAX_GPS_ACCURACY_M = 80;

/** GPS 증명 검증 (서버에서 호출) */
export function checkGps(loc: GameLocation | undefined, p: { lat: unknown; lng: unknown; accuracy?: unknown }):
  { ok: true; distance: number } | { ok: false; code: string; reason: string; distance?: number } {
  if (!loc) return { ok: false, code: "unknown", reason: "등록되지 않은 장소" };
  const lat = Number(p.lat), lng = Number(p.lng), acc = Number(p.accuracy ?? 0);
  if (!Number.isFinite(lat) || !Number.isFinite(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180) return { ok: false, code: "bad", reason: "잘못된 좌표" };
  if (!loc.gps) return { ok: false, code: "no_coords", reason: "이 장소는 아직 공식 좌표가 등록되지 않았어요. QR 인증을 이용해 주세요." };
  if (acc > MAX_GPS_ACCURACY_M) return { ok: false, code: "low_accuracy", reason: `GPS 정확도가 낮아요(±${Math.round(acc)}m). QR 인증을 이용해 주세요.` };
  const d = haversine({ lat, lng }, loc.gps);
  if (d > loc.gps.radiusM) return { ok: false, code: "too_far", distance: Math.round(d), reason: `아직 ${Math.round(d)}m 떨어져 있어요` };
  return { ok: true, distance: Math.round(d) };
}
