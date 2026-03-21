import { useState, useEffect, useRef } from 'react';
import InsectCard from '../components/InsectCard.jsx';
import { INSECTS } from '../data/insects.js';
import { getInsectStats, getTrainCost, MAX_INSECT_LEVEL } from '../utils/battleLogic.js';

const TABS = [
  { key: 'common',    label: 'ノーマル' },
  { key: 'rare',      label: 'レア' },
  { key: 'superRare', label: 'SR' },
  { key: 'ultra',     label: 'ウルトラ' },
  { key: 'legend',    label: '👑 LG' },
  { key: 'battle',    label: '⚔️ バトル' },
];

const RARITY_COLORS = {
  common: '#9ca3af', rare: '#3b82f6', superRare: '#a855f7', ultra: '#f59e0b', legend: '#ffd700', battle: '#0f766e',
};

export default function EncyclopediaScreen({ state, onBack, onTrain, onSpendCoins }) {
  const [tab, setTab] = useState('common');
  const [detail, setDetail] = useState(null);
  const closeButtonRef = useRef(null);

  useEffect(() => {
    if (detail && closeButtonRef.current) {
      closeButtonRef.current.focus();
    }
  }, [detail]);

  const insects = INSECTS.filter(i => i.rarity === tab);
  const owned = id => state.collection.includes(id);

  function handleTrain(insect) {
    const currentLevel = state.insectLevels?.[insect.id] ?? 1;
    if (currentLevel >= MAX_INSECT_LEVEL) return;
    const cost = getTrainCost(insect, currentLevel);
    if (state.coins < cost) return;
    onTrain(insect.id, cost);
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#f0fdf4' }}>
      {/* Header */}
      <div className="flex items-center gap-3 p-4 bg-green-700 text-white">
        <button onClick={onBack} aria-label="もどる" className="text-2xl">←</button>
        <h2 className="text-xl font-black">🔍 むしずかん</h2>
        <span className="ml-auto text-sm">{state.collection.length}/{INSECTS.length}しゅ</span>
        <span className="text-yellow-300 font-bold text-sm">💰 {state.coins}</span>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-green-200 bg-white">
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className="flex-1 py-3 text-sm font-bold transition-colors"
            style={{
              color: tab === t.key ? RARITY_COLORS[t.key] : '#6b7280',
              borderBottom: tab === t.key ? `3px solid ${RARITY_COLORS[t.key]}` : '3px solid transparent',
            }}
          >
            {t.label}
            <div className="text-xs font-normal">
              {INSECTS.filter(i => i.rarity === t.key && owned(i.id)).length}/
              {INSECTS.filter(i => i.rarity === t.key).length}
            </div>
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-y-auto p-3">
        <div className="grid grid-cols-3 gap-2">
          {insects.map(ins => (
            <InsectCard
              key={ins.id}
              insect={ins}
              owned={owned(ins.id)}
              insectLevel={state.insectLevels?.[ins.id] ?? 1}
              onClick={() => owned(ins.id) && setDetail(ins)}
            />
          ))}
        </div>
      </div>

      {/* Detail Modal */}
      {detail && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 bg-black/60 flex items-end justify-center z-50"
          onClick={() => setDetail(null)}
          onKeyDown={e => { if (e.key === 'Escape') setDetail(null); }}
        >
          <div
            className="w-full max-w-sm rounded-t-3xl p-5 pb-8"
            style={{ background: detail.bgColor }}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="text-xl font-black" style={{ color: detail.labelColor || '#1c1917' }}>
                  {detail.name}
                </h3>
                <div className="text-xs italic opacity-70" style={{ color: detail.labelColor || '#1c1917' }}>
                  {detail.nameEn}
                </div>
              </div>
              <button
                ref={closeButtonRef}
                onClick={() => setDetail(null)}
                aria-label="とじる"
                className="text-2xl opacity-70"
              >✕</button>
            </div>

            {detail.imagePath && (
              <img src={detail.imagePath} alt={detail.name}
                className="w-full h-36 object-contain mb-3 rounded-xl"/>
            )}

            <div className="space-y-1.5 text-sm mb-4" style={{ color: detail.labelColor || '#1c1917' }}>
              <div className="flex gap-2">
                <span className="font-bold w-16"><ruby>産地<rt>さんち</rt></ruby></span>
                <span>{detail.origin}</span>
              </div>
              <div className="flex gap-2">
                <span className="font-bold w-16"><ruby>体長<rt>たいちょう</rt></ruby></span>
                <span>{detail.length}</span>
              </div>
              <div className="mt-2 opacity-90 leading-relaxed text-xs">{detail.description}</div>
            </div>

            {/* 育成パネル */}
            {(() => {
              const currentLevel = state.insectLevels?.[detail.id] ?? 1;
              const cost = getTrainCost(detail, currentLevel);
              const stats = getInsectStats(detail, currentLevel);
              const canAfford = state.coins >= cost;
              const maxed = currentLevel >= MAX_INSECT_LEVEL;

              return (
                <div className="bg-white/20 rounded-2xl p-3">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-black text-sm" style={{ color: detail.labelColor || '#1c1917' }}>
                      🔧 育成 Lv.{currentLevel}{maxed ? ' (MAX)' : ''}
                    </span>
                    <div className="flex gap-2 text-xs font-bold" style={{ color: detail.labelColor || '#78350f' }}>
                      <span>❤️{stats.hp}</span>
                      <span>⚔️{stats.atk}</span>
                      <span>💨{stats.spd}</span>
                    </div>
                  </div>
                  {/* レベルゲージ */}
                  <div className="w-full h-2 bg-black/10 rounded-full mb-3 overflow-hidden">
                    <div className="h-full rounded-full bg-yellow-400 transition-all"
                         style={{ width: `${(currentLevel / MAX_INSECT_LEVEL) * 100}%` }}/>
                  </div>
                  {!maxed && (
                    <button
                      onClick={() => handleTrain(detail)}
                      disabled={!canAfford}
                      className="w-full py-2 rounded-xl font-black text-white text-sm active:scale-95 transition-transform disabled:opacity-40"
                      style={{ background: canAfford ? 'linear-gradient(135deg,#7c3aed,#4f46e5)' : '#6b7280' }}>
                      💰 {cost}コインでLv UP！
                      {!canAfford && <span className="text-xs ml-1">(あと{cost - state.coins}コイン)</span>}
                    </button>
                  )}
                  {maxed && (
                    <div className="text-center font-black text-yellow-500 text-sm">✨ MAXレベル達成！</div>
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
