import { useState } from 'react';
import Confetti from '../components/Confetti.jsx';
import InsectCard from '../components/InsectCard.jsx';
import { rollGacha, DUPLICATE_COINS } from '../data/insects.js';
import { GACHA_COST } from '../utils/gameLogic.js';

const RARITY_LABELS = { common:'ノーマル', rare:'レア', superRare:'スーパーレア', ultra:'ウルトラ！！' };
const RARITY_BG = { common:'#e5e7eb', rare:'#dbeafe', superRare:'#ede9fe', ultra:'#fef3c7' };

export default function GachaScreen({ state, onBack, onPull }) {
  const [phase, setPhase] = useState('idle'); // idle | shaking | result
  const [result, setResult] = useState(null);
  const [isNew, setIsNew] = useState(false);
  const [coinBonus, setCoinBonus] = useState(0);

  const canPull = state.coins >= GACHA_COST;

  function handlePull() {
    if (!canPull || phase !== 'idle') return;
    setPhase('shaking');
    setTimeout(() => {
      const insect = rollGacha();
      const { isNew: n, coinBonus: b } = onPull(insect);
      setResult(insect);
      setIsNew(n);
      setCoinBonus(b);
      setPhase('result');
    }, 1200);
  }

  return (
    <div className="min-h-screen flex flex-col items-center" style={{ background: 'linear-gradient(180deg,#fef3c7 0%,#fde68a 100%)' }}>
      {isNew && phase === 'result' && <Confetti active={true} />}

      {/* Header */}
      <div className="flex items-center gap-3 w-full p-4">
        <button onClick={onBack} className="text-2xl">←</button>
        <h2 className="text-xl font-black text-amber-900">🎲 ガチャ</h2>
        <span className="ml-auto font-bold text-amber-800">💰 {state.coins}</span>
      </div>

      {/* Capsule machine SVG */}
      <div className="my-6">
        <svg width="200" height="220" viewBox="0 0 200 220">
          {/* 土の中の演出 */}
          <rect x="0" y="150" width="200" height="70" fill="#92400e" rx="8"/>
          {[20,60,100,140,180].map(x => (
            <ellipse key={x} cx={x} cy={148} rx="12" ry="5" fill="#78350f" opacity="0.6"/>
          ))}

          {/* マシン本体 */}
          <rect x="40" y="60" width="120" height="100" rx="12" fill="#b45309"/>
          <rect x="44" y="64" width="112" height="92" rx="10" fill="#d97706"/>

          {/* ガラス球 */}
          <circle cx="100" cy="90" r="45" fill="#fed7aa" opacity="0.9"/>
          <circle cx="100" cy="90" r="43" fill="none" stroke="#f97316" strokeWidth="3"/>
          <ellipse cx="85" cy="72" rx="15" ry="10" fill="white" opacity="0.3"/>

          {/* カプセル（通常時） */}
          {phase === 'idle' && (
            <g>
              <ellipse cx="100" cy="88" rx="22" ry="28" fill="#ef4444"/>
              <ellipse cx="100" cy="88" rx="22" ry="5" fill="#b91c1c"/>
              <ellipse cx="100" cy="116" rx="22" ry="28" fill="#fbbf24"/>
            </g>
          )}

          {/* シェイクアニメ */}
          {phase === 'shaking' && (
            <g>
              <ellipse cx="100" cy="88" rx="22" ry="28" fill="#ef4444">
                <animateTransform attributeName="transform" type="translate"
                  values="0,0;-4,0;4,0;-4,0;4,0;0,0" dur="0.15s" repeatCount="8"/>
              </ellipse>
              <ellipse cx="100" cy="88" rx="22" ry="5" fill="#b91c1c">
                <animateTransform attributeName="transform" type="translate"
                  values="0,0;-4,0;4,0;-4,0;4,0;0,0" dur="0.15s" repeatCount="8"/>
              </ellipse>
              <ellipse cx="100" cy="116" rx="22" ry="28" fill="#fbbf24">
                <animateTransform attributeName="transform" type="translate"
                  values="0,0;-4,0;4,0;-4,0;4,0;0,0" dur="0.15s" repeatCount="8"/>
              </ellipse>
            </g>
          )}

          {/* 投入口 */}
          <rect x="75" y="148" width="50" height="12" rx="6" fill="#92400e"/>
          <rect x="88" y="150" width="24" height="8" rx="4" fill="#78350f"/>
        </svg>
      </div>

      {/* Pull button */}
      {phase !== 'result' && (
        <button
          onClick={handlePull}
          disabled={!canPull || phase === 'shaking'}
          className="w-64 py-4 rounded-2xl text-xl font-black text-white shadow-lg active:scale-95 transition-transform disabled:opacity-50"
          style={{ background: canPull ? 'linear-gradient(135deg,#f472b6,#ec4899)' : '#9ca3af' }}
        >
          {phase === 'shaking' ? '🎲 ガチャ中...' : `🎲 ガチャを引く！`}
          <div className="text-sm font-normal">{GACHA_COST}コイン</div>
        </button>
      )}

      {!canPull && phase === 'idle' && (
        <p className="text-red-600 font-bold text-sm mt-2">コインが足りません</p>
      )}

      {/* Result */}
      {phase === 'result' && result && (
        <div
          className="w-full max-w-sm mx-4 rounded-3xl p-6 text-center shadow-xl"
          style={{ background: RARITY_BG[result.rarity], animation: 'fadeInUp 0.4s ease' }}
        >
          <div className="text-2xl font-black mb-2"
            style={{ color: { common:'#6b7280',rare:'#1d4ed8',superRare:'#7c3aed',ultra:'#d97706' }[result.rarity] }}>
            {RARITY_LABELS[result.rarity]}
          </div>

          <div className="my-4 flex justify-center">
            <InsectCard insect={result} owned={true}/>
          </div>

          <h3 className="text-xl font-black mb-1">{result.name}</h3>
          <p className="text-sm text-gray-600 mb-1">{result.origin}</p>

          {isNew ? (
            <div className="mt-3 bg-green-100 rounded-xl p-3">
              <p className="text-green-700 font-bold">🔍 ずかんに登録しました！</p>
            </div>
          ) : (
            <div className="mt-3 bg-amber-100 rounded-xl p-3">
              <p className="text-amber-700 font-bold">すでに入手済み！</p>
              <p className="text-amber-600 text-sm">コイン +{DUPLICATE_COINS} に変換しました</p>
            </div>
          )}

          <button
            onClick={() => setPhase('idle')}
            className="mt-4 w-full py-3 rounded-xl text-white font-bold"
            style={{ background: 'linear-gradient(135deg,#60a5fa,#3b82f6)' }}
          >
            もう一度引く
          </button>
        </div>
      )}
    </div>
  );
}
