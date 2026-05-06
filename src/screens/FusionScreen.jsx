import { useState, useRef } from 'react';
import { STICKERS } from '../data/stickers.js';
import { FUSIONS } from '../data/fusions.js';
import Confetti from '../components/Confetti.jsx';

const stickerMap = Object.fromEntries(STICKERS.map(s => [s.id, s]));
const fusionMap  = Object.fromEntries(FUSIONS.map(f => [f.id, f]));

// bioシリーズのみ融合対象
const BIO_STICKERS = STICKERS.filter(s => s.series === 'bio');

export default function FusionScreen({ state, onBack, onAttemptFusion }) {
  const [selected, setSelected]       = useState([]);
  const [animPhase, setAnimPhase]     = useState(null);
  const [fusionResult, setFusionResult] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const timerRefs = useRef([]);

  const ownedBio = BIO_STICKERS
    .filter(s => (state.collection[s.id] || 0) > 0)
    .map(s => ({ ...s, count: state.collection[s.id] }));

  function canSelect(cardId) {
    const alreadySelected = selected.filter(s => s === cardId).length;
    return (state.collection[cardId] || 0) > alreadySelected;
  }

  function handleCardClick(cardId) {
    if (animPhase) return;
    // 選択済みなら解除
    const idx = selected.indexOf(cardId);
    if (idx !== -1) {
      setSelected(s => s.filter((_, i) => i !== idx));
      return;
    }
    if (selected.length === 2) return;
    if (!canSelect(cardId)) return;
    setSelected(s => [...s, cardId]);
  }

  function handleDeselect(idx) {
    if (animPhase) return;
    setSelected(s => s.filter((_, i) => i !== idx));
  }

  function clearTimers() {
    timerRefs.current.forEach(clearTimeout);
    timerRefs.current = [];
  }

  function schedule(fn, ms) {
    const id = setTimeout(fn, ms);
    timerRefs.current.push(id);
    return id;
  }

  function handleFusion() {
    if (selected.length !== 2 || animPhase) return;
    const [id1, id2] = selected;

    setAnimPhase('start');

    schedule(() => setAnimPhase('flash'), 1500);
    schedule(() => {
      const result = onAttemptFusion(id1, id2);
      setFusionResult(result);
      if (result && result.success) {
        setAnimPhase('success');
        setShowConfetti(true);
        schedule(() => setShowConfetti(false), 3000);
        schedule(() => setAnimPhase('done'), 4500);
      } else if (result && !result.success) {
        setAnimPhase('fail');
        schedule(() => setAnimPhase('done'), 3000);
      } else {
        // result === null: カードが不足していた（想定外の状態）
        setAnimPhase('done');
      }
    }, 2000);
  }

  function handleReset() {
    clearTimers();
    setSelected([]);
    setAnimPhase(null);
    setFusionResult(null);
  }

  const card1 = selected[0] ? stickerMap[selected[0]] : null;
  const card2 = selected[1] ? stickerMap[selected[1]] : null;
  const resultFusion = fusionResult?.fusionCard
    ? (fusionMap[fusionResult.fusionCard.id] ?? fusionResult.fusionCard)
    : null;

  return (
    <div
      className="min-h-screen flex flex-col relative overflow-hidden"
      style={{ background: '#080c16', color: '#fff' }}
    >
      <AnimStyles />
      {showConfetti && <Confetti />}
      <FullscreenOverlay animPhase={animPhase} />

      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 sticky top-0 z-10"
        style={{ background: 'rgba(8,12,22,0.95)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <button onClick={onBack} aria-label="もどる" className="text-xl" style={{ color: '#64748b' }}>←</button>
        <h2 className="text-lg font-black" style={{ color: '#e2e8f0' }}>⚗️ 融合工房</h2>
        <span className="ml-auto text-xs" style={{ color: '#475569' }}>融合成功率: 10%</span>
      </div>

      <div className="flex-1 overflow-y-auto pb-8 px-4">
        <FusionSlot
          card1={card1} card2={card2}
          animPhase={animPhase}
          fusionResult={fusionResult}
          resultFusion={resultFusion}
          onDeselect={handleDeselect}
        />

        <FusionButton
          ready={selected.length === 2}
          animPhase={animPhase}
          onFusion={handleFusion}
          onReset={handleReset}
        />

        {(!animPhase || animPhase === 'done') && (
          <CardGrid
            cards={ownedBio}
            selected={selected}
            onCardClick={handleCardClick}
          />
        )}

        {(!animPhase || animPhase === 'done') && (
          <FusionGallery fusionCollection={state.fusionCollection || []} />
        )}
      </div>
    </div>
  );
}

// ===== アニメーション CSS =====
function AnimStyles() {
  return (
    <style>{`
      @keyframes shake {
        0%,100%{ transform:translateX(0) }
        20%{ transform:translateX(-8px) }
        40%{ transform:translateX(8px) }
        60%{ transform:translateX(-6px) }
        80%{ transform:translateX(6px) }
      }
      @keyframes slideLeft {
        from { transform: translateX(0) rotate(0deg); }
        to   { transform: translateX(120px) rotate(720deg); }
      }
      @keyframes slideRight {
        from { transform: translateX(0) rotate(0deg); }
        to   { transform: translateX(-120px) rotate(-720deg); }
      }
      @keyframes whiteFade {
        0%   { opacity: 0; }
        50%  { opacity: 1; }
        100% { opacity: 0; }
      }
      @keyframes redFade {
        0%   { opacity: 0; }
        30%  { opacity: 0.7; }
        100% { opacity: 0; }
      }
      @keyframes rainbowBurst {
        0%   { transform: scale(0); opacity: 1; }
        100% { transform: scale(4); opacity: 0; }
      }
      @keyframes zoomIn {
        0%   { transform: scale(0.2); opacity: 0; filter: brightness(3); }
        60%  { transform: scale(1.15); opacity: 1; filter: brightness(1.5); }
        100% { transform: scale(1); opacity: 1; filter: brightness(1); }
      }
      @keyframes goldPulse {
        0%,100% { box-shadow: 0 0 20px #ffd700, 0 0 40px #ff8800; }
        50%      { box-shadow: 0 0 60px #ffd700, 0 0 120px #ff8800; }
      }
      @keyframes textPulse {
        0%,100% { transform: scale(1); }
        50%      { transform: scale(1.1); }
      }
      @keyframes shatter {
        0%   { transform: scale(1); opacity: 1; filter: blur(0px); }
        100% { transform: scale(0.1); opacity: 0; filter: blur(8px); }
      }
      @keyframes lightning {
        0%,100% { opacity: 0; }
        10%,30%,50%,70%,90% { opacity: 1; }
        20%,40%,60%,80% { opacity: 0; }
      }
      @keyframes smokeRise {
        from { transform: translateY(0) scale(1); opacity: 0.5; }
        to   { transform: translateY(-60px) scale(2); opacity: 0; }
      }
      .slide-left-anim  { animation: slideLeft  1.5s ease-in forwards; }
      .slide-right-anim { animation: slideRight 1.5s ease-in forwards; }
      .shatter-anim { animation: shatter 1s ease-in forwards; }
      .shake-screen { animation: shake 0.4s infinite; }
    `}</style>
  );
}

// ===== 全画面オーバーレイ =====
function FullscreenOverlay({ animPhase }) {
  if (animPhase === 'start') return (
    <div className="fixed inset-0 z-30 pointer-events-none shake-screen" />
  );
  if (animPhase === 'flash') return (
    <div className="fixed inset-0 z-50 pointer-events-none"
      style={{ background: '#ffffff', animation: 'whiteFade 0.5s ease-out forwards' }} />
  );
  if (animPhase === 'fail') return (
    <>
      <div className="fixed inset-0 z-40 pointer-events-none"
        style={{ background: '#ff0000', animation: 'redFade 1s ease-out forwards' }} />
      {[...Array(5)].map((_, i) => (
        <div key={i} className="fixed z-40 pointer-events-none rounded-full"
          style={{
            width: 60 + i * 20, height: 60 + i * 20,
            top: `${30 + i * 10}%`, left: `${10 + i * 18}%`,
            background: 'rgba(80,60,60,0.6)',
            animation: `smokeRise ${1 + i * 0.3}s ease-out ${i * 0.2}s forwards`,
          }} />
      ))}
    </>
  );
  if (animPhase === 'success') return (
    <>
      <div className="fixed z-40 pointer-events-none rounded-full"
        style={{
          width: 200, height: 200,
          top: '50%', left: '50%',
          marginTop: -100, marginLeft: -100,
          background: 'conic-gradient(red,orange,yellow,green,blue,violet,red)',
          animation: 'rainbowBurst 0.8s ease-out forwards',
        }} />
      {[...Array(6)].map((_, i) => (
        <div key={i} className="fixed z-40 pointer-events-none"
          style={{
            width: 3, height: `${40 + i * 15}%`,
            top: 0, left: `${10 + i * 15}%`,
            background: 'linear-gradient(to bottom, transparent, #ffd700, transparent)',
            animation: `lightning 0.3s ${i * 0.1}s infinite`,
            transformOrigin: 'top',
            transform: `rotate(${(i - 2.5) * 5}deg)`,
          }} />
      ))}
    </>
  );
  return null;
}

// ===== 融合スロット =====
function FusionSlot({ card1, card2, animPhase, fusionResult, resultFusion, onDeselect }) {
  const isDone    = animPhase === 'done';
  const isSuccess = animPhase === 'success' || (isDone && fusionResult?.success);
  const isFail    = animPhase === 'fail'    || (isDone && fusionResult && !fusionResult.success);

  if (isSuccess && resultFusion) return (
    <div className="mt-4 mb-4 flex flex-col items-center gap-3">
      <div className="text-2xl font-black text-center"
        style={{ color: '#ffd700', animation: 'textPulse 0.6s infinite', textShadow: '0 0 20px #ffd700' }}>
        ✨ FUSION SUCCESS!! ✨
      </div>
      <div className="rounded-2xl overflow-hidden"
        style={{
          animation: 'zoomIn 0.8s ease-out forwards, goldPulse 1s 0.8s infinite',
          border: '3px solid #ffd700', width: 140, height: 140,
        }}>
        <img src={resultFusion.imagePath} alt={resultFusion.name} className="w-full h-full object-cover" />
      </div>
      <div className="text-center">
        <div className="text-xl font-black" style={{ color: '#ffd700' }}>{resultFusion.name}</div>
        <div className="text-sm mt-1" style={{ color: '#94a3b8' }}>{resultFusion.nameEn}</div>
        <div className="text-xs mt-1 px-3 py-1 rounded-full inline-block"
          style={{ background: 'rgba(255,215,0,0.15)', color: '#fcd34d', border: '1px solid rgba(255,215,0,0.3)' }}>
          🧬 融合限定
        </div>
      </div>
    </div>
  );

  if (isFail) return (
    <div className="mt-4 mb-4 flex flex-col items-center gap-3">
      <div className="text-xl font-black text-center"
        style={{ color: '#ef4444', animation: 'shake 0.3s infinite', textShadow: '0 0 10px #ef4444' }}>
        💀 FUSION FAILED...
      </div>
      <div className="text-sm text-center" style={{ color: '#94a3b8' }}>2枚のカードは失われた...</div>
    </div>
  );

  return (
    <div className="mt-4 mb-4 flex items-center justify-center gap-4">
      <SlotCard
        card={card1}
        animClass={animPhase === 'start' ? 'slide-left-anim' : ''}
        onDeselect={() => onDeselect(0)}
      />
      <div className="text-2xl" style={{ color: '#64748b' }}>⚡⚗️⚡</div>
      <SlotCard
        card={card2}
        animClass={animPhase === 'start' ? 'slide-right-anim' : ''}
        onDeselect={() => onDeselect(1)}
      />
    </div>
  );
}

function SlotCard({ card, animClass, onDeselect }) {
  return (
    <div
      className={`rounded-xl overflow-hidden flex-shrink-0 ${animClass}`}
      style={{
        width: 90, height: 90,
        border: card ? '2px solid #fcd34d' : '2px dashed #334155',
        background: '#111827',
        cursor: card ? 'pointer' : 'default',
      }}
      onClick={card ? onDeselect : undefined}
    >
      {card
        ? <img src={card.imagePath} alt={card.name} className="w-full h-full object-cover" />
        : <div className="w-full h-full flex items-center justify-center text-2xl" style={{ color: '#334155' }}>?</div>
      }
    </div>
  );
}

// ===== 融合ボタン =====
function FusionButton({ ready, animPhase, onFusion, onReset }) {
  if (animPhase === 'done') return (
    <div className="flex justify-center mt-3">
      <button onClick={onReset}
        className="px-6 py-3 rounded-xl font-black text-base"
        style={{ background: '#1e293b', color: '#94a3b8', border: '1px solid #334155' }}>
        もう一度
      </button>
    </div>
  );
  const active = ready && !animPhase;
  return (
    <div className="flex justify-center mt-3">
      <button
        onClick={active ? onFusion : undefined}
        className="px-8 py-3 rounded-xl font-black text-base transition-transform active:scale-95"
        style={{
          background: active ? 'linear-gradient(135deg, #7c3aed, #4f46e5)' : '#1e293b',
          color: active ? '#fff' : '#475569',
          border: active ? '1px solid #8b5cf6' : '1px solid #334155',
          boxShadow: active ? '0 0 20px rgba(124,58,237,0.4)' : 'none',
          cursor: active ? 'pointer' : 'not-allowed',
        }}
      >
        {animPhase ? '融合中...' : active ? '⚗️ 融合チャレンジ！' : 'カードを2枚選んでください'}
      </button>
    </div>
  );
}

// ===== 所持 bio カードグリッド =====
function CardGrid({ cards, selected, onCardClick }) {
  if (cards.length === 0) return (
    <div className="mt-6 text-center py-8" style={{ color: '#475569' }}>
      <div className="text-3xl mb-2">🃏</div>
      <div className="text-sm">ガチャで生物カードを手に入れよう！</div>
      <div className="text-xs mt-1">同じカードが2枚あると融合できます</div>
    </div>
  );
  return (
    <div className="mt-6">
      <div className="text-sm font-bold mb-3" style={{ color: '#94a3b8' }}>所持カード（生物のみ）</div>
      <div className="grid gap-2" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        {cards.map(card => {
          const selCount = selected.filter(s => s === card.id).length;
          const available = card.count - selCount > 0;
          return (
            <div
              key={card.id}
              onClick={() => available ? onCardClick(card.id) : undefined}
              className="relative rounded-xl overflow-hidden"
              style={{
                border: selCount > 0 ? '2px solid #fcd34d' : '2px solid #1e293b',
                background: '#111827',
                cursor: available ? 'pointer' : 'not-allowed',
                opacity: available ? 1 : 0.4,
                aspectRatio: '1',
              }}
            >
              <img src={card.imagePath} alt={card.name} className="w-full h-full object-cover" />
              <div className="absolute top-1 right-1 rounded-full text-xs font-black px-1.5"
                style={{ background: '#fcd34d', color: '#000', minWidth: 20, textAlign: 'center' }}>
                {card.count}
              </div>
              {selCount > 0 && (
                <div className="absolute inset-0 flex items-center justify-center"
                  style={{ background: 'rgba(252,211,77,0.2)' }}>
                  <span className="text-2xl font-black" style={{ color: '#fcd34d' }}>✓</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ===== 所持融合キャラ図鑑 =====
function FusionGallery({ fusionCollection }) {
  if (fusionCollection.length === 0) return null;
  return (
    <div className="mt-8">
      <div className="text-sm font-bold mb-3" style={{ color: '#94a3b8' }}>
        🧬 所持融合キャラ ({fusionCollection.length}体)
      </div>
      <div className="grid gap-2" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        {fusionCollection.map((id, idx) => {
          const f = fusionMap[id];
          if (!f) return null;
          return (
            <div key={`${id}-${idx}`} className="rounded-xl overflow-hidden"
              style={{ border: '2px solid rgba(255,215,0,0.4)', background: '#111827', aspectRatio: '1' }}>
              <img src={f.imagePath} alt={f.name} className="w-full h-full object-cover" />
            </div>
          );
        })}
      </div>
    </div>
  );
}
