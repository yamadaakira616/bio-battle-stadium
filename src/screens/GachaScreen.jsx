import { useState, useEffect, useRef } from 'react';
import Confetti from '../components/Confetti.jsx';
import InsectCard from '../components/InsectCard.jsx';
import { rollGacha, DUPLICATE_COINS } from '../data/insects.js';
import { GACHA_COST } from '../utils/gameLogic.js';
import { playGachaTick, playGachaSlowTick, playGachaReveal, playGachaFlash } from '../utils/sound.js';

const RARITY_LABELS = { common:'ノーマル', rare:'レア', superRare:'スーパーレア！', ultra:'🔥 ULTRA!!! 🔥', legend:'👑 LEGEND ✨' };
const RARITY_COLORS = {
  common:    { bg:'#f3f4f6', text:'#6b7280', glow:'rgba(107,114,128,0.4)',    flash:'#e5e7eb' },
  rare:      { bg:'#dbeafe', text:'#1d4ed8', glow:'rgba(59,130,246,0.5)',     flash:'#bfdbfe' },
  superRare: { bg:'#f3e8ff', text:'#7c3aed', glow:'rgba(139,92,246,0.7)',     flash:'#e9d5ff' },
  ultra:     { bg:'#fef3c7', text:'#d97706', glow:'rgba(245,158,11,0.9)',     flash:'#fde68a' },
  legend:    { bg:'#0f0a1e', text:'#ffd700', glow:'rgba(255,215,0,1.0)',      flash:'#ffd700' },
};

// レアリティに応じたルーレット演出の長さ
const RARITY_DURATION = { common: 1500, rare: 2200, superRare: 3200, ultra: 4500, legend: 7000 };

const ROULETTE_SEQUENCE = ['common','rare','superRare','ultra','common','rare','superRare','ultra','legend','common','rare'];

export default function GachaScreen({ state, onBack, onPull }) {
  // phase: idle | spinning | slowdown | flash | reveal | result
  const [phase, setPhase] = useState('idle');
  const [result, setResult]   = useState(null);
  const [isNew, setIsNew]     = useState(false);
  const [rouletteIdx, setRouletteIdx] = useState(0);
  const [flashCount, setFlashCount]   = useState(0);
  const [rainbowIdx, setRainbowIdx]   = useState(0);
  const [screenFlash, setScreenFlash] = useState(false);
  const timerRef = useRef(null);
  const rouletteRef = useRef(null);

  const canPull = state.coins >= GACHA_COST;

  // クリーンアップ
  useEffect(() => () => { clearTimeout(timerRef.current); clearInterval(rouletteRef.current); }, []);

  function handlePull() {
    if (!canPull || phase !== 'idle') return;

    const insect = rollGacha();
    setResult(insect);

    // ルーレットスタート: 速く回る
    setPhase('spinning');
    let idx = 0;
    let speed = 80;
    const totalDuration = RARITY_DURATION[insect.rarity];
    const startTime = Date.now();

    function tick() {
      const elapsed = Date.now() - startTime;
      const progress = elapsed / totalDuration;

      // progressに応じてスピードを落とす
      if (progress < 0.6) {
        speed = 80;
      } else if (progress < 0.85) {
        speed = 80 + (progress - 0.6) / 0.25 * 220; // 80ms→300ms
      } else {
        speed = 300 + (progress - 0.85) / 0.15 * 500; // 300ms→800ms
      }

      if (elapsed >= totalDuration) {
        clearInterval(rouletteRef.current);
        // 最終的なレアリティに一致するインデックスで止める
        const finalIdx = ROULETTE_SEQUENCE.findIndex((r, i) => i >= idx % ROULETTE_SEQUENCE.length && r === insect.rarity)
          ?? ROULETTE_SEQUENCE.findIndex(r => r === insect.rarity);
        setRouletteIdx(finalIdx >= 0 ? finalIdx : idx);
        startFlash(insect);
        return;
      }

      idx = (idx + 1) % ROULETTE_SEQUENCE.length;
      setRouletteIdx(idx);
      if (progress < 0.7) playGachaTick(); else playGachaSlowTick();
      rouletteRef.current = setTimeout(tick, speed);
    }

    rouletteRef.current = setTimeout(tick, speed);
  }

  function startFlash(insect) {
    setPhase('flash');
    let count = 0;
    const maxFlash = insect.rarity === 'legend' ? 14 : insect.rarity === 'ultra' ? 8 : insect.rarity === 'superRare' ? 5 : insect.rarity === 'rare' ? 3 : 1;
    const flashInterval = insect.rarity === 'legend' ? 90 : insect.rarity === 'ultra' ? 120 : 150;

    const RAINBOW = ['#ff0040','#ff8c00','#ffd700','#00e676','#00b0ff','#7c4dff','#f50057'];
    function doFlash() {
      setScreenFlash(f => !f);
      if (insect.rarity === 'legend') setRainbowIdx(i => (i + 1) % RAINBOW.length);
      playGachaFlash();
      count++;
      if (count < maxFlash * 2) {
        timerRef.current = setTimeout(doFlash, flashInterval);
      } else {
        setScreenFlash(false);
        setPhase('reveal');
        playGachaReveal(insect.rarity);
        timerRef.current = setTimeout(() => {
          const { isNew: n } = onPull(insect);
          setIsNew(n);
          setPhase('result');
        }, 600);
      }
    }
    doFlash();
  }

  const currentRarity = ROULETTE_SEQUENCE[rouletteIdx % ROULETTE_SEQUENCE.length];
  const colors = result ? RARITY_COLORS[result.rarity] : RARITY_COLORS.common;
  const isHighRare = result && (result.rarity === 'ultra' || result.rarity === 'superRare' || result.rarity === 'legend');
  const isLegend = result?.rarity === 'legend';

  return (
    <div
      className="min-h-screen flex flex-col items-center relative overflow-hidden"
      style={{
        background: phase === 'result' && isLegend
          ? 'linear-gradient(135deg,#0f0a1e 0%,#1a0533 30%,#0a1628 60%,#0f0a1e 100%)'
          : phase === 'result'
          ? `linear-gradient(180deg, ${colors.bg} 0%, white 100%)`
          : 'linear-gradient(180deg,#1a0533 0%,#2d1b69 50%,#1a0533 100%)',
        transition: 'background 0.8s ease',
      }}
    >
      {/* 画面フラッシュオーバーレイ */}
      {screenFlash && (
        <div className="fixed inset-0 z-50 pointer-events-none"
             style={{
               background: isLegend
                 ? `linear-gradient(135deg,${['#ff0040','#ff8c00','#ffd700','#00e676','#00b0ff','#7c4dff','#f50057'][rainbowIdx]},${['#ff8c00','#ffd700','#00e676','#00b0ff','#7c4dff','#f50057','#ff0040'][rainbowIdx]})`
                 : colors.flash,
               opacity: 0.75,
             }}/>
      )}

      {/* 星パーティクル背景（演出中） */}
      {(phase === 'spinning' || phase === 'flash') && (
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <div key={i} className="absolute rounded-full animate-ping"
                 style={{
                   left: `${Math.random() * 100}%`,
                   top: `${Math.random() * 100}%`,
                   width: `${4 + Math.random() * 8}px`,
                   height: `${4 + Math.random() * 8}px`,
                   background: ['#f59e0b','#818cf8','#34d399','#f472b6','#60a5fa'][i % 5],
                   animationDuration: `${0.5 + Math.random() * 1.5}s`,
                   animationDelay: `${Math.random() * 1}s`,
                   opacity: 0.8,
                 }}/>
          ))}
        </div>
      )}

      {isNew && phase === 'result' && <Confetti active={true} />}

      {/* ヘッダー */}
      <div className="flex items-center gap-3 w-full p-4 z-10">
        <button onClick={onBack} aria-label="もどる" className="text-2xl"
                style={{ color: phase === 'result' ? '#1c1917' : '#fff' }}>←</button>
        <h2 className="text-xl font-black" style={{ color: phase === 'result' ? '#92400e' : '#fbbf24' }}>🎲 ガチャ</h2>
        <span className="ml-auto font-bold" style={{ color: phase === 'result' ? '#92400e' : '#fef3c7' }}>💰 {state.coins}</span>
      </div>

      {/* ===== IDLE フェーズ ===== */}
      {phase === 'idle' && (
        <div className="flex flex-col items-center flex-1 justify-center gap-8 z-10">
          {/* ガチャマシン */}
          <div className="relative">
            <svg width="220" height="260" viewBox="0 0 220 260">
              {/* 光のオーラ */}
              <ellipse cx="110" cy="130" rx="90" ry="100" fill="none"
                       stroke="#7c3aed" strokeWidth="2" opacity="0.3"/>
              <ellipse cx="110" cy="130" rx="70" ry="80" fill="none"
                       stroke="#a78bfa" strokeWidth="1" opacity="0.4"/>

              {/* マシン本体 */}
              <rect x="35" y="60" width="150" height="130" rx="18"
                    fill="url(#machineGrad)" filter="url(#glow)"/>
              <defs>
                <linearGradient id="machineGrad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#4c1d95"/>
                  <stop offset="100%" stopColor="#7c3aed"/>
                </linearGradient>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="3" result="blur"/>
                  <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
                </filter>
              </defs>
              <rect x="39" y="64" width="142" height="122" rx="16"
                    fill="#6d28d9" opacity="0.8"/>

              {/* ガラス球 */}
              <circle cx="110" cy="115" r="52" fill="#1e1b4b" opacity="0.9"/>
              <circle cx="110" cy="115" r="50" fill="none" stroke="#818cf8" strokeWidth="2"/>
              <ellipse cx="92" cy="95" rx="18" ry="12" fill="white" opacity="0.15"/>

              {/* カプセル */}
              <ellipse cx="110" cy="108" rx="24" ry="30" fill="#ef4444"/>
              <ellipse cx="110" cy="108" rx="24" ry="6" fill="#b91c1c"/>
              <ellipse cx="110" cy="138" rx="24" ry="30" fill="#fbbf24"/>
              <ellipse cx="110" cy="112" rx="10" ry="4" fill="white" opacity="0.3"/>

              {/* 投入口 */}
              <rect x="80" y="178" width="60" height="14" rx="7" fill="#4c1d95"/>
              <rect x="94" y="181" width="32" height="8" rx="4" fill="#3b1f76"/>

              {/* 星飾り */}
              {['✦','✦','✦'].map((s, i) => (
                <text key={i} x={50 + i * 60} y="55" fontSize="16" fill="#fbbf24" opacity="0.8"
                      textAnchor="middle">{s}</text>
              ))}
            </svg>
          </div>

          <button
            onClick={handlePull}
            disabled={!canPull}
            className="relative w-72 py-5 rounded-3xl text-xl font-black text-white shadow-2xl active:scale-95 transition-all disabled:opacity-50"
            style={{
              background: canPull
                ? 'linear-gradient(135deg,#f472b6,#ec4899,#db2777)'
                : '#4b5563',
              boxShadow: canPull ? '0 8px 32px rgba(236,72,153,0.6), 0 0 0 3px #fbbf24' : 'none',
            }}
          >
            <span className="relative z-10">🎲 ガチャを引く！</span>
            <div className="text-sm font-normal opacity-80">{GACHA_COST}コイン</div>
          </button>

          {!canPull && (
            <p className="text-yellow-300 font-bold text-sm">コインが足りません（あと{GACHA_COST - state.coins}コイン）</p>
          )}
        </div>
      )}

      {/* ===== SPINNING / FLASH フェーズ（ルーレット） ===== */}
      {(phase === 'spinning' || phase === 'flash') && (
        <div className="flex flex-col items-center flex-1 justify-center gap-6 z-10">
          <div className="text-white font-black text-2xl animate-pulse">🎲 ガチャ中...</div>

          {/* レアリティルーレット */}
          <div className="relative w-80 overflow-hidden rounded-3xl border-4 border-yellow-400"
               style={{ height: 100, background: 'rgba(0,0,0,0.6)' }}>
            {/* 中央の選択ライン */}
            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-12 border-y-2 border-yellow-400/60 z-10"
                 style={{ background: 'rgba(251,191,36,0.1)' }}/>

            <div className="absolute inset-0 flex items-center justify-center">
              <div
                className="flex flex-col items-center gap-2 transition-all"
                style={{ transform: `translateY(0)` }}
              >
                {ROULETTE_SEQUENCE.map((r, i) => {
                  const active = i === rouletteIdx % ROULETTE_SEQUENCE.length;
                  return (
                    <div key={i}
                         className="font-black text-center rounded-xl px-6 py-1 transition-all duration-75"
                         style={{
                           fontSize: active ? '1.6rem' : '1rem',
                           opacity: active ? 1 : 0.3,
                           color: RARITY_COLORS[r].text,
                           background: active ? RARITY_COLORS[r].bg : 'transparent',
                           transform: active ? 'scale(1.15)' : 'scale(0.85)',
                           display: Math.abs(i - (rouletteIdx % ROULETTE_SEQUENCE.length)) <= 1 ? 'block' : 'none',
                         }}>
                      {RARITY_LABELS[r]}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 揺れるカプセルアイコン */}
          <div className="text-8xl animate-bounce">🥚</div>

          <div className="text-yellow-300 text-sm font-bold animate-pulse">
            {phase === 'flash' ? '✨ 結果が出るよ！✨' : 'ドキドキ...'}
          </div>
        </div>
      )}

      {/* ===== REVEAL フェーズ（カード反転演出） ===== */}
      {phase === 'reveal' && result && (
        <div className="flex flex-col items-center flex-1 justify-center gap-6 z-10">
          <div className="text-6xl animate-spin" style={{ animationDuration: '0.5s' }}>🌟</div>
          <div className="font-black text-4xl animate-bounce"
               style={{ color: colors.text }}>
            {RARITY_LABELS[result.rarity]}
          </div>
          <div className="w-40 h-40 rounded-3xl animate-pulse"
               style={{ background: colors.bg, boxShadow: `0 0 40px ${colors.glow}` }}/>
        </div>
      )}

      {/* ===== RESULT フェーズ ===== */}
      {phase === 'result' && result && (
        <div className="flex flex-col items-center flex-1 gap-4 px-4 pt-2 pb-6 z-10 w-full max-w-sm mx-auto">

          {/* レアリティバナー */}
          <div className="w-full text-center py-3 rounded-2xl font-black text-2xl"
               style={{
                 background: colors.bg,
                 color: colors.text,
                 boxShadow: `0 0 20px ${colors.glow}`,
                 animation: 'scaleIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
               }}>
            {RARITY_LABELS[result.rarity]}
          </div>

          {/* ウルトラ演出: 特別な背景エフェクト */}
          {result.rarity === 'ultra' && (
            <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="absolute text-4xl animate-ping"
                     style={{
                       left: `${10 + i * 12}%`,
                       top: `${20 + (i % 3) * 25}%`,
                       animationDuration: `${1 + i * 0.2}s`,
                       animationDelay: `${i * 0.1}s`,
                     }}>
                  {['⭐','✨','🌟','💫'][i % 4]}
                </div>
              ))}
            </div>
          )}

          {/* レジェンド演出: 虹色の特別エフェクト */}
          {result.rarity === 'legend' && (
            <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
              {[...Array(16)].map((_, i) => (
                <div key={i} className="absolute text-3xl animate-ping"
                     style={{
                       left: `${5 + i * 6}%`,
                       top: `${10 + (i % 4) * 22}%`,
                       animationDuration: `${0.6 + i * 0.15}s`,
                       animationDelay: `${i * 0.05}s`,
                     }}>
                  {['👑','💎','✨','🌈','⚡','🔥','💫','🌟'][i % 8]}
                </div>
              ))}
              <div className="absolute inset-0 animate-pulse"
                   style={{ background: 'linear-gradient(45deg,rgba(255,0,64,0.1),rgba(255,215,0,0.1),rgba(0,230,118,0.1),rgba(124,77,255,0.1))', animationDuration: '0.8s' }}/>
            </div>
          )}

          {/* 昆虫カード */}
          <div className="relative flex justify-center"
               style={{ animation: 'bounceIn 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)' }}>
            {isHighRare && (
              <div className="absolute inset-0 rounded-3xl animate-pulse"
                   style={{ background: colors.glow, filter: 'blur(15px)', transform: 'scale(1.1)' }}/>
            )}
            <InsectCard insect={result} owned={true}/>
          </div>

          <h3 className="text-2xl font-black text-center">{result.name}</h3>
          <p className="text-sm text-gray-500">{result.nameEn}</p>
          <p className="text-sm text-gray-600">{result.origin} · {result.length}</p>

          {/* 入手結果 */}
          {isNew ? (
            <div className="w-full bg-green-50 border-2 border-green-400 rounded-2xl p-4 text-center"
                 style={{ animation: 'slideUp 0.4s ease 0.2s both' }}>
              <div className="text-2xl mb-1">🔍</div>
              <p className="text-green-700 font-black">ずかんに登録しました！</p>
              <p className="text-green-600 text-sm">{state.collection.length + 1}種類目をゲット！</p>
            </div>
          ) : (
            <div className="w-full bg-amber-50 border-2 border-amber-400 rounded-2xl p-4 text-center"
                 style={{ animation: 'slideUp 0.4s ease 0.2s both' }}>
              <div className="text-2xl mb-1">💫</div>
              <p className="text-amber-700 font-black">すでに入手済み！</p>
              <p className="text-amber-600 text-sm">コイン +{DUPLICATE_COINS} に変換しました</p>
            </div>
          )}

          {/* アクションボタン */}
          <div className="w-full flex flex-col gap-2 mt-2">
            {state.coins >= GACHA_COST ? (
              <button
                onClick={() => setPhase('idle')}
                className="w-full py-4 rounded-2xl text-white font-black text-lg active:scale-95 transition-transform"
                style={{ background: 'linear-gradient(135deg,#7c3aed,#4f46e5)', boxShadow: '0 4px 20px rgba(124,58,237,0.5)' }}>
                🎲 もう一度引く！
              </button>
            ) : (
              <button
                onClick={onBack}
                className="w-full py-4 rounded-2xl text-white font-black text-lg active:scale-95 transition-transform"
                style={{ background: 'linear-gradient(135deg,#f97316,#ea580c)' }}>
                コインをためよう！
              </button>
            )}
            <button
              onClick={onBack}
              className="w-full py-3 rounded-xl font-bold text-gray-600 bg-gray-100 active:scale-95 transition-transform">
              ホームにもどる
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes scaleIn {
          from { transform: scale(0.5); opacity: 0; }
          to   { transform: scale(1);   opacity: 1; }
        }
        @keyframes bounceIn {
          0%   { transform: scale(0.3) rotate(-10deg); opacity: 0; }
          60%  { transform: scale(1.1) rotate(3deg);  opacity: 1; }
          80%  { transform: scale(0.95); }
          100% { transform: scale(1) rotate(0deg); }
        }
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
      `}</style>
    </div>
  );
}
