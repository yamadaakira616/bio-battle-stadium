import { useEffect, useState } from 'react';

const FLOWERS = ['🌸','🌺','🌼','🌻','💐','🌹','🌷','✿'];
const SPARKLES = ['✨','💫','⭐','🌟','💥','🔆'];

function FloatingPetal({ emoji, style }) {
  return (
    <div style={{
      position: 'absolute',
      fontSize: style.size,
      left: style.left,
      top: style.top,
      animation: `legendaryPetal ${style.duration}s ease-in-out ${style.delay}s both`,
      pointerEvents: 'none',
      zIndex: 60,
    }}>
      {emoji}
    </div>
  );
}

export default function LegendaryReveal({ active, onComplete }) {
  const [phase, setPhase] = useState('idle'); // idle → flash → petals → card → done

  useEffect(() => {
    if (!active) { setPhase('idle'); return; }
    setPhase('flash');
    const t1 = setTimeout(() => setPhase('petals'), 600);
    const t2 = setTimeout(() => setPhase('card'), 2000);
    const t3 = setTimeout(() => { setPhase('done'); onComplete?.(); }, 3800);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [active]);

  if (phase === 'idle' || phase === 'done') return null;

  // 花びら・スパークルの配置（固定シード）
  const petals = Array.from({ length: 28 }, (_, i) => ({
    emoji: i % 3 === 0 ? SPARKLES[i % SPARKLES.length] : FLOWERS[i % FLOWERS.length],
    style: {
      size: `${1.2 + (i % 5) * 0.4}rem`,
      left: `${(i * 13 + 3) % 95}%`,
      top: `${(i * 17 + 5) % 90}%`,
      duration: 1.8 + (i % 4) * 0.3,
      delay: (i % 7) * 0.15,
    },
  }));

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 55,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      pointerEvents: 'none',
    }}>
      {/* フラッシュ */}
      {phase === 'flash' && (
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(circle, rgba(255,220,80,0.95) 0%, rgba(255,150,200,0.85) 40%, rgba(180,100,255,0.7) 100%)',
          animation: 'legendaryFlash 0.6s ease-out both',
          zIndex: 56,
        }} />
      )}

      {/* 花びらシャワー */}
      {(phase === 'petals' || phase === 'card') && petals.map((p, i) => (
        <FloatingPetal key={i} emoji={p.emoji} style={p.style} />
      ))}

      {/* 背景オーラ */}
      {(phase === 'petals' || phase === 'card') && (
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse at center, rgba(255,215,0,0.25) 0%, rgba(255,100,200,0.15) 50%, transparent 80%)',
          animation: 'legendaryAura 1.8s ease-in-out infinite alternate',
          zIndex: 57,
        }} />
      )}

      {/* LEGENDARY テキスト */}
      {(phase === 'petals' || phase === 'card') && (
        <div style={{
          position: 'relative', zIndex: 62,
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
          animation: 'legendaryTextIn 0.5s cubic-bezier(0.34,1.56,0.64,1) 0.3s both',
        }}>
          <div style={{ fontSize: '2.8rem', letterSpacing: '0.15em', fontWeight: 900,
            background: 'linear-gradient(135deg, #FFD700 0%, #FF69B4 40%, #DA70D6 70%, #FFD700 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            filter: 'drop-shadow(0 0 12px rgba(255,215,0,0.8))',
          }}>
            ✨ LEGENDARY ✨
          </div>
          <div style={{ fontSize: '1rem', color: '#FFD700', fontWeight: 700, letterSpacing: '0.3em',
            textShadow: '0 0 8px rgba(255,215,0,0.9)',
          }}>
            伝説のカード降臨
          </div>
        </div>
      )}

      <style>{`
        @keyframes legendaryFlash {
          0%   { opacity: 0; transform: scale(0.8); }
          40%  { opacity: 1; transform: scale(1.05); }
          100% { opacity: 0; transform: scale(1.2); }
        }
        @keyframes legendaryPetal {
          0%   { opacity: 0; transform: translateY(60px) rotate(0deg) scale(0); }
          20%  { opacity: 1; transform: translateY(-20px) rotate(180deg) scale(1.1); }
          80%  { opacity: 0.9; transform: translateY(-80px) rotate(360deg) scale(1); }
          100% { opacity: 0; transform: translateY(-140px) rotate(540deg) scale(0.5); }
        }
        @keyframes legendaryAura {
          0%   { opacity: 0.6; transform: scale(0.95); }
          100% { opacity: 1;   transform: scale(1.05); }
        }
        @keyframes legendaryTextIn {
          0%   { opacity: 0; transform: scale(0.3) translateY(40px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  );
}
