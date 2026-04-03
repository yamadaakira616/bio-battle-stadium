import { useState, useEffect, useRef } from 'react';
import { STICKERS, SERIES } from '../data/stickers.js';

const SERIES_COLORS = {
  'bio':    '#22c55e',
  'arms':   '#f59e0b',
  'armbio': '#ef4444',
  'corps':  '#a855f7',
  'catsle': '#fbbf24',
};

export default function EncyclopediaScreen({ state, onBack }) {
  const [tab, setTab] = useState('bio');
  const [detail, setDetail] = useState(null);
  const closeButtonRef = useRef(null);

  useEffect(() => {
    if (detail) closeButtonRef.current?.focus();
  }, [detail]);

  const stickers = STICKERS.filter(s => s.series === tab);
  const owned = id => state.collection.includes(id);

  return (
    <div className="min-h-screen flex flex-col"
         style={{ background: '#0a0f1e', color: '#fff' }}>

      {/* Header */}
      <div className="flex items-center gap-3 p-4 text-white"
           style={{ background: 'linear-gradient(135deg, #1e3a5f, #1d4ed8)' }}>
        <button onClick={onBack} aria-label="もどる" className="text-2xl">←</button>
        <h2 className="text-xl font-black">📖 カード図鑑</h2>
        <span className="ml-auto text-sm">
          {state.collection.length}/{STICKERS.length}枚
        </span>
        <span className="font-bold text-sm">🪙 {state.coins}</span>
      </div>

      {/* Tabs */}
      <div className="flex overflow-x-auto border-b" style={{ borderColor: 'rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.03)' }}>
        {SERIES.map(s => {
          const color = SERIES_COLORS[s.id];
          const ownedCount = STICKERS.filter(st => st.series === s.id && owned(st.id)).length;
          const totalCount = STICKERS.filter(st => st.series === s.id).length;
          return (
            <button
              key={s.id}
              onClick={() => setTab(s.id)}
              className="flex-shrink-0 px-3 py-3 text-xs font-bold transition-colors"
              style={{
                color: tab === s.id ? color : '#64748b',
                borderBottom: tab === s.id ? `3px solid ${color}` : '3px solid transparent',
                background: tab === s.id ? `${color}18` : 'transparent',
              }}
            >
              {s.label}
              <div className="text-xs font-normal">{ownedCount}/{totalCount}</div>
            </button>
          );
        })}
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-y-auto p-3">
        <div className="grid grid-cols-3 gap-3">
          {stickers.map(sticker => {
            const isOwned = owned(sticker.id);
            const seriesColor = SERIES_COLORS[sticker.series] || '#64748b';
            const cardStyle = {
              background: isOwned ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.03)',
              border: isOwned ? `2px solid ${seriesColor}55` : '2px solid rgba(255,255,255,0.08)',
              aspectRatio: '1',
            };
            const cardContent = isOwned ? (
              <div className="flex flex-col items-center p-2 h-full">
                <img
                  src={sticker.imagePath}
                  alt={sticker.name}
                  style={{ flex: 1, width: '100%', objectFit: 'contain' }}
                />
                <div className="text-xs font-bold text-center mt-1 leading-tight"
                     style={{ color: '#cbd5e1', fontSize: '0.6rem' }}>
                  {sticker.name}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full gap-1">
                <div className="text-3xl opacity-20">⚔️</div>
                <div className="text-xs font-bold" style={{ color: '#334155' }}>？？？</div>
              </div>
            );
            return isOwned ? (
              <button
                key={sticker.id}
                onClick={() => setDetail(sticker)}
                className="rounded-2xl overflow-hidden shadow active:scale-95 transition-transform"
                style={cardStyle}
              >
                {cardContent}
              </button>
            ) : (
              <div
                key={sticker.id}
                className="rounded-2xl overflow-hidden shadow"
                style={cardStyle}
              >
                {cardContent}
              </div>
            );
          })}
        </div>
      </div>

      {/* Detail Modal */}
      {detail && (
        <div
          role="dialog"
          aria-modal="true"
          tabIndex="-1"
          className="fixed inset-0 flex items-end justify-center z-50"
          style={{ background: 'rgba(0,0,0,0.5)' }}
          onClick={() => setDetail(null)}
          onKeyDown={e => { if (e.key === 'Escape') setDetail(null); }}
        >
          <div
            className="w-full max-w-sm rounded-t-3xl p-5 pb-8"
            style={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)' }}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-black text-white">{detail.name}</h3>
                <div className="text-xs mt-1 px-2 py-0.5 rounded-full inline-block"
                     style={{ background: `${SERIES_COLORS[detail.series]}25`, color: SERIES_COLORS[detail.series] }}>
                  {SERIES.find(s => s.id === detail.series)?.label}
                </div>
              </div>
              <button ref={closeButtonRef} onClick={() => setDetail(null)} aria-label="とじる" className="text-2xl opacity-50 text-white">✕</button>
            </div>
            <div className="flex justify-center mb-4">
              <img
                src={detail.imagePath}
                alt={detail.name}
                style={{ width: 160, height: 160, objectFit: 'contain' }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
