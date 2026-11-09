"use client";
// 캐릭터 그림 진입점 — 지역 캐릭터는 components/art/Painted.tsx 의 민화풍 채색본을 사용합니다.
// 공식 원화 사용 허가 후 /public/characters/* 이미지로 교체할 수 있도록 CharacterArt 한 곳에서만 그립니다.
import React from "react";
import { useContent } from "@/lib/content";
import { useGame } from "@/lib/game";
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

/** 엽서 등 SVG 합성용: 캐릭터 원본 SVG를 지정 위치·크기로 반환 (민화 채색본) */
export function CharacterSvg({ id, mood = "idle", box }: { id: string; mood?: Mood; box?: Box }) {
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
export function WalkerArt({ avatar = "sage", walking = false, flip = false, equipped }: { avatar?: string; walking?: boolean; flip?: boolean; equipped?: { hat?: string; neck?: string; face?: string; outfit?: string; prop?: string } }) {
  const game = useGame();
  const eq = equipped ?? game.state.equipped ?? {};
  const a = AVATARS[avatar] ?? AVATARS.sage;
  const hat = eq.hat ?? null;
  return (
    <svg viewBox="0 0 80 110" className="w-full h-full overflow-visible" style={{ transform: flip ? "scaleX(-1)" : undefined }}>
      <ellipse cx={40} cy={106} rx={20} ry={4} fill="#000" opacity={0.15} />
      <g className={walking ? "anim-step-l" : ""}><rect x={28} y={86} width={9} height={16} rx={4} fill="#39332F" /></g>
      <g className={walking ? "anim-step-r" : ""}><rect x={43} y={86} width={9} height={16} rx={4} fill="#39332F" /></g>
      {/* 소품: 몸 뒤 (양산·트렁크) */}
      {eq.prop === "prop-parasol" && <g><path d="M62 96 V30" stroke={LINE} strokeWidth={2} /><path d="M36 34 Q62 6 88 34 Q81 30 75 34 Q68 29 62 34 Q56 29 49 34 Q43 30 36 34Z" fill="#F2E7D0" stroke={LINE} strokeWidth={1.8} /><path d="M40 33 q4 3 8 0 M52 33 q5 3 10 0 M66 33 q5 3 10 0" stroke="#D9A79B" strokeWidth={1.2} fill="none" /><path d="M62 96 q4 4 -2 6" stroke={LINE} strokeWidth={2} fill="none" /></g>}
      {eq.prop === "prop-trunk" && <g><rect x={56} y={84} width={22} height={17} rx={2} fill="#7A4A30" stroke={LINE} strokeWidth={1.8} /><path d="M62 84 v-4 h10 v4" fill="none" stroke={LINE} strokeWidth={1.8} /><path d="M56 92 h22" stroke="#B58B48" strokeWidth={1.6} /><rect x={65} y={90} width={4} height={4} fill="#B58B48" /></g>}
      {/* 의상 */}
      {(!eq.outfit) && <path d="M22 92 Q20 62 40 60 Q60 62 58 92 Z" fill={a.coat} stroke={LINE} strokeWidth={2.4} strokeLinejoin="round" />}
      {eq.outfit === "outfit-suit" && <g>
        <path d="M22 92 Q20 62 40 60 Q60 62 58 92 Z" fill="#3A3530" stroke={LINE} strokeWidth={2.4} strokeLinejoin="round" />
        <path d="M33 62 L40 76 L47 62Z" fill="#F2E7D0" stroke={LINE} strokeWidth={1.2} />
        <path d="M31 66 L40 80 L49 66 V90 H31Z" fill="#6B4A36" stroke={LINE} strokeWidth={1.2} />
        <path d="M40 66 l-2 4 l2 8 l2 -8z" fill="#963F38" />
        <circle cx={40} cy={84} r={1.2} fill="#B58B48" /><circle cx={40} cy={88} r={1.2} fill="#B58B48" />
      </g>}
      {eq.outfit === "outfit-dress" && <g>
        <path d="M26 96 Q24 74 30 64 Q40 58 50 64 Q56 74 54 96 Z" fill="#3B5659" stroke={LINE} strokeWidth={2.2} strokeLinejoin="round" />
        <path d="M30 64 L40 72 L50 64 L46 70 L40 76 L34 70Z" fill="#F2E7D0" stroke={LINE} strokeWidth={1.2} />
        <path d="M27 84 H53" stroke="#B58B48" strokeWidth={2} />
        <path d="M30 96 l3 -6 l3 6 l3 -6 l3 6 l3 -6 l3 6 l3 -6 l2 6" fill="none" stroke="#F2E7D0" strokeWidth={1} />
      </g>}
      {eq.outfit === "outfit-hanbok" && <g>
        <path d="M24 98 Q22 80 30 76 H50 Q58 80 56 98Z" fill="#963F38" stroke={LINE} strokeWidth={2} />
        <path d="M27 76 Q28 62 40 60 Q52 62 53 76 Z" fill="#F2E7D0" stroke={LINE} strokeWidth={2} />
        {["#C9433A", "#E8B04A", "#6E9A63", "#3E6E8E", "#D9849A"].map((c, i) => <rect key={c} x={18 - i * 0} y={64 + i * 2.6} width={10} height={2.6} fill={c} />)}
        {["#C9433A", "#E8B04A", "#6E9A63", "#3E6E8E", "#D9849A"].map((c, i) => <rect key={`r${c}`} x={52} y={64 + i * 2.6} width={10} height={2.6} fill={c} />)}
        <path d="M40 66 l-6 8 M40 66 l3 10" stroke="#963F38" strokeWidth={2.2} strokeLinecap="round" />
      </g>}
      {eq.outfit === "outfit-academy" && <g>
        <path d="M20 98 Q18 62 40 60 Q62 62 60 98 Z" fill="#1F3336" stroke={LINE} strokeWidth={2.4} strokeLinejoin="round" />
        <path d="M33 62 L40 98 M47 62 L40 98" stroke="#B58B48" strokeWidth={2.2} />
        <path d="M20 98 H60" stroke="#B58B48" strokeWidth={2.4} />
        {[[28, 74], [31, 84], [52, 72], [49, 86], [26, 90]].map(([x, y], i) => <path key={i} d={`M${x} ${y - 2} l.8 1.5 l1.7 .3 l-1.2 1.2 l.3 1.7 l-1.6 -.8 l-1.6 .8 l.3 -1.7 l-1.2 -1.2 l1.7 -.3z`} fill="#E6CB8E" />)}
        <path d="M28 76 L31 84 M52 72 L49 86" stroke="#E6CB8E" strokeWidth={.6} opacity={.7} />
      </g>}
      {eq.neck === "neck-apron" && <path d="M28 66 h24 v24 q-12 4 -24 0 z" fill="#F2E7D0" stroke={LINE} strokeWidth={1.8} />}
      <path d="M40 62 v28" stroke={LINE} strokeWidth={1.5} />
      <circle cx={40} cy={72} r={1.8} fill="#B58B48" /><circle cx={40} cy={80} r={1.8} fill="#B58B48" />
      {/* 회중시계 */}
      <circle cx={52} cy={78} r={5} fill="#B58B48" stroke={LINE} strokeWidth={1.6} />
      <path d="M52 75.5 v2.5 l1.8 1" stroke={LINE} strokeWidth={1.2} fill="none" />
      <circle cx={40} cy={38} r={24} fill="#F6D9BE" stroke={LINE} strokeWidth={2.4} />
      <path d="M17 36 Q18 14 40 13 Q62 14 63 36 Q54 26 40 27 Q26 26 17 36 Z" fill="#5A4030" />
      {hat === "hat-fedora" && (<g>
        <ellipse cx={40} cy={18} rx={30} ry={6} fill={a.hat} stroke={LINE} strokeWidth={2.2} />
        <path d="M24 17 Q26 0 40 0 Q54 0 56 17 Z" fill={a.hat} stroke={LINE} strokeWidth={2.2} />
        <rect x={25} y={10} width={30} height={4} fill="#B58B48" />
      </g>)}
      {hat === "hat-straw" && (<g>
        <ellipse cx={40} cy={18} rx={36} ry={7} fill="#E8C877" stroke={LINE} strokeWidth={2.2} />
        <path d="M24 17 Q27 2 40 2 Q53 2 56 17 Z" fill="#E8C877" stroke={LINE} strokeWidth={2.2} />
        <rect x={25} y={11} width={30} height={4} fill="#963F38" />
      </g>)}
      {hat === "hat-beret" && <path d="M14 22 Q14 6 40 6 Q66 6 64 20 Q50 26 14 22 Z M40 6 v-5" fill="#963F38" stroke={LINE} strokeWidth={2.2} />}
      {hat === "hat-cat" && (<g fill="#B4B3B6" stroke={LINE} strokeWidth={2.2} strokeLinejoin="round">
        <path d="M16 24 Q16 8 40 8 Q64 8 64 24 Q40 18 16 24 Z" />
        <path d="M20 14 L22 -2 L34 9 Z" /><path d="M60 14 L58 -2 L46 9 Z" />
        <path d="M24 9 L24 3 L29 8 Z M56 9 L56 3 L51 8 Z" fill="#F2A1A0" stroke="none" />
      </g>)}
      {hat === "hat-cloche" && <g><path d="M15 26 Q14 6 40 6 Q66 6 65 26 Q52 20 40 20 Q28 20 15 26Z" fill="#963F38" stroke={LINE} strokeWidth={2.2} /><path d="M17 20 Q40 12 63 20" stroke="#B58B48" strokeWidth={3} fill="none" /><circle cx={56} cy={17} r={3} fill="#F2E7D0" stroke={LINE} strokeWidth={1} /></g>}
      {hat === "hat-gat" && <g><ellipse cx={40} cy={20} rx={36} ry={5.5} fill="#26211E" opacity={.85} stroke={LINE} strokeWidth={1.6} /><path d="M28 19 Q28 2 40 2 Q52 2 52 19Z" fill="#26211E" stroke={LINE} strokeWidth={1.6} /><path d="M22 22 Q20 40 26 54 M58 22 Q60 40 54 54" stroke="#B58B48" strokeWidth={1.2} fill="none" opacity={.8} /></g>}
      {eq.face === "face-glasses" && <g fill="none" stroke={LINE} strokeWidth={1.8}><circle cx={32} cy={40} r={6} /><circle cx={48} cy={40} r={6} /><path d="M38 40 h4" /></g>}
      {eq.face === "face-mono" && <g fill="none" stroke="#8A6731" strokeWidth={2}><circle cx={48} cy={40} r={6.5} /><path d="M54 42 q6 10 0 20" strokeWidth={1.2} /></g>}
      <circle cx={32} cy={40} r={2.8} fill={LINE} /><circle cx={48} cy={40} r={2.8} fill={LINE} />
      <ellipse cx={27} cy={47} rx={4} ry={2.4} fill="#F2A1A0" opacity={0.7} /><ellipse cx={53} cy={47} rx={4} ry={2.4} fill="#F2A1A0" opacity={0.7} />
      <path d="M36 48 q4 4 8 0" stroke={LINE} strokeWidth={1.8} fill="none" strokeLinecap="round" />
      {eq.prop === "prop-camera" && <g><path d="M30 62 L48 84" stroke="#5A4033" strokeWidth={1.6} /><rect x={42} y={78} width={18} height={13} rx={1.5} fill="#2A2522" stroke={LINE} strokeWidth={1.4} /><path d="M46 78 l3 -4 h6 l2 4" fill="#5A4033" stroke={LINE} strokeWidth={1} /><circle cx={51} cy={85} r={4} fill="#3B5659" stroke="#B58B48" strokeWidth={1.4} /></g>}
      {eq.prop === "prop-fan" && <g><path d="M58 82 l6 -2" stroke={LINE} strokeWidth={2} /><circle cx={70} cy={74} r={10} fill="#F2E7D0" stroke={LINE} strokeWidth={1.6} /><path d="M60 74 A10 10 0 0 1 80 74 A5 5 0 0 1 70 74 A5 5 0 0 0 60 74Z" fill="#963F38" /><path d="M60 74 A10 10 0 0 0 80 74 A5 5 0 0 1 70 74 A5 5 0 0 0 60 74Z" fill="#3E6E8E" /></g>}
      {eq.prop === "prop-lantern" && <g><path d="M60 80 L66 70 V74" stroke={LINE} strokeWidth={1.6} fill="none" /><circle cx={66} cy={84} r={12} fill="#F3D896" opacity={.3} className="anim-glow" /><rect x={60} y={74} width={12} height={2.5} fill="#263D40" /><path d="M60 76.5 Q58 84 60 92 H72 Q74 84 72 76.5Z" fill="#963F38" stroke={LINE} strokeWidth={1.2} /><path d="M59 84 H73" stroke="#263D40" strokeWidth={2.4} /><rect x={60} y={92} width={12} height={2.5} fill="#263D40" /></g>}
      {eq.prop === "prop-compass" && <g><circle cx={64} cy={82} r={14} fill="#F3D896" opacity={.35} className="anim-glow" /><circle cx={64} cy={82} r={8} fill="#B58B48" stroke={LINE} strokeWidth={1.6} /><circle cx={64} cy={82} r={5.5} fill="#F2E7D0" /><path d="M64 77 l1.6 5 l-1.6 5 l-1.6 -5z" fill="#963F38" /><path d="M58 70 l1 2 M70 70 l-1 2 M64 68 v2" stroke="#E6CB8E" strokeWidth={1.2} /></g>}
      {eq.neck === "neck-scarf" && <g><path d="M24 60 Q40 68 56 60 L56 66 Q40 74 24 66 Z" fill="#963F38" stroke={LINE} strokeWidth={1.8} /><path d="M48 66 l4 14 l5 -2 l-3 -13" fill="#963F38" stroke={LINE} strokeWidth={1.6} /></g>}
      {eq.neck === "neck-bow" && <g fill="#963F38" stroke={LINE} strokeWidth={1.6}><path d="M40 64 l-9 -5 v10 z" /><path d="M40 64 l9 -5 v10 z" /><circle cx={40} cy={64} r={2.4} /></g>}
    </svg>
  );
}

/** NPC 초상화 (창작 NPC) */
export function NpcArt({ look }: { look: { hat: string; outfit: string; skin: string; prop?: string } }) {
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible">
      <path d="M18 100 Q16 66 50 64 Q84 66 82 100 Z" fill={look.outfit} stroke={LINE} strokeWidth={2.4} />
      <circle cx={50} cy={42} r={25} fill={look.skin} stroke={LINE} strokeWidth={2.4} />
      <path d="M25 38 Q28 16 50 16 Q72 16 75 38 Q62 28 50 30 Q38 28 25 38 Z" fill="#39332F" />
      <path d="M22 26 Q24 8 50 8 Q76 8 78 26 Q50 20 22 26 Z" fill={look.hat} stroke={LINE} strokeWidth={2.2} />
      <circle cx={41} cy={44} r={2.8} fill={LINE} /><circle cx={59} cy={44} r={2.8} fill={LINE} />
      <ellipse cx={35} cy={51} rx={4} ry={2.4} fill="#F2A1A0" opacity={0.7} /><ellipse cx={65} cy={51} rx={4} ry={2.4} fill="#F2A1A0" opacity={0.7} />
      <path d="M45 53 q5 5 10 0" stroke={LINE} strokeWidth={2} fill="none" strokeLinecap="round" />
      {look.prop === "jar" && <g><path d="M68 80 q-4 -10 6 -12 h10 q10 2 6 12 q-2 14 -11 14 q-9 0 -11 -14z" fill="#5A4033" stroke={LINE} strokeWidth={2} /><rect x={72} y={64} width={14} height={5} rx={2} fill="#39332F" /></g>}
      {look.prop === "camera" && <g><rect x={62} y={72} width={28} height={18} rx={3} fill="#39332F" /><circle cx={76} cy={81} r={6} fill="#B58B48" stroke="#fff" strokeWidth={1.5} /></g>}
      {look.prop === "letter" && <g><rect x={64} y={72} width={26} height={18} fill="#F2E7D0" stroke={LINE} strokeWidth={2} /><path d="M64 72 l13 10 l13 -10" fill="none" stroke={LINE} strokeWidth={2} /><circle cx={77} cy={84} r={3} fill="#963F38" /></g>}
      {look.prop === "map" && <g><path d="M62 72 l10 -3 l10 3 l10 -3 v20 l-10 3 l-10 -3 l-10 3z" fill="#D6C29C" stroke={LINE} strokeWidth={2} /><circle cx={78} cy={80} r={2.5} fill="#963F38" /></g>}
      {look.prop === "bag" && <g><rect x={64} y={74} width={24} height={20} rx={3} fill="#B58B48" stroke={LINE} strokeWidth={2} /><path d="M70 74 q6 -10 12 0" fill="none" stroke={LINE} strokeWidth={2} /></g>}
    </svg>
  );
}
