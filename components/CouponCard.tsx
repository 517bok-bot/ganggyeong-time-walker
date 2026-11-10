"use client";
// 엽서 무료 인쇄 쿠폰: 현장 도장 5개부터 1회용 번호가 생기고, 강경모던상회 직원이 비밀번호로 '사용 완료'를 눌러요.
import { useEffect, useState } from "react";
import { useGame, realStamps, FREE_PRINT_STAMPS } from "@/lib/game";
import { sfx } from "@/lib/sfx";

export default function CouponCard() {
  const { state, act, ready } = useGame();
  const st = realStamps(state);
  const faint = Object.keys(state.visits).length - st;
  const c = state.coupon;
  const [staff, setStaff] = useState(false);
  const [pin, setPin] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const [left, setLeft] = useState<number | null>(null);

  // 조건이 되면 쿠폰을 자동으로 발급
  useEffect(() => { if (ready && !c && st >= FREE_PRINT_STAMPS) act({ type: "couponIssue" }, { quiet: true }); }, [ready, c, st, act]);
  useEffect(() => {
    fetch("/api/coupon").then((r) => r.json()).then((d) => { if (typeof d.used === "number") setLeft(Math.max(0, d.limit - d.used)); }).catch(() => {});
  }, [c?.usedAt]);

  const redeem = async () => {
    if (!c) return;
    setBusy(true); setMsg("");
    const r = await fetch("/api/coupon", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ code: c.code, pin }) })
      .then((x) => x.json()).catch(() => ({ ok: false, error: "서버에 연결하지 못했어요" }));
    if (r.ok) { await act({ type: "couponUsed", code: c.code }); sfx.success(); setStaff(false); setPin(""); }
    else { sfx.error(); setMsg(r.error ?? "확인에 실패했어요"); }
    setBusy(false);
  };

  if (st < FREE_PRINT_STAMPS || !c) {
    return (
      <p className="text-sumi">현장 도장을 <b>{FREE_PRINT_STAMPS - st}개</b> 더 모으면 강경모던상회에서 <b>실물 엽서로 무료 인쇄</b>할 수 있어요. (지금 {st}/{FREE_PRINT_STAMPS})
        {faint > 0 && <> 집에서 받은 흐린 도장 {faint}개는 강경에 와서 QR을 찍으면 진한 도장이 돼요.</>}</p>
    );
  }
  if (c.usedAt) {
    return (
      <div className="flex items-center gap-3">
        <span className="seal w-16 h-16 text-sm rotate-[-8deg] shrink-0">사용<br />완료</span>
        <div><p className="font-story text-xl text-sumi">엽서 무료 인쇄 완료</p>
          <p className="text-sumi-light text-xs">쿠폰 {c.code} · {new Date(c.usedAt).toLocaleString("ko-KR", { month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" })}</p>
          <p className="text-sumi-light text-xs mt-1">디지털 엽서는 언제든 다시 만들어 저장할 수 있어요.</p></div>
      </div>
    );
  }
  return (
    <div>
      <p className="font-story text-xl text-vermilion">🎟️ 엽서 무료 인쇄 쿠폰</p>
      <p className="text-sumi mt-1">강경모던상회에서 이 화면을 직원에게 보여 주세요. 엽서 사진을 보내면 10×15cm 실물 엽서로 인쇄해 드려요.</p>
      <div className="mt-3 rounded-2xl border-2 border-dashed border-vermilion p-3 text-center bg-white">
        <p className="text-xs text-sumi-light">1회용 쿠폰 번호</p>
        <p className="font-mono text-3xl tracking-[.3em] font-bold text-sumi">{c.code}</p>
        <p className="text-xs text-sumi-light mt-1">{state.player.name} · 현장 도장 {st}개{left !== null ? ` · 남은 수량 ${left}장` : " · 선착순 300명"}</p>
      </div>
      {!staff ? (
        <button className="btn-soft btn-sm w-full mt-2" onClick={() => setStaff(true)}>직원 확인 (상회 직원용)</button>
      ) : (
        <div className="mt-2 flex gap-2">
          <input value={pin} onChange={(e) => setPin(e.target.value)} type="password" inputMode="numeric" placeholder="직원 비밀번호" aria-label="직원 비밀번호"
            className="flex-1 min-w-0 rounded-xl bg-hanji/70 px-3 py-2 font-game focus:outline-none focus:ring-2 focus:ring-vermilion" />
          <button className="btn-primary btn-sm" disabled={busy || !pin} onClick={redeem}>사용 완료</button>
        </div>
      )}
      {msg && <p className="text-xs text-vermilion mt-1">{msg}</p>}
    </div>
  );
}
