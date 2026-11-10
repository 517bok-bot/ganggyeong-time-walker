"use client";
// 앱 내 브라우저 안내: 카카오톡·인스타그램 등 앱 안에서 열면 기록이 다른 곳에 저장되고 카메라·위치가 잘 안 될 수 있어요.
import { useEffect, useState } from "react";

const INAPP = /KAKAOTALK|Instagram|FBAN|FBAV|NAVER\(inapp|Line\/|DaumApps|everytimeApp/i;

export default function InAppNotice() {
  const [show, setShow] = useState<null | "kakao" | "other">(null);
  useEffect(() => {
    const ua = navigator.userAgent;
    if (!INAPP.test(ua)) return;
    try { if (sessionStorage.getItem("gtw-inapp-ok")) return; } catch { /* ignore */ }
    setShow(/KAKAOTALK/i.test(ua) ? "kakao" : "other");
  }, []);
  if (!show) return null;
  const openOut = () => { window.location.href = `kakaotalk://web/openExternal?url=${encodeURIComponent(window.location.href)}`; };
  const close = () => { try { sessionStorage.setItem("gtw-inapp-ok", "1"); } catch { /* ignore */ } setShow(null); };
  return (
    <div className="fixed inset-x-3 top-[max(10px,env(safe-area-inset-top))] z-[80] rounded-2xl bg-sumi text-hanji-light p-3 shadow-card text-sm" role="alert">
      <p className="font-game font-bold">크롬이나 사파리로 열어 주세요</p>
      <p className="mt-1 opacity-90">{show === "kakao" ? "카카오톡 안에서" : "앱 안 브라우저에서"} 열면 도장 기록이 따로 저장되고, 카메라·위치가 잘 안 될 수 있어요.{show === "other" && " 오른쪽 위 ⋯ 메뉴에서 ‘다른 브라우저로 열기’를 눌러 주세요."}</p>
      <div className="flex gap-2 mt-2">
        {show === "kakao" && <button className="btn-primary btn-sm flex-1" onClick={openOut}>기본 브라우저로 열기</button>}
        <button className="btn-soft btn-sm" onClick={close}>여기서 계속</button>
      </div>
    </div>
  );
}
