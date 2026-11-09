"use client";
// 지역 캐릭터 그림: 공식 디자인처럼 깔끔하고 귀엽게 + 작은 전통 소품(목도리·색동 깃·노리개)
// - 강이: 회색 줄무늬, 흰 주둥이·배, 다문 입(ω) + 청록 끈 노리개
// - 갱이: 크림색 + 주황 얼룩(왼쪽 귀·머리·배·꼬리), 한쪽 눈 찡긋 + 붉은 홀치기 목도리
// - 콩이: 연크림 + 산호빛 왼쪽 귀·머리 무늬, 흰 배, 활짝 웃는 입 + 색동 깃과 방울
// - 베리쥬·대추삼형제·스윗포: 본초도감식 잎맥·바림 채색
import React from "react";

export type Mood = "idle" | "happy" | "surprised" | "wave";
type Box = { x?: number; y?: number; width?: number; height?: number };
const K = "#5A4A42"; // 부드러운 갈색 선 (먼작귀·실바니안 느낌)

function Whiskers({ cx = 60, y = 66, color = K }: { cx?: number; y?: number; color?: string }) {
  const w = (x1: number, y1: number, x2: number, y2: number, k: number) => <path key={k} d={`M${x1} ${y1} L${x2} ${y2}`} stroke={color} strokeWidth={1.2} strokeLinecap="round" opacity={0.7} />;
  return <g>{w(cx - 30, y - 4, cx - 42, y - 6, 1)}{w(cx - 30, y + 1, cx - 43, y + 2, 2)}{w(cx + 30, y - 4, cx + 42, y - 6, 3)}{w(cx + 30, y + 1, cx + 43, y + 2, 4)}</g>;
}

function Eye({ x, y, mood, closed = false }: { x: number; y: number; mood: Mood; closed?: boolean }) {
  if (mood === "happy" || closed) return <path d={`M${x - 4} ${y + 1} Q${x} ${y - 3.5} ${x + 4} ${y + 1}`} stroke="#3A302B" strokeWidth={2} strokeLinecap="round" fill="none" />;
  const r = mood === "surprised" ? 1.15 : 1;
  return (
    <g>
      <ellipse cx={x} cy={y} rx={3.3 * r} ry={3.9 * r} fill="#3A302B" />
      <circle cx={x + 1.1} cy={y - 1.3} r={1.15} fill="#FFFFFF" />
    </g>
  );
}

/** 윙크: 한쪽 눈을 부드럽게 감은 모양 (^) */
function WinkEye({ x, y }: { x: number; y: number }) {
  return <path d={`M${x - 4} ${y + 1} Q${x} ${y - 3.5} ${x + 4} ${y + 1}`} stroke="#3A302B" strokeWidth={2} strokeLinecap="round" fill="none" />;
}

const CATS = {
  kangi: { base: "#C9C6C2", light: "#EEEBE6", shade: "#A9A6A2", belly: "#F4F0E6", patch: null as string | null, earIn: "#E2BDB6", fur: "#F4F0E6" },
  kaengi: { base: "#FBF2E2", light: "#FFFCF4", shade: "#E6D8BC", belly: "#F4B57E", patch: "#F0A468", earIn: "#EFB89F", fur: "#FFFBF0" },
  kongi: { base: "#FCEACB", light: "#FFF9EC", shade: "#EBD3A8", belly: "#FFFCF5", patch: "#EE8577", earIn: "#F1A79A", fur: "#FFF8E8" },
};

export function PaintedCat({ variant, mood = "idle", box }: { variant: keyof typeof CATS; mood?: Mood; box?: Box }) {
  const p = CATS[variant];
  const id = `pc-${variant}`;
  const wave = mood === "wave" || variant === "kaengi";
  return (
    <svg viewBox="0 0 120 130" className="w-full h-full overflow-visible" {...box}>
      <defs>
        <radialGradient id={`${id}-vol`} cx="40%" cy="32%" r="85%"><stop offset="0" stopColor={p.light} /><stop offset=".6" stopColor={p.base} /><stop offset="1" stopColor={p.base} /></radialGradient>
        <radialGradient id={`${id}-blush`}><stop offset="0" stopColor="#F09A8E" stopOpacity=".9" /><stop offset="1" stopColor="#E58C80" stopOpacity="0" /></radialGradient>
        <clipPath id={`${id}-head`}><ellipse cx="60" cy="54" rx="44" ry="35" /></clipPath>
        <clipPath id={`${id}-body`}><path d="M36 84 Q34 120 46 122 H74 Q86 120 84 84 Z" /></clipPath>
      </defs>
      <ellipse cx="60" cy="125" rx="30" ry="4" fill="#26211E" opacity=".18" />
      {/* 꼬리 */}
      <path d="M80 112 Q104 112 106 92 Q107 80 99 76" fill="none" stroke={K} strokeWidth="10" strokeLinecap="round" />
      <path d="M80 112 Q104 112 106 92 Q107 80 99 76" fill="none" stroke={variant === "kaengi" ? p.patch! : p.base} strokeWidth="7" strokeLinecap="round" />
      {variant === "kangi" && <path d="M98 104 l6 -3 M104 93 l5 -1 M103 83 l5 1" stroke="#6E6B69" strokeWidth="1.5" strokeLinecap="round" />}
      {/* 몸 */}
      <path d="M36 84 Q34 120 46 122 H74 Q86 120 84 84 Z" fill={`url(#${id}-vol)`} stroke={K} strokeWidth="1.8" />
      <g clipPath={`url(#${id}-body)`}>
        <ellipse cx="60" cy="104" rx="15" ry="16" fill={p.belly} opacity=".95" />
      </g>
      {/* 발 */}
      {[49, 71].map((x) => (
        <g key={x}><ellipse cx={x} cy="122" rx="8" ry="4.6" fill={p.light} stroke={K} strokeWidth="1.3" />
          {variant === "kongi" && <path d={`M${x - 3} 120 v3 M${x} 120 v3.4 M${x + 3} 120 v3`} stroke="#E06F5F" strokeWidth="1" strokeLinecap="round" />}</g>
      ))}
      {/* 팔 */}
      <g className={wave ? "anim-wave" : ""} style={{ transformOrigin: "40px 92px" }}>
        <path d={wave ? "M40 92 Q24 84 22 70" : "M40 92 Q30 98 34 106"} stroke={K} strokeWidth="10.5" strokeLinecap="round" fill="none" />
        <path d={wave ? "M40 92 Q24 84 22 70" : "M40 92 Q30 98 34 106"} stroke={p.light} strokeWidth="7.5" strokeLinecap="round" fill="none" />
      </g>
      <path d="M80 92 Q90 98 86 106" stroke={K} strokeWidth="10.5" strokeLinecap="round" fill="none" />
      <path d="M80 92 Q90 98 86 106" stroke={p.light} strokeWidth="7.5" strokeLinecap="round" fill="none" />

      {/* 목 장식 (민화 요소) */}
      {variant === "kaengi" && (
        <g>
          <path d="M30 80 Q60 96 90 80 Q92 88 84 92 Q60 104 36 92 Q28 88 30 80Z" fill="#B23A31" stroke={K} strokeWidth="1.5" />
          {[[38, 87], [46, 92], [55, 95], [65, 95], [74, 92], [82, 87], [42, 90], [60, 98], [78, 90]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r="1.3" fill="#F7EFDC" />)}
          <path d="M84 90 q6 4 4 10 q-4 -2 -6 -6z" fill="#B23A31" stroke={K} strokeWidth="1.2" />
        </g>
      )}
      {variant === "kongi" && (
        <g>
          {["#C9433A", "#E8B04A", "#6E9A63", "#3E6E8E", "#D9849A"].map((c, i) => <path key={c} d={`M${34 + i * 10.4} 84 L${44 + i * 10.4} 84 L${42 + i * 10.4} 93 L${36 + i * 10.4} 93Z`} fill={c} stroke={K} strokeWidth=".9" />)}
          <circle cx="60" cy="97" r="4.2" fill="#C99A3F" stroke={K} strokeWidth="1.2" /><path d="M57.5 98 h5" stroke={K} strokeWidth="1" /><circle cx="60" cy="96" r="1" fill="#F7EFDC" />
        </g>
      )}
      {variant === "kangi" && (
        <g>
          <path d="M34 84 Q60 94 86 84" stroke="#263D40" strokeWidth="4" fill="none" strokeLinecap="round" />
          <path d="M66 89 l-3 5 l3 5 l3 -5z" fill="#B58B48" stroke={K} strokeWidth="1" />
          <path d="M66 99 v3" stroke="#B58B48" strokeWidth="1.4" />
          {[-2, -1, 0, 1, 2].map((d) => <path key={d} d={`M${66 + d} 102 q${d * 0.6} 7 ${d * 1.2} 12`} stroke="#963F38" strokeWidth="1.3" fill="none" />)}
        </g>
      )}

      {/* 귀 */}
      <path d="M20 42 Q18 14 27 8 Q38 14 49 26 Z" fill={variant === "kongi" || variant === "kaengi" ? p.patch! : p.base} stroke={K} strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M100 42 Q102 14 93 8 Q82 14 71 26 Z" fill={p.base} stroke={K} strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M26 34 Q26 18 30 15 Q37 20 42 27Z" fill={p.earIn} opacity=".85" />
      <path d="M94 34 Q94 18 90 15 Q83 20 78 27Z" fill={p.earIn} opacity=".85" />

      {/* 머리 */}
      <ellipse cx="60" cy="54" rx="44" ry="35" fill={`url(#${id}-vol)`} />
      <g clipPath={`url(#${id}-head)`}>
        {variant === "kongi" && <path d="M14 46 Q18 18 52 20 Q44 32 40 48 Q26 52 14 46Z" fill={p.patch!} />}
        {variant === "kaengi" && <path d="M14 50 Q16 18 54 18 Q50 34 38 46 Q26 54 14 50Z" fill={p.patch!} />}
        {variant === "kangi" && (
          <g fill="#6E6B69" opacity=".85">
            {[[50, 19], [58, 18], [66, 19]].map(([x, y], i) => <path key={i} d={`M${x - 2} ${y} Q${x} ${y + 9} ${x + 2} ${y} Q${x} ${y + 3} ${x - 2} ${y}Z`} />)}
            <path d="M16 50 Q24 49 28 51 Q24 52 16 52Z M16 57 Q23 56 27 58 Q23 59 16 59Z M104 50 Q96 49 92 51 Q96 52 104 52Z M104 57 Q97 56 93 58 Q97 59 104 59Z" />
          </g>
        )}
        {/* 주둥이 밝은 부분 */}
        {variant === "kangi" && <ellipse cx="60" cy="70" rx="16" ry="10" fill={p.belly} />}
      </g>
      <ellipse cx="60" cy="54" rx="44" ry="35" fill="none" stroke={K} strokeWidth="1.5" />
      {/* 볼 털 */}

      {/* 얼굴 */}
      {[36, 84].map((bx) => (
        <g key={bx}><ellipse cx={bx} cy="68" rx="8" ry="5" fill="#F4A8A0" opacity=".55" />
          <path d={`M${bx - 4} 70 l2 -4 M${bx} 70 l2 -4 M${bx + 4} 70 l2 -4`} stroke="#E07F76" strokeWidth=".9" strokeLinecap="round" opacity=".8" /></g>
      ))}
      <Eye x={45} y={60} mood={mood} />
      {variant === "kaengi" && mood !== "happy" ? <WinkEye x={75} y={60} /> : <Eye x={75} y={60} mood={mood} />}
      <path d="M57.5 64.5 Q60 63.5 62.5 64.5 L60 67.5Z" fill="#B5655A" stroke={K} strokeWidth="1" strokeLinejoin="round" />
      {variant === "kongi" || mood === "happy" || mood === "wave"
        ? <g><path d="M54 69 Q60 82 66 69 Q60 72 54 69Z" fill="#8C3A33" stroke={K} strokeWidth="1.4" strokeLinejoin="round" /><path d="M56.5 74 Q60 79 63.5 74 Q60 75 56.5 74Z" fill="#E58C80" /></g>
        : variant === "kaengi"
          ? <path d="M53 68 Q56.5 74 60 68 Q63.5 74 67 68 Q60 77 53 68Z" fill="#FFFBF0" stroke={K} strokeWidth="1.4" strokeLinejoin="round" />
          : <path d="M54 69 Q57 72.5 60 69 Q63 72.5 66 69" stroke={K} strokeWidth="1.5" fill="none" strokeLinecap="round" />}
      <Whiskers />
    </svg>
  );
}

/** 베리쥬: 딸기 탈 — 본초도감식 잎맥과 씨앗 */
export function PaintedBerry({ mood = "idle", box }: { mood?: Mood; box?: Box }) {
  return (
    <svg viewBox="0 0 120 130" className="w-full h-full overflow-visible" {...box}>
      <defs>
        <radialGradient id="pb-body" cx="35%" cy="30%" r="80%"><stop offset="0" stopColor="#E9675E" /><stop offset=".6" stopColor="#C8403A" /><stop offset="1" stopColor="#8E2B28" /></radialGradient>
        <radialGradient id="pb-face" cx="45%" cy="35%" r="70%"><stop offset="0" stopColor="#FFFDF6" /><stop offset="1" stopColor="#EDE3CF" /></radialGradient>
        <clipPath id="pb-clip"><path d="M60 122 C24 120 12 86 16 62 C20 34 40 26 60 26 C80 26 100 34 104 62 C108 86 96 120 60 122 Z" /></clipPath>
      </defs>
      <ellipse cx="60" cy="126" rx="30" ry="4" fill="#26211E" opacity=".18" />
      <path d="M60 122 C24 120 12 86 16 62 C20 34 40 26 60 26 C80 26 100 34 104 62 C108 86 96 120 60 122 Z" fill="url(#pb-body)" stroke={K} strokeWidth="1.5" />
      {[[24, 56], [96, 60], [28, 92], [92, 94], [60, 112], [42, 108], [78, 110], [20, 76], [100, 80]].map(([x, y], i) => (
        <path key={i} d={`M${x} ${y - 2.6} Q${x + 2} ${y} ${x} ${y + 2.6} Q${x - 2} ${y} ${x} ${y - 2.6}Z`} fill="#E9C46A" stroke="#7A2422" strokeWidth=".6" />
      ))}
      {/* 꼭지 잎: 잎맥 있는 다섯 잎 */}
      {[-56, -28, 0, 28, 56].map((r, i) => (
        <g key={i} transform={`rotate(${r} 60 30)`}>
          <path d="M60 30 Q50 18 60 4 Q70 18 60 30Z" fill={i % 2 ? "#5E8A57" : "#6F9B63"} stroke={K} strokeWidth="1.4" />
          <path d="M60 28 V8 M60 20 l-4 -4 M60 16 l4 -4" stroke="#3E5E3A" strokeWidth=".8" fill="none" />
        </g>
      ))}
      <path d="M60 10 q3 -9 10 -11" stroke="#4E7A48" strokeWidth="3" fill="none" strokeLinecap="round" />
      <ellipse cx="60" cy="68" rx="29" ry="25" fill="url(#pb-face)" stroke={K} strokeWidth="1.3" />
      <ellipse cx="41" cy="74" rx="7" ry="4.5" fill="#E58C80" opacity=".55" /><ellipse cx="79" cy="74" rx="7" ry="4.5" fill="#E58C80" opacity=".55" />
      <Eye x={49} y={64} mood={mood} /><Eye x={71} y={64} mood={mood} />
      <path d="M54 73 Q60 84 66 73 Q60 76 54 73Z" fill="#8C3A33" stroke={K} strokeWidth="1.3" />
      {/* 매듭 리본 */}
      <path d="M52 96 Q60 92 68 96 L60 100Z" fill="#963F38" stroke={K} strokeWidth="1.2" />
      <path d="M60 99 l-5 9 M60 99 l5 9" stroke="#963F38" strokeWidth="1.5" strokeLinecap="round" />
      <g className={mood === "wave" ? "anim-wave" : ""} style={{ transformOrigin: "18px 80px" }}>
        <circle cx={mood === "wave" ? 10 : 14} cy={mood === "wave" ? 62 : 82} r="8" fill="#FBF6EA" stroke={K} strokeWidth="1.3" />
      </g>
      <circle cx="106" cy="82" r="8" fill="#FBF6EA" stroke={K} strokeWidth="1.3" />
      <ellipse cx="48" cy="124" rx="8" ry="5" fill="#FBF6EA" stroke={K} strokeWidth="1.3" /><ellipse cx="72" cy="124" rx="8" ry="5" fill="#FBF6EA" stroke={K} strokeWidth="1.3" />
    </svg>
  );
}

/** 대추삼형제: 윤기 나는 대추 + 구름(운문) 얼굴 */
export function PaintedDaechu({ n, mood = "idle", box }: { n: 1 | 2 | 3; mood?: Mood; box?: Box }) {
  const dried = n === 1, young = n === 3;
  const body = "M60 14 C92 14 102 46 100 72 C98 102 82 120 60 120 C38 120 22 102 20 72 C18 46 28 14 60 14 Z";
  const cloud = "M40 56 q2 -11 12 -9 q5 -9 14 -2 q10 -5 14 5 q9 2 7 11 q7 7 0 13 q2 9 -9 9 q-5 7 -14 2 q-9 5 -14 -2 q-11 0 -9 -9 q-8 -7 -1 -18 z";
  return (
    <svg viewBox="0 0 120 130" className="w-full h-full overflow-visible" {...box}>
      <defs>
        <radialGradient id={`pd-${n}`} cx="32%" cy="25%" r="85%"><stop offset="0" stopColor={dried ? "#8A3A3E" : "#B8414A"} /><stop offset=".55" stopColor={dried ? "#5E1F27" : "#8E2A35"} /><stop offset="1" stopColor={dried ? "#3E1219" : "#5C1820"} /></radialGradient>
        <clipPath id={`pdc-${n}`}><path d={body} /></clipPath>
      </defs>
      <ellipse cx="60" cy="126" rx="28" ry="4" fill="#26211E" opacity=".18" />
      <path d={body} fill={`url(#pd-${n})`} stroke={K} strokeWidth="1.5" />
      <g clipPath={`url(#pdc-${n})`}>
        {young && <path d="M10 88 Q40 80 60 90 Q82 98 110 86 V130 H10Z" fill="#94B86A" />}
        <path d="M36 28 Q44 22 52 24" stroke="#F2E7D0" strokeWidth="4" strokeLinecap="round" opacity=".35" fill="none" />
        {dried && <g stroke="#2E0C12" strokeWidth="1.4" fill="none" strokeLinecap="round" opacity=".8"><path d="M28 40 q8 8 2 16" /><path d="M90 44 q-8 10 0 18" /><path d="M34 100 q10 6 18 0" /><path d="M76 24 q4 8 0 12" /><path d="M70 104 q8 -4 14 2" /></g>}
      </g>
      <path d="M60 14 q-2 -11 7 -13" stroke="#6F9B4E" strokeWidth="3.4" fill="none" strokeLinecap="round" />
      {dried && <path d="M66 2 q11 -2 13 7 q-9 2 -13 -7z" fill="#6F9B4E" stroke={K} strokeWidth="1.2" />}
      <path d={cloud} fill="#FBF6EA" stroke={K} strokeWidth="1.3" />
      <path d="M48 76 q6 -5 12 0 q6 -5 12 0" stroke="#D6C29C" strokeWidth="1" fill="none" />
      <ellipse cx="47" cy="68" rx="5" ry="3" fill="#E58C80" opacity=".55" /><ellipse cx="73" cy="68" rx="5" ry="3" fill="#E58C80" opacity=".55" />
      {dried && mood === "idle" ? <><Eye x={52} y={62} mood="happy" /><Eye x={68} y={62} mood="happy" /></>
        : n === 3 && mood === "idle" ? <><WinkEye x={53} y={62} /><Eye x={68} y={62} mood={mood} /></>
          : <><Eye x={52} y={62} mood={mood} /><Eye x={68} y={62} mood={mood} /></>}
      {young || mood !== "idle" ? <path d="M56 70 Q60 77 64 70Z" fill="#8C3A33" stroke={K} strokeWidth="1.2" /> : <ellipse cx="60" cy="71" rx="1.6" ry="1.2" fill="#B5655A" />}
      <path d="M54 88 Q60 85 66 88 L60 91Z" fill="#3E1219" />
      <path d="M60 90 l-4 7 M60 90 l4 7" stroke="#3E1219" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="16" cy="80" r="7" fill="#FBF6EA" stroke={K} strokeWidth="1.3" /><circle cx="104" cy="80" r="7" fill="#FBF6EA" stroke={K} strokeWidth="1.3" />
      <ellipse cx="48" cy="123" rx="7" ry="5" fill={young || n === 2 ? "#8FB55E" : "#5E1F27"} stroke={K} strokeWidth="1.3" />
      <ellipse cx="72" cy="123" rx="7" ry="5" fill={young || n === 2 ? "#8FB55E" : "#5E1F27"} stroke={K} strokeWidth="1.3" />
    </svg>
  );
}

/** 스윗포: 자줏빛 고구마 몸 + 노란 얼굴 + 새싹 */
export function PaintedSweetpo({ mood = "idle", box }: { mood?: Mood; box?: Box }) {
  const body = "M60 8 C90 8 106 44 106 74 C106 104 86 122 60 122 C34 122 14 104 14 74 C14 44 30 8 60 8 Z";
  return (
    <svg viewBox="0 0 120 130" className="w-full h-full overflow-visible" {...box}>
      <defs>
        <radialGradient id="ps-body" cx="34%" cy="26%" r="85%"><stop offset="0" stopColor="#A9466A" /><stop offset=".6" stopColor="#7E2D4C" /><stop offset="1" stopColor="#521A33" /></radialGradient>
        <radialGradient id="ps-face" cx="45%" cy="35%" r="70%"><stop offset="0" stopColor="#FBD86A" /><stop offset="1" stopColor="#E6B13E" /></radialGradient>
        <clipPath id="ps-clip"><path d={body} /></clipPath>
      </defs>
      <ellipse cx="60" cy="126" rx="30" ry="4" fill="#26211E" opacity=".18" />
      <path d={body} fill="url(#ps-body)" stroke={K} strokeWidth="1.5" />
      <g clipPath="url(#ps-clip)">
        <g stroke="#3E1428" strokeWidth="1" fill="none" opacity=".7" strokeLinecap="round"><path d="M26 44 q-5 2 -8 0" /><path d="M96 52 q5 1 8 -2" /><path d="M24 96 q-4 3 -8 2" /><path d="M98 98 q4 2 7 0" /><path d="M40 24 q4 4 9 2" /></g>
        {[[34, 36], [84, 40], [30, 104], [90, 106], [72, 22]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r="1.4" fill="#3E1428" opacity=".6" />)}
        <path d="M36 22 Q46 14 56 16" stroke="#F2E7D0" strokeWidth="4" strokeLinecap="round" opacity=".25" fill="none" />
      </g>
      <path d="M70 12 q8 -14 20 -10 q-3 12 -20 10z" fill="#E6B13E" stroke={K} strokeWidth="1.4" />
      <path d="M72 11 q8 -5 15 -7" stroke="#8A6731" strokeWidth=".8" fill="none" />
      <ellipse cx="60" cy="64" rx="28" ry="24" fill="url(#ps-face)" stroke={K} strokeWidth="1.3" />
      <ellipse cx="42" cy="71" rx="6" ry="4" fill="#E0805F" opacity=".55" /><ellipse cx="78" cy="71" rx="6" ry="4" fill="#E0805F" opacity=".55" />
      <Eye x={50} y={61} mood={mood} /><Eye x={70} y={61} mood={mood} />
      {mood === "idle" ? <path d="M55 70 Q60 75 65 70" stroke={K} strokeWidth="1.3" fill="none" strokeLinecap="round" /> : <path d="M54 69 Q60 80 66 69 Q60 72 54 69Z" fill="#8C3A33" stroke={K} strokeWidth="1.2" />}
      <path d="M52 94 Q60 90 68 94 L60 98Z" fill="#3E1428" /><path d="M60 97 l-5 8 M60 97 l5 8" stroke="#3E1428" strokeWidth="1.8" strokeLinecap="round" />
      <g className={mood === "wave" ? "anim-wave" : ""} style={{ transformOrigin: "16px 78px" }}>
        <circle cx={mood === "wave" ? 8 : 12} cy={mood === "wave" ? 60 : 80} r="8" fill="url(#ps-face)" stroke={K} strokeWidth="1.3" />
      </g>
      <circle cx="108" cy="80" r="8" fill="url(#ps-face)" stroke={K} strokeWidth="1.3" />
      <ellipse cx="46" cy="124" rx="9" ry="5" fill="url(#ps-face)" stroke={K} strokeWidth="1.3" /><ellipse cx="74" cy="124" rx="9" ry="5" fill="url(#ps-face)" stroke={K} strokeWidth="1.3" />
    </svg>
  );
}
