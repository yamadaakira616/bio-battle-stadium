import { useState, useEffect, useRef } from 'react';
import InsectCard from '../components/InsectCard.jsx';
import { INSECTS } from '../data/insects.js';

const TABS = [
  { key: 'common',    label: 'ノーマル' },
  { key: 'rare',      label: 'レア' },
  { key: 'superRare', label: 'SR' },
  { key: 'ultra',     label: 'ウルトラ' },
];

const RARITY_COLORS = {
  common: '#9ca3af', rare: '#3b82f6', superRare: '#a855f7', ultra: '#f59e0b',
};

export default function EncyclopediaScreen({ state, onBack }) {
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

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#f0fdf4' }}>
      {/* Header */}
      <div className="flex items-center gap-3 p-4 bg-green-700 text-white">
        <button onClick={onBack} aria-label="もどる" className="text-2xl">←</button>
        <h2 className="text-xl font-black">🔍 むしずかん</h2>
        <span className="ml-auto text-sm">{state.collection.length}/{INSECTS.length}しゅ</span>
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
            className="w-full max-w-sm rounded-t-3xl p-6 pb-10"
            style={{ background: detail.bgColor }}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-4">
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
                className="w-full h-40 object-contain mb-4 rounded-xl"/>
            )}

            <div className="space-y-2 text-sm" style={{ color: detail.labelColor || '#1c1917' }}>
              <div className="flex gap-2">
                <span className="font-bold w-16"><ruby>産地<rt>さんち</rt></ruby></span>
                <span>{detail.origin}</span>
              </div>
              <div className="flex gap-2">
                <span className="font-bold w-16"><ruby>体長<rt>たいちょう</rt></ruby></span>
                <span>{detail.length}</span>
              </div>
              <div className="mt-3 opacity-90 leading-relaxed">{detail.description}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
