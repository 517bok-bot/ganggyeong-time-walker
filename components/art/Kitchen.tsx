// 전통 부엌 배경: 흙벽 · 서까래 · 살창 · 장독대 · 매달린 마늘 (젓갈 공방용 창작 삽화)
export function KitchenScene({ children, className = "" }: { children?: React.ReactNode; className?: string }) {
  return (
    <div className={`relative overflow-hidden border-2 border-sumi ${className}`}>
      <svg viewBox="0 0 400 260" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 w-full h-full" aria-hidden>
        <rect width="400" height="260" fill="#B89A72" />
        <rect width="400" height="260" fill="url(#pt-grain)" />
        <rect width="400" height="260" fill="url(#pt-hatch)" opacity=".5" />
        {/* 서까래 */}
        <rect y="0" width="400" height="26" fill="#4A3426" stroke="#39332F" strokeWidth="2" />
        {[20, 80, 140, 200, 260, 320, 380].map((x) => <rect key={x} x={x - 6} y="0" width="12" height="40" fill="#5A4033" stroke="#39332F" strokeWidth="1.4" />)}
        {/* 살창: 달빛이 드는 창 */}
        <rect x="270" y="56" width="90" height="74" fill="#3B5659" stroke="#39332F" strokeWidth="3" />
        <circle cx="330" cy="80" r="18" fill="#EFE2C2" opacity=".9" />
        {[285, 300, 315, 330, 345].map((x) => <path key={x} d={`M${x} 56v74`} stroke="#5A4033" strokeWidth="4" />)}
        <path d="M270 93h90" stroke="#5A4033" strokeWidth="4" />
        <path d="M262 130h106" stroke="#39332F" strokeWidth="5" />
        {/* 매달린 마늘·고추 */}
        <path d="M60 26v40" stroke="#39332F" strokeWidth="1.6" />
        {[0, 1, 2, 3].map((i) => <ellipse key={i} cx={60 + (i % 2 ? 6 : -6)} cy={58 + i * 10} rx="7" ry="6" fill="#EFE2C2" stroke="#39332F" strokeWidth="1.2" />)}
        <path d="M110 26v30" stroke="#39332F" strokeWidth="1.6" />
        {[0, 1, 2].map((i) => <path key={i} d={`M${104 + i * 6} ${54 + i * 4} q2 16 -4 22`} stroke="#963F38" strokeWidth="5" strokeLinecap="round" fill="none" />)}
        {/* 바닥과 작은 장독 */}
        <rect y="210" width="400" height="50" fill="#7A5D42" stroke="#39332F" strokeWidth="2" />
        <rect y="210" width="400" height="50" fill="url(#pt-grain)" />
        {[[40, 214, 1], [86, 220, .8], [340, 216, .9]].map(([x, y, k], i) => (
          <g key={i} transform={`translate(${x} ${y}) scale(${k})`}>
            <path d="M-16 -30 Q-28 -16 -22 0 H22 Q28 -16 16 -30Z" fill="#6B4A36" stroke="#39332F" strokeWidth="1.8" />
            <ellipse cx="0" cy="-30" rx="14" ry="4" fill="#4A3426" stroke="#39332F" strokeWidth="1.4" />
            <path d="M-20 -14 Q0 -8 20 -14" stroke="#B58B48" strokeWidth="1.2" fill="none" />
          </g>
        ))}
        <ellipse cx="200" cy="232" rx="210" ry="14" fill="#E8D8B8" opacity=".25" filter="url(#soft-fog)" />
      </svg>
      <div className="relative">{children}</div>
    </div>
  );
}
