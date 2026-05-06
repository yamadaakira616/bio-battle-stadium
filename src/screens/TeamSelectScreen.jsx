import { useState } from 'react';
import { STICKERS } from '../data/stickers.js';
import { getCardStats } from '../utils/battleEngine.js';

const SERIES_ORDER = ['bio', 'arms', 'armbio', 'corps', 'catsle'];
const SERIES_LABELS = {
  bio: '生物',
  arms: '武器',
  armbio: '武装生物',
  corps: '軍団',
  catsle: '城主',
};
const SERIES_COLORS = {
  bio: '#22c55e',
  arms: '#f59e0b',
  armbio: '#ef4444',
  corps: '#a855f7',
  catsle: '#d69e2e',
};
const STARTERS = {
  bio:    'bio-migratory-locust',
  arms:   'arm-medieval-crossbow',
  armbio: 'ab-mantis-with-emp',
  corps:  'cor-honeybee-mosquito-squadron',
  catsle: 'cas-white-lion-king',
};

const stickerMap = Object.fromEntries(STICKERS.map(s => [s.id, s]));

export default function TeamSelectScreen({ state, nation, onBack, onConfirm }) {
  const lastTeam = state.battleProgress?.teamIds || [];

  function getOwnedForSlot(series) {
    return STICKERS.filter(s =>
      (s.series === series || s.series === `legendary-${series}`) && (s.id in (state.collection || {}))
    );
  }

  function getInitialSelection() {
    const sel = {};
    SERIES_ORDER.forEach((series, idx) => {
      const owned = getOwnedForSlot(series);
      const lastCard = lastTeam[idx] ? stickerMap[lastTeam[idx]] : null;
      const validLast = lastCard && owned.find(c => c.id === lastCard.id);
      sel[series] = validLast ? lastCard.id : (owned[0]?.id || STARTERS[series]);
    });
    return sel;
  }

  const [selections, setSelections] = useState(getInitialSelection);

  function select(series, cardId) {
    setSelections(s => ({ ...s, [series]: cardId }));
  }

  function handleConfirm() {
    const teamIds = SERIES_ORDER.map(s => selections[s]).filter(Boolean);
    onConfirm(teamIds);
  }

  const missingCount = SERIES_ORDER.filter(s => !Object.keys(state.collection || {}).some(id => {
    const c = STICKERS.find(cc => cc.id === id);
    return c && (c.series === s || c.series === `legendary-${s}`);
  })).length;

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: '#080c16', color: '#fff' }}
    >
      {/* Header */}
      <div
        className="flex items-center gap-3 px-4 py-3 sticky top-0 z-10"
        style={{ background: 'rgba(8,12,22,0.95)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}
      >
        <button onClick={onBack} className="text-xl active:scale-90 transition-transform" style={{ color: '#64748b' }}>←</button>
        <div className="flex-1">
          <h1 className="font-black" style={{ fontSize: 16, color: '#e2e8f0' }}>チーム編成</h1>
          <div style={{ fontSize: 11, color: '#475569' }}>
            vs {nation.emoji} {nation.name}
          </div>
        </div>
      </div>

      {/* Team Preview */}
      <div className="px-4 py-3">
        <div className="rounded-2xl p-3 flex items-center gap-2" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
          {SERIES_ORDER.map(series => {
            const cardId = selections[series];
            const card = cardId ? stickerMap[cardId] : null;
            const color = SERIES_COLORS[series];
            const isOwned = card && (card.id in (state.collection || {}));
            return (
              <div key={series} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className="w-11 h-11 rounded-xl overflow-hidden"
                  style={{
                    border: `2px solid ${color}55`,
                    background: 'rgba(0,0,0,0.3)',
                    opacity: isOwned ? 1 : 0.5,
                  }}
                >
                  {card && <img src={card.imagePath} alt={card.name} className="w-full h-full object-contain" />}
                </div>
                {!isOwned && <div style={{ fontSize: 8, color: '#ef4444', fontWeight: 700 }}>弱</div>}
              </div>
            );
          })}
        </div>
      </div>

      {/* Series Sections */}
      <div className="flex-1 overflow-y-auto px-4 pb-8 flex flex-col gap-3">
        {SERIES_ORDER.map(series => {
          const owned = getOwnedForSlot(series);
          const selectedId = selections[series];
          const selectedCard = selectedId ? stickerMap[selectedId] : null;
          const selectedStats = selectedCard ? getCardStats(selectedCard, 1.0) : null;
          const color = SERIES_COLORS[series];
          const hasCards = owned.length > 0;

          return (
            <div
              key={series}
              className="rounded-2xl overflow-hidden"
              style={{
                background: 'rgba(255,255,255,0.02)',
                border: `1px solid ${hasCards ? color + '20' : 'rgba(255,255,255,0.04)'}`,
              }}
            >
              {/* Series Header */}
              <div className="px-4 py-2.5 flex items-center justify-between" style={{ borderBottom: `1px solid rgba(255,255,255,0.04)` }}>
                <div className="flex items-center gap-2">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ background: color }}
                  />
                  <span style={{ fontSize: 13, fontWeight: 800, color: '#e2e8f0' }}>
                    {SERIES_LABELS[series]}
                  </span>
                </div>
                <span style={{ fontSize: 11, fontWeight: 600, color: hasCards ? '#475569' : '#7f1d1d' }}>
                  {hasCards ? `${owned.length}枚` : '未所持'}
                </span>
              </div>

              {/* Warning for missing */}
              {!hasCards && (
                <div className="px-4 pt-2">
                  <div style={{
                    fontSize: 10, color: '#b91c1c',
                    padding: '4px 8px',
                    background: 'rgba(239,68,68,0.06)',
                    borderRadius: 6,
                    display: 'inline-block',
                  }}>
                    スターターで参戦（ステータス半減）
                  </div>
                </div>
              )}

              {/* Card Scroll */}
              {(() => {
              const pool = hasCards ? owned : [stickerMap[STARTERS[series]]].filter(Boolean);
              return (
              <div className="flex gap-2 p-3 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
                {pool.map(card => {
                  const isSelected = card.id === selectedId;
                  return (
                    <button
                      key={card.id}
                      onClick={() => select(series, card.id)}
                      className="flex-shrink-0 flex flex-col items-center gap-1 rounded-xl p-2 transition-all active:scale-95"
                      style={{
                        background: isSelected ? (card.legendary ? 'rgba(255,215,0,0.12)' : `${color}15`) : 'rgba(255,255,255,0.02)',
                        border: isSelected ? `2px solid ${card.legendary ? '#FFD700' : color}88` : `2px solid ${card.legendary ? 'rgba(255,215,0,0.25)' : 'transparent'}`,
                        minWidth: 72,
                      }}
                    >
                      <div className="w-14 h-14 rounded-xl overflow-hidden relative" style={{ background: 'rgba(0,0,0,0.25)' }}>
                        <img src={card.imagePath} alt={card.name} className="w-full h-full object-contain" />
                        {card.legendary && (
                          <div style={{ position:'absolute', bottom:1, right:1, fontSize:7, fontWeight:900, background:'#FFD700', color:'#000', borderRadius:3, padding:'1px 3px', lineHeight:1.2 }}>✨</div>
                        )}
                      </div>
                      <div style={{
                        fontSize: 10, fontWeight: 700, textAlign: 'center', lineHeight: 1.2,
                        color: isSelected ? '#e2e8f0' : '#64748b',
                        maxWidth: 64, wordBreak: 'break-word',
                      }}>
                        {card.name.length > 10 ? card.name.slice(0, 10) + '…' : card.name}
                      </div>
                    </button>
                  );
                })}
              </div>
              );
              })()}

              {/* Stats */}
              {selectedStats && (
                <div className="mx-3 mb-3 rounded-xl p-2.5 flex justify-around" style={{ background: 'rgba(0,0,0,0.2)' }}>
                  {[
                    { label: 'HP',  val: selectedStats.maxHp },
                    { label: 'ATK', val: selectedStats.atk },
                    { label: 'DEF', val: selectedStats.def },
                    { label: 'SPD', val: selectedStats.spd },
                  ].map(({ label, val }) => (
                    <div key={label} className="text-center">
                      <div style={{ fontSize: 13, fontWeight: 800, color }}>{val}</div>
                      <div style={{ fontSize: 9, color: '#475569', fontWeight: 600 }}>{label}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Bottom CTA */}
      <div className="px-4 pb-6 pt-3" style={{ background: 'rgba(8,12,22,0.95)', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
        {missingCount > 0 && (
          <div className="text-center mb-2" style={{ fontSize: 11, color: '#7f1d1d' }}>
            {missingCount}シリーズ未所持 — スターターで参戦
          </div>
        )}
        <button
          onClick={handleConfirm}
          className="w-full py-4 rounded-2xl font-black text-white active:scale-[0.97] transition-transform relative overflow-hidden"
          style={{
            background: 'linear-gradient(180deg, #3b82f6 0%, #1d4ed8 100%)',
            boxShadow: '0 5px 0 #1e3a8a, 0 8px 20px rgba(0,0,0,0.4)',
            fontSize: '1.1rem',
            border: 'none',
          }}
        >
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, height: '50%',
            background: 'linear-gradient(180deg, rgba(255,255,255,0.12) 0%, transparent 100%)',
            borderRadius: '16px 16px 0 0',
            pointerEvents: 'none',
          }} />
          <span className="relative">バトル開始！</span>
        </button>
      </div>
    </div>
  );
}
