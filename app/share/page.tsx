"use client";
// 함께 플레이: 지금 이 주소를 QR로 띄워 휴대폰으로 접속하게 합니다.
import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { PageHeader } from "@/components/ui";
import { Ico } from "@/components/art/Icons";

export default function Share() {
  const [url, setUrl] = useState("");
  const [svg, setSvg] = useState("");
  const [local, setLocal] = useState(false);
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    const origin = window.location.origin;
    const isLocal = /localhost|127\.0\.0\.1/.test(window.location.hostname);
    setLocal(isLocal); setUrl(origin);
    QRCode.toString(origin, { type: "svg", margin: 1, color: { dark: "#39332F", light: "#F2E7D0" } }).then(setSvg);
  }, []);
  const secure = url.startsWith("https://");

  return (
    <main className="px-3">
      <PageHeader title="함께 플레이" seal="초대" sub="휴대폰 카메라로 QR을 찍으면 바로 강경 타임워커가 열려요" />
      <section className="silk-frame mx-auto max-w-sm"><div className="paper p-5 text-center">
        <p className="font-story text-2xl text-sumi">시간 학당 초대장</p>
        {local ? (
          <div className="mt-3 text-sm text-sumi text-left space-y-2">
            <p className="font-game font-bold text-vermilion">지금은 ‘localhost’ 주소라 다른 휴대폰에서 열 수 없어요.</p>
            <p>실행 창에 보이는 <b>http://192.168…:3000/share</b> 주소로 이 화면을 다시 열어 주세요. (실행하기 파일이 자동으로 알려줘요)</p>
          </div>
        ) : (
          <>
            {svg && <div className="mx-auto mt-3 w-64 h-64 border-2 border-sumi bg-hanji-light p-2" dangerouslySetInnerHTML={{ __html: svg }} />}
            <p className="mt-3 font-game font-bold text-sumi break-all">{url}</p>
            <button className="btn-cream btn-sm mt-2" onClick={() => { navigator.clipboard?.writeText(url); setCopied(true); }}>{copied ? "복사했어요" : "주소 복사"}</button>
          </>
        )}
      </div></section>

      <section className="paper p-4 mt-5 text-sm text-sumi space-y-2 max-w-2xl mx-auto">
        <h2 className="font-story text-xl">휴대폰에서 앱처럼 쓰기</h2>
        <p className="flex gap-2"><Ico name="pin" size={20} /><span><b>아이폰(사파리)</b>: 공유 버튼 → ‘홈 화면에 추가’</span></p>
        <p className="flex gap-2"><Ico name="pin" size={20} /><span><b>안드로이드(크롬)</b>: 메뉴(⋮) → ‘홈 화면에 추가’ 또는 ‘앱 설치’</span></p>
        <p className="flex gap-2"><Ico name="compass" size={20} /><span>{secure
          ? "https 주소라 GPS 위치 인증과 카메라 QR 스캔이 모두 동작해요."
          : "같은 와이파이(http) 주소에서는 휴대폰 보안 정책 때문에 GPS 위치 인증과 앱 안 카메라 스캔이 막혀요. 장소 QR은 휴대폰 기본 카메라로 찍으면 그대로 인증되고, 현장 도착 시뮬레이션도 쓸 수 있어요. GPS까지 쓰려면 Vercel(https)로 배포하세요."}</span></p>
        <p className="flex gap-2"><Ico name="pouch" size={20} /><span>지금 버전은 각자 휴대폰에 기록이 저장돼요(로컬 모드). 기록을 서버에 모으려면 README의 ‘Supabase 연결’을 따라 주세요.</span></p>
      </section>
    </main>
  );
}
