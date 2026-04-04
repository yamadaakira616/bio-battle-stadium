import { getLevelConfig, TOTAL_LEVELS } from '../utils/gameLogic';
import WorldScene from '../components/WorldScene';

const WORLD_THEMES = {
  1: { accent: '#f472b6', name: 'はなのせかい', scene: 'grassland' },
  2: { accent: '#a78bfa', name: 'まほうのせかい', scene: 'forest' },
  3: { accent: '#60a5fa', name: 'ほしのせかい', scene: 'night' },
};

export default function LevelSelectScreen({ state, onSelect, onBack }) {
  const { level: currentLevel, levelStars } = state;
  const worlds = [1, 2, 3];

  return (
    <div style={{ minHeight: '100svh', background: '#080c16', padding: 16, paddingBottom: 32 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, paddingTop: 8 }}>
        <button
          onClick={onBack}
          aria-label="もどる"
          style={{ fontSize: 20, background: 'none', border: 'none', cursor: 'pointer', padding: 8, color: '#64748b' }}
        >
          ←
        </button>
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 900, color: '#e2e8f0' }}>レベルえらび</h2>
      </div>

      {worlds.map(world => {
        const wt = WORLD_THEMES[world];
        const levels = Array.from({ length: TOTAL_LEVELS }, (_, i) => i + 1)
          .filter(l => getLevelConfig(l).world === world);
        const worldCleared = levels.filter(l => (levelStars[String(l)] || 0) > 0).length;

        return (
          <div key={world} style={{ marginBottom: 28 }}>
            {/* World Header */}
            <div style={{
              position: 'relative', marginBottom: 12, borderRadius: 16, overflow: 'hidden',
              border: `1px solid ${wt.accent}20`,
            }}>
              <div aria-hidden="true">
                <WorldScene scene={wt.scene} height={90} />
              </div>
              <div style={{
                position: 'absolute', inset: 0, display: 'flex', alignItems: 'center',
                padding: '0 16px',
                background: 'linear-gradient(90deg, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.2) 60%, transparent 100%)',
              }}>
                <div>
                  <div style={{ color: '#fff', fontWeight: 900, fontSize: 16, textShadow: '0 1px 4px rgba(0,0,0,0.5)' }}>
                    {wt.name}
                  </div>
                  <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11, fontWeight: 700 }}>
                    {worldCleared}/{levels.length} クリア
                  </div>
                </div>
              </div>
            </div>

            {/* Level Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8 }}>
              {levels.map(lv => {
                const stars = levelStars[String(lv)] || 0;
                const locked = lv > currentLevel;
                const perfect = stars === 3;
                return (
                  <button
                    key={lv}
                    onClick={() => !locked && onSelect(lv)}
                    disabled={locked}
                    style={{
                      borderRadius: 14,
                      padding: '10px 4px',
                      border: locked
                        ? '1px solid rgba(255,255,255,0.04)'
                        : perfect
                        ? `2px solid ${wt.accent}66`
                        : stars > 0
                        ? `1px solid ${wt.accent}33`
                        : '1px solid rgba(255,255,255,0.08)',
                      background: locked
                        ? 'rgba(255,255,255,0.015)'
                        : perfect
                        ? `${wt.accent}10`
                        : stars > 0
                        ? 'rgba(255,255,255,0.03)'
                        : 'rgba(255,255,255,0.02)',
                      opacity: locked ? 0.3 : 1,
                      cursor: locked ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 2,
                      minHeight: 52,
                    }}
                  >
                    <span style={{
                      fontSize: 13, fontWeight: 900,
                      color: locked ? '#334155' : perfect ? wt.accent : '#94a3b8',
                    }}>
                      {locked ? '🔒' : `${lv}`}
                    </span>
                    <span style={{ fontSize: 10, color: '#475569', fontWeight: 700 }}>
                      {getLevelConfig(lv).count}こ
                    </span>
                    <div style={{ fontSize: 10 }} aria-label={`${stars}つぼし`}>
                      {Array.from({ length: 3 }).map((_, i) => (
                        <span key={i} style={{ color: i < stars ? '#d69e2e' : 'rgba(255,255,255,0.08)' }}>★</span>
                      ))}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
