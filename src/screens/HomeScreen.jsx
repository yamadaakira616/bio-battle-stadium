import { STICKERS } from '../data/stickers.js';
import { GACHA_COST } from '../utils/gameLogic.js';

const B = import.meta.env.BASE_URL;

const SHOWCASE = [
  { src: B+'assets/gacha/catsle/tiger-king.png',             x: '38%', y: '4%',  size: 90, rotate:  0,  delay: '0s',   z: 10 },
  { src: B+'assets/gacha/catsle/white-lion-king.png',        x: '6%',  y: '30%', size: 72, rotate: -8,  delay: '0.6s', z: 8  },
  { src: B+'assets/gacha/catsle/giant-stag-beetle-king.png', x: '73%', y: '28%', size: 72, rotate:  9,  delay: '1.0s', z: 8  },
  { src: B+'assets/gacha/corps/elephant-rhino-army.png',     x: '0%',  y: '62%', size: 66, rotate: -6,  delay: '0.3s', z: 6  },
  { src: B+'assets/gacha/corps/lion-hyena-army.png',         x: '68%', y: '60%', size: 66, rotate:  7,  delay: '0.8s', z: 6  },
  { src: B+'assets/gacha/corps/gorilla-mandrill-legion.png', x: '30%', y: '68%', size: 62, rotate: -4,  delay: '1.3s', z: 6  },
  { src: B+'assets/gacha/armbio/trex-artillery-front.png',   x: '55%', y: '8%',  size: 68, rotate:  6,  delay: '0.4s', z: 7  },
  { src: B+'assets/gacha/armbio/elephant-with-rockets.png',  x: '14%', y: '8%',  size: 64, rotate: -10, delay: '0.9s', z: 7  },
  { src: B+'assets/gacha/armbio/mantis-with-gatling.png',    x: '80%', y: '6%',  size: 60, rotate:  5,  delay: '1.5s', z: 7  },
  { src: B+'assets/gacha/arms/katana.png',                   x: '2%',  y: '45%', size: 56, rotate: 15,  delay: '0.2s', z: 5  },
  { src: B+'assets/gacha/arms/divine-celestial-greatsword.png', x: '84%', y: '44%', size: 56, rotate: -12, delay: '0.7s', z: 5 },
  { src: B+'assets/gacha/arms/plasma-beam-rifle.png',        x: '55%', y: '70%', size: 52, rotate: -5,  delay: '1.1s', z: 5  },
  { src: B+'assets/gacha/bio/tyrannosaurus-rex.png',         x: '20%', y: '48%', size: 58, rotate: -7,  delay: '0.5s', z: 4  },
  { src: B+'assets/gacha/bio/hercules-beetle.png',           x: '68%', y: '46%', size: 54, rotate:  8,  delay: '1.2s', z: 4  },
  { src: B+'assets/gacha/bio/african-lion.png',              x: '44%', y: '46%', size: 52, rotate:  3,  delay: '1.6s', z: 4  },
];

export default function HomeScreen({ state, onPlay, onEncyclopedia, onGacha, onBattle }) {
  const owned = state.collection.length;
  const total = STICKERS.length;
  const pct = Math.round((owned / total) * 100);
  const conquered = state.battleProgress?.conquered?.length ?? 0;

  const greeting = owned === 0
    ? '生物カードを集めて最強の軍団を作れ！'
    : conquered >= 8
    ? '全ての国を征服した！伝説の王者！'
    : conquered > 0
    ? `${conquered}カ国征服！さらなる強敵が待つ！`
    : `${owned}枚収集済み！バトルで国を征服しよう！`;

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-between py-4 px-4"
      style={{ background: '#080c16' }}
    >
      <style>{`
        @keyframes heroFloat {
          0%, 100% { transform: translateY(0px) rotate(var(--rot)); }
          50%       { transform: translateY(-8px) rotate(var(--rot)); }
        }
        .game-btn { transition: transform 0.1s; }
        .game-btn:active { transform: translateY(3px) !important; }
      `}</style>

      {/* Status Bar */}
      <div className="w-full max-w-sm flex items-center gap-2 flex-shrink-0 mb-1">
        <div
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
          style={{ background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.25)' }}
        >
          <span style={{ fontSize: 11, fontWeight: 800, color: '#fcd34d' }}>Lv.{state.level ?? 1}</span>
        </div>
        <div className="flex-1" />
        <div
          className="flex items-center gap-1 px-3 py-1.5 rounded-full"
          style={{ background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.2)' }}
        >
          <span style={{ fontSize: 14 }}>🪙</span>
          <span style={{ fontSize: 13, fontWeight: 800, color: '#fcd34d' }}>{state.coins}</span>
        </div>
        <div
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-full"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          <span style={{ fontSize: 12 }}>⭐</span>
          <span style={{ fontSize: 12, fontWeight: 700, color: '#cbd5e1' }}>{state.totalStars}</span>
        </div>
      </div>

      {/* Title */}
      <div className="text-center flex-shrink-0">
        <div className="relative inline-block px-6 py-1">
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(180deg, rgba(251,191,36,0.08) 0%, transparent 100%)',
            borderRadius: 12,
          }} />
          <h1
            className="text-4xl font-black tracking-tight leading-none relative"
            style={{
              background: 'linear-gradient(180deg, #fde68a 0%, #d69e2e 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '-0.02em',
            }}
          >
            BIO BATTLE
          </h1>
          <h1
            className="text-xl font-black tracking-[0.25em] leading-none mt-0.5 relative"
            style={{
              color: '#64748b',
            }}
          >
            STADIUM
          </h1>
        </div>
      </div>

      {/* Card Showcase */}
      <div style={{ position: 'relative', width: '100%', maxWidth: 420, height: 210, flexShrink: 0, margin: '0' }}>
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse at 50% 50%, rgba(251,191,36,0.05) 0%, transparent 65%)',
          pointerEvents: 'none',
        }} />
        {SHOWCASE.map((s, i) => (
          <img
            key={i}
            src={s.src}
            alt=""
            style={{
              position: 'absolute',
              left: s.x,
              top: s.y,
              width: s.size,
              height: s.size,
              objectFit: 'contain',
              zIndex: s.z,
              '--rot': `${s.rotate}deg`,
              animation: `heroFloat ${2.8 + (i % 4) * 0.4}s ease-in-out infinite`,
              animationDelay: s.delay,
              filter: `drop-shadow(0 3px 8px rgba(0,0,0,0.8))`,
              pointerEvents: 'none',
            }}
          />
        ))}
      </div>

      {/* Message */}
      <div
        className="w-full max-w-sm rounded-2xl px-4 py-2.5 text-center text-sm font-bold flex-shrink-0"
        style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.06)',
          color: '#94a3b8',
        }}
      >
        {greeting}
      </div>

      {/* Progress */}
      <div className="w-full max-w-sm flex gap-3 flex-shrink-0">
        <div className="flex-1 rounded-2xl p-3" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex justify-between items-center mb-2">
            <span style={{ fontSize: 11, fontWeight: 800, color: '#fcd34d' }}>征服</span>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#64748b' }}>{conquered}/8</span>
          </div>
          <div className="w-full rounded-full h-2 overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
            <div className="h-full rounded-full" style={{ width: `${(conquered / 8) * 100}%`, background: '#d69e2e', transition: 'width 0.5s' }} />
          </div>
        </div>
        <div className="flex-1 rounded-2xl p-3" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex justify-between items-center mb-2">
            <span style={{ fontSize: 11, fontWeight: 800, color: '#60a5fa' }}>カード</span>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#64748b' }}>{owned}/{total}</span>
          </div>
          <div className="w-full rounded-full h-2 overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
            <div className="h-full rounded-full" style={{ width: `${pct}%`, background: '#3b82f6', transition: 'width 0.5s' }} />
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex flex-col gap-3 w-full max-w-sm flex-shrink-0">
        {/* Battle - Primary */}
        <button
          onClick={onBattle}
          className="game-btn w-full py-4 rounded-2xl font-black text-white relative overflow-hidden"
          style={{
            background: 'linear-gradient(180deg, #f59e0b 0%, #b45309 100%)',
            boxShadow: '0 5px 0 #78350f, 0 8px 20px rgba(0,0,0,0.4)',
            fontSize: '1.2rem',
            border: 'none',
          }}
        >
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, height: '50%',
            background: 'linear-gradient(180deg, rgba(255,255,255,0.15) 0%, transparent 100%)',
            borderRadius: '16px 16px 0 0',
            pointerEvents: 'none',
          }} />
          <span className="relative">バトル開始</span>
          <div className="text-xs font-bold opacity-70 relative mt-0.5">国を征服して最強の王者になれ！</div>
        </button>

        {/* Play & Gacha */}
        <div className="flex gap-3">
          <button
            onClick={onPlay}
            className="game-btn flex-1 py-3.5 rounded-2xl font-black text-white relative overflow-hidden"
            style={{
              background: 'linear-gradient(180deg, #22c55e 0%, #15803d 100%)',
              boxShadow: '0 4px 0 #14532d, 0 6px 16px rgba(0,0,0,0.3)',
              fontSize: '1.05rem',
              border: 'none',
            }}
          >
            <div style={{
              position: 'absolute', top: 0, left: 0, right: 0, height: '50%',
              background: 'linear-gradient(180deg, rgba(255,255,255,0.12) 0%, transparent 100%)',
              borderRadius: '16px 16px 0 0',
              pointerEvents: 'none',
            }} />
            <span className="relative">あそぶ</span>
            <div className="text-xs font-bold opacity-60 relative">算数で強化</div>
          </button>
          <button
            onClick={onGacha}
            disabled={state.coins < GACHA_COST}
            className="game-btn flex-1 py-3.5 rounded-2xl font-black text-white relative overflow-hidden disabled:opacity-35"
            style={{
              background: 'linear-gradient(180deg, #a855f7 0%, #6b21a8 100%)',
              boxShadow: state.coins < GACHA_COST ? 'none' : '0 4px 0 #4c1d95, 0 6px 16px rgba(0,0,0,0.3)',
              fontSize: '1.05rem',
              border: 'none',
            }}
          >
            <div style={{
              position: 'absolute', top: 0, left: 0, right: 0, height: '50%',
              background: 'linear-gradient(180deg, rgba(255,255,255,0.12) 0%, transparent 100%)',
              borderRadius: '16px 16px 0 0',
              pointerEvents: 'none',
            }} />
            <span className="relative">ガチャ</span>
            <div className="text-xs font-bold opacity-60 relative">{GACHA_COST}コイン</div>
          </button>
        </div>

        {/* Encyclopedia */}
        <button
          onClick={onEncyclopedia}
          className="game-btn w-full py-3 rounded-2xl font-bold relative overflow-hidden"
          style={{
            background: 'rgba(255,255,255,0.04)',
            boxShadow: '0 3px 0 rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.08)',
            color: '#94a3b8',
            fontSize: '0.95rem',
          }}
        >
          カード図鑑
          <span className="ml-2 text-xs opacity-60">{owned}/{total}枚</span>
        </button>
      </div>
    </div>
  );
}
