// 실제 위치(위도·경도) ↔ 게임 지도 좌표(mapX, mapY) 변환
// ─────────────────────────────────────────────────────────────
// 지도는 안내도 배치를 옮긴 그림이라 실제 지도와 비율·방향이 조금 달라요. 그래서 '닮음 변환'(크기·회전·이동)으로 맞춥니다.
// - 기준점 1곳(옛 한일은행 강경지점 = 강경역사관, 위키백과 좌표 36.16222, 127.01500)과
//   안내도 비율(근대거리↔강경구락부 약 200m)로 추정한 기본값을 씁니다.
// - 현장 보정 화면(/calibrate)에서 2곳 이상을 '여기가 이 장소'로 찍으면 그 점들로 다시 맞춥니다.
// 좌표는 이 기기에만 저장되고 서버로 보내지 않습니다.

export interface LatLng { lat: number; lng: number }
export interface CalibPoint { id: string; mapX: number; mapY: number; lat: number; lng: number }
interface Transform { a: number; b: number; tx: number; ty: number } // map = [a -b; b a]·m + t (m: 기준점 기준 동·북 미터)

const ORIGIN: LatLng = { lat: 36.16222, lng: 127.015 }; // 강경역사관
const BANK_MAP = { x: 925, y: 945 }; // 지도 속 옛 한일은행 위치
const UNITS_PER_M = 3; // 지도 3칸 ≈ 1m (안내도 비율 추정)
const KEY = "gtw-calib-v1";

/** 기준점에서 동쪽·북쪽으로 몇 m */
export function toMeters(p: LatLng, o: LatLng = ORIGIN) {
  const R = 6371000, rad = Math.PI / 180;
  return { e: (p.lng - o.lng) * rad * R * Math.cos(o.lat * rad), n: (p.lat - o.lat) * rad * R };
}

export function loadCalib(): CalibPoint[] {
  try { return JSON.parse(localStorage.getItem(KEY) ?? "[]"); } catch { return []; }
}
export function saveCalib(points: CalibPoint[]) {
  try { localStorage.setItem(KEY, JSON.stringify(points)); } catch { /* ignore */ }
}

/** 기본 변환: 북쪽이 지도 위쪽, 3칸/m */
const DEFAULT_T: Transform = { a: UNITS_PER_M, b: 0, tx: BANK_MAP.x, ty: BANK_MAP.y };

/** 보정 점들로 닮음 변환을 최소제곱으로 구함 (점 2개 이상) */
export function fitTransform(points: CalibPoint[]): Transform {
  if (points.length < 2) {
    if (points.length === 1) { // 한 점: 크기·방향은 기본값, 위치만 맞춤
      const m = toMeters(points[0]);
      return { a: UNITS_PER_M, b: 0, tx: points[0].mapX - UNITS_PER_M * m.e, ty: points[0].mapY + UNITS_PER_M * m.n };
    }
    return DEFAULT_T;
  }
  // 지도 y는 아래로 증가하므로 북(n)을 -y로 둠: src=(e,-n), dst=(x,y)
  const src = points.map((p) => { const m = toMeters(p); return [m.e, -m.n]; });
  const dst = points.map((p) => [p.mapX, p.mapY]);
  const n = points.length;
  const sx = src.reduce((s, p) => s + p[0], 0) / n, sy = src.reduce((s, p) => s + p[1], 0) / n;
  const dx = dst.reduce((s, p) => s + p[0], 0) / n, dy = dst.reduce((s, p) => s + p[1], 0) / n;
  let num1 = 0, num2 = 0, den = 0;
  for (let i = 0; i < n; i++) {
    const u = src[i][0] - sx, v = src[i][1] - sy, X = dst[i][0] - dx, Y = dst[i][1] - dy;
    num1 += u * X + v * Y; num2 += u * Y - v * X; den += u * u + v * v;
  }
  if (den < 1e-6) return DEFAULT_T;
  const a = num1 / den, b = num2 / den;
  return { a, b, tx: dx - (a * sx - b * sy), ty: dy - (b * sx + a * sy) };
}

let cached: { key: string; t: Transform } | null = null;
function current(): Transform {
  const pts = typeof window === "undefined" ? [] : loadCalib();
  const key = JSON.stringify(pts);
  if (cached?.key !== key) cached = { key, t: fitTransform(pts) };
  return cached.t;
}

/** 실제 위치 → 지도 좌표 */
export function latLngToMap(p: LatLng) {
  const t = current(); const m = toMeters(p); const u = m.e, v = -m.n;
  return { x: t.a * u - t.b * v + t.tx, y: t.b * u + t.a * v + t.ty };
}
/** 지도 좌표 1칸이 몇 m 인지 */
export function metersPerUnit() { const t = current(); return 1 / Math.hypot(t.a, t.b); }
/** 실제 이동량(동·북 m) → 지도 이동량 (상대 이동 모드) */
export function metersToMapDelta(de: number, dn: number) {
  const t = current(); const u = de, v = -dn;
  return { dx: t.a * u - t.b * v, dy: t.b * u + t.a * v };
}
/** 강경근대거리 일대 안에 있는지 (지도 범위 ± 여유) */
export function inDistrict(p: LatLng) {
  const m = latLngToMap(p);
  return m.x > 30 && m.x < 1550 && m.y > -160 && m.y < 1340;
}
export function distanceM(a: LatLng, b: LatLng) {
  const m = toMeters(a, b); return Math.hypot(m.e, m.n);
}
