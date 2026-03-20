import { getLevelConfig, TOTAL_LEVELS } from '../utils/gameLogic';
import WorldScene from '../components/WorldScene';

const WORLD_COLORS = {
  1: { bg: '#ecfccb', accent: '#16a34a', name: '草はらワールド 🌿' },
  2: { bg: '#d1fae5', accent: '#059669', name: 'もりワールド 🌲' },
  3: { bg: '#e0f2fe', accent: '#0ea5e9', name: 'よるのもりワールド 🌙' },
};
const SCENE_NAMES = { 1: 'grassland', 2: 'forest', 3: 'night' };

export default function LevelSelectScreen({ state, onSelect, onBack }) {
  const { level: currentLevel, levelStars } = state;
  const worlds = [1,2,3];

  return (
    <div style={{ minHeight:'100svh', padding:16, paddingBottom:32 }}>
      <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:16, paddingTop:8 }}>
        <button onClick={onBack} aria-label="もどる" style={{ fontSize:24, background:'none', border:'none', cursor:'pointer', padding:8 }}>←</button>
        <h2 style={{ margin:0, fontSize:22, fontWeight:900 }}>🗺️ レベルえらび</h2>
      </div>

      {worlds.map(world => {
        const wc = WORLD_COLORS[world];
        const levels = Array.from({length: TOTAL_LEVELS}, (_,i)=>i+1)
          .filter(l => getLevelConfig(l).world === world);
        const worldCleared = levels.filter(l => (levelStars[String(l)] || 0) > 0).length;

        return (
          <div key={world} style={{ marginBottom:24 }}>
            {/* ワールドヘッダー */}
            <div style={{ position:'relative', marginBottom:12, borderRadius:16, overflow:'hidden' }}>
              <div aria-hidden="true">
                <WorldScene scene={SCENE_NAMES[world]} height={100}/>
              </div>
              <div style={{
                position:'absolute', inset:0, display:'flex', alignItems:'center',
                padding:'0 16px', background:'linear-gradient(90deg,rgba(0,0,0,0.4),transparent)',
              }}>
                <div>
                  <div style={{ color:'white', fontWeight:900, fontSize:18, textShadow:'1px 1px 4px rgba(0,0,0,0.5)' }}>
                    {wc.name}
                  </div>
                  <div style={{ color:'rgba(255,255,255,0.85)', fontSize:12, fontWeight:'bold' }}>
                    {worldCleared}/{levels.length} クリア
                  </div>
                </div>
              </div>
            </div>

            {/* レベルグリッド */}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:8 }}>
              {levels.map(lv => {
                const stars = levelStars[String(lv)] || 0;
                const locked = lv > currentLevel;
                const cfg = getLevelConfig(lv);
                return (
                  <button key={lv} onClick={() => !locked && onSelect(lv)} disabled={locked}
                    style={{
                      borderRadius:12, padding:'12px 4px', border:`2px solid ${locked ? '#e5e7eb' : stars===3 ? '#fbbf24' : wc.accent}`,
                      background: locked ? '#f9fafb' : stars===3 ? '#fef9c3' : stars>0 ? wc.bg : 'white',
                      opacity: locked ? 0.5 : 1, cursor: locked ? 'not-allowed' : 'pointer',
                      display:'flex', flexDirection:'column', alignItems:'center', gap:2,
                      boxShadow: !locked && stars===3 ? '0 2px 8px rgba(251,191,36,0.4)' : 'none',
                      minHeight: 52,
                    }}>
                    <span style={{ fontSize:13, fontWeight:900, color: locked ? '#9ca3af' : wc.accent }}>
                      {locked ? '🔒' : `Lv${lv}`}
                    </span>
                    <span style={{ fontSize:11, color:'#9ca3af', fontWeight:'bold' }}>{cfg.count}こ</span>
                    <div style={{ fontSize:11 }} aria-label={`${stars}つぼし`}>
                      {'⭐'.repeat(stars)}{'☆'.repeat(3-stars)}
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
