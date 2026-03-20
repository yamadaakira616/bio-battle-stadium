import { useState } from 'react';

const RARITY_LABELS = {
  common: { label: 'ノーマル', color: '#9ca3af' },
  rare: { label: 'レア', color: '#3b82f6' },
  superRare: { label: 'SR', color: '#a855f7' },
  ultra: { label: 'ULTRA', color: '#f59e0b' },
};

// Inline SVG silhouette for fallback
function InsectSilhouette({ size = 80 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80">
      {/* Generic beetle silhouette */}
      <ellipse cx="40" cy="45" rx="18" ry="22" fill="black"/>
      <ellipse cx="40" cy="28" rx="10" ry="10" fill="black"/>
      {/* Antennae */}
      <line x1="34" y1="20" x2="22" y2="8" stroke="black" strokeWidth="2" strokeLinecap="round"/>
      <line x1="46" y1="20" x2="58" y2="8" stroke="black" strokeWidth="2" strokeLinecap="round"/>
      {/* Legs */}
      {[-1,0,1].map(i => (
        <g key={i}>
          <line x1="22" y1={40+i*8} x2="10" y2={38+i*10} stroke="black" strokeWidth="1.5" strokeLinecap="round"/>
          <line x1="58" y1={40+i*8} x2="70" y2={38+i*10} stroke="black" strokeWidth="1.5" strokeLinecap="round"/>
        </g>
      ))}
    </svg>
  );
}

// props: insect (InsectData), owned (bool), onClick (optional)
export default function InsectCard({ insect, owned, onClick }) {
  const rarity = RARITY_LABELS[insect.rarity] ?? RARITY_LABELS.common;
  const [imgError, setImgError] = useState(false);

  return (
    <div
      onClick={onClick}
      role="button"
      tabIndex={onClick ? 0 : -1}
      onKeyDown={e => { if ((e.key === 'Enter' || e.key === ' ') && onClick) { e.preventDefault(); onClick(); } }}
      aria-label={owned ? insect.name : 'みつけていないむし'}
      className="rounded-xl overflow-hidden cursor-pointer select-none"
      style={{
        background: insect.bgColor,
        border: `2px solid ${rarity.color}`,
        boxShadow: `0 0 8px ${rarity.color}44`,
        transition: 'transform 0.15s',
      }}
      onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.04)'}
      onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
    >
      {/* Image area */}
      <div className="flex items-center justify-center" style={{ height: 80, padding: 8 }}>
        {owned && insect.imagePath && !imgError ? (
          <img
            src={insect.imagePath}
            alt={insect.name}
            loading="lazy"
            style={{ maxWidth: 64, maxHeight: 64, objectFit: 'contain' }}
            onError={() => setImgError(true)}
          />
        ) : (
          <div
            aria-label={owned ? insect.name : 'みつけていないむし'}
            role="img"
            style={{ filter: owned ? 'none' : 'brightness(0)', opacity: owned ? 1 : 0.7 }}
          >
            <InsectSilhouette size={64}/>
          </div>
        )}
      </div>

      {/* Label */}
      <div className="text-center pb-2 px-1">
        <div
          className="text-xs font-bold rounded px-1 inline-block mb-1"
          style={{ background: rarity.color, color: 'white' }}
        >
          {rarity.label}
        </div>
        <div
          className="text-xs font-bold truncate"
          style={{ color: insect.labelColor || '#1c1917' }}
        >
          {owned ? insect.name : '？？？'}
        </div>
        {owned && (
          <div className="text-xs opacity-70" style={{ color: insect.labelColor || '#1c1917' }}>
            {insect.origin}
          </div>
        )}
      </div>
    </div>
  );
}
