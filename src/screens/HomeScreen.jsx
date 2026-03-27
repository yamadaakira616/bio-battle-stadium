import ProfessorMascot from '../components/ProfessorMascot.jsx';
import { STICKERS } from '../data/stickers.js';
import { GACHA_COST } from '../utils/gameLogic.js';

export default function HomeScreen({ state, onPlay, onEncyclopedia, onGacha, onStickerBook }) {
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
      <h1 className="text-3xl font-black tracking-tight" style={{ color: '#831843' }}>
        🩷 かわいいシールずかん
      </h1>

      {/* マスコット + ふきだし */}
      <div className="flex flex-col items-center gap-2 my-4">
        <ProfessorMascot size={140} mood={owned === total ? 'excited' : 'happy'} />
        <div
          className="rounded-2xl px-4 py-2 shadow text-sm font-bold max-w-xs text-center relative"
          style={{ background: 'white', color: '#9d174d' }}
        >
          <span className="absolute -top-2 left-1/2 -translate-x-1/2 text-lg">💬</span>
          {greeting}
        </div>
      </div>

      {/* シール収集進捗 */}
      <div className="w-full max-w-sm rounded-2xl p-4 shadow mb-4"
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
      <div className="w-full max-w-sm mb-3">
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
      <div className="flex gap-3 w-full max-w-sm mb-4">
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
          onClick={onStickerBook}
          className="w-full py-3 rounded-2xl text-lg font-black text-white shadow active:scale-95 transition-transform"
          style={{ background: 'linear-gradient(135deg, #f9a8d4, #ec4899)' }}
        >
          📖 シールブック
          <div className="text-xs font-normal opacity-80">シールをはって飾ろう！</div>
        </button>
      </div>
    </div>
  );
}
