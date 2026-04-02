import { STICKERS } from '../data/stickers.js';
import { GACHA_COST } from '../utils/gameLogic.js';

const stickerMap = Object.fromEntries(STICKERS.map(s => [s.id, s]));

// トップ画面に浮かべるシール（上段・中段・下段 各5枚）
const SHOWCASE = [
  // 上段
  { id: 'nm-quokka',       x: '1%',  y: '2%',  size: 68, rotate: -12, delay: '0s'   },
  { id: 'sp-velvet-bunny', x: '22%', y: '0%',  size: 64, rotate:   7, delay: '0.4s' },
  { id: 'nm-mendako',      x: '43%', y: '2%',  size: 66, rotate:  -5, delay: '0.8s' },
  { id: 'nm-kitsune',      x: '64%', y: '0%',  size: 62, rotate:  14, delay: '0.2s' },
  { id: 'bd-ghost',        x: '83%', y: '3%',  size: 60, rotate:  -8, delay: '1.1s' },
  // 中段
  { id: 'ss-ame-chan',     x: '0%',  y: '40%', size: 58, rotate:  11, delay: '0.6s' },
  { id: 'mm-cream-soda',   x: '20%', y: '38%', size: 62, rotate: -14, delay: '0.9s' },
  { id: 'ws-neko-chan',    x: '41%', y: '41%', size: 60, rotate:   6, delay: '0.1s' },
  { id: 'sp-velvet-cat',   x: '62%', y: '38%', size: 58, rotate: -10, delay: '1.3s' },
  { id: 'os-axolotl',      x: '82%', y: '40%', size: 56, rotate:  13, delay: '0.5s' },
  // 下段
  { id: 'nm-axolotl',      x: '7%',  y: '74%', size: 58, rotate:  -7, delay: '0.7s' },
  { id: 'bd-crystal',      x: '29%', y: '72%', size: 60, rotate:   9, delay: '1.0s' },
  { id: 'sp-puni-animals', x: '52%', y: '74%', size: 58, rotate: -11, delay: '0.3s' },
  { id: 'nm-kappa',        x: '76%', y: '72%', size: 56, rotate:   4, delay: '1.4s' },
];

export default function HomeScreen({ state, onPlay, onEncyclopedia, onGacha, onBattle }) {
  const owned = state.collection.length;
  const total = STICKERS.length;
  const pct = Math.round((owned / total) * 100);

  const greeting = owned === 0
    ? 'シールをぜんぶ集めよう！🩷'
    : owned === total
    ? 'すごい！全部のシールを集めたよ！🎉'
    : `あと ${total - owned} まいのシールをゲットしよう！`;

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-between py-6 px-4"
      style={{ background: 'linear-gradient(180deg, #fce7f3 0%, #fdf2f8 50%, #f5f0ff 100%)' }}
    >
      {/* タイトル */}
      <h1 className="text-3xl font-black tracking-tight" style={{ color: '#1e3a5f' }}>
        ⚔️ Bio Battle Stadium
      </h1>

      {/* シールショーケース */}
      <div style={{ position: 'relative', width: '100%', maxWidth: 420, height: 185, flexShrink: 0, margin: '8px 0' }}>
        {SHOWCASE.map((s) => {
          const sticker = stickerMap[s.id];
          if (!sticker) return null;
          return (
            <img
              key={s.id}
              src={sticker.imagePath}
              alt={sticker.name}
              style={{
                position: 'absolute',
                left: s.x,
                top: s.y,
                width: s.size,
                height: s.size,
                objectFit: 'contain',
                '--rot': `${s.rotate}deg`,
                animation: `stickerFloat 3s ease-in-out infinite`,
                animationDelay: s.delay,
                filter: 'drop-shadow(0 3px 8px rgba(0,0,0,0.18))',
                pointerEvents: 'none',
              }}
            />
          );
        })}
      </div>

      {/* ふきだし */}
      <div
        className="rounded-2xl px-4 py-2 shadow text-sm font-bold max-w-xs text-center relative"
        style={{ background: 'white', color: '#9d174d', border: '2px solid #fbcfe8', flexShrink: 0 }}
      >
        <span className="absolute -top-2 left-1/2 -translate-x-1/2 text-lg">💬</span>
        {greeting}
      </div>

      {/* シール収集進捗 */}
      <div className="w-full max-w-sm rounded-2xl p-4 shadow mb-2"
           style={{ background: 'white', border: '2px solid #fbcfe8' }}>
        <div className="flex justify-between text-sm font-bold mb-2" style={{ color: '#be185d' }}>
          <span>🩷 シールずかん</span>
          <span>{owned}/{total}まい</span>
        </div>
        <div className="w-full rounded-full h-4 overflow-hidden" style={{ background: '#fce7f3' }}>
          <div
            className="h-4 rounded-full transition-all duration-500"
            style={{ width: `${pct}%`, background: 'linear-gradient(90deg, #f9a8d4, #ec4899)' }}
          />
        </div>
        <div className="text-right text-xs mt-1" style={{ color: '#ec4899' }}>{pct}%</div>
      </div>

      {/* レベル表示 */}
      <div className="w-full max-w-sm mb-2">
        <div className="rounded-2xl px-4 py-3 shadow flex items-center gap-3"
             style={{ background: 'white', border: '2px solid #fbcfe8' }}>
          <div className="text-3xl font-black leading-none" style={{ color: '#db2777' }}>
            Lv.{state.level ?? 1}
          </div>
          <div className="flex-1">
            <div className="text-xs font-bold mb-1" style={{ color: '#9ca3af' }}>算数レベル</div>
            <div className="w-full rounded-full h-2.5 overflow-hidden" style={{ background: '#fce7f3' }}>
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${((state.level ?? 1) / 50) * 100}%`,
                  background: 'linear-gradient(90deg, #f9a8d4, #ec4899)',
                }}
              />
            </div>
          </div>
          <div className="text-xs font-bold whitespace-nowrap" style={{ color: '#9ca3af' }}>
            {state.level ?? 1}/50
          </div>
        </div>
      </div>

      {/* スタッツ行 */}
      <div className="flex gap-3 w-full max-w-sm mb-3">
        {[
          { icon: '🪙', val: state.coins,      label: 'コイン' },
          { icon: '⭐', val: state.totalStars, label: 'ほし' },
          { icon: '🔥', val: state.bestCombo,  label: 'コンボ' },
        ].map(({ icon, val, label }) => (
          <div key={label} className="flex-1 rounded-xl p-3 text-center shadow"
               style={{ background: 'white', border: '1.5px solid #fbcfe8' }}>
            <div className="text-2xl font-black">{icon}</div>
            <div className="text-lg font-black" style={{ color: '#9d174d' }}>{val}</div>
            <div className="text-xs" style={{ color: '#9ca3af' }}>{label}</div>
          </div>
        ))}
      </div>

      {/* ナビゲーションボタン */}
      <div className="flex flex-col gap-3 w-full max-w-sm">
        <button
          onClick={onPlay}
          className="w-full py-4 rounded-2xl text-xl font-black text-white shadow-lg active:scale-95 transition-transform"
          style={{ background: 'linear-gradient(135deg, #f472b6, #ec4899)', boxShadow: '0 8px 24px rgba(236,72,153,0.4)' }}
        >
          🎮 あそぶ
        </button>
        <div className="flex gap-3">
          <button
            onClick={onEncyclopedia}
            className="flex-1 py-3 rounded-2xl text-lg font-black text-white shadow active:scale-95 transition-transform"
            style={{ background: 'linear-gradient(135deg, #c084fc, #a855f7)' }}
          >
            🩷 シールずかん
          </button>
          <button
            onClick={onGacha}
            disabled={state.coins < GACHA_COST}
            aria-disabled={state.coins < GACHA_COST}
            className="flex-1 py-3 rounded-2xl text-lg font-black text-white shadow active:scale-95 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ background: 'linear-gradient(135deg, #fb7185, #f43f5e)' }}
          >
            🎀 ガチャ
            <div className="text-xs font-normal opacity-80">{GACHA_COST}コイン</div>
            {state.coins < GACHA_COST && GACHA_COST - state.coins <= 50 && (
              <div className="text-xs font-normal opacity-90">あと{GACHA_COST - state.coins}コイン</div>
            )}
          </button>
        </div>
        <button
          onClick={onBattle}
          className="w-full py-3 rounded-2xl text-lg font-black text-white shadow active:scale-95 transition-transform"
          style={{ background: 'linear-gradient(135deg, #1e3a5f, #1e40af)', boxShadow: '0 8px 24px rgba(30,64,175,0.5)' }}
        >
          ⚔️ バトル
          <div className="text-xs font-normal opacity-80">国を征服しよう！</div>
        </button>
      </div>
    </div>
  );
}
