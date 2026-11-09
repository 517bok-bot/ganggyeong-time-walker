"use client";
// 첫 장: 3D 미니어처 강경의 달밤 + 시작 단추 하나. 아래에는 오늘 할 일과 만난 친구만.
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import StoryPlayer from "@/components/StoryPlayer";
import { CHAPTER, chapterProgress, currentChapter, CHAPTERS, objectiveLine } from "@/lib/data/story";
import { SPARKS_PER_DAY, dayKeyKST } from "@/lib/data/sparks";
import { useGame } from "@/lib/game";
import { Fireflies } from "@/components/art/Ornaments";
import { CharacterArt, AVATARS, WalkerArt } from "@/components/Characters";
import { Modal } from "@/components/ui";
import { Ico } from "@/components/art/Icons";
import { useContent } from "@/lib/content";
import { sfx } from "@/lib/sfx";
import { HOUSES, HouseEmblem } from "@/components/art/Houses";
import { DISTRICT_INFO } from "@/lib/data/locations";
import { useDaytime, PHASE_LABEL } from "@/lib/daytime";

export default function Home() {
  const { state, rename } = useGame();
  const { characters: CHARACTERS } = useContent();
  const router = useRouter();
  const [step, setStep] = useState<"none" | "story" | "guardian" | "name">("none");
  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState("sage");
  const [house, setHouse] = useState("cheongryong");
  const [today, setToday] = useState("");
  const enrolled = !!state.player.house;
  const cur = currentChapter(state);
  const cp = cur ? chapterProgress(cur, state) : null;
  useEffect(() => { setToday(dayKeyKST(Date.now())); if (new URLSearchParams(window.location.search).get("prologue")) { setStep("story"); window.history.replaceState(null, "", "/"); } }, []);
  const sparksToday = state.sparks?.day === today ? state.sparks.got.length : 0;
  const found = Object.keys(state.characters).length;
  const dt = useDaytime();
  const start = () => { sfx.fanfare(); if (enrolled) router.push("/explore"); else setStep("story"); };

  return (
    <main className="px-4">
      {/* ── 첫 화면 ── */}
      <section className="relative left-1/2 -translate-x-1/2 w-screen h-[100svh] min-h-[560px] overflow-hidden bg-[#1B2B3A]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={`/world/hero-${dt.phase}.webp`} alt={`${PHASE_LABEL[dt.phase]}의 강경근대거리 미니어처와 고양이 가족`} className="absolute inset-0 w-full h-full object-cover" style={{ objectPosition: "50% 70%" }} />
        {dt.t > 0 && <img src={`/world/hero-${dt.next}.webp`} alt="" className="absolute inset-0 w-full h-full object-cover transition-opacity duration-[2000ms]" style={{ objectPosition: "50% 70%", opacity: dt.t }} />}
        <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(15,25,35,.55), transparent 30%, transparent 55%, rgba(15,25,35,.75))" }} />
        {(dt.phase === "night" || dt.phase === "dusk") && <Fireflies count={18} />}
        <div className="absolute top-[max(28px,env(safe-area-inset-top))] inset-x-0 text-center px-6">
          <p className="font-game font-bold text-[12px] tracking-[.35em] text-antique-light">時間行者 · 멈춘 시간의 포구</p>
          <h1 className="font-story text-hanji-light text-[46px] leading-none mt-2 anim-ink" style={{ textShadow: "0 3px 12px rgba(0,0,0,.45)" }}>강경 타임워커</h1>
          <p className="font-game font-bold text-hanji/90 text-sm mt-2">강경근대거리를 걸으며 흩어진 시간을 모아요</p>
          <p className="inline-block mt-2 px-3 py-0.5 rounded-full bg-black/30 text-hanji-light text-[12px] font-game font-bold">지금 강경은 {PHASE_LABEL[dt.phase]} · {dt.clock}</p>
        </div>
        <div className="absolute inset-x-0 bottom-[118px] flex flex-col items-center gap-3 px-6">
          {enrolled && cur && <p className="px-3 py-1 rounded-full bg-black/40 text-hanji-light text-[13px] font-game font-bold backdrop-blur-sm anim-rise">{cur.no} · {cur.title} <span className="text-antique-light">{cp?.done}/{cp?.total}</span></p>}
          <button onClick={start} className="btn-primary min-w-[240px] h-[64px] !text-[24px] font-story tracking-wider" style={{ animation: "glow-pulse 3.2s ease-in-out infinite" }}>
            {enrolled ? "이어서 걷기" : "시간 여행 시작"}
          </button>
        </div>
      </section>

      {/* ── 오늘의 강경 ── */}
      <Link href="/explore" className="card mt-5 block p-4 active:scale-[.99] transition-transform">
        <p className="text-[12px] font-game font-bold text-vermilion">오늘의 강경</p>
        <p className="font-story text-2xl text-sumi mt-0.5">{cur ? `${cur.no} · ${cur.title}` : "강경의 종지기"}</p>
        <div className="flex gap-1 mt-2">{CHAPTERS.map((c) => <span key={c.id} className={`h-1.5 flex-1 rounded-full ${(state.story ?? []).includes(c.id) ? "bg-vermilion" : c.id === cur?.id ? "bg-antique" : "bg-sumi/10"}`} />)}</div>
        <p className="text-sm text-sumi-light mt-2">{cur ? (cp?.complete ? "목표 달성! 지도에서 이야기를 이어 보세요" : objectiveLine(cur, state)) : "모든 장을 마쳤어요. 고마워요, 종지기!"}</p>
        <div className="flex items-center justify-between mt-3">
          <span className="chip-soft">오늘의 시간 조각 {sparksToday}/{SPARKS_PER_DAY}</span>
          <span className="text-sm font-game font-bold text-vermilion">지도로 ›</span>
        </div>
      </Link>

      {/* ── 만난 친구 ── */}
      <Link href="/dex" className="card mt-3 block p-4">
        <div className="flex items-center justify-between"><p className="font-story text-xl text-sumi">만난 친구</p><span className="text-sm font-game text-sumi-light">{found}/{CHARACTERS.length}</span></div>
        <div className="grid grid-cols-4 gap-2 mt-2">
          {CHARACTERS.map((c) => (
            <div key={c.id} className="text-center">
              <div className="aspect-square rounded-2xl bg-hanji/70 p-1"><CharacterArt id={c.id} silhouette={!state.characters[c.id]} className="w-full h-full" /></div>
              <p className="text-[11px] font-game font-bold text-sumi mt-0.5 truncate">{state.characters[c.id] ? c.name.split(" · ")[0] : "???"}</p>
            </div>
          ))}
        </div>
      </Link>

      {/* ── 찾아오는 길 ── */}
      <section className="card mt-3 p-4 text-sm text-sumi-light">
        <p className="font-story text-lg text-sumi flex items-center gap-1"><Ico name="pin" size={20} />강경근대거리</p>
        <p className="mt-1">{DISTRICT_INFO.address}</p>
        <p>현장에서 장소마다 붙은 QR을 찍으면 도장을 받고 숨은 친구를 만나요.</p>
      </section>
      <p className="text-[11px] text-sumi-light/90 mt-4 mb-2 text-center">강이·갱이·콩이·베리쥬·대추삼형제·스윗포는 논산시 지역 캐릭터이며, 논산시 사업 협의에 따라 사용합니다.</p>

      {/* ── 시작 이야기 → 수호 신수 → 이름 ── */}
      <StoryPlayer chapter={step === "story" ? CHAPTER.ch0 : null} part="intro" onDone={() => { setStep("guardian"); sfx.open(); }} />
      <Modal open={step === "guardian" || step === "name"} onClose={() => setStep("none")} label="타임워커 계약">
        <div className="p-5 text-center">
          {step === "guardian" ? (
            <>
              <h2 className="font-story text-3xl text-sumi">수호 신수를 고르세요</h2>
              <p className="text-sm text-sumi-light mt-1">하늘의 네 신수 중 하나가 그림자에 깃들어 여행을 지켜 줘요.</p>
              <div className="grid grid-cols-2 gap-2 mt-3">
                {HOUSES.map((h) => (
                  <button key={h.id} onClick={() => { sfx.tap(); setHouse(h.id); }} aria-pressed={house === h.id}
                    className={`p-2.5 rounded-2xl border-2 text-left transition-all ${house === h.id ? "border-vermilion bg-white shadow-card" : "border-transparent bg-hanji/60"}`}>
                    <div className="flex items-center gap-2"><HouseEmblem id={h.id} size={34} /><div><p className="font-story text-lg leading-none" style={{ color: h.color === "#B58B48" ? "#8A6731" : h.color }}>{h.name}</p><p className="text-[11px] font-game font-bold text-sumi-light">{h.virtue}</p></div></div>
                  </button>
                ))}
              </div>
              <p className="text-[13px] text-sumi-light mt-2 min-h-[40px]">{HOUSES.find((h) => h.id === house)?.desc}</p>
              <button className="btn-primary w-full mt-3" onClick={() => { sfx.stamp(); setStep("name"); }}>이 신수와 함께하기</button>
            </>
          ) : (
            <>
              <h2 className="font-story text-3xl text-sumi">계약 두루마리에 이름을</h2>
              <div className="flex justify-center items-center gap-2 mt-1"><HouseEmblem id={house} size={24} /><span className="font-game font-bold text-sumi">{HOUSES.find((h) => h.id === house)?.name}의 타임워커</span></div>
              <div className="w-28 h-32 mx-auto mt-2 anim-idle"><WalkerArt avatar={avatar} /></div>
              <div className="flex justify-center gap-2 mt-2">
                {Object.entries(AVATARS).map(([k, a]) => (
                  <button key={k} aria-label={a.name} onClick={() => setAvatar(k)}
                    className={`w-10 h-10 rounded-full border-4 transition-transform ${avatar === k ? "border-vermilion scale-110" : "border-white"}`} style={{ background: a.coat }} />
                ))}
              </div>
              <input className="mt-3 w-full rounded-2xl bg-hanji/60 px-4 py-3 font-story text-xl text-center focus:outline-none focus:ring-2 focus:ring-vermilion" maxLength={12}
                placeholder={state.player.name} value={name} onChange={(e) => setName(e.target.value)} aria-label="이름" />
              <button className="btn-primary w-full mt-4" onClick={async () => { await rename(name || state.player.name, avatar, house); setStep("none"); sfx.stamp(); router.push("/explore"); }}>계약의 인장을 찍고 길을 나서다</button>
            </>
          )}
        </div>
      </Modal>
    </main>
  );
}
