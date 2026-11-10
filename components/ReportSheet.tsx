"use client";
// 오류 신고 · 의견 보내기: 이름·연락처 없이 내용만 보내요.
import { useState } from "react";
import { Sheet } from "./ui";
import { useGame } from "@/lib/game";

export default function ReportSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { toast } = useGame();
  const [kind, setKind] = useState<"bug" | "idea" | "info">("bug");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const send = async () => {
    setBusy(true);
    const r = await fetch("/api/report", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ kind, message, page: document.referrer ? new URL(document.referrer).pathname : location.pathname }) })
      .then((x) => x.json()).catch(() => ({ ok: false, error: "인터넷 연결을 확인해 주세요" }));
    setBusy(false);
    if (r.ok) { toast("보내 주셔서 고마워요! 빨리 고칠게요", "💌"); setMessage(""); onClose(); } else toast(r.error ?? "보내지 못했어요", "⚠️");
  };
  return (
    <Sheet open={open} onClose={onClose} label="오류 신고">
      <div className="px-4 pb-6">
        <h2 className="font-story text-2xl text-sumi">오류 신고 · 의견 보내기</h2>
        <p className="text-sm text-sumi-light mt-1">이름이나 연락처는 적지 마세요. 내용과 화면 정보만 보내져요.</p>
        <div className="flex gap-2 mt-3">
          {([["bug", "오류"], ["info", "정보가 달라요"], ["idea", "제안"]] as const).map(([k, l]) => (
            <button key={k} className={`chip ${kind === k ? "bg-vermilion text-white" : "bg-hanji text-sumi"}`} onClick={() => setKind(k)}>{l}</button>
          ))}
        </div>
        <textarea value={message} onChange={(e) => setMessage(e.target.value)} maxLength={1000} rows={5} aria-label="내용"
          placeholder={kind === "bug" ? "어떤 화면에서 무엇을 눌렀을 때 문제가 생겼나요?" : kind === "info" ? "어느 장소의 어떤 정보(영업시간·간판·미션 정답 등)가 다른가요?" : "이런 게 있으면 좋겠어요!"}
          className="mt-3 w-full rounded-xl bg-hanji/60 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-vermilion" />
        <button className="btn-primary w-full mt-2" disabled={busy || message.trim().length < 2} onClick={send}>{busy ? "보내는 중…" : "보내기"}</button>
      </div>
    </Sheet>
  );
}
