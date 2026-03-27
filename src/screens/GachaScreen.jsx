import { useState, useEffect, useRef } from 'react';
import Confetti from '../components/Confetti.jsx';
import { rollGacha, DUPLICATE_COINS, SERIES } from '../data/stickers.js';
import { GACHA_COST } from '../utils/gameLogic.js';
import { playGachaTick, playGachaSlowTick, playGachaReveal, playGachaFlash } from '../utils/sound.js';

// シリーズID順のルーレット表示
const ROULETTE_SEQUENCE = ['normal','bonbon-drop','marshmallow','shaka-shaka','water-seal','normal','bonbon-drop','marshmallow','normal','bonbon-drop','normal'];

const SERIES_COLORS = {
  'normal':      { bg:'#fce7f3', text:'#9d174d', glow:'rgba(236,72,153,0.4)', flash:'#fbcfe8' },
  'bonbon-drop': { bg:'#f5f3ff', text:'#6d28d9', glow:'rgba(139,92,246,0.5)', flash:'#ede9fe' },
  'marshmallow': { bg:'#fdf4ff', text:'#86198f', glow:'rgba(168,85,247,0.7)', flash:'#f0abfc' },
  'shaka-shaka': { bg:'#fef3c7', text:'#d97706', glow:'rgba(245,158,11,0.9)', flash:'#fde68a' },
  'water-seal':  { bg:'#e0f2fe', text:'#0369a1', glow:'rgba(14,165,233,0.9)', flash:'#bae6fd' },
};

const SERIES_LABELS = Object.fromEntries(SERIES.map(s => [s.id, s.label]));

// シリーズに応じたルーレット演出の長さ
const SERIES_DURATION = {
  'normal': 1500, 'bonbon-drop': 2200, 'marshmallow': 3200,
  'shaka-shaka': 4500, 'water-seal': 6000,
};

export default function GachaScreen({ state, onBack, onPull }) {
  // phase: idle | spinning | slowdown | flash | reveal | result
  const [phase, setPhase] = useState('idle');
  const [result, setResult]   = useState(null);
  const [isNew, setIsNew]     = useState(false);
  const [rouletteIdx, setRouletteIdx] = useState(0);
  const [screenFlash, setScreenFlash] = useState(false);
  const timerRef = useRef(null);
  const rouletteRef = useRef(null);

  const canPull = state.coins >= GACHA_COST;

  // クリーンアップ
  useEffect(() => () => { clearTimeout(timerRef.current); clearInterval(rouletteRef.current); }, []);

  function handlePull() {
    if (!canPull || phase !== 'idle') return;

    const sticker = rollGacha();
    setResult(sticker);

    // ルーレットスタート: 速く回る
    setPhase('spinning');
    let idx = 0;
    let speed = 80;
    const totalDuration = SERIES_DURATION[sticker.series] ?? 1500;
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
        // 最終的なシリーズに一致するインデックスで止める
        const forwardIdx = ROULETTE_SEQUENCE.findIndex((s, i) => i >= idx % ROULETTE_SEQUENCE.length && s === sticker.series);
        const finalIdx = forwardIdx >= 0 ? forwardIdx : ROULETTE_SEQUENCE.findIndex(s => s === sticker.series);
        setRouletteIdx(finalIdx >= 0 ? finalIdx : idx);
        startFlash(sticker);
        return;
      }

      idx = (idx + 1) % ROULETTE_SEQUENCE.length;
      setRouletteIdx(idx);
      if (progress < 0.7) playGachaTick(); else playGachaSlowTick();
      rouletteRef.current = setTimeout(tick, speed);
    }

    rouletteRef.current = setTimeout(tick, speed);
  }

  function startFlash(sticker) {
    setPhase('flash');
    let count = 0;
    const maxFlash = sticker.series === 'water-seal' ? 10 : sticker.series === 'shaka-shaka' ? 8 : sticker.series === 'marshmallow' ? 5 : sticker.series === 'bonbon-drop' ? 3 : 1;
    const flashInterval = sticker.series === 'water-seal' ? 90 : sticker.series === 'shaka-shaka' ? 120 : 150;

    const RAINBOW = ['#ff0040','#ff8c00','#ffd700','#00e676','#00b0ff','#7c4dff','#f50057'];
    function doFlash() {
      setScreenFlash(f => !f);
      playGachaFlash();
      count++;
      if (count < maxFlash * 2) {
        timerRef.current = setTimeout(doFlash, flashInterval);
      } else {
        setScreenFlash(false);
        setPhase('reveal');
        playGachaReveal('common');
        timerRef.current = setTimeout(() => {
          const { isNew: n } = onPull(sticker);
          setIsNew(n);
          setPhase('result');
        }, 600);
      }
    }
    doFlash();
  }

  const currentSeries = ROULETTE_SEQUENCE[rouletteIdx % ROULETTE_SEQUENCE.length];
  const colors = result ? (SERIES_COLORS[result.series] ?? SERIES_COLORS.normal) : SERIES_COLORS.normal;
  const isHighRare = result && (result.series === 'water-seal' || result.series === 'shaka-shaka');
  const isLegend = false;

  return (
    <div
      className="min-h-screen flex flex-col items-center relative overflow-hidden"
      style={{
        background: phase === 'result' && isLegend
          ? 'linear-gradient(135deg,#0f0a1e 0%,#1a0533 30%,#0a1628 60%,#0f0a1e 100%)'
          : phase === 'result'
          ? `linear-gradient(180deg, ${colors.bg} 0%, #fdf2f8 100%)`
          : 'linear-gradient(180deg,#2d0a3e 0%,#4a1260 50%,#2d0a3e 100%)',
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
        <h2 className="text-xl font-black" style={{ color: phase === 'result' ? '#9d174d' : '#f9a8d4' }}>🎀 ガチャ</h2>
        <span className="ml-auto font-bold" style={{ color: phase === 'result' ? '#9d174d' : '#fce7f3' }}>🪙 {state.coins}</span>
      </div>

      {/* ===== IDLE フェーズ ===== */}
      {phase === 'idle' && (
        <div className="flex flex-col items-center flex-1 justify-center gap-8 z-10">
          {/* ガチャマシン */}
          <div className="relative">
            <svg width="220" height="260" viewBox="0 0 220 260">
              {/* 光のオーラ */}
              <ellipse cx="110" cy="130" rx="90" ry="100" fill="none"
                       stroke="#f9a8d4" strokeWidth="2" opacity="0.5"/>
              <ellipse cx="110" cy="130" rx="70" ry="80" fill="none"
                       stroke="#f472b6" strokeWidth="1" opacity="0.4"/>

              {/* マシン本体 */}
              <rect x="35" y="60" width="150" height="130" rx="18"
                    fill="url(#machineGradPink)" filter="url(#glowPink)"/>
              <defs>
                <linearGradient id="machineGradPink" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#be185d"/>
                  <stop offset="100%" stopColor="#ec4899"/>
                </linearGradient>
                <filter id="glowPink">
                  <feGaussianBlur stdDeviation="4" result="blur"/>
                  <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
                </filter>
              </defs>
              <rect x="39" y="64" width="142" height="122" rx="16"
                    fill="#db2777" opacity="0.8"/>

              {/* ガラス球 */}
              <circle cx="110" cy="115" r="52" fill="#4a0020" opacity="0.9"/>
              <circle cx="110" cy="115" r="50" fill="none" stroke="#f9a8d4" strokeWidth="2"/>
              <ellipse cx="92" cy="95" rx="18" ry="12" fill="white" opacity="0.2"/>

              {/* カプセル */}
              <ellipse cx="110" cy="108" rx="24" ry="30" fill="#f9a8d4"/>
              <ellipse cx="110" cy="108" rx="24" ry="6" fill="#ec4899"/>
              <ellipse cx="110" cy="138" rx="24" ry="30" fill="#fce7f3"/>
              <ellipse cx="110" cy="112" rx="10" ry="4" fill="white" opacity="0.4"/>

              {/* 投入口 */}
              <rect x="80" y="178" width="60" height="14" rx="7" fill="#9d174d"/>
              <rect x="94" y="181" width="32" height="8" rx="4" fill="#831843"/>

              {/* ハート飾り */}
              {['💕','✨','💕'].map((s, i) => (
                <text key={i} x={50 + i * 60} y="55" fontSize="16" textAnchor="middle">{s}</text>
              ))}
            </svg>
          </div>

          <button
            onClick={handlePull}
            disabled={!canPull}
            className="relative w-72 py-5 rounded-3xl text-xl font-black text-white shadow-2xl active:scale-95 transition-all disabled:opacity-50"
            style={{
              background: canPull
                ? 'linear-gradient(135deg,#fb7185,#f43f5e,#e11d48)'
                : '#9ca3af',
              boxShadow: canPull ? '0 8px 32px rgba(244,63,94,0.6), 0 0 0 3px #f9a8d4' : 'none',
            }}
          >
            <span className="relative z-10">🎀 ガチャを引く！</span>
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
          <div className="text-white font-black text-2xl animate-pulse">🎀 ガチャ中...</div>

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
                {ROULETTE_SEQUENCE.map((s, i) => {
                  const active = i === rouletteIdx % ROULETTE_SEQUENCE.length;
                  const sc = SERIES_COLORS[s] ?? SERIES_COLORS.normal;
                  return (
                    <div key={i}
                         className="font-black text-center rounded-xl px-6 py-1 transition-all duration-75"
                         style={{
                           fontSize: active ? '1.6rem' : '1rem',
                           opacity: active ? 1 : 0.3,
                           color: sc.text,
                           background: active ? sc.bg : 'transparent',
                           transform: active ? 'scale(1.15)' : 'scale(0.85)',
                           display: Math.abs(i - (rouletteIdx % ROULETTE_SEQUENCE.length)) <= 1 ? 'block' : 'none',
                         }}>
                      {SERIES_LABELS[s]}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 揺れるカプセルアイコン */}
          <div className="text-8xl animate-bounce">🎀</div>

          <div className="text-pink-300 text-sm font-bold animate-pulse">
            {phase === 'flash' ? '💕 シールが出るよ！💕' : 'ドキドキ...'}
          </div>
        </div>
      )}

      {/* ===== REVEAL フェーズ（カード反転演出） ===== */}
      {phase === 'reveal' && result && (
        <div className="flex flex-col items-center flex-1 justify-center gap-6 z-10">
          <div className="text-6xl animate-spin" style={{ animationDuration: '0.5s' }}>🌟</div>
          <div className="font-black text-4xl animate-bounce"
               style={{ color: colors.text }}>
            {SERIES_LABELS[result.series]}
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
            {SERIES_LABELS[result.series]}
          </div>

          {isHighRare && (
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

          {/* シール画像 */}
          <div className="relative flex justify-center"
               style={{ animation: 'bounceIn 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)' }}>
            {isHighRare && (
              <div className="absolute inset-0 rounded-3xl animate-pulse"
                   style={{ background: colors.glow, filter: 'blur(15px)', transform: 'scale(1.1)' }}/>
            )}
            <div className="rounded-3xl overflow-hidden shadow-xl"
                 style={{ width: 160, height: 160, background: colors.bg }}>
              <img
                src={result.imagePath}
                alt={result.name}
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              />
            </div>
          </div>

          <h3 className="text-2xl font-black text-center">{result.name}</h3>
          <p className="text-sm text-gray-500">{SERIES_LABELS[result.series]}</p>

          {/* 入手結果 */}
          {isNew ? (
            <div className="w-full bg-green-50 border-2 border-green-400 rounded-2xl p-4 text-center"
                 style={{ animation: 'slideUp 0.4s ease 0.2s both' }}>
              <div className="text-2xl mb-1">🔍</div>
              <p className="text-green-700 font-black">シールずかんに登録しました！</p>
              <p className="text-green-600 text-sm">{state.collection.length + 1}まい目をゲット！</p>
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
                style={{ background: 'linear-gradient(135deg,#f472b6,#ec4899)', boxShadow: '0 4px 20px rgba(236,72,153,0.5)' }}>
                🎀 もう一度引く！
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
