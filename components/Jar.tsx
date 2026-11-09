// 옹기 항아리 삽화 (손잡이 무늬·유약 광택·짚 끈) — fill(0~1), 재료 색, 표정
export function JarArt({ fill = 0, color = "#F2B8A0", body = "#6B4A36", rim = "#4A3426", sealed = false, face = "idle", bubbling = false }:
  { fill?: number; color?: string; body?: string; rim?: string; sealed?: boolean; face?: "idle" | "happy" | "sleep"; bubbling?: boolean }) {
  const top = 150 - 110 * Math.min(1, fill);
  return (
    <svg viewBox="0 0 160 180" className="w-full h-full overflow-visible">
      <defs>
        <clipPath id="jarIn"><path d="M40 40 Q14 70 22 120 Q30 166 80 168 Q130 166 138 120 Q146 70 120 40 Z" /></clipPath>
      </defs>
      <ellipse cx="80" cy="172" rx="56" ry="7" fill="#000" opacity=".15" />
      <path d="M40 40 Q14 70 22 120 Q30 166 80 168 Q130 166 138 120 Q146 70 120 40 Z" fill={body} stroke="#39332F" strokeWidth="3" />
      {!sealed && <g clipPath="url(#jarIn)">
        <rect x="0" y={top} width="160" height="180" fill={color} style={{ transition: "y .6s cubic-bezier(.2,.9,.3,1.2)" }} opacity=".92" />
        <path d={`M0 ${top} q20 -6 40 0 t40 0 t40 0 t40 0`} fill="none" stroke="#fff" strokeWidth="3" opacity=".5" style={{ transition: "d .6s" }} />
      </g>}
      {/* 무늬 */}
      <path d="M30 96 q50 18 100 0" stroke="#B58B48" strokeWidth="3" fill="none" opacity=".8" />
      <path d="M40 70 q10 -8 20 0 q10 -8 20 0 q10 -8 20 0 q10 -8 20 0" stroke="#E8D8B8" strokeWidth="1.6" fill="none" opacity=".45" />
      <path d="M40 40 Q14 70 22 120 Q30 166 80 168" fill="none" stroke="#E8D8B8" strokeWidth="5" opacity=".12" />
      <path d="M34 108 q46 14 92 0" stroke="#B58B48" strokeWidth="1.6" fill="none" opacity=".6" />
      {/* 얼굴 */}
      {face === "sleep"
        ? <g stroke="#E8D8B8" strokeWidth="2.4" opacity=".7" strokeLinecap="round" fill="none"><path d="M56 128 q6 5 12 0" /><path d="M92 128 q6 5 12 0" /></g>
        : face === "happy"
          ? <g stroke="#E8D8B8" strokeWidth="2.4" opacity=".7" strokeLinecap="round" fill="none"><path d="M56 130 q6 -7 12 0" /><path d="M92 130 q6 -7 12 0" /></g>
          : <g fill="#E8D8B8" opacity=".7"><circle cx="62" cy="128" r="4.5" /><circle cx="98" cy="128" r="4.5" /></g>}

      {/* 입구 */}
      <ellipse cx="80" cy="40" rx="42" ry="10" fill={rim} stroke="#39332F" strokeWidth="3" />
      {sealed && (
        <g>
          <path d="M34 40 Q80 4 126 40 Q80 30 34 40 Z" fill="#E8D8B8" stroke="#39332F" strokeWidth="2.6" />
          <path d="M40 44 q40 10 80 0" stroke="#8A6731" strokeWidth="4" fill="none" strokeDasharray="5 2" />
        </g>
      )}
      {bubbling && [0, 1, 2].map((i) => <circle key={i} cx={60 + i * 20} cy={30} r={4 + i} fill="#F2E7D0" stroke="#5C534C" strokeWidth="1.5" className="anim-bubble" style={{ animationDelay: `${i * 0.6}s` }} />)}
    </svg>
  );
}
