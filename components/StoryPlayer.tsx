"use client";
// 이야기 컷신: 화면 가득 배경 + 인물 초상 + 한지 대사창 (탭하면 다음 대사)
import { useEffect, useMemo, useState } from "react";
import type { Chapter, Line, Speaker } from "@/lib/data/story";
import { SPEAKER_NAME } from "@/lib/data/story";
import { CharacterArt, NpcArt, WalkerArt } from "./Characters";
import { NPC } from "@/lib/data/npcs";
import { useGame } from "@/lib/game";
import { sfx } from "@/lib/sfx";
import { haptic } from "@/lib/fx";
import { Portal } from "./ui";

const CHAR_OF: Partial<Record<Speaker, string>> = { kangi: "kangi", kaengi: "kaengi", kongi: "kongi", berijyu: "berijyu", sweetpo: "sweetpo", daechu: "daechu-1" };

/** 장면 배경: 3D 미니어처 거리를 미리 구운 그림 (scripts/characters3d/scenes.json) */
export function SceneBackdrop({ scene }: { scene: Chapter["scene"]; cleared?: number }) {
  return (
    <div className="absolute inset-0" aria-hidden>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={`/world/scene-${scene}.webp`} alt="" className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(20,30,40,.35), transparent 30%, transparent 55%, rgba(20,30,40,.55))" }} />
      {scene === "fog" && <div className="absolute inset-0 anim-fog" style={{ background: "radial-gradient(ellipse 60% 20% at 30% 60%, rgba(240,240,232,.7), transparent 70%), radial-gradient(ellipse 50% 18% at 75% 75%, rgba(240,240,232,.6), transparent 70%)" }} />}
    </div>
  );
}

function Portrait({ who, mood, active }: { who: Speaker; mood?: Line["mood"]; active: boolean }) {
  const { state } = useGame();
  const id = CHAR_OF[who];
  const cls = `transition-all duration-500 ${active ? "opacity-100 scale-100 translate-y-0" : "opacity-60 scale-90 translate-y-3 brightness-75"}`;
  return (
    <div className={`relative w-[38%] max-w-[180px] aspect-[4/5] ${cls}`} style={{ transitionTimingFunction: "var(--spring)" }}>
      <div className={active ? "anim-idle w-full h-full" : "w-full h-full"}>
        {id ? <CharacterArt id={id} mood={mood ?? "idle"} className="w-full h-full drop-shadow-[0_8px_10px_rgba(0,0,0,.35)]" />
          : who === "popo" ? <NpcArt id="postman" look={NPC.postman.look} />
          : who === "deokbae" ? <NpcArt id="artisan" look={NPC.artisan.look} />
          : who === "me" ? <WalkerArt avatar={state.player.avatar} equipped={state.equipped} /> : null}
      </div>
    </div>
  );
}

export default function StoryPlayer({ chapter, part, onDone }: { chapter: Chapter | null; part: "intro" | "outro"; onDone: () => void }) {
  const lines = useMemo(() => (chapter ? chapter[part] : []), [chapter, part]);
  const [i, setI] = useState(0);
  const [shown, setShown] = useState(0);
  const line = lines[i];
  const { state } = useGame();
  const text = line ? (line.who === "me" ? line.text : line.text.replaceAll("견습생", state.player.name)) : "";

  useEffect(() => { setI(0); setShown(0); }, [chapter, part]);
  // 타자기처럼 한 글자씩
  useEffect(() => {
    setShown(0);
    if (!text) return;
    const id = setInterval(() => setShown((n) => { if (n >= text.length) { clearInterval(id); return n; } return n + 1; }), 28);
    return () => clearInterval(id);
  }, [text, i]);

  if (!chapter || !line) return null;
  const typing = shown < text.length;
  const cast: Speaker[] = [];
  for (let k = i; k >= 0 && cast.length < 2; k--) { const w = lines[k].who; if (w !== "narr" && !cast.includes(w)) cast.unshift(w); }

  const next = () => {
    if (typing) { setShown(text.length); return; }
    sfx.page(); haptic(8);
    if (i + 1 < lines.length) setI(i + 1); else onDone();
  };

  return (<Portal>
    <div className="fixed inset-0 z-[75] select-none anim-fade" role="dialog" aria-modal aria-label={`${chapter.no} ${chapter.title}`} onClick={next}>
      <SceneBackdrop scene={chapter.scene} />
      {/* 장 제목 */}
      {i === 0 && (
        <div className="absolute top-[12%] inset-x-0 text-center pointer-events-none anim-rise">
          <p className="font-game font-bold tracking-[.4em] text-antique-light text-sm">{chapter.no}</p>
          <h2 className="font-story text-hanji-light text-4xl mt-1" style={{ textShadow: "0 3px 0 rgba(0,0,0,.4)" }}>{chapter.title}</h2>
          <p className="font-game text-hanji/80 text-sm mt-1">{part === "intro" ? chapter.sub : "― 이야기의 끝에서"}</p>
        </div>
      )}
      <button onClick={(e) => { e.stopPropagation(); onDone(); }} className="absolute top-[max(12px,env(safe-area-inset-top))] left-3 z-10 px-3 py-1.5 text-sm font-game font-bold text-hanji-light bg-black/30 border border-hanji/30 rounded-full">건너뛰기 ›</button>
      {/* 인물 */}
      <div className="absolute inset-x-0 bottom-[190px] flex items-end justify-center gap-2 px-4 pointer-events-none">
        {cast.map((w) => <Portrait key={w} who={w} mood={lines.slice(0, i + 1).reverse().find((l) => l.who === w)?.mood} active={w === line.who} />)}
      </div>
      {/* 대사창 */}
      <div className="absolute inset-x-3 bottom-[max(16px,env(safe-area-inset-bottom))] mx-auto max-w-lg">
        {line.who !== "narr" && (
          <span className="relative z-10 ml-4 inline-block px-4 py-1 font-story text-lg text-hanji-light bg-vermilion border border-vermilion-dark" style={{ clipPath: "polygon(0 0,100% 0,92% 100%,0 100%)" }}>{line.who === "me" ? state.player.name : SPEAKER_NAME[line.who]}</span>
        )}
        <div className="paper -mt-1 px-5 py-4 min-h-[128px]">
          <p className={`text-[17px] leading-relaxed ${line.who === "narr" ? "font-story text-sumi-light italic" : "font-game font-bold text-sumi"}`}>
            {text.slice(0, shown)}{typing && <span className="anim-caret">▍</span>}
          </p>
          {!typing && <span className="absolute right-4 bottom-2 text-vermilion anim-nudge" aria-hidden>▼</span>}
          <span className="absolute left-4 bottom-1.5 text-[10px] font-game text-sumi-light/70">{i + 1} / {lines.length} · 화면을 누르면 넘어가요</span>
        </div>
      </div>
    </div>
  </Portal>);
}
