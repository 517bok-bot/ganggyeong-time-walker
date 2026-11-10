"use client";
// 내 공간: 나의 타임워커, 꾸미기, 친구 초대, 설정만 간단하게.
import { useState } from "react";
import Link from "next/link";
import { Ico } from "@/components/art/Icons";
import { useGame, expToNext } from "@/lib/game";
import { WalkerArt } from "@/components/Characters";
import { HouseEmblem, HOUSE, rankTitle } from "@/components/art/Houses";
import { CHAPTERS } from "@/lib/data/story";
import { useContent } from "@/lib/content";

export default function Me() {
  const { state, rename, reset, mode, user, authConfigured, signOut, loadShowcase } = useGame();
  const { characters, locations } = useContent();
  const p = state.player;
  const [name, setName] = useState(p.name);
  const [editing, setEditing] = useState(false);
  const need = expToNext(p.level);

  const stats = [
    ["stamp", "방문 도장", `${Object.keys(state.visits).length}/${locations.length}`],
    ["paw", "만난 친구", `${Object.keys(state.characters).length}/${characters.length}`],
    ["hourglass", "시간 조각", `${state.sparkTotal ?? 0}`],
    ["scroll", "이야기", `${(state.story ?? []).length}/${CHAPTERS.length}`],
  ] as const;

  return (
    <main className="px-4 pt-[max(20px,env(safe-area-inset-top))]">
      <h1 className="font-story text-[32px] text-sumi pr-12">내 공간</h1>

      <section className="card mt-3 p-4 flex gap-4 items-center">
        <Link href="/wardrobe" className="relative w-28 h-36 shrink-0 rounded-3xl bg-gradient-to-b from-hanji to-hanji-dark/60" aria-label="옷장">
          <span className="absolute inset-1"><WalkerArt avatar={p.avatar} /></span>
          <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 chip-soft !bg-white whitespace-nowrap">꾸미기</span>
        </Link>
        <div className="flex-1 min-w-0">
          {editing ? (
            <div className="flex gap-2">
              <input value={name} onChange={(e) => setName(e.target.value)} maxLength={12} className="flex-1 min-w-0 rounded-xl bg-hanji/70 px-3 py-2 font-game focus:outline-none focus:ring-2 focus:ring-vermilion" aria-label="이름" />
              <button className="btn-primary btn-sm" onClick={async () => { await rename(name, p.avatar); setEditing(false); }}>저장</button>
            </div>
          ) : (
            <button className="font-story text-2xl text-sumi flex items-center gap-1" onClick={() => setEditing(true)} aria-label="이름 바꾸기">{p.name} <Ico name="brush" size={18} /></button>
          )}
          <p className="flex items-center gap-1 text-sm font-game font-bold text-sumi-light mt-1">{p.house && <HouseEmblem id={p.house} size={20} />}{p.house ? `${HOUSE[p.house]?.name}의 ` : ""}{rankTitle(p.level)}</p>
          <div className="mt-2 flex items-center gap-2 text-sm font-game font-bold text-sumi">
            <span className="chip-soft !bg-vermilion !text-white">Lv.{p.level}</span>
            <span className="flex-1 h-2 rounded-full bg-sumi/10 overflow-hidden"><span className="block h-full bg-teal rounded-full" style={{ width: `${(p.exp / need) * 100}%` }} /></span>
          </div>
          <p className="mt-2 flex items-center gap-1 font-game font-bold text-sumi"><Ico name="coin" size={20} />{p.coins} 엽전</p>
        </div>
      </section>

      <section className="grid grid-cols-4 gap-2 mt-3">
        {stats.map(([i, l, n]) => (
          <div key={l} className="card p-2 text-center"><Ico name={i} size={26} className="mx-auto" /><p className="font-game font-bold text-lg text-sumi leading-tight mt-1">{n}</p><p className="text-[11px] text-sumi-light">{l}</p></div>
        ))}
      </section>

      <section className="grid grid-cols-2 gap-2 mt-3">
        <Link href="/wardrobe" className="btn-soft"><Ico name="gat" size={22} />옷장</Link>
        <Link href="/share" className="btn-soft"><Ico name="qr" size={22} />친구 초대 QR</Link>
        <Link href="/postcard" className="btn-gold col-span-2"><Ico name="camera" size={22} />캐릭터 엽서 찍기</Link>
      </section>

      <section className="card p-4 mt-3 text-sm">
        <p className="font-game font-bold text-sumi">기록 저장</p>
        <p className="text-sumi-light mt-1">{mode === "remote" ? (user?.isAnonymous ? "게스트 계정으로 서버에 저장돼요." : `${user?.email} 계정으로 서버에 저장돼요.`) : "이 휴대폰의 브라우저에만 저장돼요. 위치는 인증하는 순간에만 거리 확인에 쓰고 저장하지 않아요."}</p>
        <div className="flex flex-wrap gap-2 mt-3">
          {authConfigured && (mode === "remote" ? <button className="btn-soft btn-sm" onClick={signOut}>로그아웃</button> : <Link href="/login" className="btn-soft btn-sm">로그인하고 이어하기</Link>)}
          {mode === "local" && <button className="btn-soft btn-sm" onClick={() => { if (confirm("발표용 샘플 기록으로 바꿀까요? 지금 기록은 덮어써져요.")) loadShowcase(); }}>발표용 샘플 기록</button>}
          <button className="btn-soft btn-sm" onClick={() => { if (confirm("모든 게임 기록을 초기화할까요? 되돌릴 수 없어요.")) { reset(); try { localStorage.removeItem("gtw-intro-seen"); localStorage.removeItem("gtw-pos"); } catch { /* ignore */ } } }}>처음부터 다시</button>
          {mode === "remote" && (
            <button className="btn-soft btn-sm !text-vermilion" onClick={async () => {
              if (!confirm("회원 탈퇴할까요? 계정과 게임 기록이 모두 영구 삭제돼요.")) return;
              const r = await fetch("/api/account", { method: "DELETE" });
              if (r.ok) { await signOut(); window.location.href = "/"; } else alert("탈퇴 처리에 실패했어요. 잠시 후 다시 시도해 주세요.");
            }}>회원 탈퇴</button>
          )}
        </div>
      </section>
    </main>
  );
}
