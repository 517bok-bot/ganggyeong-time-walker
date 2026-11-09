// 시간 우체국 삽화: 우체국 창구 · 우체통 · 봉투 · 우표
import { LocationGlyph } from "./LocationArt";

const K = "#39332F";

export function PostOfficeScene() {
  return (
    <svg viewBox="0 0 600 220" className="w-full h-auto block" role="img" aria-label="달밤의 시간 우체국 창구와 붉은 우체통">
      <rect width="600" height="220" fill="#263D40" />
      <rect width="600" height="220" fill="url(#pt-hatch)" opacity=".3" />
      <circle cx="520" cy="48" r="26" fill="#EFE2C2" /><circle cx="520" cy="48" r="44" fill="#EFE2C2" opacity=".12" className="anim-glow" />
      {/* 우체국 건물 */}
      <rect x="110" y="70" width="330" height="130" fill="#E2D3B2" stroke={K} strokeWidth="2.5" />
      <rect x="110" y="70" width="330" height="130" fill="url(#pt-grain)" />
      <path d="M90 74 Q130 64 140 40 H410 Q420 64 460 74 Q275 60 90 74Z" fill="#2F3B3B" stroke={K} strokeWidth="2.5" />
      <path d="M90 74 Q130 64 140 40 H410 Q420 64 460 74Z" fill="url(#pt-tile)" />
      <rect x="215" y="82" width="120" height="24" fill="#963F38" stroke="#B58B48" strokeWidth="2" />
      <text x="275" y="99" textAnchor="middle" fontSize="15" fill="#F2E7D0" fontFamily="'Song Myung', serif">시간 우체국</text>
      {/* 창구와 우편함 칸 */}
      <rect x="135" y="116" width="150" height="70" fill="#5A4033" stroke={K} strokeWidth="2" />
      {[0, 1, 2, 3, 4].map((c) => [0, 1, 2].map((r) => (
        <g key={`${c}-${r}`}><rect x={142 + c * 28} y={122 + r * 20} width="24" height="16" fill="#3B2C24" stroke="#B58B48" strokeWidth=".8" />
          {(c + r) % 2 === 0 && <rect x={145 + c * 28} y={126 + r * 20} width="18" height="9" fill="#F2E7D0" transform={`rotate(${(c - r) * 3} ${154 + c * 28} ${130 + r * 20})`} />}</g>
      )))}
      <rect x="305" y="116" width="110" height="84" fill="url(#gr-window)" stroke={K} strokeWidth="2" />
      <rect x="305" y="116" width="110" height="84" fill="url(#pt-lattice)" />
      {/* 붉은 우체통 */}
      <g transform="translate(480 108)">
        <rect x="-4" y="74" width="48" height="18" fill="#39332F" />
        <path d="M0 74 V18 Q20 0 40 18 V74Z" fill="#963F38" stroke={K} strokeWidth="2.5" />
        <rect x="8" y="26" width="24" height="5" fill="#26211E" />
        <rect x="9" y="40" width="22" height="22" fill="none" stroke="#E6CB8E" strokeWidth="1.5" />
        <path d="M13 45h14l-7 6z" fill="#E6CB8E" />
      </g>
      {/* 편지를 나르는 까치들 */}
      <g transform="translate(330 14) scale(.55)"><Magpie nested /></g>
      <g transform="translate(40 30) scale(.4) scale(-1 1) translate(-120 0)"><Magpie nested /></g>
      {/* 초롱 */}
      <g transform="translate(70 80)"><path d="M0 -20 V0" stroke={K} strokeWidth="2" /><path d="M-9 0 Q-12 14 -9 28 H9 Q12 14 9 0Z" fill="#963F38" stroke={K} strokeWidth="1.5" /><circle cy="14" r="26" fill="#F3D896" opacity=".2" className="anim-glow" /></g>
      <rect y="200" width="600" height="20" fill="#7A5D42" stroke={K} strokeWidth="2" />
      <ellipse cx="300" cy="205" rx="320" ry="14" fill="#E8D8B8" opacity=".3" filter="url(#soft-fog)" className="anim-fog" />
      <rect x="2" y="2" width="596" height="216" fill="none" stroke={K} strokeWidth="3" />
    </svg>
  );
}

/** 톱니 테두리 우표 (방문한 장소의 건물 그림) */
export function Stamp({ locId, label, size = 64, faded = false }: { locId: string; label?: string; size?: number; faded?: boolean }) {
  const teeth = Array.from({ length: 9 });
  return (
    <svg viewBox="0 0 80 96" width={size} height={size * 1.2} className={`inline-block ${faded ? "opacity-30 grayscale" : ""}`} role="img" aria-label={label ? `${label} 우표` : "우표"}>
      <rect x="2" y="2" width="76" height="92" fill="#F2E7D0" />
      {teeth.map((_, i) => <g key={i}><circle cx={6 + i * 8.5} cy="2" r="2.6" fill="#E8D8B8" /><circle cx={6 + i * 8.5} cy="94" r="2.6" fill="#E8D8B8" /></g>)}
      {Array.from({ length: 11 }).map((_, i) => <g key={i}><circle cx="2" cy={6 + i * 8.5} r="2.6" fill="#E8D8B8" /><circle cx="78" cy={6 + i * 8.5} r="2.6" fill="#E8D8B8" /></g>)}
      <rect x="9" y="9" width="62" height="64" fill="#263D40" stroke={K} strokeWidth="1.2" />
      <circle cx="58" cy="22" r="7" fill="#EFE2C2" />
      <g transform="translate(40 70)"><LocationGlyph id={locId} scale={0.36} /></g>
      <text x="40" y="86" textAnchor="middle" fontSize="9" fontFamily="'Nanum Myeongjo', serif" fontWeight="800" fill="#963F38">{label ?? "강경"}</text>
    </svg>
  );
}

/** 봉투 (닫힘/열림) */
export function Envelope({ open = false, sealColor = "#963F38" }: { open?: boolean; sealColor?: string }) {
  return (
    <svg viewBox="0 0 160 110" className="w-full h-auto block" aria-hidden>
      <rect x="4" y="20" width="152" height="86" fill="#E2D3B2" stroke={K} strokeWidth="2" />
      <rect x="4" y="20" width="152" height="86" fill="url(#pt-grain)" />
      <path d="M4 106 L80 60 L156 106" fill="none" stroke={K} strokeWidth="1.5" opacity=".6" />
      <g style={{ transformOrigin: "80px 20px", transform: open ? "rotateX(180deg)" : "none", transition: "transform .6s ease" }}>
        <path d="M4 20 L80 68 L156 20Z" fill="#D6C29C" stroke={K} strokeWidth="2" />
      </g>
      {!open && <g><circle cx="80" cy="64" r="11" fill={sealColor} filter="url(#seal-rough)" /><circle cx="80" cy="64" r="7" fill="none" stroke="#F2E7D0" strokeWidth="1" opacity=".7" /></g>}
      <path d="M14 30 h20 M14 36 h14" stroke="#963F38" strokeWidth="1.5" opacity=".5" />
    </svg>
  );
}

/** 까치 우체부: 편지를 문 까치 (시간 학당의 전령) */
export function Magpie({ flying = true, nested = false }: { flying?: boolean; nested?: boolean }) {
  return (
    <svg viewBox="0 0 120 90" {...(nested ? { width: 120, height: 90 } : { className: "w-full h-auto block" })} role="img" aria-label="편지를 문 까치">
      <g className={flying ? "anim-idle" : ""}>
        <path d="M60 40 Q30 6 6 18 Q30 22 44 44Z" fill="#26211E" stroke={K} strokeWidth="1.5" />
        <path d="M24 20 Q34 26 40 38" stroke="#E8EEF0" strokeWidth="4" strokeLinecap="round" opacity=".9" />
        <path d="M44 46 Q60 30 80 36 Q94 40 98 50 Q84 60 62 58 Q48 56 44 46Z" fill="#F2F0EA" stroke={K} strokeWidth="1.5" />
        <path d="M80 36 Q92 30 98 36 Q100 46 92 48 Q84 44 80 36Z" fill="#26211E" stroke={K} strokeWidth="1.5" />
        <path d="M98 40 l12 2 l-12 3z" fill="#39332F" />
        <circle cx="92" cy="39" r="1.6" fill="#F2E7D0" />
        <path d="M46 50 Q20 62 4 60 Q22 50 40 48" fill="#26211E" stroke={K} strokeWidth="1.2" />
        <path d="M62 40 Q80 4 104 10 Q86 18 72 42Z" fill="#2F4A57" stroke={K} strokeWidth="1.5" />
        <path d="M76 22 Q86 16 96 14" stroke="#E8EEF0" strokeWidth="3" strokeLinecap="round" opacity=".7" />
        <g transform="translate(104 44) rotate(14)">
          <rect x="0" y="0" width="16" height="11" fill="#F2E7D0" stroke={K} strokeWidth="1.2" />
          <path d="M0 0 l8 6 l8 -6" fill="none" stroke={K} strokeWidth="1" />
          <circle cx="8" cy="6.5" r="2.2" fill="#963F38" />
        </g>
      </g>
    </svg>
  );
}
