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

/** 장면 배경 (자체 창작 수묵 채색) */
export function SceneBackdrop({ scene, cleared = 0 }: { scene: Chapter["scene"]; cleared?: number }) {
  const sky: Record<Chapter["scene"], [string, string]> = {
    night: ["#14262A", "#3B5659"], fog: ["#5E6B68", "#A9AEA4"], street: ["#3D5A5C", "#C9B48A"],
    kitchen: ["#4A3428", "#B9895A"], lighthouse: ["#1F3540", "#6E8C93"], festival: ["#2A1F3A", "#D9806F"],
  };
  const [a, b] = sky[scene];
  return (
    <svg viewBox="0 0 400 700" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 w-full h-full" aria-hidden>
      <defs>
        <linearGradient id="sb-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={a} /><stop offset="1" stopColor={b} /></linearGradient>
        <radialGradient id="sb-moon"><stop offset="0" stopColor="#FFF4D6" /><stop offset=".55" stopColor="#F3D896" /><stop offset="1" stopColor="#F3D896" stopOpacity="0" /></radialGradient>
      </defs>
      <rect width="400" height="700" fill="url(#sb-sky)" />
      <rect width="400" height="700" fill="url(#pt-grain)" opacity=".6" />
      {(scene === "night" || scene === "lighthouse" || scene === "festival") && <circle cx="300" cy="140" r="90" fill="url(#sb-moon)" opacity=".9" />}
      {/* 먼 산 */}
      <path d="M0 330 L60 270 L110 300 L170 230 L240 300 L300 250 L400 320 V420 H0Z" fill="#39332F" opacity=".35" />
      <path d="M0 380 L80 330 L150 360 L230 310 L320 360 L400 340 V460 H0Z" fill="#263D40" opacity=".55" />
      {/* 장면 소품 */}
      {scene === "lighthouse" && <g transform="translate(250 200)"><path d="M0 0 L30 0 L40 260 L-10 260Z" fill="#E8D8B8" stroke="#39332F" strokeWidth="2" /><path d="M-2 60 H32 M-5 130 H35 M-8 200 H38" stroke="#963F38" strokeWidth="10" /><rect x="-6" y="-26" width="42" height="26" fill="#39332F" /><circle cx="15" cy="-12" r="9" fill="#F3D896" className="anim-glow" /></g>}
      {scene === "kitchen" && <g>{[60, 150, 250, 330].map((x, i) => <g key={i} transform={`translate(${x} ${400 + (i % 2) * 20})`}><ellipse cx="0" cy="0" rx="40" ry="50" fill="#5A3426" stroke="#26211E" strokeWidth="2" /><ellipse cx="0" cy="-46" rx="26" ry="7" fill="#3a2418" /></g>)}</g>}
      {scene === "festival" && <g>{Array.from({ length: 9 }, (_, i) => <g key={i} transform={`translate(${20 + i * 45} ${120 + (i % 2) * 16})`}><path d="M0 -20 V-8" stroke="#39332F" /><ellipse cx="0" cy="4" rx="11" ry="14" fill="#963F38" /><ellipse cx="0" cy="4" rx="16" ry="18" fill="#F3D896" opacity=".25" className="anim-glow" style={{ animationDelay: `${i * .3}s` }} /></g>)}<path d="M0 120 Q200 160 400 120" stroke="#39332F" fill="none" /></g>}
      {/* 거리 실루엣 */}
      <g fill="#1F2E30" opacity=".85">
        <path d="M0 470 H60 V430 L90 410 L120 430 V470 H150 V420 H210 V470 H240 V440 L270 420 L300 440 V470 H330 V425 H400 V700 H0Z" />
      </g>
      <g fill="#F3D896" opacity=".8">{[[20, 450], [170, 440], [190, 440], [260, 450], [350, 440]].map(([x, y], i) => <rect key={i} x={x} y={y} width="8" height="10" />)}</g>
      {/* 강 */}
      <rect y="560" width="400" height="140" fill="#263D40" opacity=".7" />
      <path d="M0 590 Q100 580 200 592 T400 588 M0 630 Q120 620 240 632 T400 628" stroke="#E8D8B8" strokeWidth="1.2" fill="none" opacity=".35" />
      {/* 망각의 안개 */}
      {(scene === "fog" || cleared < 1) && (
        <g filter="url(#soft-fog)" fill="#D6D6CC" opacity={scene === "fog" ? .7 : .35 * (1 - cleared)} className="anim-fog">
          <ellipse cx="80" cy="470" rx="200" ry="50" /><ellipse cx="330" cy="420" rx="180" ry="44" /><ellipse cx="200" cy="560" rx="260" ry="50" />
        </g>
      )}
    </svg>
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
