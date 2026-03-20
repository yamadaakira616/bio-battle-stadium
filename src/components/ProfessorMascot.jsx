/**
 * @param {Object} props
 * @param {number} [props.size=120]
 * @param {'happy'|'thinking'|'excited'|'sad'} [props.mood='happy']
 */
// props: size (default 120), mood ('happy'|'thinking'|'excited'|'sad')
export default function ProfessorMascot({ size = 120, mood = 'happy' }) {
  const mouthPath = mood === 'sad'
    ? 'M 40 58 Q 50 52 60 58'
    : mood === 'excited'
    ? 'M 37 54 Q 50 66 63 54'
    : 'M 40 56 Q 50 64 60 56';

  return (
    <svg width={size} height={size} viewBox="0 0 100 100" style={{ overflow: 'visible' }}>
      <defs>
        <linearGradient id="profBody" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fde68a"/>
          <stop offset="100%" stopColor="#f59e0b"/>
        </linearGradient>
        <filter id="profShadow">
          <feDropShadow dx="2" dy="4" stdDeviation="3" floodOpacity="0.2"/>
        </filter>
      </defs>

      {/* 影 */}
      <ellipse cx="50" cy="97" rx="26" ry="5" fill="rgba(0,0,0,0.1)"/>

      {/* 体（丸い博士） */}
      <circle cx="50" cy="52" r="38" fill="url(#profBody)" filter="url(#profShadow)"/>
      <circle cx="50" cy="52" r="36" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2"/>

      {/* 帽子（虫取り帽） */}
      <ellipse cx="50" cy="18" rx="30" ry="6" fill="#78350f"/>
      <rect x="26" y="5" width="48" height="15" rx="5" fill="#92400e"/>
      <ellipse cx="50" cy="5" rx="15" ry="4" fill="#78350f"/>

      {/* 目 */}
      {[35, 65].map(cx => (
        <g key={cx}>
          <circle cx={cx} cy={mood === 'thinking' ? 44 : 42} r="8" fill="white"/>
          <circle cx={cx} cy={mood === 'thinking' ? 44 : 42} r="5" fill="#1e40af"/>
          <circle cx={cx+1.5} cy={(mood === 'thinking' ? 44 : 42)-1.5} r="2" fill="white"/>
          {/* まばたき */}
          <rect x={cx-8} y={(mood === 'thinking' ? 44 : 42)-8} width="16" height="16" rx="8" fill="#fde68a"
            style={{ transformOrigin: `${cx}px 42px` }}>
            <animate attributeName="height" values="0;0;0;16;0;0;0;16;0" dur="5s" repeatCount="indefinite"/>
            <animate attributeName="y" values={`${(mood==='thinking'?44:42)};${(mood==='thinking'?44:42)};${(mood==='thinking'?44:42)};${(mood==='thinking'?44:42)-8};${(mood==='thinking'?44:42)};${(mood==='thinking'?44:42)};${(mood==='thinking'?44:42)};${(mood==='thinking'?44:42)-8};${(mood==='thinking'?44:42)}`} dur="5s" repeatCount="indefinite"/>
          </rect>
        </g>
      ))}

      {/* 口 */}
      <path d={mouthPath} stroke="#92400e" strokeWidth="2.5" fill="none" strokeLinecap="round"/>

      {/* ほっぺ */}
      <ellipse cx="27" cy="52" rx="6" ry="4" fill="rgba(252,165,165,0.5)"/>
      <ellipse cx="73" cy="52" rx="6" ry="4" fill="rgba(252,165,165,0.5)"/>

      {/* 虫眼鏡（右手） */}
      <g transform="rotate(30 80 70)">
        <circle cx="80" cy="65" r="10" fill="none" stroke="#92400e" strokeWidth="3"/>
        <circle cx="80" cy="65" r="8" fill="rgba(147,210,255,0.3)"/>
        <line x1="87" y1="72" x2="95" y2="80" stroke="#78350f" strokeWidth="3" strokeLinecap="round"/>
      </g>

      {/* 左腕 */}
      <ellipse cx="14" cy="60" rx="5" ry="9" fill="#f59e0b" transform="rotate(10 14 60)"/>

      {/* 足 */}
      <rect x="32" y="84" width="12" height="9" rx="5" fill="#f59e0b"/>
      <rect x="56" y="84" width="12" height="9" rx="5" fill="#f59e0b"/>

      {/* 興奮エフェクト */}
      {mood === 'excited' && (
        <>
          <text x="2" y="22" fontSize="12">✨</text>
          <text x="78" y="18" fontSize="10">⭐</text>
        </>
      )}

      {/* 考え中の吹き出し */}
      {mood === 'thinking' && (
        <>
          <circle cx="78" cy="22" r="3" fill="white" opacity="0.8"/>
          <circle cx="84" cy="14" r="5" fill="white" opacity="0.8"/>
          <circle cx="90" cy="6" r="7" fill="white" opacity="0.9"/>
          <text x="87" y="10" textAnchor="middle" fontSize="7">?</text>
        </>
      )}
    </svg>
  );
}
