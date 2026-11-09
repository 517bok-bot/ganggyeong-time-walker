"use client";
// 3단계: 나만의 강경 여행 앨범 — 게임 기록으로 자동 완성되는 스크랩북
import { useState } from "react";
import { Ico } from "@/components/art/Icons";
import Link from "next/link";
import { useGame } from "@/lib/game";
import { useContent } from "@/lib/content";
import { JTYPE, GRADES } from "@/lib/data/jeotgal";
import { CharacterArt, WalkerArt } from "@/components/Characters";
import { Building } from "@/components/Building";
import { JarArt } from "@/components/Jar";
import { PageHeader, Stars } from "@/components/ui";
import { sfx } from "@/lib/audio";

const STYLES = ["western", "shop", "brick", "hanok", "tower"] as const;
const d = (t: number) => new Date(t).toLocaleDateString("ko-KR", { month: "long", day: "numeric" });
const tilt = (i: number) => [-3, 2, -1.5, 3, -2, 1][i % 6];

export default function Album() {
  const { state } = useGame();
  const { LOC, CHAR } = useContent();
  const [page, setPage] = useState(0);
  const visits = Object.entries(state.visits).sort((a, b) => a[1].at - b[1].at);
  const chars = Object.entries(state.characters).sort((a, b) => a[1].at - b[1].at);
  const jars = state.jars.filter((j) => j.status === "done");
  const badges = Object.entries(state.achievements);
  const first = Math.min(...[...visits.map((v) => v[1].at), ...state.log.map((l) => l.at), Date.now()]);

  const PAGES: { title: string; body: React.ReactNode }[] = [
    {
      title: "표지",
      body: (
        <div className="text-center py-4">
          <p className="font-game text-sage tracking-[0.3em] text-xs">GANGGYEONG TRAVEL ALBUM</p>
          <h2 className="font-story font-bold text-3xl text-wood-dark mt-1">{state.player.name}의<br />강경 여행 앨범</h2>
          <div className="flex justify-center items-end gap-1 mt-4 h-40">
            <div className="w-28 h-36 anim-idle"><WalkerArt avatar={state.player.avatar} /></div>
            {state.companion && <div className="w-16 h-20 anim-jump"><CharacterArt id={state.companion} mood="happy" className="w-full h-full" /></div>}
          </div>
          <p className="font-game text-wood mt-3">{d(first)}부터 · Lv.{state.player.level}</p>
          <div className="flex justify-center gap-4 mt-3 font-game text-wood-dark">
            <span className="flex items-center gap-1"><Ico name="pin" size={20} />{visits.length}곳</span><span className="flex items-center gap-1"><Ico name="paw" size={20} />{chars.length}인연</span><span className="flex items-center gap-1"><Ico name="jar" size={20} />{jars.length}항아리</span><span className="flex items-center gap-1"><Ico name="postcard" size={20} />{state.postcardsMade.length}엽서</span>
          </div>
        </div>
      ),
    },
    {
      title: "발자취",
      body: visits.length === 0 ? <Empty text="방문 인증한 장소가 여기에 사진처럼 붙어요" href="/explore" cta="탐험하러 가기" /> : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 p-2">
          {visits.map(([id, v], i) => {
            const l = LOC[id];
            return (
              <div key={id} className="bg-hanji-light p-2 pb-3 shadow-card border border-sumi/30 anim-pop" style={{ transform: `rotate(${tilt(i)}deg)`, animationDelay: `${i * 60}ms` }}>
                {l?.photoUrl
                  // eslint-disable-next-line @next/next/no-img-element
                  ? <img src={l.photoUrl} alt="" className="w-full aspect-[4/3] object-cover" />
                  : <svg viewBox="0 0 160 120" className="w-full bg-gold/40"><Building x={25} y={20} w={110} h={90} style={STYLES[i % STYLES.length]} /><rect y={108} width={160} height={12} fill="#D6C29C" /></svg>}
                <p className="font-game text-sm text-wood-dark mt-1 truncate">{l?.name}</p>
                <div className="flex justify-between items-center"><span className="text-[11px] text-wood">{d(v.at)}</span>
                  <span className="text-[10px] font-game border-2 border-brick text-brick rounded-full px-1.5 rotate-[-8deg]">{v.method.toUpperCase()}</span></div>
              </div>
            );
          })}
        </div>
      ),
    },
    {
      title: "만난 친구들",
      body: chars.length === 0 ? <Empty text="만난 캐릭터가 스티커로 붙어요" href="/village" cta="친구 찾으러 가기" /> : (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 p-2">
          {chars.map(([id, c], i) => (
            <div key={id} className="text-center anim-pop" style={{ animationDelay: `${i * 70}ms` }}>
              <div className="mx-auto w-20 h-20 rounded-full bg-hanji-light border-2 border-sumi p-1 shadow-card" style={{ transform: `rotate(${tilt(i) * 2}deg)` }}>
                <CharacterArt id={id} mood="happy" className="w-full h-full" />
              </div>
              <p className="font-game text-sm text-wood-dark mt-1">{CHAR[id]?.name}</p>
              <p className="text-[10px] text-wood leading-tight">{c.place}<br />{d(c.at)} · {c.method === "online" ? "온라인" : "현장"}</p>
            </div>
          ))}
        </div>
      ),
    },
    {
      title: "젓갈 공방 일지",
      body: jars.length === 0 ? <Empty text="완성한 젓갈 항아리가 기록돼요" href="/jeotgal" cta="공방 가기" /> : (
        <div className="space-y-2 p-2">
          {jars.map((j, i) => {
            const t = JTYPE[j.typeId]; const g = GRADES.find((x) => x.name === j.grade);
            return (
              <div key={j.id} className="flex items-center gap-3 bg-hanji-light/80 border border-sumi/30 p-2 anim-rise" style={{ animationDelay: `${i * 60}ms` }}>
                <div className="w-12 h-14 shrink-0"><JarArt fill={0.85} color={t.color} face="happy" /></div>
                <div className="flex-1 text-sm"><p className="font-game text-wood-dark">{j.grade} · {t.name} <Stars n={g?.stars ?? 1} /></p>
                  <p className="text-xs text-wood">{d(j.startedAt)} 담금 · 소금 {j.ratio}% · {j.score}점</p></div>
              </div>
            );
          })}
        </div>
      ),
    },
    {
      title: "엽서와 배지",
      body: (
        <div className="p-2">
          <p className="font-game text-wood-dark">엽서를 만든 곳</p>
          <div className="flex flex-wrap gap-2 mt-1">{state.postcardsMade.length ? state.postcardsMade.map((id) => <span key={id} className="chip bg-gold/50 text-wood-dark !text-sm">{LOC[id]?.name}</span>) : <span className="text-sm text-wood">아직 없어요 · <Link href="/postcard" className="underline">엽서 만들기</Link></span>}</div>
          <p className="font-game text-wood-dark mt-4">배지</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-1">
            {badges.length ? badges.map(([k, at]) => (
              <div key={k} className="rounded-full bg-gold/40 border-4 border-gold-dark aspect-square grid place-items-center text-center p-2 anim-pop max-w-[120px] mx-auto">
                <div><Ico name="star" size={28} className="mx-auto" /><p className="font-game text-xs text-wood-dark leading-tight">{k === "cat-family" ? "고양이 가족 완성" : k.replace("badge:", "")}</p><p className="text-[9px] text-wood">{d(at)}</p></div>
              </div>
            )) : <span className="text-sm text-wood">퀘스트를 완료하면 배지가 붙어요</span>}
          </div>
        </div>
      ),
    },
    {
      title: "여행 일지",
      body: state.log.length === 0 ? <Empty text="여행하면서 생긴 일이 일기처럼 쌓여요" href="/" cta="여행 시작" /> : (
        <ol className="border-l-4 border-gold pl-4 space-y-2 m-2">
          {[...state.log].reverse().slice(-30).map((l, i) => (
            <li key={i} className="relative text-sm"><span className="absolute -left-[26px] top-1 w-3 h-3 rounded-full bg-brick border-2 border-cream" />
              <span className="text-wood text-xs font-game">{new Date(l.at).toLocaleString("ko-KR", { month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" })}</span> {l.text}</li>
          ))}
        </ol>
      ),
    },
  ];
  const go = (n: number) => { if (n < 0 || n >= PAGES.length) return; sfx.page(); setPage(n); };

  return (
    <main className="px-3">
      <PageHeader title="여행 화첩" seal="화첩" sub="걸은 만큼 채워지는 나만의 강경 화첩" right={<Link href="/wardrobe" className="btn-cream btn-sm"><Ico name="gat" size={20} />옷장</Link>} />
      <div className="flex gap-1 overflow-x-auto no-scrollbar pb-1">
        {PAGES.map((p, i) => <button key={p.title} data-nosfx onClick={() => go(i)} className={`chip !text-sm shrink-0 ${i === page ? "bg-brick text-cream" : "bg-cream-dark text-wood-dark"}`}>{i + 1}. {p.title}</button>)}
      </div>
      <section key={page} className="paper mt-2 p-4 min-h-[460px] relative anim-flip" >
        <div className="absolute inset-y-0 left-0 w-3 bg-gradient-to-r from-wood/20 to-transparent rounded-l-2xl" />
        <h2 className="title-ribbon">{PAGES[page].title}</h2>
        <div className="mt-3">{PAGES[page].body}</div>
        <p className="absolute bottom-2 right-4 font-game text-wood/60 text-sm">- {page + 1} -</p>
      </section>
      <div className="flex gap-2 mt-3">
        <button data-nosfx className="btn-cream flex-1" disabled={page === 0} onClick={() => go(page - 1)}>◀ 이전 장</button>
        <button data-nosfx className="btn-sage flex-1" disabled={page === PAGES.length - 1} onClick={() => go(page + 1)}>다음 장 ▶</button>
      </div>
    </main>
  );
}

function Empty({ text, href, cta }: { text: string; href: string; cta: string }) {
  return <div className="text-center py-12 text-wood"><Ico name="album" size={48} className="mx-auto" /><p className="mt-2">{text}</p><Link href={href} className="btn-gold btn-sm mt-3">{cta}</Link></div>;
}
