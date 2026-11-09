// 관리자: 장소별 QR 코드 생성 (서버 컴포넌트 — 서명 비밀키는 서버에서만 사용)
import { headers } from "next/headers";
import QRCode from "qrcode";
import { LOCATIONS, locLabel } from "@/lib/data/locations";
import { signLocation } from "@/lib/qr";
import AdminGate from "../AdminGate";

export const dynamic = "force-dynamic";

export default function AdminQr() {
  return <AdminGate title="장소 QR 코드">{() => <QrList />}</AdminGate>;
}

async function QrList() {
  const h = await headers();
  const proto = h.get("x-forwarded-proto") ?? "http";
  const origin = `${proto}://${h.get("host")}`;
  const codes = await Promise.all(LOCATIONS.map(async (l) => {
    const payload = signLocation(l.id);
    const url = `${origin}/explore?qr=${payload}`;
    const svg = await QRCode.toString(url, { type: "svg", margin: 1, color: { dark: "#3A2E25", light: "#FAF4E8" } });
    return { l, payload, svg };
  }));
  return (
    <div>
      <header className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <p className="text-sm text-wood">각 QR은 <code>{origin}/explore?qr=…</code> 주소를 담고 있어요. 휴대폰 기본 카메라로 찍어도 인증 화면이 열립니다. 서명은 서버의 QR_SECRET으로 만들어져 위조할 수 없어요.</p>
          <p className="text-xs text-wood mt-1">인쇄 후 장소에 부착하세요. QR_SECRET 을 바꾸면 기존 QR은 모두 무효가 됩니다.</p>
        </div>
      </header>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mt-4">
        {codes.map(({ l, payload, svg }) => (
          <div key={l.id} className="paper p-3 text-center break-inside-avoid">
            <p className="font-game text-wood-dark">{l.no}. {locLabel(l)}</p>
            <div className="w-full aspect-square mt-2" dangerouslySetInnerHTML={{ __html: svg }} />
            <p className="text-[10px] font-mono break-all text-wood mt-1">{payload}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
