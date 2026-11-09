"use client";
// 캐릭터 그림 진입점 — 지역 캐릭터는 components/art/Painted.tsx 의 민화풍 채색본을 사용합니다.
// 공식 원화 사용 허가 후 /public/characters/* 이미지로 교체할 수 있도록 CharacterArt 한 곳에서만 그립니다.
import React from "react";
import { useContent } from "@/lib/content";
import { useGame } from "@/lib/game";
import { NPCS } from "@/lib/data/npcs";
import { PaintedBerry, PaintedCat, PaintedDaechu, PaintedSweetpo } from "./art/Painted";

type Box = { x?: number; y?: number; width?: number; height?: number };

export type Mood = "idle" | "happy" | "surprised" | "wave";

const LINE = "#39332F";

function Eyes({ mood, cx = 50, y = 54, gap = 15 }: { mood: Mood; cx?: number; y?: number; gap?: number }) {
  if (mood === "happy")
    return (
      <g stroke={LINE} strokeWidth={2.6} fill="none" strokeLinecap="round">
        <path d={`M${cx - gap - 4} ${y + 1} q4 -6 8 0`} />
        <path d={`M${cx + gap - 4} ${y + 1} q4 -6 8 0`} />
      </g>
    );
  const r = mood === "surprised" ? 4.4 : 3.6;
  return (
    <g className="anim-blink">
      <circle cx={cx - gap} cy={y} r={r} fill={LINE} />
      <circle cx={cx + gap} cy={y} r={r} fill={LINE} />
      <circle cx={cx - gap + 1.2} cy={y - 1.3} r={1.2} fill="#fff" />
      <circle cx={cx + gap + 1.2} cy={y - 1.3} r={1.2} fill="#fff" />
    </g>
  );
}
function Mouth({ mood, cx = 50, y = 62, open }: { mood: Mood; cx?: number; y?: number; open?: boolean }) {
  if (mood === "surprised") return <ellipse cx={cx} cy={y + 3} rx={3} ry={3.6} fill="#7a3b33" stroke={LINE} strokeWidth={1.6} />;
  if (open || mood === "happy" || mood === "wave")
    return (
      <g>
        <path d={`M${cx - 5} ${y} q5 9 10 0 z`} fill="#E8706A" stroke={LINE} strokeWidth={1.8} strokeLinejoin="round" />
      </g>
    );
  return <path d={`M${cx - 5} ${y} q2.5 3 5 0 q2.5 3 5 0`} fill="none" stroke={LINE} strokeWidth={1.8} strokeLinecap="round" />;
}
function Blush({ cx = 50, y = 61, gap = 22, color = "#F2A1A0" }) {
  return (
    <g fill={color} opacity={0.75}>
      <ellipse cx={cx - gap} cy={y} rx={5.5} ry={3.4} />
      <ellipse cx={cx + gap} cy={y} rx={5.5} ry={3.4} />
    </g>
  );
}
function Whiskers({ cx = 50, y = 60 }) {
  return (
    <g stroke={LINE} strokeWidth={1.3} strokeLinecap="round">
      <path d={`M${cx - 27} ${y - 3} l-9 -2 M${cx - 27} ${y + 1} l-9 1`} />
      <path d={`M${cx + 27} ${y - 3} l9 -2 M${cx + 27} ${y + 1} l9 1`} />
    </g>
  );
}

const CAT_PALETTE = {
  // 강이: 회색 줄무늬 (안내도 그림)
  kangi: { base: "#B4B3B6", belly: "#F4F1EC", patch: null as string | null, stripe: "#8B8A8E", ear: "#E9C9C4" },
  // 갱이: 크림 + 주황 얼룩 (사진 1)
  kaengi: { base: "#FBF1DF", belly: "#F3A867", patch: "#EE9A55", stripe: null as string | null, ear: "#F2B596" },
  // 콩이: 연노랑 크림 + 코랄빛 귀 무늬 (사진 1·2)
  kongi: { base: "#FFE9C4", belly: "#FFFBF2", patch: "#E7756A", stripe: null as string | null, ear: "#F4A9A0" },
};

export function CatArt({ variant, mood = "idle", box }: { variant: keyof typeof CAT_PALETTE; mood?: Mood; box?: Box }) {
  const p = CAT_PALETTE[variant];
  const small = variant === "kongi";
  return (
    <svg viewBox="0 0 100 110" className="w-full h-full overflow-visible" {...box}>
      {/* tail */}
      <path d="M72 92 q20 -4 18 -22" fill="none" stroke={LINE} strokeWidth={9} strokeLinecap="round" />
      <path d="M72 92 q20 -4 18 -22" fill="none" stroke={variant === "kaengi" ? p.patch! : p.base} strokeWidth={6} strokeLinecap="round" />
      {/* body */}
      <g className={mood === "wave" ? "" : ""}>
        <rect x={small ? 33 : 29} y={74} width={small ? 34 : 42} height={30} rx={14} fill={p.base} stroke={LINE} strokeWidth={2.4} />
        <ellipse cx={50} cy={90} rx={small ? 10 : 12} ry={10} fill={p.belly} />
        <ellipse cx={42} cy={104} rx={6} ry={4} fill={p.base} stroke={LINE} strokeWidth={2} />
        <ellipse cx={58} cy={104} rx={6} ry={4} fill={p.base} stroke={LINE} strokeWidth={2} />
        {/* arms */}
        <g className={mood === "wave" ? "anim-wave" : ""} style={{ transformOrigin: "30px 80px" }}>
          <ellipse cx={mood === "wave" ? 24 : 30} cy={mood === "wave" ? 70 : 84} rx={6} ry={7} fill={p.base} stroke={LINE} strokeWidth={2} />
        </g>
        <ellipse cx={70} cy={84} rx={6} ry={7} fill={p.base} stroke={LINE} strokeWidth={2} />
      </g>
      {/* head */}
      <path d="M12 30 L20 4 L40 20 Z" fill={variant === "kongi" ? p.patch! : p.base} stroke={LINE} strokeWidth={2.4} strokeLinejoin="round" />
      <path d="M88 30 L80 4 L60 20 Z" fill={variant === "kaengi" ? p.patch! : p.base} stroke={LINE} strokeWidth={2.4} strokeLinejoin="round" />
      <path d="M19 22 L22 11 L31 19 Z" fill={p.ear} />
      <path d="M81 22 L78 11 L69 19 Z" fill={p.ear} />
      <ellipse cx={50} cy={50} rx={42} ry={33} fill={p.base} stroke={LINE} strokeWidth={2.8} />
      <path d="M62 80 Q90 74 92 50 Q86 72 62 80Z" fill="url(#pt-hatch)" />
      {variant === "kongi" && <path d="M18 34 Q26 16 46 19 Q36 28 32 42 Q22 40 18 34 Z" fill={p.patch!} />}
      {variant === "kaengi" && <path d="M56 18 Q80 18 88 40 Q76 46 66 36 Q58 30 56 18 Z" fill={p.patch!} />}
      {variant === "kangi" && (
        <g stroke={p.stripe!} strokeWidth={3.2} strokeLinecap="round">
          <path d="M44 20 v8 M50 18 v10 M56 20 v8" />
          <path d="M10 46 h8 M10 53 h7 M82 46 h8 M83 53 h7" />
        </g>
      )}
      {variant === "kangi" && <ellipse cx={50} cy={63} rx={13} ry={8} fill={p.belly} />}
      <Blush />
      <Whiskers />
      <Eyes mood={mood} />
      <path d="M48 58 h4 l-2 2 z" fill={LINE} />
      <Mouth mood={mood} open={variant !== "kangi"} />
    </svg>
  );
}

export function BerryArt({ mood = "idle", box }: { mood?: Mood; box?: Box }) {
  return (
    <svg viewBox="0 0 100 110" className="w-full h-full overflow-visible" {...box}>
      <path d="M50 102 C18 100 8 70 12 50 C16 26 34 20 50 20 C66 20 84 26 88 50 C92 70 82 100 50 102 Z" fill="#E2504A" stroke={LINE} strokeWidth={2.6} />
      <g fill="#F6C65B">{[[22, 46], [80, 52], [26, 78], [74, 80], [50, 94], [36, 92], [64, 93]].map(([x, y], i) => <ellipse key={i} cx={x} cy={y} rx={1.8} ry={2.6} />)}</g>
      <path d="M26 24 Q30 10 42 18 Q46 4 54 16 Q62 6 66 18 Q78 12 76 26 Q62 30 50 26 Q38 30 26 24 Z" fill="#5FA463" stroke={LINE} strokeWidth={2.2} strokeLinejoin="round" />
      <path d="M50 16 q2 -10 8 -12" stroke="#4A8A4F" strokeWidth={3} fill="none" strokeLinecap="round" />
      <ellipse cx={50} cy={60} rx={26} ry={22} fill="#FFFDF8" stroke={LINE} strokeWidth={2} />
      <Blush cx={50} y={64} gap={17} color="#F4A6A0" />
      <Eyes mood={mood} cx={50} y={56} gap={10} />
      <Mouth mood={mood} cx={50} y={63} open />
      <path d="M44 84 q6 4 12 0 M50 84 l-4 6 M50 84 l4 6" stroke="#7a2a26" strokeWidth={1.8} fill="none" strokeLinecap="round" />
      <g className={mood === "wave" ? "anim-wave" : ""} style={{ transformOrigin: "16px 70px" }}>
        <ellipse cx={mood === "wave" ? 8 : 12} cy={mood === "wave" ? 56 : 72} rx={7} ry={7} fill="#fff" stroke={LINE} strokeWidth={2} />
      </g>
      <ellipse cx={88} cy={72} rx={7} ry={7} fill="#fff" stroke={LINE} strokeWidth={2} />
      <ellipse cx={40} cy={104} rx={7} ry={5} fill="#fff" stroke={LINE} strokeWidth={2} />
      <ellipse cx={60} cy={104} rx={7} ry={5} fill="#fff" stroke={LINE} strokeWidth={2} />
    </svg>
  );
}

const DAECHU = {
  1: { body: "#6E2232", wrinkle: true, foot: "#6E2232", bottom: null as string | null },
  2: { body: "#8E2A35", wrinkle: false, foot: "#8BB65A", bottom: null as string | null },
  3: { body: "#8E2A35", wrinkle: false, foot: "#8BB65A", bottom: "#9CC46A" },
};
export function DaechuArt({ n, mood = "idle", box }: { n: 1 | 2 | 3; mood?: Mood; box?: Box }) {
  const d = DAECHU[n];
  return (
    <svg viewBox="0 0 100 110" className="w-full h-full overflow-visible" {...box}>
      <defs>
        <clipPath id={`dc${n}`}><path d="M50 12 C80 12 88 40 86 62 C84 88 70 100 50 100 C30 100 16 88 14 62 C12 40 20 12 50 12 Z" /></clipPath>
      </defs>
      <path d="M50 12 C80 12 88 40 86 62 C84 88 70 100 50 100 C30 100 16 88 14 62 C12 40 20 12 50 12 Z" fill={d.body} stroke={LINE} strokeWidth={2.6} />
      {d.bottom && <rect x={0} y={72} width={100} height={40} fill={d.bottom} clipPath={`url(#dc${n})`} />}
      {d.bottom && <path d="M14 76 q12 -6 24 0 q12 6 24 0 q12 -6 24 0" fill="none" stroke={LINE} strokeWidth={1.6} clipPath={`url(#dc${n})`} />}
      {d.wrinkle && <g stroke="#4a1420" strokeWidth={1.6} fill="none" strokeLinecap="round"><path d="M24 30 q6 6 2 12" /><path d="M76 34 q-6 8 0 14" /><path d="M30 82 q8 4 14 0" /><path d="M66 22 q4 6 0 10" /></g>}
      <path d="M50 12 q-2 -10 6 -12" stroke="#7FA651" strokeWidth={3.4} fill="none" strokeLinecap="round" />
      {n === 1 && <path d="M56 2 q10 -2 12 6 q-8 2 -12 -6z" fill="#7FA651" stroke={LINE} strokeWidth={1.4} />}
      {/* 구름 모양 얼굴 */}
      <path d="M32 46 q2 -10 10 -8 q4 -8 12 -2 q8 -4 12 4 q8 2 6 10 q6 6 0 12 q2 8 -8 8 q-4 6 -12 2 q-8 4 -12 -2 q-10 0 -8 -8 q-6 -6 0 -16 z" fill="#FFFDF8" stroke={LINE} strokeWidth={1.8} />
      <Blush cx={52} y={58} gap={13} color="#F4A6A0" />
      <Eyes mood={n === 1 && mood === "idle" ? "happy" : mood} cx={52} y={52} gap={8} />
      <Mouth mood={mood} cx={52} y={58} open={n === 3} />
      <path d="M46 72 q6 4 12 0 M52 72 l-3 5 M52 72 l3 5" stroke="#3a0e16" strokeWidth={1.6} fill="none" strokeLinecap="round" />
      <ellipse cx={14} cy={72} rx={6} ry={6} fill="#fff" stroke={LINE} strokeWidth={2} />
      <ellipse cx={86} cy={72} rx={6} ry={6} fill="#fff" stroke={LINE} strokeWidth={2} />
      <ellipse cx={40} cy={104} rx={6} ry={5} fill={d.foot} stroke={LINE} strokeWidth={2} />
      <ellipse cx={60} cy={104} rx={6} ry={5} fill={d.foot} stroke={LINE} strokeWidth={2} />
    </svg>
  );
}

// 스윗포: 사진 4 포스터의 자주색 몸통 + 노란 얼굴 + 작은 새싹
export function SweetpoArt({ mood = "idle", box }: { mood?: Mood; box?: Box }) {
  return (
    <svg viewBox="0 0 100 110" className="w-full h-full overflow-visible" {...box}>
      <path d="M50 6 C76 6 90 38 90 64 C90 90 72 104 50 104 C28 104 10 90 10 64 C10 38 24 6 50 6 Z" fill="#8A2F4E" stroke={LINE} strokeWidth={2.6} />
      <path d="M26 30 q4 -4 8 -2 M68 24 q5 0 7 4 M20 80 q4 2 8 0" stroke="#5E1C35" strokeWidth={1.6} fill="none" strokeLinecap="round" />
      <path d="M62 12 q6 -12 16 -8 q-2 10 -16 8 z" fill="#F2C84B" stroke={LINE} strokeWidth={1.8} strokeLinejoin="round" />
      <ellipse cx={50} cy={56} rx={23} ry={20} fill="#F6C445" stroke={LINE} strokeWidth={2} />
      <Blush cx={50} y={61} gap={15} color="#F29A7A" />
      <Eyes mood={mood} cx={50} y={53} gap={9} />
      <Mouth mood={mood} cx={50} y={60} open={mood !== "idle"} />
      <path d="M43 80 q7 4 14 0 M50 80 l-4 6 M50 80 l4 6" stroke="#4a1428" strokeWidth={1.8} fill="none" strokeLinecap="round" />
      <g className={mood === "wave" ? "anim-wave" : ""} style={{ transformOrigin: "14px 70px" }}>
        <ellipse cx={mood === "wave" ? 6 : 10} cy={mood === "wave" ? 56 : 70} rx={7} ry={7} fill="#F6C445" stroke={LINE} strokeWidth={2} />
      </g>
      <ellipse cx={90} cy={70} rx={7} ry={7} fill="#F6C445" stroke={LINE} strokeWidth={2} />
      <ellipse cx={38} cy={104} rx={8} ry={5} fill="#F6C445" stroke={LINE} strokeWidth={2} />
      <ellipse cx={62} cy={104} rx={8} ry={5} fill="#F6C445" stroke={LINE} strokeWidth={2} />
    </svg>
  );
}

/** 3D 피규어 이미지 경로 (scripts/characters3d/render.mjs 로 미리 구운 그림) */
export const charImg = (id: string, mood: Mood = "idle") => `/characters/${id}-${mood}.webp`;
const CHAR3D = new Set(["kangi", "kaengi", "kongi", "berijyu", "daechu-1", "daechu-2", "daechu-3", "sweetpo"]);

/** SVG 합성용(지도·엽서·첫 화면): 지정 위치·크기에 캐릭터를 놓습니다 */
export function CharacterSvg({ id, mood = "idle", box }: { id: string; mood?: Mood; box?: Box }) {
  if (CHAR3D.has(id)) {
    const b = { x: box?.x ?? 0, y: box?.y ?? 0, width: box?.width ?? 120, height: box?.height ?? 130 };
    const im = <image href={charImg(id, mood)} {...b} preserveAspectRatio="xMidYMax meet" />;
    return box ? im : <svg viewBox="0 0 120 130" className="w-full h-full overflow-visible">{im}</svg>;
  }
  if (id === "kangi" || id === "kaengi" || id === "kongi") return <PaintedCat variant={id} mood={mood} box={box} />;
  if (id === "berijyu") return <PaintedBerry mood={mood} box={box} />;
  if (id.startsWith("daechu-")) return <PaintedDaechu n={Number(id.slice(-1)) as 1 | 2 | 3} mood={mood} box={box} />;
  return <PaintedSweetpo mood={mood} box={box} />;
}

/** 캐릭터 ID → 그림. silhouette=true 면 미수집 실루엣.
 *  관리자가 공식 원화를 올리고 사용 허가 상태를 'approved'로 바꾸면 공식 이미지로 자동 교체됩니다. */
export function CharacterArt({ id, mood = "idle", silhouette = false, className = "" }: { id: string; mood?: Mood; silhouette?: boolean; className?: string }) {
  const { CHAR } = useContent();
  const c = CHAR[id];
  const official = c?.imageUrl && c.licenseStatus === "approved";
  return (
    <div className={`${className} ${silhouette ? "silhouette" : ""}`} aria-hidden>
      {official
        // eslint-disable-next-line @next/next/no-img-element
        ? <img src={c.imageUrl!} alt="" className="w-full h-full object-contain" style={silhouette ? { filter: "brightness(0) opacity(.28)" } : undefined} />
        : CHAR3D.has(id)
          // eslint-disable-next-line @next/next/no-img-element
          ? <img src={charImg(id, mood)} alt="" draggable={false} className="w-full h-full object-contain object-bottom select-none" />
          : <CharacterSvg id={id} mood={mood} />}
    </div>
  );
}

/** 플레이어 타임워커 (창작 캐릭터) */
export const AVATARS: Record<string, { coat: string; hat: string; name: string }> = {
  sage: { coat: "#3B5659", hat: "#39332F", name: "청록 두루마기" },
  brick: { coat: "#963F38", hat: "#39332F", name: "주홍 두루마기" },
  gold: { coat: "#B58B48", hat: "#39332F", name: "금빛 두루마기" },
  wood: { coat: "#65516F", hat: "#39332F", name: "보랏빛 두루마기" },
};
/** 플레이어 3D 피규어: 몸(두루마기·옷) 위에 모자·목·얼굴·소품 그림을 겹칩니다 (scripts/characters3d/player.js) */
const P3D = new Set(["hat-fedora", "hat-straw", "hat-beret", "hat-cat", "hat-cloche", "hat-gat", "neck-scarf", "neck-bow", "neck-apron", "face-glasses", "face-mono", "prop-parasol", "prop-trunk", "prop-camera", "prop-fan", "prop-lantern", "prop-compass", "outfit-suit", "outfit-dress", "outfit-hanbok", "outfit-academy"]);
export function WalkerArt({ avatar = "sage", walking = false, flip = false, equipped }: { avatar?: string; walking?: boolean; flip?: boolean; equipped?: { hat?: string; neck?: string; face?: string; outfit?: string; prop?: string } }) {
  const game = useGame();
  const eq = equipped ?? game.state.equipped ?? {};
  const base = eq.outfit && P3D.has(eq.outfit) ? eq.outfit : `base-${AVATARS[avatar] ? avatar : "sage"}`;
  const layers = [base, eq.neck, eq.face, eq.hat, eq.prop].filter((x): x is string => !!x && (x === base || P3D.has(x)));
  return (
    <div className={`relative w-full h-full ${walking ? "anim-walk" : ""}`} style={{ transform: flip ? "scaleX(-1)" : undefined }}>
      {layers.map((l) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img key={l} src={`/player/${l}.webp`} alt="" draggable={false} className="absolute inset-0 w-full h-full object-contain object-bottom select-none pointer-events-none" />
      ))}
    </div>
  );
}

/** NPC 초상화 (창작 NPC) */
/** 마을 사람(NPC) 3D 피규어. look 으로 누구인지 찾습니다. */
export function NpcArt({ look, id }: { look: { hat: string; outfit: string; skin: string; prop?: string }; id?: string }) {
  const who = id ?? NPCS.find((n) => n.look.hat === look.hat && n.look.outfit === look.outfit)?.id ?? "guide";
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={`/npc/${who}.webp`} alt="" draggable={false} className="w-full h-full object-contain object-bottom select-none pointer-events-none" />;
}
