import { STICKERS } from '../data/stickers.js';
import { GACHA_COST } from '../utils/gameLogic.js';

const B = import.meta.env.BASE_URL;

// ショーケース：全5シリーズからふんだんに表示
const SHOWCASE = [
  // 城主（レジェンド）- 大きく目立つ
  { src: B+'assets/gacha/catsle/tiger-king.png',             x: '38%', y: '4%',  size: 90, rotate:  0,  delay: '0s',   z: 10 },
  { src: B+'assets/gacha/catsle/white-lion-king.png',        x: '6%',  y: '30%', size: 72, rotate: -8,  delay: '0.6s', z: 8  },
  { src: B+'assets/gacha/catsle/giant-stag-beetle-king.png', x: '73%', y: '28%', size: 72, rotate:  9,  delay: '1.0s', z: 8  },
  // 軍団
  { src: B+'assets/gacha/corps/elephant-rhino-army.png',     x: '0%',  y: '62%', size: 66, rotate: -6,  delay: '0.3s', z: 6  },
  { src: B+'assets/gacha/corps/lion-hyena-army.png',         x: '68%', y: '60%', size: 66, rotate:  7,  delay: '0.8s', z: 6  },
  { src: B+'assets/gacha/corps/gorilla-mandrill-legion.png', x: '30%', y: '68%', size: 62, rotate: -4,  delay: '1.3s', z: 6  },
  // 武装生物
  { src: B+'assets/gacha/armbio/trex-artillery-front.png',   x: '55%', y: '8%',  size: 68, rotate:  6,  delay: '0.4s', z: 7  },
  { src: B+'assets/gacha/armbio/elephant-with-rockets.png',  x: '14%', y: '8%',  size: 64, rotate: -10, delay: '0.9s', z: 7  },
  { src: B+'assets/gacha/armbio/mantis-with-gatling.png',    x: '80%', y: '6%',  size: 60, rotate:  5,  delay: '1.5s', z: 7  },
  // 武器
  { src: B+'assets/gacha/arms/katana.png',                   x: '2%',  y: '45%', size: 56, rotate: 15,  delay: '0.2s', z: 5  },
  { src: B+'assets/gacha/arms/divine-celestial-greatsword.png', x: '84%', y: '44%', size: 56, rotate: -12, delay: '0.7s', z: 5 },
  { src: B+'assets/gacha/arms/plasma-beam-rifle.png',        x: '55%', y: '70%', size: 52, rotate: -5,  delay: '1.1s', z: 5  },
  // 生物
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
    ? '全ての国を征服した！伝説の王者！👑'
    : conquered > 0
    ? `${conquered}カ国征服！さらなる強敵が待つ！`
    : `${owned}枚収集済み！バトルで国を征服しよう！`;

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-between py-5 px-4"
      style={{ background: 'linear-gradient(180deg, #0a0e1a 0%, #0f1e3a 35%, #1a1035 70%, #0d0a1e 100%)' }}
    >
      <style>{`
        @keyframes heroFloat {
          0%, 100% { transform: translateY(0px) rotate(var(--rot)); }
          50%       { transform: translateY(-9px) rotate(var(--rot)); }
        }
        @keyframes titleGlow {
          0%, 100% { text-shadow: 0 0 20px rgba(251,191,36,0.6), 0 0 40px rgba(251,191,36,0.3); }
          50%       { text-shadow: 0 0 30px rgba(251,191,36,0.9), 0 0 60px rgba(251,191,36,0.5), 0 0 80px rgba(251,191,36,0.2); }
        }
        @keyframes barShine {
          0%   { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes borderPulse {
          0%, 100% { box-shadow: 0 0 8px rgba(251,191,36,0.3), inset 0 0 8px rgba(251,191,36,0.05); }
          50%       { box-shadow: 0 0 18px rgba(251,191,36,0.5), inset 0 0 12px rgba(251,191,36,0.1); }
        }
        @keyframes btnGlow {
          0%, 100% { box-shadow: 0 8px 24px rgba(251,191,36,0.35); }
          50%       { box-shadow: 0 8px 32px rgba(251,191,36,0.6); }
        }
      `}</style>

      {/* タイトル */}
      <div className="text-center flex-shrink-0">
        <div className="text-xs font-bold tracking-[0.3em] mb-0.5" style={{ color: '#60a5fa' }}>
          ⚔ STRATEGIC CARD BATTLE ⚔
        </div>
        <h1
          className="text-3xl font-black tracking-tight leading-none"
          style={{
            background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 40%, #fde68a 60%, #d97706 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            animation: 'titleGlow 2.5s ease-in-out infinite',
          }}
        >
          BIO BATTLE
        </h1>
        <h1
          className="text-2xl font-black tracking-widest leading-none"
          style={{
            background: 'linear-gradient(135deg, #e2e8f0 0%, #94a3b8 50%, #e2e8f0 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          STADIUM
        </h1>
      </div>

      {/* カードショーケース */}
      <div style={{ position: 'relative', width: '100%', maxWidth: 420, height: 200, flexShrink: 0, margin: '4px 0' }}>
        {/* 背景グロー */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse at 50% 50%, rgba(251,191,36,0.07) 0%, transparent 70%)',
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
              filter: `drop-shadow(0 4px 12px rgba(0,0,0,0.7)) drop-shadow(0 0 8px rgba(251,191,36,${s.z >= 8 ? '0.4' : '0.15'}))`,
              pointerEvents: 'none',
            }}
          />
        ))}
      </div>

      {/* メッセージバナー */}
      <div
        className="w-full max-w-sm rounded-xl px-4 py-2 text-center text-sm font-bold flex-shrink-0"
        style={{
          background: 'linear-gradient(135deg, rgba(251,191,36,0.12), rgba(59,130,246,0.12))',
          border: '1px solid rgba(251,191,36,0.3)',
          color: '#fde68a',
          animation: 'borderPulse 3s ease-in-out infinite',
        }}
      >
        ⚔️ {greeting}
      </div>

      {/* 征服進捗 & カード収集 */}
      <div className="w-full max-w-sm flex gap-2 flex-shrink-0">
        {/* 征服マップ */}
        <div className="flex-1 rounded-xl p-3"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(251,191,36,0.2)' }}>
          <div className="text-xs font-bold mb-1.5 flex justify-between" style={{ color: '#fbbf24' }}>
            <span>👑 征服</span><span>{conquered}/8</span>
          </div>
          <div className="w-full rounded-full h-2.5 overflow-hidden" style={{ background: 'rgba(255,255,255,0.1)' }}>
            <div className="h-full rounded-full transition-all duration-500"
              style={{ width: `${(conquered / 8) * 100}%`, background: 'linear-gradient(90deg, #f59e0b, #fbbf24)' }} />
          </div>
        </div>
        {/* カード収集 */}
        <div className="flex-1 rounded-xl p-3"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(96,165,250,0.2)' }}>
          <div className="text-xs font-bold mb-1.5 flex justify-between" style={{ color: '#60a5fa' }}>
            <span>🃏 カード</span><span>{owned}/{total}</span>
          </div>
          <div className="w-full rounded-full h-2.5 overflow-hidden" style={{ background: 'rgba(255,255,255,0.1)' }}>
            <div className="h-full rounded-full transition-all duration-500"
              style={{ width: `${pct}%`, background: 'linear-gradient(90deg, #3b82f6, #60a5fa)' }} />
          </div>
        </div>
      </div>

      {/* スタッツ & レベル */}
      <div className="w-full max-w-sm flex gap-2 flex-shrink-0">
        <div className="rounded-xl px-3 py-2.5 flex items-center gap-2 flex-1"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(251,191,36,0.2)' }}>
          <div className="text-2xl font-black leading-none" style={{ color: '#fbbf24' }}>
            Lv.{state.level ?? 1}
          </div>
          <div className="flex-1">
            <div className="text-xs mb-1" style={{ color: '#94a3b8' }}>算数レベル</div>
            <div className="w-full rounded-full h-1.5 overflow-hidden" style={{ background: 'rgba(255,255,255,0.1)' }}>
              <div className="h-full rounded-full"
                style={{ width: `${((state.level ?? 1) / 50) * 100}%`, background: 'linear-gradient(90deg, #f59e0b, #fbbf24)' }} />
            </div>
          </div>
          <div className="text-xs" style={{ color: '#64748b' }}>{state.level ?? 1}/50</div>
        </div>
        {[
          { icon: '🪙', val: state.coins,      label: 'コイン' },
          { icon: '⭐', val: state.totalStars, label: 'ほし' },
          { icon: '🔥', val: state.bestCombo,  label: 'コンボ' },
        ].map(({ icon, val, label }) => (
          <div key={label} className="rounded-xl px-2 py-2.5 text-center"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div className="text-lg">{icon}</div>
            <div className="text-base font-black" style={{ color: '#e2e8f0' }}>{val}</div>
            <div className="text-xs" style={{ color: '#64748b' }}>{label}</div>
          </div>
        ))}
      </div>

      {/* ナビゲーションボタン */}
      <div className="flex flex-col gap-2.5 w-full max-w-sm flex-shrink-0">

        {/* バトル - メインCTA */}
        <button
          onClick={onBattle}
          className="w-full py-4 rounded-2xl font-black text-white active:scale-95 transition-transform relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #1e3a5f 0%, #1d4ed8 50%, #1e3a5f 100%)',
            animation: 'btnGlow 2.5s ease-in-out infinite',
            fontSize: '1.2rem',
          }}
        >
          <div className="absolute inset-0 opacity-30"
            style={{ background: 'linear-gradient(135deg, transparent 40%, rgba(251,191,36,0.3) 50%, transparent 60%)', backgroundSize: '200% 100%', animation: 'barShine 3s linear infinite' }} />
          <span className="relative">⚔️ バトル開始</span>
          <div className="text-xs font-normal opacity-80 relative">国を征服して最強の王者になれ！</div>
        </button>

        {/* あそぶ & ガチャ */}
        <div className="flex gap-2.5">
          <button
            onClick={onPlay}
            className="flex-1 py-3.5 rounded-2xl text-lg font-black text-white shadow active:scale-95 transition-transform"
            style={{ background: 'linear-gradient(135deg, #059669, #10b981)' }}
          >
            🎮 あそぶ
            <div className="text-xs font-normal opacity-80">算数で強化！</div>
          </button>
          <button
            onClick={onGacha}
            disabled={state.coins < GACHA_COST}
            aria-disabled={state.coins < GACHA_COST}
            className="flex-1 py-3.5 rounded-2xl text-lg font-black text-white shadow active:scale-95 transition-transform disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)' }}
          >
            🎰 ガチャ
            <div className="text-xs font-normal opacity-80">{GACHA_COST}コイン</div>
            {state.coins < GACHA_COST && GACHA_COST - state.coins <= 50 && (
              <div className="text-xs font-normal opacity-90">あと{GACHA_COST - state.coins}コイン</div>
            )}
          </button>
        </div>

        {/* 図鑑 */}
        <button
          onClick={onEncyclopedia}
          className="w-full py-3 rounded-2xl text-base font-black text-white shadow active:scale-95 transition-transform"
          style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.08), rgba(255,255,255,0.04))', border: '1px solid rgba(255,255,255,0.15)' }}
        >
          📖 カード図鑑
          <span className="ml-2 text-xs font-normal opacity-60">{owned}/{total}枚収集</span>
        </button>
      </div>
    </div>
  );
}
