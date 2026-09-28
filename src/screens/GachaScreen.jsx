import { useState, useEffect, useRef } from 'react';
import Confetti from '../components/Confetti.jsx';
import { rollGacha, rollGachaLegend, isLegendaryConfirm, STICKERS, SERIES } from '../data/stickers.js';
import { GACHA_COST } from '../utils/gameLogic.js';
import { playGachaTick, playGachaSlowTick, playGachaReveal, playGachaFlash } from '../utils/sound.js';
import '../gacha-upgrade.css';

// ===== エフェクト定義 =====
const FX_PLAIN     = 0; // 普通
const FX_CUTIN     = 1; // カットイン
const FX_REACH     = 2; // リーチ
const FX_BEAM      = 3; // ビーム
const FX_EXPLOSION = 4; // 爆発
const FX_RAINBOW   = 5; // レインボー
const FX_COSMIC    = 6; // コズミック
const FX_LEGEND    = 7; // LEGEND確定（0.8%）★城主確定

// シリーズ別エフェクト確率 [PLAIN, CUTIN, REACH, BEAM, EXPLOSION, RAINBOW, COSMIC]
// レアリティが上がるほど派手なエフェクト
const EFFECT_WEIGHTS = {
  'bio':    [96,  2,  1,  1,  0,  0,  0],  //  4% 演出あり（よくある）
  'arms':   [88,  6,  4,  2,  0,  0,  0],  // 12% 演出あり
  'armbio': [72,  9,  9,  6,  4,  0,  0],  // 28% 演出あり
  'corps':  [38, 18, 20, 14,  8,  2,  0],  // 62% 演出あり
  'catsle': [ 8, 12, 18, 24, 20, 15,  3],  // 92% 演出あり（激レア）
  // Legendary: 常にFX_LEGEND（確定演出）
  'legendary-bio':    [0, 0, 0, 0, 0, 0, 0],
  'legendary-arms':   [0, 0, 0, 0, 0, 0, 0],
  'legendary-armbio': [0, 0, 0, 0, 0, 0, 0],
  'legendary-corps':  [0, 0, 0, 0, 0, 0, 0],
  'legendary-catsle': [0, 0, 0, 0, 0, 0, 0],
};

const REVEAL_SFX = {
  'bio': 'common', 'arms': 'rare', 'armbio': 'superRare',
  'corps': 'ultra', 'catsle': 'legend',
  'legendary-bio': 'legend', 'legendary-arms': 'legend',
  'legendary-armbio': 'legend', 'legendary-corps': 'legend', 'legendary-catsle': 'legend',
};

function weightedRandom(weights) {
  const total = weights.reduce((a, b) => a + b, 0);
  let r = Math.random() * total;
  for (let i = 0; i < weights.length; i++) {
    r -= weights[i];
    if (r <= 0) return i;
  }
  return weights.length - 1;
}

function pickEffect(series) {
  return weightedRandom(EFFECT_WEIGHTS[series] ?? EFFECT_WEIGHTS['bio']);
}

// ルーレット表示シーケンス（bioが多め → 確率に沿った体感）
const ROULETTE_SEQ = [
  'bio','arms','armbio','corps','bio','arms','armbio','bio','arms','bio','bio',
];

const SERIES_COLORS = {
  'bio':    { bg:'#f0fdf4', text:'#166534', glow:'rgba(34,197,94,0.5)',   flash:'#bbf7d0' },
  'arms':   { bg:'#fffbeb', text:'#92400e', glow:'rgba(245,158,11,0.6)', flash:'#fde68a' },
  'armbio': { bg:'#fff7ed', text:'#9a3412', glow:'rgba(234,88,12,0.7)',  flash:'#fed7aa' },
  'corps':  { bg:'#faf5ff', text:'#6b21a8', glow:'rgba(147,51,234,0.8)', flash:'#e9d5ff' },
  'catsle': { bg:'#fefce8', text:'#713f12', glow:'rgba(234,179,8,1)',    flash:'#fef08a' },
  // Legendary: ゴールド×ピンクのグラデーション
  'legendary-bio':    { bg:'linear-gradient(135deg,#fef9c3,#fce7f3)', text:'#7c3aed', glow:'rgba(255,215,0,0.9)', flash:'#fef08a' },
  'legendary-arms':   { bg:'linear-gradient(135deg,#fef9c3,#fce7f3)', text:'#7c3aed', glow:'rgba(255,215,0,0.9)', flash:'#fef08a' },
  'legendary-armbio': { bg:'linear-gradient(135deg,#fef9c3,#fce7f3)', text:'#7c3aed', glow:'rgba(255,215,0,0.9)', flash:'#fef08a' },
  'legendary-corps':  { bg:'linear-gradient(135deg,#fef9c3,#fce7f3)', text:'#7c3aed', glow:'rgba(255,215,0,0.9)', flash:'#fef08a' },
  'legendary-catsle': { bg:'linear-gradient(135deg,#fef9c3,#fce7f3)', text:'#7c3aed', glow:'rgba(255,215,0,0.9)', flash:'#fef08a' },
};

const SERIES_LABELS = {
  ...Object.fromEntries(SERIES.map(s => [s.id, s.label])),
  'legendary-bio':    '✨ 伝説の生物',
  'legendary-arms':   '✨ 伝説の武器',
  'legendary-armbio': '✨ 伝説の武装生物',
  'legendary-corps':  '✨ 伝説の軍団',
  'legendary-catsle': '✨ 伝説の城主',
};

const SPIN_DURATION = {
  'bio': 1500, 'arms': 2200, 'armbio': 3200, 'corps': 4200, 'catsle': 5500,
};

const RAINBOW_COLORS = ['#ef4444','#f97316','#eab308','#22c55e','#3b82f6','#8b5cf6','#ec4899'];

function genParticles() {
  return Array.from({ length: 20 }, (_, i) => {
    const angle = (i / 20) * Math.PI * 2;
    const dist = 55 + Math.random() * 80;
    return {
      id: i,
      dx: Math.cos(angle) * dist,
      dy: Math.sin(angle) * dist,
      color: ['#f59e0b','#818cf8','#34d399','#f472b6','#60a5fa','#fb7185','#a78bfa'][i % 7],
      size: 8 + Math.random() * 10,
    };
  });
}

// ===== メインコンポーネント =====
export default function GachaScreen({ state, onBack, onPull }) {
  // phase: idle | legend | cutin | spinning | reach | flash | reveal | result
  const [phase, setPhase]               = useState('idle');
  const [result, setResult]             = useState(null);
  const [resultMeta, setResultMeta]     = useState(null);
  const [isNew, setIsNew]               = useState(false);
  const [effect, setEffect]             = useState(FX_PLAIN);
  const [isLegend, setIsLegend]         = useState(false);
  const [rouletteIdx, setRouletteIdx]   = useState(0);
  const [screenFlash, setScreenFlash]   = useState(false);
  // cutinStep: 0=非表示 1=外側初期位置 2=閉じた 3=外へ出る
  const [cutinStep, setCutinStep]       = useState(0);
  const [reachPulsing, setReachPulsing] = useState(false);
  const [particles, setParticles]       = useState([]);
  const [shaking, setShaking]           = useState(false);
  const [beamOn, setBeamOn]             = useState(false);
  const [rainbowOn, setRainbowOn]       = useState(false);
  const [cosmicAngle, setCosmicAngle]   = useState(0);
  const [legendStep, setLegendStep]     = useState(0); // 0=暗転 1=テキスト表示

  const timerRef  = useRef(null);
  const roulRef   = useRef(null);
  const cosmicRef = useRef(null);
  const settledRef = useRef(false);
  const pullStartedRef = useRef(false);

  const canPull = state.coins >= GACHA_COST;
  const collectedCount = STICKERS.filter(sticker => (state.collection?.[sticker.id] || 0) > 0).length;
  const featured = STICKERS.filter(sticker => sticker.featured === true);
  const previewCards = featured.length > 0
    ? featured.slice(-12)
    : STICKERS.filter(sticker => ['leg-bio-dragon', 'bio-hercules-beetle', 'leg-bio-phoenix', 'bio-tyrannosaurus-rex'].includes(sticker.id));

  useEffect(() => () => {
    clearTimeout(timerRef.current);
    clearInterval(roulRef.current);
    clearInterval(cosmicRef.current);
  }, []);

  // ===== ガチャスタート =====
  function handlePull() {
    if (!canPull || phase !== 'idle' || pullStartedRef.current) return;
    pullStartedRef.current = true;

    // 0.5%の伝説確定演出と、通常抽選内の伝説1%は独立。
    // 画面全体で伝説を引く確率は約1.495%。
    const confirmLegendary = isLegendaryConfirm();
    const sticker = confirmLegendary ? rollGachaLegend() : rollGacha();
    const isLegendaryCard = sticker.legendary === true;
    const fx = isLegendaryCard ? FX_LEGEND : pickEffect(sticker.series);
    const award = onPull(sticker) || { isNew: false, coinBonus: 0 };

    setResult(sticker);
    setResultMeta({
      coinBonus: award.coinBonus || 0,
      collectedCount: collectedCount + (award.isNew ? 1 : 0),
    });
    setIsNew(award.isNew);
    settledRef.current = false;
    setEffect(fx);
    setIsLegend(isLegendaryCard);
    setParticles([]);
    setShaking(false);
    setBeamOn(false);
    setRainbowOn(false);
    setReachPulsing(false);
    setCutinStep(0);
    setLegendStep(0);

    if (isLegendaryCard) {
      doLegend(sticker);
    } else if (fx === FX_CUTIN || fx === FX_COSMIC) {
      doCutin(sticker, fx);
    } else {
      doSpin(sticker, fx);
    }
  }

  // ===== LEGEND演出（暗転→花エフェクト→金テキスト→カットイン→COSMIC） =====
  function doLegend(sticker) {
    setPhase('legend');
    setLegendStep(0); // 暗転
    timerRef.current = setTimeout(() => {
      setLegendStep(1); // テキスト+花エフェクト出現
      timerRef.current = setTimeout(() => {
        doCutin(sticker, FX_LEGEND);
      }, 3000);
    }, 400);
  }

  // ===== カットイン演出 =====
  function doCutin(sticker, fx) {
    setPhase('cutin');
    setCutinStep(1);
    timerRef.current = setTimeout(() => {
      setCutinStep(2);
      timerRef.current = setTimeout(() => {
        setCutinStep(3);
        timerRef.current = setTimeout(() => {
          setCutinStep(0);
          doSpin(sticker, fx);
        }, 500);
      }, 1300);
    }, 50);
  }

  // ===== スピン =====
  function doSpin(sticker, fx) {
    setPhase('spinning');
    let idx = 0;
    let speed = 80;
    const total = SPIN_DURATION[sticker.series] ?? 1500;
    const start = Date.now();
    let reachFired = false;

    function tick() {
      const elapsed = Date.now() - start;
      const prog = elapsed / total;

      if (fx === FX_REACH && !reachFired && prog >= 0.65) {
        reachFired = true;
        clearInterval(roulRef.current);
        idx = (idx + 1) % ROULETTE_SEQ.length;
        setRouletteIdx(idx);
        doReach(sticker, fx, idx);
        return;
      }

      if (prog < 0.6) {
        speed = 80;
      } else if (prog < 0.85) {
        speed = 80 + ((prog - 0.6) / 0.25) * 220;
      } else {
        speed = 300 + ((prog - 0.85) / 0.15) * 500;
      }

      if (elapsed >= total) {
        clearInterval(roulRef.current);
        const fi = findStop(sticker.series, idx);
        setRouletteIdx(fi);
        doFlash(sticker, fx);
        return;
      }

      idx = (idx + 1) % ROULETTE_SEQ.length;
      setRouletteIdx(idx);
      if (prog < 0.7) playGachaTick(); else playGachaSlowTick();
      roulRef.current = setTimeout(tick, speed);
    }
    roulRef.current = setTimeout(tick, speed);
  }

  function findStop(series, cur) {
    const fwd = ROULETTE_SEQ.findIndex((s, i) => i >= cur && s === series);
    const fallback = ROULETTE_SEQ.findIndex(s => s === series);
    return fwd >= 0 ? fwd : fallback >= 0 ? fallback : cur;
  }

  // ===== リーチ =====
  function doReach(sticker, fx, cur) {
    setPhase('reach');
    setReachPulsing(true);
    let ticks = 0;
    function slowTick() {
      ticks++;
      const ni = (cur + ticks) % ROULETTE_SEQ.length;
      setRouletteIdx(ni);
      playGachaSlowTick();
      if (ticks < 4) {
        timerRef.current = setTimeout(slowTick, 400 + ticks * 200);
      } else {
        setRouletteIdx(findStop(sticker.series, ni));
        timerRef.current = setTimeout(() => {
          setReachPulsing(false);
          doFlash(sticker, fx);
        }, 2000);
      }
    }
    slowTick();
  }

  // ===== フラッシュ/エフェクト =====
  function doFlash(sticker, fx) {
    setPhase('flash');
    const actualFx = fx === FX_LEGEND ? FX_COSMIC : fx;

    if (actualFx === FX_EXPLOSION) setParticles(genParticles());
    if (actualFx === FX_RAINBOW)   setRainbowOn(true);
    if (actualFx === FX_BEAM || actualFx === FX_COSMIC) setBeamOn(true);
    if (actualFx === FX_COSMIC)    startCosmicSpin();
    if (actualFx >= FX_BEAM)       setShaking(true);

    const flashCounts = [1, 3, 4, 6, 0, 0, 0];
    const maxFlash = flashCounts[actualFx] ?? 1;

    if (maxFlash === 0) {
      const holdMs = actualFx === FX_RAINBOW ? 1400 : actualFx === FX_EXPLOSION ? 700 : 500;
      timerRef.current = setTimeout(() => doReveal(sticker), holdMs);
      return;
    }

    let count = 0;
    function step() {
      setScreenFlash(f => !f);
      playGachaFlash();
      count++;
      if (count < maxFlash * 2) {
        timerRef.current = setTimeout(step, 110);
      } else {
        setScreenFlash(false);
        doReveal(sticker);
      }
    }
    step();
  }

  function startCosmicSpin() {
    let angle = 0;
    cosmicRef.current = setInterval(() => {
      angle = (angle + 4) % 360;
      setCosmicAngle(angle);
    }, 16);
  }

  // ===== リビール =====
  function doReveal(sticker) {
    setRainbowOn(false);
    setShaking(false);
    setPhase('reveal');
    playGachaReveal(REVEAL_SFX[sticker.series] ?? 'common');
    timerRef.current = setTimeout(() => {
      settlePull();
    }, 900);
  }

  // 抽選・支払い・付与は開始時に確定済み。ここでは表示だけを終える。
  function settlePull() {
    if (settledRef.current) return;
    settledRef.current = true;
    clearTimeout(timerRef.current);
    clearTimeout(roulRef.current);
    clearInterval(cosmicRef.current);
    setBeamOn(false);
    setParticles([]);
    setShaking(false);
    setRainbowOn(false);
    setScreenFlash(false);
    setCutinStep(0);
    setLegendStep(0);
    setPhase('result');
  }

  // ===== リセット =====
  function resetToIdle() {
    pullStartedRef.current = false;
    setPhase('idle');
    setResult(null);
    setResultMeta(null);
    setIsNew(false);
    setIsLegend(false);
    setParticles([]);
    setShaking(false);
    setBeamOn(false);
    setRainbowOn(false);
    setReachPulsing(false);
    setCutinStep(0);
    setLegendStep(0);
    setScreenFlash(false);
  }

  // ===== 描画用データ =====
  const colors = result ? (SERIES_COLORS[result.series] ?? SERIES_COLORS.bio) : SERIES_COLORS.bio;

  const bgColor = phase === 'result'
    ? `radial-gradient(circle at 50% 26%, ${colors.glow} 0%, #10201d 42%, #091311 100%)`
    : phase === 'legend'
    ? 'linear-gradient(180deg,#000000 0%,#0a0020 100%)'
    : effect === FX_COSMIC || effect === FX_LEGEND
    ? 'linear-gradient(180deg,#070718 0%,#120830 50%,#070718 100%)'
    : 'linear-gradient(180deg,#0a1628 0%,#1e3a5f 50%,#0a1628 100%)';

  const cutinLeft  = cutinStep === 2 ? 'translateX(0)' : 'translateX(-101%)';
  const cutinRight = cutinStep === 2 ? 'translateX(0)' : 'translateX(101%)';
  const cutinTrans = cutinStep === 1 ? 'none' : 'transform 0.4s cubic-bezier(0.25,0.46,0.45,0.94)';

  return (
    <div
      className={`min-h-screen flex flex-col items-center relative overflow-hidden gacha-upgrade${shaking ? ' gacha-shake' : ''}`}
      style={{ background: bgColor, transition: 'background 0.8s ease' }}
    >
      {phase !== 'idle' && phase !== 'result' && result && (
        <button type="button" onClick={settlePull} className="gacha-skip">演出をスキップ</button>
      )}

      {/* ===== LEGENDARY 確定演出（花・豪華エフェクト） ===== */}
      {phase === 'legend' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center"
             style={{ background: 'radial-gradient(ellipse at center, #0a0020 0%, #000000 100%)' }}>

          {/* 背景オーラ */}
          {legendStep === 1 && (
            <div style={{
              position: 'absolute', inset: 0,
              background: 'radial-gradient(ellipse at 50% 50%, rgba(255,215,0,0.18) 0%, rgba(255,100,200,0.12) 40%, transparent 70%)',
              animation: 'legendAuraPulse 1.5s ease-in-out infinite alternate',
            }}/>
          )}

          {/* 花びら・スパークル シャワー */}
          {legendStep === 1 && ['🌸','🌺','✨','💫','🌸','🌼','⭐','🌹','💐','🌷','✨','🌸','💫','🌺','🌼','🌸','⭐','🌹','✨','💐','🌷','🌸','💫','🌺','🌼','✨','⭐','🌸'].map((f, i) => (
            <div key={i} style={{
              position: 'absolute',
              fontSize: `${1.0 + (i % 5) * 0.35}rem`,
              left: `${(i * 13 + 3) % 92}%`,
              top: `${(i * 17 + 8) % 85}%`,
              animation: `legendPetal ${1.6 + (i % 5) * 0.35}s ease-in-out ${(i % 8) * 0.18}s infinite`,
              pointerEvents: 'none',
            }}>{f}</div>
          ))}

          {/* 光の柱 */}
          {legendStep === 1 && [...Array(8)].map((_, i) => (
            <div key={i} style={{
              position: 'absolute',
              width: 1.5, height: '70%',
              background: `linear-gradient(180deg,transparent,${['gold','#ff69b4','#da70d6','gold','#87ceeb','gold','#ff69b4','gold'][i]},transparent)`,
              left: `${8 + i * 12}%`,
              top: '15%',
              opacity: 0.6,
              animation: `legendBeam ${1.4 + i * 0.15}s ease-in-out ${i * 0.2}s infinite alternate`,
              transform: `rotate(${-10 + i * 3}deg)`,
            }}/>
          ))}

          {legendStep === 0 && (
            <div style={{ animation: 'legendFadeIn 0.5s ease forwards' }}>
              <div style={{ fontSize: '1.2rem', color: '#888', fontWeight: 700, textAlign: 'center', letterSpacing: '0.3em' }}>
                ✦ ✦ ✦
              </div>
            </div>
          )}

          {legendStep === 1 && (
            <div className="flex flex-col items-center gap-5" style={{ position: 'relative', zIndex: 10,
              animation: 'legendTextIn 0.7s cubic-bezier(0.175,0.885,0.32,1.275) forwards' }}>
              {/* 上段デコ */}
              <div style={{ display: 'flex', gap: 10 }}>
                {['🌸','✨','🌺','💫','🌼','✨','🌸'].map((s, i) => (
                  <span key={i} style={{
                    fontSize: '1.5rem',
                    filter: 'drop-shadow(0 0 6px rgba(255,215,0,0.9))',
                    animation: `legendStar 0.7s ease ${i * 0.08}s infinite alternate`,
                  }}>{s}</span>
                ))}
              </div>

              {/* メインテキスト */}
              <div style={{
                fontSize: '3.8rem', fontWeight: 900, letterSpacing: '0.12em',
                background: 'linear-gradient(135deg, #FFD700 0%, #FF69B4 35%, #DA70D6 65%, #FFD700 100%)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                filter: 'drop-shadow(0 0 16px rgba(255,215,0,0.9))',
                animation: 'legendGlow 0.9s ease-in-out infinite alternate',
              }}>✨ LEGENDARY ✨</div>

              <div style={{
                fontSize: '1.1rem', fontWeight: 800, letterSpacing: '0.25em',
                background: 'linear-gradient(90deg, #FFD700, #FF69B4, #DA70D6, #FFD700)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                animation: 'legendPulse 0.6s ease-in-out infinite',
              }}>🌸 伝説のカード降臨 🌸</div>

              {/* 下段デコ */}
              <div style={{ display: 'flex', gap: 10 }}>
                {['💐','⭐','🌹','✨','🌷','⭐','💐'].map((s, i) => (
                  <span key={i} style={{
                    fontSize: '1.3rem',
                    filter: 'drop-shadow(0 0 5px rgba(255,150,200,0.8))',
                    animation: `legendStar 0.9s ease ${i * 0.1}s infinite alternate`,
                  }}>{s}</span>
                ))}
              </div>
            </div>
          )}

          <style>{`
            @keyframes legendAuraPulse {
              0%   { opacity: 0.5; transform: scale(0.95); }
              100% { opacity: 1;   transform: scale(1.08); }
            }
            @keyframes legendPetal {
              0%   { opacity: 0;   transform: translateY(30px) rotate(0deg) scale(0.5); }
              25%  { opacity: 1;   transform: translateY(-15px) rotate(120deg) scale(1.1); }
              75%  { opacity: 0.8; transform: translateY(-60px) rotate(300deg) scale(1.0); }
              100% { opacity: 0;   transform: translateY(-100px) rotate(450deg) scale(0.4); }
            }
            @keyframes legendBeam {
              0%   { opacity: 0.2; transform: scaleY(0.8) rotate(var(--r, 0deg)); }
              100% { opacity: 0.7; transform: scaleY(1.1) rotate(var(--r, 0deg)); }
            }
          `}</style>
        </div>
      )}

      {/* ===== カットインパネル ===== */}
      {cutinStep > 0 && (
        <>
          <div className="fixed inset-y-0 left-0 z-40 pointer-events-none flex items-center justify-end pr-5"
               style={{
                 width: '50%',
                 background: isLegend
                   ? 'linear-gradient(135deg,#000000,#1a0040)'
                   : 'linear-gradient(135deg,#0a1628,#1e3a5f)',
                 transform: cutinLeft,
                 transition: cutinTrans,
                 borderRight: `3px solid ${isLegend ? 'gold' : '#3b82f6'}`,
                 boxShadow: `4px 0 30px ${isLegend ? 'rgba(255,215,0,0.5)' : 'rgba(59,130,246,0.4)'}`,
               }}>
            <span style={{
              fontSize: 64,
              filter: `drop-shadow(0 0 20px ${isLegend ? 'gold' : '#60a5fa'})`,
            }}>{isLegend ? '👑' : '⚔️'}</span>
          </div>
          <div className="fixed inset-y-0 right-0 z-40 pointer-events-none flex items-center justify-start pl-5"
               style={{
                 width: '50%',
                 background: isLegend
                   ? 'linear-gradient(225deg,#000000,#1a0040)'
                   : 'linear-gradient(225deg,#0a1628,#1e3a5f)',
                 transform: cutinRight,
                 transition: cutinTrans,
                 borderLeft: `3px solid ${isLegend ? 'gold' : '#3b82f6'}`,
                 boxShadow: `-4px 0 30px ${isLegend ? 'rgba(255,215,0,0.5)' : 'rgba(59,130,246,0.4)'}`,
               }}>
            <span style={{
              fontSize: 64,
              filter: `drop-shadow(0 0 20px ${isLegend ? 'gold' : '#60a5fa'})`,
              transform: 'scaleX(-1)', display: 'inline-block',
            }}>{isLegend ? '👑' : '⚔️'}</span>
          </div>
          {cutinStep === 2 && (
            <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
              <div style={{
                fontSize: isLegend ? '3rem' : '2.8rem',
                fontWeight: 900,
                color: isLegend ? 'gold' : '#60a5fa',
                textShadow: isLegend
                  ? '0 0 20px gold, 0 0 60px gold, 0 0 120px rgba(255,200,0,0.4)'
                  : '0 0 20px #3b82f6, 0 0 60px #3b82f6',
                animation: 'cutinTextAnim 1s ease-in-out infinite',
                letterSpacing: '0.08em',
                WebkitTextStroke: isLegend ? '1px #ff8c00' : 'none',
              }}>
                {isLegend ? '👑 LEGEND PULL！！' : '🎰 カットイン！！'}
              </div>
            </div>
          )}
        </>
      )}

      {/* ===== レインボーオーバーレイ ===== */}
      {rainbowOn && (
        <div className="fixed inset-0 z-30 pointer-events-none overflow-hidden flex">
          {RAINBOW_COLORS.map((color, i) => (
            <div key={i} style={{
              flex: 1, background: color, opacity: 0.75,
              animation: `rbStripe 0.35s ease ${i * 0.06}s both`,
            }}/>
          ))}
          <div className="absolute inset-0 flex items-center justify-center">
            <div style={{
              fontSize: '2.8rem', fontWeight: 900, color: 'white',
              textShadow: '0 0 20px rgba(0,0,0,0.9)',
              animation: 'rbText 0.4s ease 0.4s both',
            }}>🌈 RAINBOW！！</div>
          </div>
        </div>
      )}

      {/* ===== ビームオーバーレイ ===== */}
      {beamOn && !rainbowOn && (
        <div className="fixed inset-0 z-20 pointer-events-none flex justify-center">
          <div style={{
            width: isLegend ? 140 : 100,
            background: isLegend
              ? 'linear-gradient(180deg,transparent 0%,rgba(255,215,0,0.4) 25%,rgba(255,255,255,0.95) 50%,rgba(255,215,0,0.4) 75%,transparent 100%)'
              : `linear-gradient(180deg,transparent 0%,${colors.flash} 25%,rgba(255,255,255,0.95) 50%,${colors.flash} 75%,transparent 100%)`,
            animation: 'beamPulseAnim 0.3s ease-in-out infinite alternate',
          }}/>
        </div>
      )}

      {/* ===== コズミックリング ===== */}
      {(effect === FX_COSMIC || effect === FX_LEGEND) && (phase === 'flash' || phase === 'reveal') && (
        <div className="fixed inset-0 z-10 pointer-events-none flex items-center justify-center">
          {[{ r:130,c:'#3b82f6' },{ r:190,c:'#6366f1' },{ r:250,c:'#a855f7' },{ r:310,c:'gold' }].map(({ r, c }, i) => (
            <div key={i} style={{
              position: 'absolute',
              width: r * 2, height: r * 2, borderRadius: '50%',
              border: `${2.5 - i * 0.4}px solid ${isLegend && i === 3 ? 'gold' : c}`,
              opacity: 0.7 - i * 0.1,
              transform: `rotate(${cosmicAngle * (i % 2 === 0 ? 1 : -1) + i * 45}deg)`,
              boxShadow: `0 0 15px ${c}`,
            }}/>
          ))}
          {[...Array(10)].map((_, i) => (
            <div key={i} style={{
              position: 'absolute',
              width: 2, height: isLegend ? 24 : 16,
              background: isLegend
                ? 'linear-gradient(180deg,gold,transparent)'
                : 'linear-gradient(180deg,white,transparent)',
              left: `${8 + i * 9}%`, top: '-3%',
              animation: `starShootAnim 0.9s linear ${i * 0.12}s infinite`,
            }}/>
          ))}
        </div>
      )}

      {/* ===== パーティクル爆発 ===== */}
      {particles.length > 0 && (
        <div className="fixed inset-0 z-30 pointer-events-none"
             style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {particles.map(p => (
            <div key={p.id} style={{
              position: 'absolute',
              width: p.size, height: p.size, borderRadius: '50%',
              background: p.color,
              top: '50%', left: '50%',
              transform: 'translate(-50%,-50%)',
              animation: 'explodeParticle 0.85s ease-out forwards',
              '--px': `${p.dx}px`,
              '--py': `${p.dy}px`,
              boxShadow: `0 0 8px ${p.color}`,
            }}/>
          ))}
          <div style={{
            position: 'absolute', fontSize: '3rem', fontWeight: 900, color: 'white',
            textShadow: '0 0 20px #f59e0b',
            animation: 'explodeText 0.6s cubic-bezier(0.175,0.885,0.32,1.275) forwards',
          }}>💥</div>
        </div>
      )}

      {/* ===== 画面フラッシュ ===== */}
      {screenFlash && (
        <div className="fixed inset-0 z-50 pointer-events-none"
             style={{ background: isLegend ? 'rgba(255,215,0,0.5)' : colors.flash, opacity: 0.85 }}/>
      )}

      {/* ===== 背景星パーティクル ===== */}
      {(phase === 'spinning' || phase === 'flash' || phase === 'reach') && (
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
          {[...Array(24)].map((_, i) => (
            <div key={i} className="absolute rounded-full"
                 style={{
                   left: `${(i * 37 + 5) % 100}%`,
                   top: `${(i * 53 + 10) % 100}%`,
                   width: `${4 + (i % 3) * 4}px`,
                   height: `${4 + (i % 3) * 4}px`,
                   background: ['#f59e0b','#818cf8','#34d399','#f472b6','#60a5fa'][i % 5],
                   opacity: 0.7,
                   animation: `bgSparkle ${0.8 + (i % 4) * 0.4}s ease-in-out ${(i * 0.13) % 1.5}s infinite`,
                 }}/>
          ))}
        </div>
      )}

      {isNew && phase === 'result' && <Confetti active={true} />}

      {/* ===== ヘッダー ===== */}
      <div className="gacha-upgrade-header w-full z-10">
        <button onClick={onBack} aria-label="もどる" className="gacha-back">←</button>
        <div className="gacha-header-brand"><span>✦</span><div><small>BIO BATTLE STADIUM</small><h2>召喚ガチャ</h2></div></div>
        <span className="gacha-wallet">🪙 {state.coins}</span>
      </div>

      {/* ===== IDLE ===== */}
      {phase === 'idle' && (
        <div className="gacha-idle-shell z-10">
          <section className="gacha-intro">
            <div className="gacha-kicker">NEW DISCOVERIES · 召喚ラボ</div>
            <h1>次の仲間は、<br /><em>だれだ。</em></h1>
            <p>計算で集めたコインを使って、新しい生物や戦士を発見しよう。</p>
            <div className="gacha-portal" aria-hidden="true">
              <div className="gacha-portal-ring" />
              <div className="gacha-portal-core">?</div>
              <span className="gacha-portal-spark spark-one">✦</span>
              <span className="gacha-portal-spark spark-two">✧</span>
              <span className="gacha-portal-spark spark-three">✦</span>
            </div>
            <div className="gacha-collection-progress">
              <div><strong>{collectedCount}</strong><span> / {STICKERS.length} 体 発見</span></div>
              <span>あと {STICKERS.length - collectedCount} 体</span>
              <div className="gacha-progress-track"><i style={{ width: `${collectedCount / STICKERS.length * 100}%` }} /></div>
            </div>
            <button onClick={handlePull} disabled={!canPull} className="gacha-draw-button">
              <span>✦ 1回召喚する</span><small>🪙 {GACHA_COST} コイン</small>
            </button>
            {!canPull && <p className="gacha-needs-coins">あと {GACHA_COST - state.coins} コインで召喚できます</p>}
          </section>
          <section className="gacha-featured" aria-label="ガチャで出会える仲間">
            <div className="gacha-featured-heading"><div><span>THE COLLECTION</span><h2>新しい仲間を発見</h2></div><b>{previewCards.length} 体に注目</b></div>
            <p>生物・武装生物・伝説の仲間が待っています。どのカードと出会えるかはお楽しみ。</p>
            <div className="gacha-featured-grid">
              {previewCards.map(sticker => (
                <div key={sticker.id} className={`gacha-featured-card${sticker.legendary ? ' is-legendary' : ''}`}>
                  <div className="gacha-featured-art"><img src={sticker.imagePath} alt="" loading="lazy" /></div>
                  <strong>{sticker.name}</strong>
                  <span>{SERIES_LABELS[sticker.series]}</span>
                  {sticker.featured && <b>NEW</b>}
                </div>
              ))}
            </div>
            <div className="gacha-featured-foot">まだ出会っていないカードも、図鑑に記録されます。</div>
          </section>
        </div>
      )}

      {/* ===== CUTIN フェーズ ===== */}
      {phase === 'cutin' && (
        <div className="flex flex-col items-center flex-1 justify-center z-10">
          <div style={{ fontSize: '5rem', animation: 'gachaSpin 0.5s linear infinite' }}>🎰</div>
        </div>
      )}

      {/* ===== SPINNING / REACH / FLASH ===== */}
      {(phase === 'spinning' || phase === 'reach' || phase === 'flash') && (
        <div className="flex flex-col items-center flex-1 justify-center gap-6 z-10 w-full px-4">
          {phase === 'reach' && (
            <div style={{
              fontSize: '2.8rem', fontWeight: 900, color: '#fbbf24',
              textShadow: '0 0 20px #f59e0b, 0 0 60px rgba(245,158,11,0.6)',
              animation: reachPulsing ? 'reachPulseAnim 0.55s ease-in-out infinite' : 'none',
              letterSpacing: '0.05em',
            }}>⚡ REACH！！</div>
          )}
          <div className="font-black text-2xl text-white" style={{ opacity: 0.9 }}>
            {phase === 'reach' ? '💫 もしかして…！？' : phase === 'flash' ? '⚔️ カードが出るよ！⚔️' : '🎰 ガチャ中...'}
          </div>
          {/* ルーレット */}
          <div className="relative w-80 overflow-hidden rounded-3xl border-4"
               style={{
                 height: 100, background: 'rgba(0,0,0,0.65)',
                 borderColor: phase === 'reach' ? '#f59e0b' : '#3b82f6',
                 boxShadow: phase === 'reach' ? '0 0 30px rgba(245,158,11,0.8)' : '0 0 10px rgba(59,130,246,0.3)',
               }}>
            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-12 border-y-2 z-10"
                 style={{
                   borderColor: phase === 'reach' ? 'rgba(245,158,11,0.8)' : 'rgba(59,130,246,0.5)',
                   background: phase === 'reach' ? 'rgba(245,158,11,0.1)' : 'rgba(59,130,246,0.08)',
                 }}/>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex flex-col items-center gap-2">
                {ROULETTE_SEQ.map((s, i) => {
                  const active = i === rouletteIdx % ROULETTE_SEQ.length;
                  if (Math.abs(i - rouletteIdx % ROULETTE_SEQ.length) > 1) return null;
                  const sc = SERIES_COLORS[s] ?? SERIES_COLORS.bio;
                  return (
                    <div key={i}
                         className="font-black text-center rounded-xl px-6 py-1 transition-all duration-75"
                         style={{
                           fontSize: active ? '1.6rem' : '1rem',
                           opacity: active ? 1 : 0.3,
                           color: sc.text,
                           background: active ? sc.bg : 'transparent',
                           transform: active ? 'scale(1.15)' : 'scale(0.85)',
                         }}>
                      {SERIES_LABELS[s]}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          <div style={{
            fontSize: '5rem',
            animation: phase === 'reach' ? 'bounceSlow 1.2s ease-in-out infinite' : 'bounceKf 0.7s ease-in-out infinite',
          }}>⚔️</div>
        </div>
      )}

      {/* ===== REVEAL ===== */}
      {phase === 'reveal' && result && (
        <div className="flex flex-col items-center flex-1 justify-center gap-6 z-10">
          <div style={{ fontSize: '4rem', animation: 'gachaSpin 0.4s linear infinite' }}>
            {isLegend ? '👑' : '🌟'}
          </div>
          <div className="font-black text-4xl"
               style={{ color: isLegend ? 'gold' : colors.text, animation: 'pulseAnim 0.45s ease-in-out infinite' }}>
            {isLegend ? '★ LEGEND ★' : SERIES_LABELS[result.series]}
          </div>
          <div className="w-40 h-40 rounded-3xl" style={{
            background: colors.bg,
            boxShadow: isLegend
              ? '0 0 40px gold, 0 0 80px rgba(255,215,0,0.5)'
              : `0 0 40px ${colors.glow}, 0 0 80px ${colors.glow}`,
            animation: 'pulseAnim 0.4s ease-in-out infinite',
          }}/>
        </div>
      )}

      {/* ===== RESULT ===== */}
      {phase === 'result' && result && (
        <div className={`gacha-result-screen z-10${isLegend ? ' legendary' : ''}`} style={{ '--rarity-glow': colors.glow }}>
          <div className="gacha-result-kicker">SUMMON COMPLETE</div>
          <div className="gacha-result-title">{isLegend ? '伝説の仲間が現れた！' : '新たな出会い！'}</div>
          <div className="gacha-result-card">
            <div className="gacha-result-art"><img src={result.imagePath} alt={result.name} /></div>
            <div className="gacha-result-card-footer"><span>{SERIES_LABELS[result.series]}</span><b>{isNew ? 'NEW!' : 'GET!'}</b></div>
          </div>
          <h3>{result.name}</h3>
          <p className="gacha-result-rarity">{SERIES_LABELS[result.series]}</p>
          <div className={`gacha-result-status${isNew ? ' new' : ''}`}>
            {isNew ? (
              <><strong>✦ 図鑑に新登録！</strong><span>{resultMeta?.collectedCount ?? collectedCount} / {STICKERS.length} 体を発見しました</span></>
            ) : (
              <><strong>もう仲間になっています</strong><span>重複ボーナス 🪙 +{resultMeta?.coinBonus ?? 0} コイン</span></>
            )}
          </div>
          {state.coins >= GACHA_COST ? (
            <button onClick={resetToIdle} className="gacha-draw-button">✦ 次の召喚へ <small>もう一度引く</small></button>
          ) : (
            <button onClick={onBack} className="gacha-draw-button">コインをためよう</button>
          )}
          <button onClick={onBack} className="gacha-home-button">ホームにもどる</button>
        </div>
      )}

      <style>{`
        @keyframes scaleInAnim {
          from { transform: scale(0.5); opacity: 0; }
          to   { transform: scale(1);   opacity: 1; }
        }
        @keyframes bounceInAnim {
          0%   { transform: scale(0.3) rotate(-10deg); opacity: 0; }
          60%  { transform: scale(1.1) rotate(3deg);   opacity: 1; }
          80%  { transform: scale(0.95); }
          100% { transform: scale(1) rotate(0deg); }
        }
        @keyframes slideUpAnim {
          from { transform: translateY(20px); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
        @keyframes legendFadeIn {
          from { opacity: 0; } to { opacity: 1; }
        }
        @keyframes legendTextIn {
          from { transform: scale(0.4) translateY(30px); opacity: 0; }
          to   { transform: scale(1) translateY(0); opacity: 1; }
        }
        @keyframes legendGlow {
          from { text-shadow: 0 0 20px gold, 0 0 40px gold; }
          to   { text-shadow: 0 0 30px gold, 0 0 80px gold, 0 0 150px rgba(255,200,0,0.4); }
        }
        @keyframes legendPulse {
          0%,100% { opacity: 1; transform: scale(1); }
          50%     { opacity: 0.7; transform: scale(1.05); }
        }
        @keyframes legendStar {
          from { opacity: 0.5; transform: scale(0.8); }
          to   { opacity: 1;   transform: scale(1.2); }
        }
        @keyframes legendStar2 {
          from { transform: translateY(-20px) rotate(15deg); opacity: 1; }
          to   { transform: translateY(110vh) rotate(15deg); opacity: 0; }
        }
        @keyframes cutinTextAnim {
          0%,100% { opacity: 1; transform: scale(1); }
          50%     { opacity: 0.75; transform: scale(1.06); }
        }
        @keyframes rbStripe {
          from { transform: scaleY(0); opacity: 0; }
          to   { transform: scaleY(1); opacity: 0.75; }
        }
        @keyframes rbText {
          from { opacity: 0; transform: scale(0.5); }
          to   { opacity: 1; transform: scale(1); }
        }
        @keyframes beamPulseAnim {
          from { opacity: 0.45; width: 80px; }
          to   { opacity: 0.9;  width: 150px; }
        }
        @keyframes starShootAnim {
          from { transform: translateY(-20px); opacity: 1; }
          to   { transform: translateY(110vh); opacity: 0; }
        }
        @keyframes reachPulseAnim {
          0%,100% { transform: scale(1);   opacity: 1; }
          50%     { transform: scale(1.1); opacity: 0.8; }
        }
        @keyframes gachaSpin {
          from { transform: rotate(0deg);   }
          to   { transform: rotate(360deg); }
        }
        @keyframes bounceKf {
          0%,100% { transform: translateY(0);    }
          50%     { transform: translateY(-20px); }
        }
        @keyframes bounceSlow {
          0%,100% { transform: translateY(0);    }
          50%     { transform: translateY(-14px); }
        }
        @keyframes pulseAnim {
          0%,100% { opacity: 1;   }
          50%     { opacity: 0.5; }
        }
        @keyframes bgSparkle {
          0%,100% { transform: scale(1);   opacity: 0.7; }
          50%     { transform: scale(1.8); opacity: 0;   }
        }
        @keyframes pingKf {
          0%   { transform: scale(1);   opacity: 0.8; }
          100% { transform: scale(2.2); opacity: 0;   }
        }
        @keyframes explodeParticle {
          from {
            transform: translate(-50%, -50%) scale(1);
            opacity: 1;
          }
          to {
            transform: translate(calc(-50% + var(--px)), calc(-50% + var(--py))) scale(0.15);
            opacity: 0;
          }
        }
        @keyframes explodeText {
          from { transform: scale(0.3); opacity: 0; }
          60%  { transform: scale(1.2); opacity: 1; }
          to   { transform: scale(1);   opacity: 1; }
        }
        @keyframes gacha-shake-kf {
          0%,100% { transform: translate(0,0) }
          10%     { transform: translate(-6px,3px) }
          20%     { transform: translate(6px,-3px) }
          30%     { transform: translate(-4px,5px) }
          40%     { transform: translate(4px,-5px) }
          50%     { transform: translate(-6px,2px) }
          60%     { transform: translate(6px,-2px) }
          70%     { transform: translate(-3px,4px) }
          80%     { transform: translate(3px,-4px) }
          90%     { transform: translate(-4px,2px) }
        }
        .gacha-shake {
          animation: gacha-shake-kf 0.12s linear infinite;
        }
      `}</style>
    </div>
  );
}
