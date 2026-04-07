import { useState, useEffect, useRef } from 'react';
import { STICKERS, SERIES } from '../data/stickers.js';
import { getCardStats, getLevelUpCost, MAX_CARD_LEVEL } from '../utils/battleEngine.js';

const LEGENDARY_TAB = { id: 'legendary', label: '✨ 伝説' };
const ALL_TABS = [...SERIES, LEGENDARY_TAB];

const SERIES_COLORS = {
  'bio':              '#22c55e',
  'arms':             '#f59e0b',
  'armbio':           '#ef4444',
  'corps':            '#a855f7',
  'catsle':           '#d69e2e',
  'legendary':        '#FFD700',
  'legendary-bio':    '#FFD700',
  'legendary-arms':   '#FFD700',
  'legendary-armbio': '#FFD700',
  'legendary-corps':  '#FFD700',
  'legendary-catsle': '#FFD700',
};

const SERIES_LABELS = {
  'bio':              '生物',
  'arms':             '武器',
  'armbio':           '武装生物',
  'corps':            '軍団',
  'catsle':           '城主',
  'legendary-bio':    '✨ 伝説の生物',
  'legendary-arms':   '✨ 伝説の武器',
  'legendary-armbio': '✨ 伝説の武装生物',
  'legendary-corps':  '✨ 伝説の軍団',
  'legendary-catsle': '✨ 伝説の城主',
};

export default function EncyclopediaScreen({ state, onBack, onUpgradeCard }) {
  const [tab, setTab] = useState('bio');
  const [detail, setDetail] = useState(null);
  const closeButtonRef = useRef(null);

  useEffect(() => {
    if (detail) closeButtonRef.current?.focus();
  }, [detail]);

  const stickers = tab === 'legendary'
    ? STICKERS.filter(s => s.legendary === true)
    : STICKERS.filter(s => s.series === tab || s.series === `legendary-${tab}`);
  const owned = id => state.collection.includes(id);

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#080c16', color: '#fff' }}>

      {/* Header */}
      <div
        className="flex items-center gap-3 px-4 py-3"
        style={{ background: 'rgba(8,12,22,0.95)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}
      >
        <button onClick={onBack} aria-label="もどる" className="text-xl" style={{ color: '#64748b' }}>←</button>
        <h2 className="text-lg font-black" style={{ color: '#e2e8f0' }}>カード図鑑</h2>
        <span className="ml-auto" style={{ fontSize: 12, color: '#475569' }}>
          {state.collection.length}/{STICKERS.length}
        </span>
        <div className="flex items-center gap-1 px-2.5 py-1 rounded-full" style={{ background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.15)' }}>
          <span style={{ fontSize: 12 }}>🪙</span>
          <span style={{ fontSize: 12, fontWeight: 800, color: '#fcd34d' }}>{state.coins}</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex px-3 pt-2 pb-1 gap-1 overflow-x-auto" style={{ background: 'rgba(255,255,255,0.02)' }}>
        {ALL_TABS.map(s => {
          const color = SERIES_COLORS[s.id] ?? '#FFD700';
          const isActive = tab === s.id;
          const ownedCount = s.id === 'legendary'
            ? STICKERS.filter(st => st.legendary && owned(st.id)).length
            : STICKERS.filter(st => (st.series === s.id || st.series === `legendary-${s.id}`) && owned(st.id)).length;
          const totalCount = s.id === 'legendary'
            ? STICKERS.filter(st => st.legendary).length
            : STICKERS.filter(st => st.series === s.id || st.series === `legendary-${s.id}`).length;
          return (
            <button
              key={s.id}
              onClick={() => setTab(s.id)}
              className="flex-1 py-2 rounded-xl text-center transition-all"
              style={{
                background: isActive ? `${color}15` : 'transparent',
                border: isActive ? `1px solid ${color}33` : '1px solid transparent',
              }}
            >
              <div style={{ fontSize: 11, fontWeight: 800, color: isActive ? color : '#475569' }}>
                {s.label}
              </div>
              <div style={{ fontSize: 9, fontWeight: 600, color: isActive ? `${color}aa` : '#334155' }}>
                {ownedCount}/{totalCount}
              </div>
            </button>
          );
        })}
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-y-auto p-3">
        <div className="grid grid-cols-3 gap-2.5">
          {stickers.map(sticker => {
            const isOwned = owned(sticker.id);
            const seriesColor = SERIES_COLORS[sticker.series] || '#64748b';
            const isLegendary = sticker.legendary === true;
            const cardLevel = state.cardLevels?.[sticker.id] || 1;

            const cardEl = isOwned ? (
              <button
                key={sticker.id}
                onClick={() => setDetail(sticker)}
                className="rounded-2xl overflow-hidden active:scale-95 transition-transform"
                style={{
                  background: isLegendary ? 'rgba(255,215,0,0.05)' : 'rgba(255,255,255,0.03)',
                  border: isLegendary ? '1px solid rgba(255,215,0,0.4)' : `1px solid ${seriesColor}25`,
                  aspectRatio: '1',
                  boxShadow: isLegendary ? '0 0 8px rgba(255,215,0,0.15)' : 'none',
                }}
              >
                <div className="flex flex-col items-center p-2 h-full relative">
                  {cardLevel > 1 && (
                    <div
                      className="absolute top-1 left-1 px-1.5 py-0.5 rounded-md"
                      style={{ background: `${seriesColor}25`, fontSize: 8, fontWeight: 800, color: seriesColor }}
                    >
                      Lv.{cardLevel}
                    </div>
                  )}
                  <img
                    src={sticker.imagePath}
                    alt={sticker.name}
                    style={{ flex: 1, width: '100%', objectFit: 'contain' }}
                  />
                  <div style={{ fontSize: 9, fontWeight: 700, color: '#94a3b8', textAlign: 'center', marginTop: 2, lineHeight: 1.2 }}>
                    {sticker.name.length > 10 ? sticker.name.slice(0, 10) + '…' : sticker.name}
                  </div>
                </div>
              </button>
            ) : (
              <div
                key={sticker.id}
                className="rounded-2xl overflow-hidden"
                style={{
                  background: 'rgba(255,255,255,0.015)',
                  border: '1px solid rgba(255,255,255,0.03)',
                  aspectRatio: '1',
                }}
              >
                <div className="flex flex-col items-center justify-center h-full">
                  <div style={{ fontSize: 24, opacity: 0.1 }}>?</div>
                </div>
              </div>
            );
            return cardEl;
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
          style={{ background: 'rgba(0,0,0,0.6)' }}
          onClick={() => setDetail(null)}
          onKeyDown={e => { if (e.key === 'Escape') setDetail(null); }}
        >
          <div
            className="w-full max-w-sm rounded-t-3xl p-5 pb-8"
            style={{ background: '#0f1420', border: '1px solid rgba(255,255,255,0.06)' }}
            onClick={e => e.stopPropagation()}
          >
            {/* Card Info Header */}
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-black" style={{ color: '#e2e8f0' }}>{detail.name}</h3>
                <div
                  className="mt-1 px-2 py-0.5 rounded-md inline-block"
                  style={{
                    background: `${SERIES_COLORS[detail.series]}12`,
                    border: `1px solid ${SERIES_COLORS[detail.series]}25`,
                    fontSize: 11, fontWeight: 700, color: SERIES_COLORS[detail.series],
                  }}
                >
                  {SERIES_LABELS[detail.series] ?? detail.series}
                </div>
              </div>
              <button ref={closeButtonRef} onClick={() => setDetail(null)} aria-label="とじる" style={{ fontSize: 18, color: '#475569' }}>✕</button>
            </div>

            {/* Card Image */}
            <div className="flex justify-center mb-4">
              <div
                className="rounded-2xl p-3"
                style={{ background: 'rgba(255,255,255,0.02)', border: `1px solid ${SERIES_COLORS[detail.series]}15` }}
              >
                <img
                  src={detail.imagePath}
                  alt={detail.name}
                  style={{ width: 120, height: 120, objectFit: 'contain' }}
                />
              </div>
            </div>

            {/* Level Up Section */}
            {(() => {
              const cardLv = state.cardLevels?.[detail.id] || 1;
              const isMax = cardLv >= MAX_CARD_LEVEL;
              const cost = getLevelUpCost(detail.series, cardLv) ?? 0;
              const canAfford = state.coins >= cost;
              const stats = getCardStats(detail, 1.0, cardLv);
              const nextStats = !isMax ? getCardStats(detail, 1.0, cardLv + 1) : null;
              const color = SERIES_COLORS[detail.series] || '#64748b';
              return (
                <div>
                  {/* Stats Grid */}
                  <div className="grid grid-cols-4 gap-2 mb-3">
                    {[
                      { label: 'HP',  cur: stats.maxHp, next: nextStats?.maxHp },
                      { label: 'ATK', cur: stats.atk,   next: nextStats?.atk },
                      { label: 'DEF', cur: stats.def,   next: nextStats?.def },
                      { label: 'SPD', cur: stats.spd,   next: nextStats?.spd },
                    ].map(({ label, cur, next }) => (
                      <div key={label} className="text-center rounded-xl p-2" style={{ background: 'rgba(255,255,255,0.03)' }}>
                        <div style={{ fontSize: 14, fontWeight: 800, color }}>{cur}</div>
                        {next && <div style={{ fontSize: 10, color: '#4ade80', fontWeight: 700 }}>+{next - cur}</div>}
                        <div style={{ fontSize: 9, color: '#475569', fontWeight: 600 }}>{label}</div>
                      </div>
                    ))}
                  </div>

                  {/* Level Bar */}
                  <div className="flex items-center gap-2 mb-3">
                    <span style={{ fontSize: 11, fontWeight: 800, color: '#64748b' }}>Lv</span>
                    <div className="flex gap-0.5 flex-1">
                      {Array.from({ length: MAX_CARD_LEVEL }).map((_, i) => (
                        <div key={i} className="flex-1 h-1.5 rounded-full"
                          style={{ background: i < cardLv ? color : 'rgba(255,255,255,0.06)' }} />
                      ))}
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 800, color }}>{cardLv}/{MAX_CARD_LEVEL}</span>
                  </div>

                  {/* Level Up Button */}
                  {isMax ? (
                    <div className="text-center py-2.5 rounded-xl" style={{ background: `${color}10`, border: `1px solid ${color}20` }}>
                      <span style={{ fontSize: 13, fontWeight: 800, color }}>MAX</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => { onUpgradeCard(detail.id, detail.series); }}
                      disabled={!canAfford}
                      className="w-full py-3 rounded-xl font-black text-white transition-all active:scale-[0.97] disabled:opacity-30 relative overflow-hidden"
                      style={{
                        background: canAfford ? `linear-gradient(180deg, ${color}, ${color}bb)` : 'rgba(255,255,255,0.05)',
                        boxShadow: canAfford ? `0 4px 0 ${color}44, 0 6px 12px rgba(0,0,0,0.3)` : 'none',
                        border: 'none',
                        fontSize: 14,
                      }}
                    >
                      {canAfford && (
                        <div style={{
                          position: 'absolute', top: 0, left: 0, right: 0, height: '50%',
                          background: 'linear-gradient(180deg, rgba(255,255,255,0.15) 0%, transparent 100%)',
                          borderRadius: '12px 12px 0 0', pointerEvents: 'none',
                        }} />
                      )}
                      <span className="relative">
                        Lv.{cardLv} → Lv.{cardLv + 1}
                        <span className="ml-2 text-sm font-bold opacity-80">🪙 {cost}</span>
                      </span>
                      {!canAfford && <div className="text-xs font-normal opacity-60 relative">コインが足りません</div>}
                    </button>
                  )}
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}
