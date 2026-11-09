"use client";
import { useEffect, useState } from "react";
import { Ico } from "@/components/art/Icons";
import Link from "next/link";
import { useGame } from "@/lib/game";
import { getBrowserSupabase } from "@/lib/supabase/browser";
import { PageHeader } from "@/components/ui";
import { WalkerArt } from "@/components/Characters";

export default function Login() {
  const { authConfigured, user, mode, signOut, state } = useGame();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const sb = getBrowserSupabase();

  useEffect(() => { if (new URLSearchParams(window.location.search).get("error")) setErr("로그인 링크가 만료되었거나 잘못되었어요. 다시 요청해 주세요."); }, []);

  const redirect = () => `${window.location.origin}/auth/callback`;
  const sendLink = async (e: React.FormEvent) => {
    e.preventDefault(); if (!sb) return;
    setBusy(true); setErr("");
    const { error } = user?.isAnonymous
      ? await sb.auth.updateUser({ email }, { emailRedirectTo: redirect() })      // 게스트 → 이메일 계정으로 전환 (기록 유지)
      : await sb.auth.signInWithOtp({ email, options: { emailRedirectTo: redirect() } });
    setBusy(false);
    if (error) setErr(error.message.includes("rate") ? "잠시 후 다시 시도해 주세요." : `메일을 보내지 못했어요: ${error.message}`);
    else setSent(true);
  };
  const guest = async () => {
    if (!sb) return;
    setBusy(true); setErr("");
    const { error } = await sb.auth.signInAnonymously();
    setBusy(false);
    if (error) setErr("게스트 시작에 실패했어요. (Supabase 대시보드에서 익명 로그인을 켜야 해요)");
  };

  return (
    <main className="px-3">
      <PageHeader title="타임워커 로그인" sub="여행 기록을 서버에 안전하게 보관해요" />
      <section className="paper p-5 max-w-md mx-auto text-center">
        <div className="w-24 h-28 mx-auto anim-idle"><WalkerArt avatar={state.player.avatar} /></div>
        {!authConfigured ? (
          <div className="text-sm text-wood mt-3 space-y-2">
            <p className="font-game text-lg text-wood-dark">지금은 로컬 모드예요</p>
            <p>Supabase가 연결되지 않아 기록이 이 기기의 브라우저에만 저장돼요. 운영자가 환경변수를 설정하면 로그인이 열려요.</p>
            <Link href="/" className="btn-sage mt-2">홈으로</Link>
          </div>
        ) : user ? (
          <div className="mt-3 space-y-2">
            <p className="font-game text-lg text-wood-dark">{user.isAnonymous ? "게스트로 플레이 중" : user.email}</p>
            <p className="text-sm text-wood">{mode === "remote" ? "기록이 서버에 저장되고 있어요." : "서버 연결 확인 중…"}</p>
            {user.isAnonymous && !sent && (
              <form onSubmit={sendLink} className="text-left mt-3">
                <p className="text-sm text-wood-dark">이메일을 연결하면 다른 기기에서도 이어서 할 수 있어요. 기록은 그대로 유지돼요.</p>
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" aria-label="이메일"
                  className="mt-2 w-full rounded-xl border-2 border-wood bg-cream px-3 py-3" />
                <button className="btn-brick w-full mt-2" disabled={busy}><Ico name="letter" size={20} />이메일 연결하기</button>
              </form>
            )}
            {sent && <p className="text-sm text-sage font-game">메일함에서 확인 링크를 눌러 주세요.</p>}
            <div className="flex gap-2 justify-center mt-3">
              <Link href="/me" className="btn-sage btn-sm">내 공간</Link>
              <button className="btn-cream btn-sm" onClick={signOut}>로그아웃</button>
            </div>
          </div>
        ) : sent ? (
          <div className="mt-3">
            <p className="font-game text-lg text-wood-dark">메일을 보냈어요</p>
            <p className="text-sm text-wood">{email} 메일함의 로그인 링크를 눌러 주세요. 링크는 이 기기·브라우저에서 열어야 해요.</p>
          </div>
        ) : (
          <div className="mt-3 text-left">
            <form onSubmit={sendLink}>
              <label className="font-game text-wood-dark">이메일로 로그인 / 가입</label>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" aria-label="이메일"
                className="mt-1 w-full rounded-xl border-2 border-wood bg-cream px-3 py-3" />
              <button className="btn-brick w-full mt-2" disabled={busy}><Ico name="letter" size={20} />로그인 링크 받기</button>
            </form>
            <div className="flex items-center gap-2 my-4 text-xs text-wood"><span className="flex-1 border-t border-wood/30" />또는<span className="flex-1 border-t border-wood/30" /></div>
            <button className="btn-gold w-full" disabled={busy} onClick={guest}><Ico name="pouch" size={20} />나그네(게스트)로 바로 시작</button>
            <p className="text-xs text-wood mt-3">비밀번호 없이 이메일 링크로 로그인해요. 게스트 기록은 나중에 이메일을 연결하면 그대로 이어져요.
              이 기기에서 로그인 없이 쌓은 로컬 기록은 보상 위조를 막기 위해 서버로 옮기지 않아요.</p>
          </div>
        )}
        {err && <p className="text-sm text-brick mt-3">{err}</p>}
      </section>
    </main>
  );
}
