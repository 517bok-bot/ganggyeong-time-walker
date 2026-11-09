// 전역 SVG 필터: 인장 테두리의 거친 번짐, 먹선 번짐, 수채 번짐
export default function ArtDefs() {
  return (
    <svg id="art-defs" width="0" height="0" style={{ position: "absolute" }} aria-hidden focusable="false">
      <defs>
        <filter id="seal-rough" x="-5%" y="-5%" width="110%" height="110%">
          <feTurbulence type="fractalNoise" baseFrequency="1.4" numOctaves="2" seed="7" result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="1.6" />
        </filter>
        <filter id="ink-bleed">
          <feTurbulence type="fractalNoise" baseFrequency=".05" numOctaves="2" seed="3" result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="2.2" />
        </filter>
        <filter id="wash" x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence type="fractalNoise" baseFrequency=".02" numOctaves="3" seed="11" result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="10" result="d" />
          <feGaussianBlur in="d" stdDeviation="1.2" />
        </filter>
        <filter id="print" x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="1" seed="2" result="g" />
          <feColorMatrix in="g" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -1.4 1.12" result="m" />
          <feComposite in="SourceGraphic" in2="m" operator="in" />
        </filter>
        <filter id="soft-fog"><feGaussianBlur stdDeviation="14" /></filter>
        {/* 목판 결 · 벽돌 · 기와 · 물결 패턴 (텍스처 오버레이용) */}
        <pattern id="pt-hatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(35)"><path d="M0 0V6" stroke="#39332F" strokeWidth=".7" opacity=".28" /></pattern>
        <pattern id="pt-grain" width="40" height="8" patternUnits="userSpaceOnUse"><path d="M0 4 Q10 2 20 4 T40 4" stroke="#39332F" strokeWidth=".6" fill="none" opacity=".18" /></pattern>
        <pattern id="pt-brick" width="16" height="8" patternUnits="userSpaceOnUse"><path d="M0 .5H16M0 4.5H16M4 .5V4.5M12 4.5V8.5" stroke="#3A1E19" strokeWidth=".8" opacity=".45" fill="none" /></pattern>
        <pattern id="pt-tile" width="7" height="6" patternUnits="userSpaceOnUse"><path d="M3.5 0V6" stroke="#E8D8B8" strokeWidth=".7" opacity=".35" /><path d="M0 5.5H7" stroke="#1A2B2D" strokeWidth="1" opacity=".6" /></pattern>
        <pattern id="pt-wave" width="40" height="12" patternUnits="userSpaceOnUse"><path d="M0 8 Q5 3 10 8 T20 8 T30 8 T40 8" stroke="#E8D8B8" strokeWidth=".9" fill="none" opacity=".35" /></pattern>
        <pattern id="pt-lattice" width="6" height="6" patternUnits="userSpaceOnUse"><path d="M0 0H6M0 0V6" stroke="#5A4033" strokeWidth=".8" fill="none" /></pattern>
        {/* 털결 붓질: 밝은 결 + 어두운 결이 엇갈리는 짧은 획 */}
        <pattern id="pt-fur" width="17" height="13" patternUnits="userSpaceOnUse" patternTransform="rotate(-18)">
          <path d="M1 8 q2 -4 1 -7 M6 9 q1.5 -3.5 0.5 -6.5 M11 8 q2 -3 1 -6" stroke="#FFFFFF" strokeWidth=".6" fill="none" opacity=".22" strokeLinecap="round" />
          <path d="M3.5 9.5 q1.5 -3 1 -5.5 M8.5 9 q1.2 -2.6 .6 -5" stroke="#39332F" strokeWidth=".45" fill="none" opacity=".08" strokeLinecap="round" />
        </pattern>
        <radialGradient id="gr-window"><stop offset="0" stopColor="#F3D896" /><stop offset="1" stopColor="#C9973F" /></radialGradient>
      </defs>
    </svg>
  );
}
