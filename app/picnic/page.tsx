"use client";
// 소풍 보따리: 장소 방문·온라인 마을의 반짝이는 보따리·퀘스트로 모은 아이템을 금강 둑에 펼쳐요.
import { useState } from "react";
import Link from "next/link";
import { useGame } from "@/lib/game";
import { useContent } from "@/lib/content";
import { PICNIC_ITEMS, PICNIC, LOCATION_PICNIC, VILLAGE_PICNIC_SPOTS, PICNIC_FOOD_NEED } from "@/lib/data/picnic";
import { PageHeader, Hud } from "@/components/ui";
import { Ico } from "@/components/art/Icons";
import { CharacterArt, WalkerArt } from "@/components/Characters";
import { sfx } from "@/lib/sfx";

function PicnicScene({ foods, companion, avatar }: { foods: string[]; companion?: string | null; avatar: string }) {
  return (
    <div className="relative border-2 border-sumi overflow-hidden">
      <svg viewBox="0 0 600 300" className="w-full h-auto block" role="img" aria-label="금강 둑의 소풍 풍경">
        <defs><linearGradient id="pn-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#B9C9B8" /><stop offset="1" stopColor="#F2E7D0" /></linearGradient></defs>
        <rect width="600" height="300" fill="url(#pn-sky)" />
        <circle cx="500" cy="60" r="30" fill="#F6E6B4" />
        <path d="M0 150 L80 100 L150 130 L230 80 L310 125 L400 90 L480 130 L600 100 V190 H0Z" fill="#8E9A90" opacity=".7" />
        <rect y="170" width="600" height="40" fill="#3B5659" /><rect y="170" width="600" height="40" fill="url(#pt-wave)" />
        <path d="M0 205 Q300 195 600 205 V300 H0Z" fill="#9DB07E" /><rect y="205" width="600" height="95" fill="url(#pt-hatch)" opacity=".3" />
        {/* 돗자리 */}
        <path d="M150 250 L200 214 H430 L400 250Z" fill="#D9C08A" stroke="#39332F" strokeWidth="2" />
        {[0, 1, 2, 3, 4].map((i) => <path key={i} d={`M${160 + i * 2} ${244 - i * 7} H${410 - i * 2}`} stroke="#8A6731" strokeWidth="1" />)}
        {/* 바람개비 · 연 */}
        <g transform="translate(470 150)"><path d="M0 0 V70" stroke="#39332F" strokeWidth="2" /><g className="anim-rays" style={{ transformOrigin: "0px 0px", animationDuration: "4s" }}><path d="M0 0 L0 -18 Q10 -14 0 0Z M0 0 L18 0 Q14 10 0 0Z M0 0 L0 18 Q-10 14 0 0Z M0 0 L-18 0 Q-14 -10 0 0Z" fill="#963F38" stroke="#39332F" /></g></g>
        <g transform="translate(110 40) rotate(-12)" className="anim-idle"><rect width="34" height="42" fill="#F2E7D0" stroke="#39332F" strokeWidth="1.6" /><rect width="34" height="6" fill="#963F38" /><circle cx="17" cy="22" r="7" fill="none" stroke="#39332F" /><path d="M17 42 q-30 40 20 90" stroke="#39332F" fill="none" /></g>
      </svg>
      {/* 먹을거리와 인물 (HTML 위에 겹침) */}
      <div className="absolute left-[30%] right-[30%] top-[68%] flex justify-center gap-2">
        {foods.map((f) => <span key={f} className="anim-pop"><Ico name={f} size={30} /></span>)}
        <Ico name="basket" size={30} />
      </div>
      <div className="absolute left-[12%] bottom-[4%] w-[13%]"><WalkerArt avatar={avatar} /></div>
      {companion && <div className="absolute right-[18%] bottom-[6%] w-[12%] aspect-[12/13] anim-jump" style={{ animationDuration: "2.8s" }}><CharacterArt id={companion} mood="happy" className="w-full h-full" /></div>}
    </div>
  );
}

export default function Picnic() {
  const { state, act } = useGame();
  const { locations } = useContent();
  const bag = state.picnic ?? {};
  const [chosen, setChosen] = useState<string[]>([]);
  const foodsOwned = PICNIC_ITEMS.filter((p) => p.kind === "food" && (bag[p.id] ?? 0) > 0);
  const hasGear = (bag.mat ?? 0) > 0 && (bag.basket ?? 0) > 0;
  const today = new Date(Date.now() + 9 * 3600_000).toISOString().slice(0, 10);
  const doneToday = state.lastPicnicDay === today;
  const where = (id: string) => {
    const locs = locations.filter((l) => LOCATION_PICNIC(l.no) === id).map((l) => l.name);
    const spot = VILLAGE_PICNIC_SPOTS.some((s) => s.item === id);
    return [...locs.slice(0, 2), ...(spot ? ["온라인 마을 보따리"] : [])].join(" · ");
  };
  const toggle = (id: string) => setChosen((c) => c.includes(id) ? c.filter((x) => x !== id) : c.length >= 5 ? c : [...c, id]);
  const spread = async () => {
    const r = await act({ type: "picnic", foods: chosen });
    if (r.ok) setChosen([]);
  };

  return (
    <main className="px-3">
      <PageHeader title="소풍 보따리" seal="소풍" sub="강경을 돌며 모은 먹을거리로 금강 둑에 돗자리를 펼쳐요" />
      <Hud />
      <section className="mt-4"><PicnicScene foods={chosen.length ? chosen : foodsOwned.slice(0, 3).map((f) => f.id)} companion={state.companion} avatar={state.player.avatar} /></section>

      <section className="paper p-4 mt-4">
        <h2 className="font-story text-2xl text-sumi">돗자리 펼치기</h2>
        <p className="text-sm text-sumi-light">돗자리와 소풍 바구니, 서로 다른 먹을거리 {PICNIC_FOOD_NEED}가지가 필요해요. 하루에 한 번, 고른 먹을거리를 하나씩 써요.</p>
        <div className="flex flex-wrap gap-2 mt-3">
          {foodsOwned.length === 0 ? <p className="text-sm text-sumi-light">아직 먹을거리가 없어요. <Link href="/explore" className="underline">장소를 방문</Link>하거나 <Link href="/village" className="underline">온라인 마을</Link>의 반짝이는 보따리를 찾아보세요.</p>
            : foodsOwned.map((f) => (
              <button key={f.id} onClick={() => { sfx.tap(); toggle(f.id); }} aria-pressed={chosen.includes(f.id)}
                className={`flex items-center gap-1 px-2 py-1 border-2 font-game font-bold text-sm ${chosen.includes(f.id) ? "border-vermilion bg-hanji-light" : "border-sumi/20 bg-hanji"}`}>
                <Ico name={f.id} size={24} />{f.name} ×{bag[f.id]}
              </button>
            ))}
        </div>
        <div className="flex flex-wrap items-center gap-3 mt-3 text-sm">
          <span className={`flex items-center gap-1 ${(bag.mat ?? 0) > 0 ? "text-sumi" : "text-sumi/40"}`}><Ico name="mat" size={22} />돗자리 {bag.mat ?? 0}</span>
          <span className={`flex items-center gap-1 ${(bag.basket ?? 0) > 0 ? "text-sumi" : "text-sumi/40"}`}><Ico name="basket" size={22} />소풍 바구니 {bag.basket ?? 0}</span>
          <span className="text-sumi-light">고른 먹을거리 {chosen.length}/{PICNIC_FOOD_NEED}</span>
        </div>
        <button className="btn-brick w-full mt-4" disabled={!hasGear || chosen.length < PICNIC_FOOD_NEED || doneToday} onClick={spread}>
          <Ico name="mat" size={22} />{doneToday ? "오늘의 소풍은 끝! 내일 또 만나요" : "금강 둑에 돗자리 펼치기"}
        </button>
        <p className="text-xs text-sumi-light mt-2">지금까지 연 소풍 {state.picnicsHeld ?? 0}번 · 동행 친구가 있으면 함께 소풍을 즐겨요 (<Link href="/wardrobe" className="underline">옷장에서 정하기</Link>)</p>
      </section>

      <section className="paper p-4 mt-4">
        <h2 className="font-story text-2xl text-sumi">보따리 속 물건</h2>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 mt-3">
          {PICNIC_ITEMS.map((p) => {
            const n = bag[p.id] ?? 0;
            return (
              <div key={p.id} className={`text-center border p-2 ${n ? "border-sumi/50 bg-hanji-light" : "border-sumi/15 bg-hanji-dark/40"}`} title={p.desc}>
                <div className={`mx-auto w-11 h-11 ${n ? "" : "silhouette"}`}><Ico name={p.id} size={44} /></div>
                <p className="font-game font-bold text-sm text-sumi mt-1">{n ? p.name : "???"}</p>
                <p className="text-[10px] text-sumi-light leading-tight min-h-[24px]">{n ? `×${n} · ${p.kind === "food" ? "먹을거리" : "소풍 도구"}` : where(p.id)}</p>
              </div>
            );
          })}
        </div>
        <p className="text-xs text-sumi-light mt-3">장소마다 방문 인증할 때 하나씩 보따리에 담겨요. {PICNIC.mat.name}은 1번 웰컴센터에서 얻을 수 있어요.</p>
      </section>
    </main>
  );
}
