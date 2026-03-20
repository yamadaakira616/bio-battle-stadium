import ProfessorMascot from '../components/ProfessorMascot.jsx';
import { INSECTS } from '../data/insects.js';
import { GACHA_COST } from '../utils/gameLogic.js';

export default function HomeScreen({ state, onPlay, onEncyclopedia, onGacha }) {
  const owned = state.collection.length;
  const total = INSECTS.length;
  const pct = Math.round((owned / total) * 100);

  const greeting = owned === 0
    ? 'むしずかんをコンプリートしよう！'
    : owned === total
    ? 'すごい！全部の虫を集めたよ！🎉'
    : `あと ${total - owned} ひき集めよう！`;

  return (
    <div className="min-h-screen flex flex-col items-center justify-between py-6 px-4"
      style={{ background: 'linear-gradient(180deg, #ecfccb 0%, #d9f99d 100%)' }}>

      {/* Title */}
      <h1 className="text-3xl font-black text-green-800 tracking-tight">
        🐛 むし算ずかん
      </h1>

      {/* Mascot + speech */}
      <div className="flex flex-col items-center gap-2 my-4">
        <ProfessorMascot size={140} mood={owned === total ? 'excited' : 'happy'}/>
        <div className="bg-white rounded-2xl px-4 py-2 shadow text-sm font-bold text-green-900 max-w-xs text-center relative">
          <span className="absolute -top-2 left-1/2 -translate-x-1/2 text-lg">💬</span>
          {greeting}
        </div>
      </div>

      {/* Encyclopedia progress */}
      <div className="w-full max-w-sm bg-white rounded-2xl p-4 shadow mb-4">
        <div className="flex justify-between text-sm font-bold text-green-800 mb-2">
          <span>🔍 ずかん</span>
          <span>{owned}/{total}しゅ</span>
        </div>
        <div className="w-full bg-green-100 rounded-full h-4 overflow-hidden">
          <div
            className="h-4 rounded-full transition-all duration-500"
            style={{ width: `${pct}%`, background: 'linear-gradient(90deg, #4ade80, #16a34a)' }}
          />
        </div>
        <div className="text-right text-xs text-green-600 mt-1">{pct}%</div>
      </div>

      {/* Stats row */}
      <div className="flex gap-3 w-full max-w-sm mb-4">
        <div className="flex-1 bg-white rounded-xl p-3 text-center shadow">
          <div className="text-2xl font-black text-yellow-500">💰</div>
          <div className="text-lg font-black">{state.coins}</div>
          <div className="text-xs text-gray-500">コイン</div>
        </div>
        <div className="flex-1 bg-white rounded-xl p-3 text-center shadow">
          <div className="text-2xl font-black">⭐</div>
          <div className="text-lg font-black">{state.totalStars}</div>
          <div className="text-xs text-gray-500">ほし</div>
        </div>
        <div className="flex-1 bg-white rounded-xl p-3 text-center shadow">
          <div className="text-2xl font-black">🔥</div>
          <div className="text-lg font-black">{state.bestCombo}</div>
          <div className="text-xs text-gray-500">コンボ</div>
        </div>
      </div>

      {/* Nav buttons */}
      <div className="flex flex-col gap-3 w-full max-w-sm">
        <button
          onClick={onPlay}
          className="w-full py-4 rounded-2xl text-xl font-black text-white shadow-lg active:scale-95 transition-transform"
          style={{ background: 'linear-gradient(135deg, #4ade80, #16a34a)' }}
        >
          🎮 あそぶ
        </button>
        <div className="flex gap-3">
          <button
            onClick={onEncyclopedia}
            className="flex-1 py-3 rounded-2xl text-lg font-black text-white shadow active:scale-95 transition-transform"
            style={{ background: 'linear-gradient(135deg, #60a5fa, #3b82f6)' }}
          >
            📖 ずかん
          </button>
          <button
            onClick={onGacha}
            disabled={state.coins < GACHA_COST}
            className="flex-1 py-3 rounded-2xl text-lg font-black text-white shadow active:scale-95 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ background: 'linear-gradient(135deg, #f472b6, #ec4899)' }}
          >
            🎲 ガチャ
            <div className="text-xs font-normal opacity-80">{GACHA_COST}コイン</div>
          </button>
        </div>
      </div>
    </div>
  );
}
