"use client";
import { useState } from "react";
import { Ico } from "@/components/art/Icons";
import Link from "next/link";
import { useGame, expToNext } from "@/lib/game";
import { AVATARS, CharacterArt, WalkerArt } from "@/components/Characters";
import { PageHeader, DemoBadge } from "@/components/ui";
import { locLabel } from "@/lib/data/locations";
import { useContent } from "@/lib/content";
import { ITEMS, JTYPE, artisanLevel } from "@/lib/data/jeotgal";
import { QUEST } from "@/lib/data/quests";

export default function Me() {
  const { state, rename, reset, mode, user, authConfigured, signOut, loadShowcase } = useGame();
  const { CHAR, LOC } = useContent();
  const p = state.player;
  const [name, setName] = useState(p.name);
  const [editing, setEditing] = useState(false);

  const stats = [
    ["pin", "방문한 장소", Object.keys(state.visits).length],
    ["paw", "만난 캐릭터", Object.keys(state.characters).length],
    ["jar", "만든 젓갈", state.jars.filter((j) => j.status === "done").length],
    ["scroll", "완료 퀘스트", Object.keys(state.quests).length],
    ["person", "만난 NPC", state.npcTalked.length],
    ["star", "업적", Object.keys(state.achievements).length],
  ] as const;

  return (
    <main className="px-3">
      <PageHeader title="내 공간" sub="나만의 강경 여행 앨범" />
      <section className={`paper p-3 mb-3 flex flex-wrap items-center gap-2 text-sm ${mode === "remote" ? "" : "!border-dashed"}`}>
        <span className={`chip ${mode === "remote" ? "bg-sage text-cream" : "bg-wood-dark text-gold"}`}>{mode === "remote" ? "서버 저장" : "이 기기에 저장"}</span>
        <span className="flex-1 text-wood-dark">{mode === "remote" ? (user?.isAnonymous ? "게스트 계정으로 플레이 중" : user?.email) : authConfigured ? "로그인하면 다른 기기에서도 기록을 이어갈 수 있어요" : "이 기기의 브라우저에만 저장돼요"}</span>
        {authConfigured && (mode === "remote" ? <><Link href="/login" className="btn-cream btn-sm !py-1">계정</Link><button className="btn-cream btn-sm !py-1" onClick={signOut}>로그아웃</button></> : <Link href="/login" className="btn-brick btn-sm !py-1">로그인</Link>)}
      </section>
      <section className="paper p-4 flex flex-col sm:flex-row gap-4 items-center">
        <div className="w-28 h-36 anim-idle"><WalkerArt avatar={p.avatar} /></div>
        <div className="flex-1 w-full">
          {editing ? (
            <div className="flex gap-2">
              <input value={name} onChange={(e) => setName(e.target.value)} maxLength={12} className="flex-1 min-w-0 rounded-xl border-2 border-wood bg-cream px-3 py-2 font-game" aria-label="이름" />
              <button className="btn-sage btn-sm" onClick={async () => { await rename(name, p.avatar); setEditing(false); }}>저장</button>
            </div>
          ) : (
            <h2 className="font-story font-bold text-3xl text-wood-dark">{p.name} <button className="text-sm font-game text-sage" onClick={() => setEditing(true)} aria-label="이름 바꾸기"><Ico name="brush" size={20} /></button></h2>
          )}
          <p className="font-game text-brick">{p.title} · 젓갈 장인 Lv.{artisanLevel(state.artisanExp)}</p>
          <p className="font-game text-wood-dark mt-1">Lv.{p.level} · {p.exp}/{expToNext(p.level)} EXP · 엽전 {p.coins}</p>
          <div className="flex gap-2 mt-2">
            {Object.entries(AVATARS).map(([k, a]) => (
              <button key={k} aria-label={`의상: ${a.name}`} title={a.name} onClick={() => rename(p.name, k)}
                className={`w-9 h-9 rounded-full border-4 ${p.avatar === k ? "border-wood-dark scale-110" : "border-cream-dark"}`} style={{ background: a.coat }} />
            ))}
            <span className="text-xs text-wood self-center">의상 변경 · 액세서리는 3단계</span>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-3 gap-2 mt-3">
        <Link href="/wardrobe" className="btn-sage"><Ico name="gat" size={22} />옷장</Link>
        <Link href="/album" className="btn-gold"><Ico name="album" size={22} />여행 앨범</Link>
        <Link href="/picnic" className="btn-brick"><Ico name="basket" size={22} />소풍</Link>
        <Link href="/share" className="btn-cream col-span-3"><Ico name="qr" size={22} />친구 초대 · 휴대폰 접속 QR</Link>
      </section>

      <section className="grid grid-cols-3 gap-2 mt-3">
        {stats.map(([i, l, n]) => (
          <div key={l} className="paper p-3 text-center"><Ico name={i} size={30} className="mx-auto" /><p className="font-game text-2xl text-wood-dark">{n}</p><p className="text-xs text-wood">{l}</p></div>
        ))}
      </section>

      <section className="paper p-4 mt-3">
        <h2 className="title-ribbon !bg-sage">만난 친구들</h2>
        <div className="flex flex-wrap gap-2 mt-3">
          {Object.keys(state.characters).length === 0 && <p className="text-wood">아직 만난 친구가 없어요. <Link href="/explore" className="underline">탐험하러 가기</Link></p>}
          {Object.entries(state.characters).map(([id]) => (
            <div key={id} className="w-20 text-center"><div className="w-16 h-16 mx-auto"><CharacterArt id={id} className="w-full h-full" /></div><p className="text-xs font-game truncate">{CHAR[id]?.name}</p></div>
          ))}
        </div>
      </section>

      <section className="paper p-4 mt-3">
        <h2 className="title-ribbon !bg-wood">가방</h2>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mt-3">
          {Object.entries(state.inventory).filter(([, v]) => v > 0).map(([k, v]) => (
            <div key={k} className="rounded-xl bg-cream border-2 border-wood/30 p-2 text-center" title={ITEMS[k]?.desc}><p className="text-3xl">{ITEMS[k]?.emoji}</p><p className="text-xs font-game">{ITEMS[k]?.name} ×{v}</p></div>
          ))}
        </div>
      </section>

      <section className="paper p-4 mt-3">
        <h2 className="title-ribbon">여행 기록</h2>
        <ol className="mt-3 border-l-4 border-gold pl-4 space-y-2">
          {state.log.length === 0 && <li className="text-wood">여행 기록이 아직 없어요.</li>}
          {state.log.slice(0, 20).map((l, i) => (
            <li key={i} className="relative text-sm"><span className="absolute -left-[26px] top-1 w-3 h-3 rounded-full bg-brick border-2 border-cream" />
              <span className="text-wood text-xs">{new Date(l.at).toLocaleString("ko-KR")}</span><br />{l.text}</li>
          ))}
        </ol>
      </section>

      <section className="paper p-4 mt-3">
        <div className="flex items-center gap-2 flex-wrap"><h2 className="title-ribbon !bg-brick">기념 엽서</h2><span className="text-sm text-wood">{state.postcardsMade.length}곳 제작</span></div>
        <p className="text-sm text-wood mt-2">방문 인증한 장소({Object.keys(state.visits).map((id) => locLabel(LOC[id])).slice(0, 3).join(", ") || "없음"})로 빈티지 엽서를 만들 수 있어요.</p>
        <Link href="/postcard" className="btn-gold btn-sm mt-2"><Ico name="postcard" size={20} />엽서 만들기 · 엽서함</Link>
        <p className="text-xs text-wood mt-2">완료 퀘스트: {Object.keys(state.quests).map((id) => QUEST[id]?.title).join(", ") || "없음"} · 젓갈: {state.jars.filter((j) => j.status === "done").map((j) => JTYPE[j.typeId].name).join(", ") || "없음"}</p>
        <p className="text-xs text-wood mt-1"><Link href="/post" className="underline">시간 우체국</Link>에서 미래의 여행자에게 편지를 남길 수 있어요.</p>
      </section>

      <section className="paper p-4 mt-3 text-sm">
        <h2 className="font-game text-lg text-wood-dark">데이터와 개인정보</h2>
        {mode === "remote" ? (
          <p className="text-wood">기록은 Supabase 서버에 저장돼요. 위치는 인증하는 순간에만 서버로 보내 거리 확인에 쓰고 저장하지 않아요. 엽서에 넣은 사진은 동의한 경우에만, 엽서함에 저장할 때만 올라가며 엽서를 지우면 함께 삭제돼요.</p>
        ) : (
          <p className="text-wood">지금은 진행 상황을 <b>이 기기의 브라우저에만</b> 저장해요. 서버로 보내는 개인정보는 없고, 위치는 인증 순간에만 서버로 보내 거리를 계산한 뒤 저장하지 않아요.</p>
        )}
        <div className="flex flex-wrap gap-2 mt-3">
          <button className="btn-cream btn-sm" onClick={() => { if (confirm("모든 게임 기록을 초기화할까요? 되돌릴 수 없어요.")) reset(); }}>게임 기록 초기화</button>
          {mode === "local" && (
            <button className="btn-gold btn-sm" onClick={() => { if (confirm("발표용 샘플 기록으로 바꿀까요? 지금 기록은 덮어써져요.")) loadShowcase(); }}><Ico name="scroll" size={20} />발표용 샘플 기록 불러오기</button>
          )}
          {mode === "remote" && (
            <button className="btn-brick btn-sm" onClick={async () => {
              if (!confirm("회원 탈퇴할까요? 계정, 게임 기록, 저장한 엽서가 모두 영구 삭제돼요.")) return;
              const r = await fetch("/api/account", { method: "DELETE" });
              if (r.ok) { await signOut(); window.location.href = "/"; } else alert("탈퇴 처리에 실패했어요. 잠시 후 다시 시도해 주세요.");
            }}>회원 탈퇴 · 개인정보 삭제</button>
          )}
        </div>
      </section>
    </main>
  );
}
