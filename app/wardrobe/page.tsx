"use client";
import { useState } from "react";
import { Ico } from "@/components/art/Icons";
import Link from "next/link";
import { useGame } from "@/lib/game";
import { useContent } from "@/lib/content";
import { WEARS, type Slot } from "@/lib/data/wardrobe";
import { AVATARS, CharacterArt, WalkerArt } from "@/components/Characters";
import { PageHeader, Hud } from "@/components/ui";

const SLOTS: [Slot, string][] = [["outfit", "의상"], ["hat", "갓·모자"], ["neck", "목"], ["face", "얼굴"], ["prop", "소품"]];

export default function Wardrobe() {
  const { state, act, rename } = useGame();
  const { CHAR } = useContent();
  const [slot, setSlot] = useState<Slot>("outfit");
  const [preview, setPreview] = useState<string | null>(null);
  const eq = state.equipped ?? {};
  const shown = preview ? { ...eq, [WEARS.find((w) => w.id === preview)!.slot]: preview } : eq;
  const companions = Object.keys(state.characters);

  return (
    <main className="px-3">
      <PageHeader title="옷장" seal="의복" sub="엽전으로 옷과 모자, 소품을 모아 꾸며요" />
      <Hud />
      <div className="grid md:grid-cols-[1fr_1.4fr] gap-3 mt-3">
        <section className="paper p-4 text-center">
          <div className="relative mx-auto w-48 h-60 rounded-2xl bg-gradient-to-b from-gold/40 to-cream border-2 border-wood/40 flex items-end justify-center gap-1 pb-3">
            <div className="w-28 h-36 anim-idle"><WalkerArt avatar={state.player.avatar} equipped={shown} /></div>
            {state.companion && <div className="w-14 h-16 anim-jump"><CharacterArt id={state.companion} mood="happy" className="w-full h-full" /></div>}
            {preview && <span className="absolute top-2 left-2 chip bg-brick text-cream">미리보기</span>}
          </div>
          <p className="font-game text-wood-dark mt-2">{state.player.name}</p>
          <div className="flex justify-center gap-2 mt-2">
            {Object.entries(AVATARS).map(([k, a]) => (
              <button key={k} aria-label={`코트: ${a.name}`} title={a.name} onClick={() => rename(state.player.name, k)}
                className={`w-9 h-9 rounded-full border-4 ${state.player.avatar === k ? "border-wood-dark scale-110" : "border-cream-dark"}`} style={{ background: a.coat }} />
            ))}
          </div>
          <div className="mt-4 text-left">
            <p className="font-game text-wood-dark">동행하는 인연</p>
            {companions.length === 0 ? <p className="text-xs text-wood mt-1">캐릭터를 만나면 함께 여행할 수 있어요.</p> : (
              <div className="flex flex-wrap gap-2 mt-1">
                <button onClick={() => act({ type: "companion", charId: null })} className={`chip !text-sm ${!state.companion ? "bg-brick text-cream" : "bg-cream-dark text-wood-dark"}`}>혼자 여행</button>
                {companions.map((id) => (
                  <button key={id} onClick={() => act({ type: "companion", charId: id })}
                    className={`flex items-center gap-1 rounded-full border-2 pr-2 ${state.companion === id ? "border-brick bg-gold/40" : "border-wood/30 bg-cream"}`}>
                    <span className="w-7 h-7"><CharacterArt id={id} className="w-full h-full" /></span><span className="text-xs font-game">{CHAR[id]?.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="paper p-4">
          <div className="flex flex-wrap gap-1.5">
            {SLOTS.map(([k, l]) => <button key={k} onClick={() => { setSlot(k); setPreview(null); }} className={`${slot === k ? "btn-sage" : "btn-cream"} btn-sm !px-2.5 grow`}>{l}</button>)}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-3">
            {WEARS.filter((w) => w.slot === slot).map((w) => {
              const owned = state.wardrobe?.includes(w.id);
              const on = eq[w.slot] === w.id;
              const locked = state.player.level < w.level;
              return (
                <div key={w.id} className={`rounded-xl border-2 p-2 text-center ${on ? "border-brick bg-gold/30" : "border-wood/30 bg-cream"}`}
                  onMouseEnter={() => !owned && setPreview(w.id)} onMouseLeave={() => setPreview(null)}>
                  <div className="w-16 h-20 mx-auto"><WalkerArt avatar={state.player.avatar} equipped={{ hat: w.slot === "hat" ? w.id : "hat-fedora", [w.slot]: w.id }} /></div>
                  <p className="font-game text-wood-dark text-sm">{w.name}</p>
                  <p className="text-[11px] text-wood min-h-[28px]">{w.desc}</p>
                  {owned ? (
                    <button className={`btn-sm btn w-full mt-1 ${on ? "bg-cream-dark text-wood" : "bg-sage text-cream"}`}
                      onClick={() => act({ type: "equip", slot: w.slot, wearId: on ? null : w.id })}>{on ? "벗기" : "착용"}</button>
                  ) : (
                    <div className="mt-1 grid gap-1">
                      <button className="btn-cream btn-sm !py-1 text-xs" onClick={() => setPreview(preview === w.id ? null : w.id)}>입어보기</button>
                      <button className="btn-gold btn-sm !py-1" disabled={locked || state.player.coins < w.price}
                        onClick={() => { setPreview(null); act({ type: "buyWear", wearId: w.id }); }}>
                        {locked ? `Lv.${w.level}부터` : <><Ico name="coin" size={18} />{w.price}</>}
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <p className="text-xs text-wood mt-3">코인은 장소 방문, 퀘스트, 젓갈 완성으로 모을 수 있어요. 모든 아이템은 게임 안에서만 쓰이는 창작 아이템이에요(결제 없음).</p>
        </section>
      </div>
    </main>
  );
}
