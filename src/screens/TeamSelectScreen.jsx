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
  catsle: '#fbbf24',
};
// シリーズごとの最弱スターターカード（未所持時のフォールバック）
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

  function getInitialSelection() {
    const sel = {};
    SERIES_ORDER.forEach((series, idx) => {
      const owned = STICKERS.filter(s => s.series === series && state.collection.includes(s.id));
      const lastCard = lastTeam[idx] ? stickerMap[lastTeam[idx]] : null;
      const validLast = lastCard && owned.find(c => c.id === lastCard.id);
      // 所持カードがあればそこから、なければスターター
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

  const missingCount = SERIES_ORDER.filter(s => !state.collection.some(id => STICKERS.find(c => c.id === id && c.series === s))).length;

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: '#0a0f1e', color: '#fff' }}
    >
      {/* Header */}
      <div
        className="flex items-center gap-3 px-4 py-3 sticky top-0 z-10"
        style={{ background: 'rgba(10,15,30,0.97)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}
      >
        <button onClick={onBack} className="text-2xl active:scale-90 transition-transform">←</button>
        <div className="flex-1">
          <h1 className="text-lg font-black">チーム編成</h1>
          <div className="text-xs" style={{ color: '#94a3b8' }}>
            vs {nation.emoji} {nation.name}
          </div>
        </div>
        <button
          onClick={handleConfirm}
          className="px-4 py-2 rounded-xl font-black text-sm transition-all active:scale-95"
          style={{
            background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
            color: '#fff',
            boxShadow: '0 4px 16px rgba(59,130,246,0.4)',
          }}
        >
          ⚔️ 出陣！
        </button>
      </div>

      {/* Nation info */}
      <div
        className="mx-4 mt-3 mb-2 rounded-xl p-3 flex items-center gap-3"
        style={{ background: nation.bgGrad, border: `1px solid ${nation.color}44` }}
      >
        <span className="text-3xl">{nation.emoji}</span>
        <div>
          <div className="font-black">{nation.name}</div>
          <div className="text-xs flex items-center gap-1" style={{ color: '#cbd5e1' }}>
            難易度:
            {Array.from({ length: 8 }).map((_, i) => (
              <span key={i} style={{ color: i < nation.difficulty ? '#fbbf24' : 'rgba(255,255,255,0.2)' }}>★</span>
            ))}
          </div>
        </div>
        <div className="ml-auto text-right">
          <div className="text-xs" style={{ color: '#94a3b8' }}>勝利報酬</div>
          <div className="font-black" style={{ color: '#fbbf24' }}>🪙 {nation.reward}</div>
        </div>
      </div>

      {/* Team preview strip */}
      <div className="px-4 pb-2">
        <div className="rounded-xl p-3 flex items-center gap-2" style={{ background: 'rgba(255,255,255,0.05)' }}>
          <span className="text-xs font-bold mr-1" style={{ color: '#94a3b8' }}>選択中:</span>
          {SERIES_ORDER.map(series => {
            const cardId = selections[series];
            const card = cardId ? stickerMap[cardId] : null;
            return (
              <div key={series} className="flex-1 flex flex-col items-center">
                <div
                  className="w-10 h-10 rounded-lg overflow-hidden"
                  style={{ border: `2px solid ${SERIES_COLORS[series]}`, background: 'rgba(0,0,0,0.3)' }}
                >
                  {card && (
                    <img src={card.imagePath} alt={card.name} className="w-full h-full object-contain" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Series sections */}
      <div className="flex-1 overflow-y-auto px-4 pb-8 flex flex-col gap-4">
        {SERIES_ORDER.map(series => {
          const owned = STICKERS.filter(s => s.series === series && state.collection.includes(s.id));
          const selectedId = selections[series];
          const selectedCard = selectedId ? stickerMap[selectedId] : null;
          const selectedStats = selectedCard ? getCardStats(selectedCard, 1.0) : null;
          const color = SERIES_COLORS[series];
          const hasCards = owned.length > 0;

          return (
            <div
              key={series}
              className="rounded-2xl overflow-hidden"
              style={{ border: `1px solid ${hasCards ? color : '#ffffff22'}33`, background: 'rgba(255,255,255,0.03)' }}
            >
              {/* Series header */}
              <div
                className="px-4 py-2 flex items-center justify-between"
                style={{ background: `${color}18`, borderBottom: `1px solid ${color}22` }}
              >
                <div className="font-black text-sm flex items-center gap-1.5" style={{ color }}>
                  {!hasCards && <span style={{ color: '#ef4444' }}>⚠</span>}
                  {SERIES_LABELS[series]}
                </div>
                <div className="text-xs" style={{ color: hasCards ? '#94a3b8' : '#ef4444' }}>
                  {hasCards ? `${owned.length}枚所持` : '未所持'}
                </div>
              </div>

              {/* Card scroll */}
              {!hasCards && (
                <div className="px-4 pt-2 pb-1">
                  <div className="text-xs px-2 py-1 rounded-lg inline-block" style={{ background: 'rgba(239,68,68,0.15)', color: '#f87171' }}>
                    ⚠️ 未所持 — スターターカードで参戦（かなり弱い）
                  </div>
                </div>
              )}
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
                        background: isSelected ? `${color}22` : 'rgba(255,255,255,0.05)',
                        border: isSelected ? `2px solid ${color}` : '2px solid transparent',
                        boxShadow: isSelected ? `0 0 12px ${color}44` : 'none',
                        minWidth: 72,
                      }}
                    >
                      <div
                        className="w-14 h-14 rounded-lg overflow-hidden"
                        style={{ background: 'rgba(0,0,0,0.3)' }}
                      >
                        <img src={card.imagePath} alt={card.name} className="w-full h-full object-contain" />
                      </div>
                      <div
                        className="text-xs font-bold text-center leading-tight"
                        style={{ color: isSelected ? color : '#cbd5e1', maxWidth: 64, wordBreak: 'break-word' }}
                      >
                        {card.name.length > 10 ? card.name.slice(0, 10) + '…' : card.name}
                      </div>
                    </button>
                  );
                })}
              </div>
              );
              })()}

              {/* Selected card stats */}
              {selectedStats && (
                <div
                  className="mx-3 mb-3 rounded-xl p-3 grid grid-cols-4 gap-2"
                  style={{ background: 'rgba(0,0,0,0.25)', border: `1px solid ${color}22` }}
                >
                  {[
                    { label: 'HP',  val: selectedStats.maxHp, icon: '❤️' },
                    { label: 'ATK', val: selectedStats.atk,   icon: '⚔️' },
                    { label: 'DEF', val: selectedStats.def,   icon: '🛡️' },
                    { label: 'SPD', val: selectedStats.spd,   icon: '💨' },
                  ].map(({ label, val, icon }) => (
                    <div key={label} className="text-center">
                      <div className="text-sm">{icon}</div>
                      <div className="text-sm font-black" style={{ color }}>{val}</div>
                      <div className="text-xs" style={{ color: '#64748b' }}>{label}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Bottom CTA */}
      <div className="px-4 pb-6 pt-2" style={{ background: 'rgba(10,15,30,0.95)' }}>
        {missingCount > 0 && (
          <div className="text-center text-xs mb-2" style={{ color: '#f87171' }}>
            ⚠️ {missingCount}シリーズ未所持 — スターターカードで参戦（弱め）
          </div>
        )}
        <button
          onClick={handleConfirm}
          className="w-full py-4 rounded-2xl text-xl font-black text-white transition-all active:scale-95"
          style={{
            background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
            boxShadow: '0 8px 24px rgba(59,130,246,0.35)',
          }}
        >
          ⚔️ バトル開始！
        </button>
      </div>
    </div>
  );
}
