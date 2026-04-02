import { NATIONS } from '../data/nations.js';

export default function BattleMapScreen({ state, onBack, onSelectNation }) {
  const conquered = state.battleProgress?.conquered || [];

  const nextIndex = conquered.length;

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: '#0a0f1e', color: '#fff' }}
    >
      {/* Header */}
      <div
        className="flex items-center gap-3 px-4 py-3 sticky top-0 z-10"
        style={{ background: 'rgba(10,15,30,0.95)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}
      >
        <button
          onClick={onBack}
          className="text-2xl active:scale-90 transition-transform"
        >
          ←
        </button>
        <div className="flex-1">
          <h1 className="text-xl font-black">⚔️ ワールドマップ</h1>
          <div className="text-xs" style={{ color: '#94a3b8' }}>
            征服: {conquered.length} / {NATIONS.length}
          </div>
        </div>
        <div
          className="rounded-xl px-3 py-1 text-sm font-bold"
          style={{ background: 'rgba(255,215,0,0.15)', color: '#fbbf24', border: '1px solid rgba(251,191,36,0.3)' }}
        >
          🪙 {state.coins}
        </div>
      </div>

      {/* Progress bar */}
      <div className="px-4 py-2" style={{ background: 'rgba(255,255,255,0.03)' }}>
        <div className="flex justify-between text-xs mb-1" style={{ color: '#94a3b8' }}>
          <span>世界征服の進捗</span>
          <span>{Math.round((conquered.length / NATIONS.length) * 100)}%</span>
        </div>
        <div className="w-full rounded-full h-2 overflow-hidden" style={{ background: 'rgba(255,255,255,0.1)' }}>
          <div
            className="h-2 rounded-full transition-all duration-700"
            style={{
              width: `${(conquered.length / NATIONS.length) * 100}%`,
              background: 'linear-gradient(90deg, #22c55e, #fbbf24)',
            }}
          />
        </div>
      </div>

      {/* Nations list */}
      <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-3 pb-8">
        {NATIONS.map((nation, idx) => {
          const isConquered = conquered.includes(nation.id);
          const isNext = idx === nextIndex;
          const isLocked = idx > nextIndex;

          return (
            <button
              key={nation.id}
              onClick={() => !isLocked && onSelectNation(nation)}
              disabled={isLocked}
              className="w-full rounded-2xl overflow-hidden text-left transition-all active:scale-98"
              style={{
                background: isLocked ? 'rgba(255,255,255,0.05)' : nation.bgGrad,
                border: isNext
                  ? `2px solid ${nation.color}`
                  : isConquered
                  ? '2px solid rgba(34,197,94,0.5)'
                  : '2px solid transparent',
                boxShadow: isNext
                  ? `0 0 20px ${nation.color}40, 0 4px 16px rgba(0,0,0,0.4)`
                  : isConquered
                  ? '0 4px 12px rgba(0,0,0,0.3)'
                  : 'none',
                opacity: isLocked ? 0.45 : 1,
              }}
            >
              <div className="p-4">
                <div className="flex items-center gap-3">
                  {/* Emoji + Status icon */}
                  <div className="relative flex-shrink-0">
                    <div
                      className="w-14 h-14 rounded-xl flex items-center justify-center text-3xl"
                      style={{
                        background: isLocked
                          ? 'rgba(255,255,255,0.05)'
                          : `${nation.color}22`,
                        border: `1px solid ${isLocked ? 'rgba(255,255,255,0.1)' : nation.color + '44'}`,
                      }}
                    >
                      {isLocked ? '🔒' : nation.emoji}
                    </div>
                    {isConquered && (
                      <div
                        className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs"
                        style={{ background: '#22c55e', boxShadow: '0 0 8px #22c55e' }}
                      >
                        ✓
                      </div>
                    )}
                    {isNext && !isConquered && (
                      <div
                        className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold"
                        style={{ background: nation.color, boxShadow: `0 0 8px ${nation.color}` }}
                      >
                        !
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg font-black truncate">{nation.name}</span>
                      {isNext && (
                        <span
                          className="text-xs px-2 py-0.5 rounded-full font-bold flex-shrink-0"
                          style={{ background: `${nation.color}33`, color: nation.color, border: `1px solid ${nation.color}66` }}
                        >
                          挑戦可能
                        </span>
                      )}
                    </div>
                    <div className="text-xs mb-1" style={{ color: '#94a3b8' }}>{nation.nameEn}</div>
                    {/* Difficulty stars */}
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 8 }).map((_, i) => (
                        <span
                          key={i}
                          className="text-xs"
                          style={{ color: i < nation.difficulty ? '#fbbf24' : 'rgba(255,255,255,0.2)' }}
                        >
                          ★
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Reward */}
                  <div className="flex-shrink-0 text-right">
                    {isConquered ? (
                      <div>
                        <div className="text-green-400 font-bold text-sm">✅ 制覇</div>
                        <div className="text-xs" style={{ color: '#fbbf24' }}>🪙 {nation.reward}</div>
                      </div>
                    ) : isLocked ? (
                      <div className="text-xs" style={{ color: '#64748b' }}>
                        <div>前の国を</div>
                        <div>制覇しよう</div>
                      </div>
                    ) : (
                      <div>
                        <div className="text-xs mb-1" style={{ color: '#94a3b8' }}>報酬</div>
                        <div
                          className="rounded-lg px-2 py-1 text-sm font-black"
                          style={{ background: 'rgba(251,191,36,0.15)', color: '#fbbf24' }}
                        >
                          🪙 {nation.reward}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Enemy preview (only for unlocked) */}
                {!isLocked && (
                  <div className="mt-3 flex items-center gap-1">
                    <span className="text-xs mr-1" style={{ color: '#94a3b8' }}>敵:</span>
                    {nation.team.map((card, ci) => (
                      <img
                        key={ci}
                        src={card.imagePath}
                        alt={card.name}
                        className="w-7 h-7 rounded-lg object-contain"
                        style={{
                          background: 'rgba(0,0,0,0.3)',
                          border: '1px solid rgba(255,255,255,0.1)',
                          filter: isConquered ? 'none' : 'brightness(0.9)',
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Next nation highlight pulse */}
              {isNext && (
                <div
                  className="h-1 w-full"
                  style={{
                    background: `linear-gradient(90deg, transparent, ${nation.color}, transparent)`,
                    animation: 'battleBgPulse 2s ease-in-out infinite',
                  }}
                />
              )}
            </button>
          );
        })}

        {/* All conquered message */}
        {conquered.length === NATIONS.length && (
          <div
            className="rounded-2xl p-6 text-center"
            style={{
              background: 'linear-gradient(160deg,#1a0a00,#3d1a00)',
              border: '2px solid #fbbf24',
              boxShadow: '0 0 30px rgba(251,191,36,0.3)',
            }}
          >
            <div className="text-4xl mb-2">👑</div>
            <div className="text-xl font-black mb-1" style={{ color: '#fbbf24' }}>
              世界征服完了！
            </div>
            <div className="text-sm" style={{ color: '#d97706' }}>
              全8カ国を制覇した！あなたは最強の王者だ！
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
