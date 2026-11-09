// 서버 전용: QR 코드 서명/검증 (HMAC-SHA256)
// QR 내용 형식: GTW1.<locationId>.<서명 16자>
// 비밀키(QR_SECRET)는 서버 환경변수로만 존재하며 클라이언트에 노출되지 않습니다.
import "server-only";
import { createHmac, timingSafeEqual } from "crypto";
import { LOC } from "./data/locations";

function secret() {
  const s = process.env.QR_SECRET;
  if (s) return s;
  if (process.env.NODE_ENV === "production") throw new Error("QR_SECRET 환경변수가 필요합니다");
  return "dev-only-insecure-secret";
}

export function signLocation(locId: string) {
  const sig = createHmac("sha256", secret()).update(`loc:${locId}`).digest("hex").slice(0, 16);
  return `GTW1.${locId}.${sig}`;
}

export function verifyQr(payload: string): { ok: true; locationId: string } | { ok: false; reason: string } {
  const raw = payload.trim();
  // QR 안에 URL 형식으로 넣은 경우 (https://…/explore?qr=GTW1...) 도 허용
  const m = raw.match(/GTW1\.([a-z0-9-]+)\.([a-f0-9]{16})/i);
  if (!m) return { ok: false, reason: "강경 타임워커 QR이 아니에요" };
  const [, locId, sig] = m;
  if (!LOC[locId]) return { ok: false, reason: "등록되지 않은 장소예요" };
  const expected = signLocation(locId).split(".")[2];
  const a = Buffer.from(sig.toLowerCase()); const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return { ok: false, reason: "위조되었거나 만료된 QR이에요" };
  return { ok: true, locationId: locId };
}
