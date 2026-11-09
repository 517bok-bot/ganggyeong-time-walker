"use client";
// 첫 장: 표구된 큰 그림 한 폭 + 붉은 인장 시작 버튼 + 두루마리·방(榜)·수배 전단
import Link from "next/link";
import { useState } from "react";
import { useGame } from "@/lib/game";
import HeroPainting from "@/components/art/HeroPainting";
import { MeanderBand, CloudCorner, Fireflies } from "@/components/art/Ornaments";
import { CharacterArt, AVATARS, WalkerArt } from "@/components/Characters";
import { Hud, DemoBadge, Modal } from "@/components/ui";
import { Ico } from "@/components/art/Icons";
import { QUEST, dailyQuestIds, questProgress } from "@/lib/data/quests";
import { CAT_FAMILY } from "@/lib/data/characters";
import { useContent } from "@/lib/content";
import { sfx } from "@/lib/sfx";
import { Scroll } from "@/components/art/Scroll";
import { HOUSES, HouseEmblem } from "@/components/art/Houses";
import { Envelope, Magpie } from "@/components/art/Post";

export default function Home() {
  const { state, rename } = useGame();
  const { characters: CHARACTERS } = useContent();
  const [prologue, setPrologue] = useState(false);
  const [page, setPage] = useState(0);
  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState("sage");
  const daily = dailyQuestIds();
  const found = Object.keys(state.characters).length;

  const [house, setHouse] = useState("cheongryong");
  const PROLOGUE = [
    "어느 달 밝은 밤, 까치 한 마리가 붉은 인장이 찍힌 편지를 물고 창가에 내려앉았습니다.",
    "‘그대의 강경 시간 학당(時間學堂) 입학을 허가합니다. 금강 달빛이 가장 밝은 밤, 근대거리로 오시오.’",
    "학당의 첫 숙제는 거리 안내도에 붙은 ‘특별수배’. 수상한(?) 고양이 세 마리, 강이·갱이·콩이를 찾는 일입니다.",
  ];

  return (
    <main className="px-3">
      {/* ── 한 폭의 동양화가 곧 첫 화면 ── */}
      <section className="relative left-1/2 -translate-x-1/2 w-screen h-[100svh] min-h-[560px] overflow-hidden bg-teal-dark -mt-0">
        <HeroPainting />
        <Fireflies count={22} />
        {/* 상단: 문양 띠 + 학당 현판 로고 */}
        <div className="absolute top-0 inset-x-0">
          <MeanderBand />
          <div className="flex justify-center sm:justify-start pt-4 px-4 sm:pl-12">
            <div className="relative px-7 sm:px-10 pt-3 pb-3 text-center border-2 border-antique bg-teal/85 backdrop-blur-[1px] shadow-card"
              style={{ backgroundImage: "var(--woodgrain)" }}>
              <CloudCorner className="absolute -left-2 -top-2 w-7 h-7" /><CloudCorner flip className="absolute -right-2 -top-2 w-7 h-7" />
              <p className="font-game font-bold text-[11px] sm:text-xs tracking-[.4em] text-antique-light">時間學堂 · 강경 시간 학당</p>
              <h1 className="font-story text-hanji-light text-[42px] sm:text-6xl leading-none mt-1 anim-ink">
                강경 <span className="gold-leaf">타임워커</span>
              </h1>
              <p className="font-game font-bold text-hanji/90 text-xs sm:text-sm mt-1.5 tracking-widest">시간을 걷는 곳, 강경으로</p>
              <span className="absolute -right-5 -bottom-5 seal w-11 h-11 text-xs rotate-[8deg] anim-stamp" style={{ animationDelay: ".5s" }}>강경</span>
            </div>
          </div>
        </div>
        {/* 하단: 붉은 인장 '시간 여행 시작' */}
        <div className="absolute inset-x-0 bottom-[100px] sm:bottom-[132px] flex items-end justify-center sm:justify-end gap-3 sm:gap-5 px-3 sm:pr-14">
          <Link href="/explore" className="btn-cream flex-col !gap-1 w-24 sm:w-32 !py-2.5 text-sm opacity-95"><Ico name="pin" size={28} />실제 강경 탐험</Link>
          <button onClick={() => { sfx.fanfare(); setPage(0); setPrologue(true); }} aria-label="시간 여행 시작"
            className="relative w-28 h-32 sm:w-36 sm:h-40 grid place-items-center text-hanji-light font-story text-[24px] sm:text-[30px] leading-[1.15] active:scale-95 transition-transform"
            style={{ background: "#963F38", borderRadius: 6, filter: "url(#seal-rough)", animation: "seal-glow 3.2s ease-in-out infinite" }}>
            <span className="text-center">시간<br />여행<br />시작</span>
          </button>
          <Link href="/village" className="btn-cream flex-col !gap-1 w-24 sm:w-32 !py-2.5 text-sm opacity-95"><Ico name="village" size={28} />온라인 마을</Link>
        </div>
      </section>

      <div className="mt-6"><Hud /></div>

      {/* ── 걸린 표찰 바로가기 ── */}
      <nav className="mt-5 relative" aria-label="바로가기">
        <div className="h-2.5 bg-teal border border-sumi-dark rounded-[2px]" style={{ backgroundImage: "var(--woodgrain)" }} />
        <div className="grid grid-cols-6 gap-1.5 px-1">
          {[["/jeotgal", "jar", "젓갈 공방"], ["/picnic", "basket", "소풍"], ["/wardrobe", "gat", "옷장"], ["/album", "album", "화첩"], ["/postcard", "postcard", "엽서"], ["/post", "letter", "우체국"]].map(([href, icon, label], i) => (
            <Link key={href} href={href} className="relative flex flex-col items-center pt-3 group">
              <span className="absolute top-0 w-0.5 h-3 bg-antique-dark" />
              <span className="flex flex-col items-center w-full bg-hanji-light border border-sumi/50 pt-2 pb-3 group-hover:-rotate-2 transition-transform"
                style={{ backgroundImage: "var(--fiber)", clipPath: "polygon(0 0,100% 0,100% 88%,50% 100%,0 88%)", transform: `rotate(${[-1.5, 1, -0.5, 1.5, -1, 0.8][i]}deg)` }}>
                <Ico name={icon} size={30} />
                <span className="text-[12px] sm:text-sm font-game font-bold text-sumi mt-1 text-center leading-tight">{label}</span>
              </span>
            </Link>
          ))}
        </div>
      </nav>

      <div className="grid md:grid-cols-2 gap-6 mt-7">
        {/* ── 오늘의 여정: 두루마리 ── */}
        <Scroll title="오늘의 여정">
          <ul className="space-y-2.5">
            {daily.map((id) => {
              const q = QUEST[id]; const p = questProgress(q, state);
              return (
                <li key={id}>
                  <Link href="/quests" className="flex items-center gap-3 group">
                    <span className={`seal w-9 h-9 text-xs shrink-0 ${p.claimed ? "" : p.complete ? "!bg-antique" : "!bg-transparent !text-vermilion !shadow-none border border-vermilion"}`}>{p.claimed ? "완" : p.complete ? "상" : `${p.done}/${p.total}`}</span>
                    <span className="flex-1 min-w-0">
                      <span className="block font-game font-bold text-sumi truncate group-hover:text-vermilion">{q.title}</span>
                      <span className="block h-1 mt-1 bg-hanji-dark"><span className="block h-full bg-teal" style={{ width: `${(p.done / p.total) * 100}%` }} /></span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
          <Link href="/quests" className="block text-right text-sm font-game font-bold text-vermilion mt-3">모든 여정 보기 ›</Link>
        </Scroll>

        {/* ── 방(榜): 나무 게시판 ── */}
        <section className="relative p-3 pb-5 border-2 border-sumi-dark rounded-[3px]" style={{ background: "#5A4033", backgroundImage: "var(--woodgrain)" }}>
          <h2 className="font-story text-2xl text-hanji-light text-center">마을 소식 방</h2>
          <div className="mt-3 grid gap-4">
            <Link href="/jeotgal#community" className="relative block bg-hanji-light p-4 pt-5 shadow-card -rotate-1" style={{ backgroundImage: "var(--fiber)" }}>
              <span className="absolute -top-1.5 left-1/2 w-3 h-3 rounded-full bg-antique border border-sumi-dark" />
              <div className="flex gap-3 items-center">
                <Ico name="jar" size={40} />
                <div className="flex-1">
                  <p className="font-game font-bold text-sumi">강경 공동 젓갈 항아리 <DemoBadge>시즌 이벤트</DemoBadge></p>
                  <p className="text-sm text-sumi-light">모두의 재료로 커다란 항아리를 채워요.</p>
                </div>
              </div>
            </Link>
            <div className="relative bg-hanji-light p-4 pt-5 shadow-card rotate-1" style={{ backgroundImage: "var(--fiber)" }}>
              <span className="absolute -top-1.5 left-1/2 w-3 h-3 rounded-full bg-antique border border-sumi-dark" />
              <div className="flex gap-3 items-center">
                <Ico name="lantern" size={40} />
                <div className="flex-1">
                  <p className="font-game font-bold text-sumi">강경젓갈축제 소식</p>
                  <p className="text-sm text-sumi-light">2026년 10월 15~18일 · 강경 금강둔치 일원 (문체부 축제 정보 기준, 매년 일정은 논산시 누리집 확인)</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* ── 특별수배 전단 ── */}
      <section className="relative mt-8 mx-auto max-w-2xl p-5 border-2 border-sumi bg-hanji-light shadow-card" style={{ backgroundImage: "var(--fiber), var(--grain)" }}>
        <div className="absolute inset-2 border border-vermilion/70 pointer-events-none" />
        <div className="flex items-center justify-center gap-3">
          <span className="h-px flex-1 bg-sumi/40" />
          <h2 className="font-story text-4xl text-vermilion tracking-[.2em]">특별수배</h2>
          <span className="h-px flex-1 bg-sumi/40" />
        </div>
        <p className="text-center font-game font-bold text-sumi mt-1">강경근대거리에서 목격된 수상한(?) 고양이 세 마리를 찾습니다</p>
        <div className="flex justify-center gap-4 sm:gap-8 mt-4">
          {CAT_FAMILY.map((id) => {
            const c = CHARACTERS.find((x) => x.id === id)!;
            const got = !!state.characters[id];
            return (
              <Link key={id} href="/dex" className="text-center">
                <span className="relative block w-20 h-20 sm:w-24 sm:h-24 rounded-full border-2 border-sumi" style={{ background: "radial-gradient(circle at 50% 45%, #F2E7D0, #D6C29C)" }}>
                  <CharacterArt id={id} silhouette={!got} className="absolute inset-1.5 anim-idle" />
                  {got && <span className="absolute -right-2 -bottom-1 seal w-9 h-9 text-[11px] rotate-[-8deg]">찾음</span>}
                </span>
                <span className="block font-story text-lg text-sumi mt-1">{got ? c.name : "???"}</span>
                <span className="block text-xs text-sumi-light">{c.role}</span>
              </Link>
            );
          })}
        </div>
        <p className="text-center text-sm text-sumi-light mt-3">단서: 강경모던상회에 가면 고양이 가족을 만날 수 있을지도…? · 인연 {found}/{CHARACTERS.length}</p>
        <div className="flex justify-center gap-3 mt-3 overflow-x-auto no-scrollbar">
          {CHARACTERS.filter((c) => !CAT_FAMILY.includes(c.id)).map((c) => (
            <Link key={c.id} href="/dex" className="shrink-0 w-14 text-center" title={state.characters[c.id] ? c.name : "미발견"}>
              <span className="block w-14 h-14 rounded-full border border-sumi/60 bg-hanji p-1"><CharacterArt id={c.id} silhouette={!state.characters[c.id]} className="w-full h-full" /></span>
            </Link>
          ))}
        </div>
      </section>
      <p className="text-[11px] text-sumi-light/90 mt-4 text-center max-w-2xl mx-auto">강이·갱이·콩이·베리쥬·대추삼형제·스윗포는 논산시 지역 캐릭터이며, 논산시 사업 협의에 따라 사용합니다.</p>

      <Modal open={prologue} onClose={() => setPrologue(false)} label="프롤로그">
        <div className="p-6 text-center">
          {page === PROLOGUE.length ? (
            <>
              <h2 className="font-story text-3xl text-sumi">문(門)을 고르세요</h2>
              <p className="text-sm text-sumi-light mt-1">학당의 네 문은 사신(四神)의 이름을 따랐어요. 고른 문은 명패에 표시돼요.</p>
              <div className="grid grid-cols-2 gap-2 mt-3">
                {HOUSES.map((h) => (
                  <button key={h.id} onClick={() => { sfx.tap(); setHouse(h.id); }} aria-pressed={house === h.id}
                    className={`p-2 border-2 text-left ${house === h.id ? "border-vermilion bg-hanji-light" : "border-sumi/20 bg-hanji"}`}>
                    <div className="flex items-center gap-2"><HouseEmblem id={h.id} size={36} /><div><p className="font-story text-lg leading-none" style={{ color: h.color === "#B58B48" ? "#8A6731" : h.color }}>{h.name}</p><p className="text-[11px] font-game font-bold text-sumi-light">{h.hanja} · {h.virtue}</p></div></div>
                    <p className="text-[11px] text-sumi-light mt-1 leading-snug">{h.desc}</p>
                  </button>
                ))}
              </div>
              <button className="btn-sage w-full mt-4" onClick={() => { sfx.stamp(); setPage(page + 1); }}>이 문으로 입학하기</button>
            </>
          ) : page < PROLOGUE.length ? (
            <>
              <div className="flex justify-center gap-2 h-24">
                {page === 2 ? CAT_FAMILY.map((id) => <div key={id} className="w-20 anim-idle"><CharacterArt id={id} silhouette className="w-full h-full" /></div>)
                  : page === 1 ? <div className="w-40"><Envelope open /></div>
                  : <div className="w-24 anim-idle"><Magpie /></div>}
              </div>
              <p className="font-story text-xl text-sumi mt-4 min-h-[96px] leading-relaxed anim-ink" key={page}>{PROLOGUE[page]}</p>
              <button className="btn-sage w-full mt-4" onClick={() => { sfx.page(); setPage(page + 1); }}>다음 장으로</button>
            </>
          ) : (
            <>
              <h2 className="font-story text-3xl text-sumi">학당 명부에 이름을</h2>
              <div className="flex justify-center items-center gap-2 mt-1"><HouseEmblem id={house} size={26} /><span className="font-game font-bold text-sumi">{HOUSES.find((h) => h.id === house)?.name} · 견습 나그네</span></div>
              <div className="w-24 h-28 mx-auto mt-2 anim-idle"><WalkerArt avatar={avatar} /></div>
              <div className="flex justify-center gap-2 mt-2">
                {Object.entries(AVATARS).map(([k, a]) => (
                  <button key={k} aria-label={a.name} onClick={() => setAvatar(k)}
                    className={`w-10 h-10 rounded-full border-4 ${avatar === k ? "border-vermilion scale-110" : "border-hanji-dark"}`} style={{ background: a.coat }} />
                ))}
              </div>
              <input className="mt-3 w-full border-b-2 border-sumi bg-transparent px-3 py-3 font-story text-xl text-center focus:outline-none focus:border-vermilion" maxLength={12}
                placeholder={state.player.name} value={name} onChange={(e) => setName(e.target.value)} aria-label="이름" />
              <Link href="/explore" className="btn-brick w-full mt-4" onClick={() => { rename(name || state.player.name, avatar, house); setPrologue(false); sfx.fanfare(); }}>입학 인장을 찍고 길을 나서다</Link>
            </>
          )}
        </div>
      </Modal>


    </main>
  );
}
