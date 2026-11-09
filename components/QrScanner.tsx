"use client";
// QR 인증: 카메라 스캔(BarcodeDetector 지원 브라우저) + 코드 직접 입력. 검증은 서버(/api/qr/verify)에서 합니다.
import { useEffect, useRef, useState } from "react";
import { Ico } from "./art/Icons";
import { Modal } from "./ui";

type Detector = { detect: (src: CanvasImageSource) => Promise<{ rawValue: string }[]> };

export async function verifyQrPayload(payload: string): Promise<{ ok: boolean; locationId?: string; reason?: string }> {
  try {
    const r = await fetch("/api/qr/verify", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ payload }) });
    return await r.json();
  } catch { return { ok: false, reason: "서버에 연결할 수 없어요" }; }
}

export default function QrScanner({ open, onClose, onResult }: { open: boolean; onClose: () => void; onResult: (payload: string) => void }) {
  const video = useRef<HTMLVideoElement>(null);
  const [code, setCode] = useState("");
  const [status, setStatus] = useState<string>("");
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    if (!open) return;
    const BD = (window as unknown as { BarcodeDetector?: new (o: { formats: string[] }) => Detector }).BarcodeDetector;
    setSupported(!!BD && !!navigator.mediaDevices?.getUserMedia);
    if (!BD || !navigator.mediaDevices?.getUserMedia) { setStatus("이 브라우저는 카메라 QR 인식을 지원하지 않아요. 휴대폰 기본 카메라로 QR을 찍거나 아래에 코드를 입력하세요."); return; }
    let stream: MediaStream | null = null; let stop = false;
    const detector = new BD({ formats: ["qr_code"] });
    (async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
        if (!video.current) return;
        video.current.srcObject = stream; await video.current.play();
        setStatus("QR코드를 화면 가운데에 맞춰 주세요");
        const tick = async () => {
          if (stop || !video.current) return;
          try {
            const r = await detector.detect(video.current);
            if (r[0]?.rawValue) { stop = true; onResult(r[0].rawValue); return; }
          } catch { /* 다음 프레임 */ }
          setTimeout(tick, 350);
        };
        tick();
      } catch { setStatus("카메라 권한이 없어요. 코드를 직접 입력해 주세요."); }
    })();
    return () => { stop = true; stream?.getTracks().forEach((t) => t.stop()); };
  }, [open, onResult]);

  return (
    <Modal open={open} onClose={onClose} label="QR 인증">
      <div className="p-4">
        <h2 className="font-story text-2xl text-sumi flex items-center gap-2"><Ico name="qr" size={26} />QR 인증</h2>
        <p className="text-sm text-wood mt-1">장소에 설치된 강경 타임워커 QR을 스캔하세요. QR은 서버에서 서명을 검증해요.</p>
        {supported && (
          <div className="relative mt-3 rounded-xl overflow-hidden border-2 border-wood bg-ink aspect-square">
            <video ref={video} className="w-full h-full object-cover" muted playsInline />
            <div className="absolute inset-[18%] border-4 border-gold rounded-2xl" />
          </div>
        )}
        {status && <p className="text-sm text-wood-dark mt-2">{status}</p>}
        <form className="mt-3 flex gap-2" onSubmit={(e) => { e.preventDefault(); if (code.trim()) onResult(code.trim()); }}>
          <input value={code} onChange={(e) => setCode(e.target.value)} placeholder="GTW1.장소.코드" aria-label="QR 코드"
            className="flex-1 min-w-0 rounded-xl border-2 border-wood bg-cream px-3 py-2 font-mono text-sm" />
          <button className="btn-sage btn-sm">확인</button>
        </form>
        <button className="btn-cream w-full mt-3" onClick={onClose}>닫기</button>
      </div>
    </Modal>
  );
}
