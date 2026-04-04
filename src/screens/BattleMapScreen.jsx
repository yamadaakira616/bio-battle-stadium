import { NATIONS } from '../data/nations.js';

export default function BattleMapScreen({ state, onBack, onSelectNation }) {
  const conquered = state.battleProgress?.conquered || [];
  const nextIndex = conquered.length;

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: '#080c16', color: '#fff' }}
    >
      <style>{`
        @keyframes nextPulse {
          0%, 100% { box-shadow: 0 0 0 0 var(--pulse-color); }
          50% { box-shadow: 0 0 0 6px var(--pulse-color); }
        }
      `}</style>

      {/* Header */}
      <div
        className="flex items-center gap-3 px-4 py-3 sticky top-0 z-10"
        style={{ background: 'rgba(8,12,22,0.95)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}
      >
        <button onClick={onBack} className="text-xl active:scale-90 transition-transform" style={{ color: '#64748b' }}>←</button>
        <div className="flex-1">
          <h1 className="text-lg font-black" style={{ color: '#e2e8f0' }}>ワールドマップ</h1>
        </div>
        <div className="flex items-center gap-1 px-3 py-1 rounded-full" style={{ background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.2)' }}>
          <span style={{ fontSize: 13 }}>🪙</span>
          <span style={{ fontSize: 13, fontWeight: 800, color: '#fcd34d' }}>{state.coins}</span>
        </div>
      </div>

      {/* Progress */}
      <div className="px-4 py-3">
        <div className="flex justify-between items-center mb-2">
          <span style={{ fontSize: 12, fontWeight: 700, color: '#64748b' }}>世界征服の進捗</span>
          <span style={{ fontSize: 12, fontWeight: 800, color: '#94a3b8' }}>{conquered.length}/{NATIONS.length}</span>
        </div>
        <div className="w-full rounded-full h-2 overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${(conquered.length / NATIONS.length) * 100}%`,
              background: 'linear-gradient(90deg, #d69e2e, #f59e0b)',
            }}
          />
        </div>
      </div>

      {/* Nations */}
      <div className="flex-1 overflow-y-auto px-4 pb-8">
        {NATIONS.map((nation, idx) => {
          const isConquered = conquered.includes(nation.id);
          const isNext = idx === nextIndex;
          const isLocked = idx > nextIndex;

          return (
            <div key={nation.id}>
              {/* Connector line */}
              {idx > 0 && (
                <div className="flex justify-center py-1">
                  <div style={{
                    width: 2, height: 20,
                    background: idx <= nextIndex ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.04)',
                  }} />
                </div>
              )}

              <button
                onClick={() => !isLocked && onSelectNation(nation)}
                disabled={isLocked}
                className="w-full rounded-2xl overflow-hidden text-left transition-all active:scale-[0.98]"
                style={{
                  background: isLocked ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.03)',
                  border: isNext
                    ? `2px solid ${nation.color}88`
                    : isConquered
                    ? '2px solid rgba(34,197,94,0.25)'
                    : '1px solid rgba(255,255,255,0.04)',
                  opacity: isLocked ? 0.35 : 1,
                  '--pulse-color': `${nation.color}30`,
                  animation: isNext ? 'nextPulse 2.5s ease-in-out infinite' : 'none',
                }}
              >
                <div className="p-4">
                  <div className="flex items-center gap-3">
                    {/* Icon */}
                    <div className="relative flex-shrink-0">
                      <div
                        className="w-13 h-13 rounded-xl flex items-center justify-center text-2xl"
                        style={{
                          width: 52, height: 52,
                          background: isLocked ? 'rgba(255,255,255,0.03)' : nation.bgGrad,
                          border: `1px solid ${isLocked ? 'rgba(255,255,255,0.06)' : nation.color + '33'}`,
                        }}
                      >
                        {isLocked ? '🔒' : nation.emoji}
                      </div>
                      {isConquered && (
                        <div
                          className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold"
                          style={{ background: '#16a34a', color: '#fff', fontSize: 10 }}
                        >
                          ✓
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="font-black truncate" style={{ fontSize: 15, color: '#e2e8f0' }}>{nation.name}</span>
                        {isNext && (
                          <span
                            className="text-xs px-2 py-0.5 rounded-full font-bold flex-shrink-0"
                            style={{ background: `${nation.color}20`, color: nation.color, fontSize: 10 }}
                          >
                            NEXT
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: 11, color: '#475569', marginBottom: 3 }}>{nation.nameEn}</div>
                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: 8 }).map((_, i) => (
                          <span key={i} style={{ fontSize: 10, color: i < nation.difficulty ? '#d69e2e' : 'rgba(255,255,255,0.08)' }}>★</span>
                        ))}
                      </div>
                    </div>

                    {/* Reward */}
                    <div className="flex-shrink-0 text-right">
                      {isConquered ? (
                        <div
                          className="px-3 py-1.5 rounded-lg"
                          style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)' }}
                        >
                          <div style={{ fontSize: 11, fontWeight: 800, color: '#4ade80' }}>制覇済み</div>
                        </div>
                      ) : isLocked ? (
                        <div style={{ fontSize: 10, color: '#334155' }}>LOCKED</div>
                      ) : (
                        <div
                          className="px-3 py-1.5 rounded-lg"
                          style={{ background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.15)' }}
                        >
                          <div style={{ fontSize: 10, color: '#64748b', marginBottom: 1 }}>初回報酬</div>
                          <div style={{ fontSize: 13, fontWeight: 800, color: '#fcd34d' }}>🪙 {nation.reward}</div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Enemy preview */}
                  {!isLocked && (
                    <div className="mt-3 flex items-center gap-1.5">
                      <span style={{ fontSize: 10, color: '#475569', marginRight: 2 }}>敵</span>
                      {nation.team.map((card, ci) => (
                        <img
                          key={ci}
                          src={card.imagePath}
                          alt={card.name}
                          style={{
                            width: 28, height: 28,
                            borderRadius: 8,
                            objectFit: 'contain',
                            background: 'rgba(255,255,255,0.03)',
                            border: '1px solid rgba(255,255,255,0.06)',
                          }}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </button>
            </div>
          );
        })}

        {/* All conquered */}
        {conquered.length === NATIONS.length && (
          <div className="mt-4 rounded-2xl p-6 text-center" style={{
            background: 'rgba(251,191,36,0.05)',
            border: '1px solid rgba(251,191,36,0.15)',
          }}>
            <div style={{ fontSize: 36, marginBottom: 4 }}>👑</div>
            <div style={{ fontSize: 18, fontWeight: 900, color: '#fcd34d', marginBottom: 4 }}>
              世界征服完了！
            </div>
            <div style={{ fontSize: 13, color: '#64748b' }}>
              全8カ国を制覇した！あなたは最強の王者だ！
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
