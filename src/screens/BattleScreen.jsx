import { useState, useEffect, useRef } from 'react';
import { INSECTS } from '../data/insects.js';
import { getInsectStats, simulateBattle, MAX_INSECT_LEVEL } from '../utils/battleLogic.js';

const RARITY_LABEL = { common:'ノーマル', rare:'レア', superRare:'SR', ultra:'ULTRA', legend:'👑 LEGEND' };
const RARITY_COLOR = { common:'#6b7280', rare:'#2563eb', superRare:'#7c3aed', ultra:'#d97706', legend:'#ffd700' };

// バトルステージ定義（弱い順）
// winReward: 勝利コイン, loseReward: 参加賞コイン, requiredLevel: 挑戦に必要な自分昆虫の最高Lv
const BATTLE_STAGES = [
  {
    id: 'b1', label: 'はじめのいっぽ', stars: 1,
    insectId: 'c05', level: 2,
    winReward: 3, loseReward: 1,
    hint: 'Lv1でも勝てる！', requiredLevel: 1,
    bg: '#ecfccb',
  },
  {
    id: 'b2', label: 'もりのたたかい', stars: 2,
    insectId: 'r01', level: 4,
    winReward: 5, loseReward: 1,
    hint: 'Lv3があれば勝てる', requiredLevel: 1,
    bg: '#dbeafe',
  },
  {
    id: 'b3', label: 'やまのはおう', stars: 3,
    insectId: 's01', level: 6,
    winReward: 8, loseReward: 2,
    hint: 'Lv5が目安', requiredLevel: 4,
    bg: '#f3e8ff',
  },
  {
    id: 'b4', label: 'せかいのきょうじん', stars: 4,
    insectId: 'u01', level: 8,
    winReward: 12, loseReward: 2,
    hint: 'Lv7以上が必要', requiredLevel: 6,
    bg: '#fef3c7',
  },
  {
    id: 'b5', label: 'でんせつのつよさ', stars: 5,
    insectId: 'u03', level: 9,
    winReward: 15, loseReward: 3,
    hint: 'Lv9が必要', requiredLevel: 8,
    bg: '#1e1b4b',
    darkText: true,
  },
  {
    id: 'boss', label: '👑 ラスボス', stars: 6,
    insectId: 'lg01', level: 10,
    winReward: 20, loseReward: 3,
    hint: 'MAX Lv10のむしで挑め！', requiredLevel: 10,
    bg: '#0f0a1e',
    darkText: true,
    isBoss: true,
  },
];

function StarRow({ count, max = 6, color = '#fbbf24', size = 16 }) {
  return (
    <span className="flex gap-0.5">
      {Array.from({ length: max }, (_, i) => (
        <span key={i} style={{ fontSize: size, opacity: i < count ? 1 : 0.2 }}>★</span>
      ))}
    </span>
  );
}

function InsectAvatar({ insect, size = 80, flip = false }) {
  return (
    <div className="rounded-2xl overflow-hidden flex items-center justify-center border-2"
         style={{
           width: size, height: size,
           background: insect.bgColor || '#e5e7eb',
           borderColor: RARITY_COLOR[insect.rarity] ?? '#9ca3af',
           transform: flip ? 'scaleX(-1)' : 'none',
           flexShrink: 0,
         }}>
      {insect.imagePath
        ? <img src={insect.imagePath} alt={insect.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }}/>
        : <svg width={size * 0.6} height={size * 0.6} viewBox="0 0 80 80">
            <ellipse cx="40" cy="48" rx="20" ry="24" fill="black" opacity="0.8"/>
            <ellipse cx="40" cy="30" rx="12" ry="12" fill="black" opacity="0.8"/>
            <line x1="34" y1="20" x2="20" y2="8" stroke="black" strokeWidth="3"/>
            <line x1="46" y1="20" x2="60" y2="8" stroke="black" strokeWidth="3"/>
          </svg>
      }
    </div>
  );
}

function HpBar({ hp, maxHp }) {
  const pct = maxHp > 0 ? Math.max(0, hp / maxHp) : 0;
  const barColor = pct > 0.5 ? '#22c55e' : pct > 0.25 ? '#f97316' : '#ef4444';
  return (
    <div className="w-full h-4 rounded-full bg-gray-200 overflow-hidden border border-gray-300">
      <div className="h-full rounded-full transition-all duration-500"
           style={{ width: `${pct * 100}%`, background: barColor }}/>
    </div>
  );
}

export default function BattleScreen({ state, onBack, onEarnCoins }) {
  const [phase, setPhase] = useState('pickStage'); // pickStage | pickInsect | battle | result
  const [selectedStage, setSelectedStage] = useState(null);
  const [enemy, setEnemy] = useState(null);
  const [selectedInsect, setSelectedInsect] = useState(null);
  const [battleLog, setBattleLog] = useState([]);
  const [logIndex, setLogIndex] = useState(0);
  const [playerHp, setPlayerHp] = useState(0);
  const [enemyHp, setEnemyHp] = useState(0);
  const [playerMaxHp, setPlayerMaxHp] = useState(0);
  const [enemyMaxHp, setEnemyMaxHp] = useState(0);
  const [attackAnim, setAttackAnim] = useState(null);
  const [showDamage, setShowDamage] = useState(null);
  const [battleResult, setBattleResult] = useState(null);
  const timerRef = useRef(null);

  const myInsects = INSECTS.filter(i => state.collection.includes(i.id));
  const bestLevel = myInsects.length > 0
    ? Math.max(...myInsects.map(i => state.insectLevels?.[i.id] ?? 1))
    : 0;

  useEffect(() => () => clearTimeout(timerRef.current), []);

  function handleSelectStage(stage) {
    const enemyInsect = INSECTS.find(i => i.id === stage.insectId) ?? INSECTS[0];
    setSelectedStage(stage);
    setEnemy({ insect: enemyInsect, level: stage.level, stats: getInsectStats(enemyInsect, stage.level) });
    setPhase('pickInsect');
  }

  function handleSelectInsect(insect) {
    const lv = state.insectLevels?.[insect.id] ?? 1;
    const playerStats = getInsectStats(insect, lv);
    const log = simulateBattle(playerStats, enemy.stats);

    setSelectedInsect({ insect, stats: playerStats, level: lv });
    setBattleLog(log);
    setLogIndex(0);
    setPlayerHp(playerStats.hp);
    setEnemyHp(enemy.stats.hp);
    setPlayerMaxHp(playerStats.hp);
    setEnemyMaxHp(enemy.stats.hp);
    setAttackAnim(null);
    setShowDamage(null);
    setBattleResult(null);
    setPhase('battle');
  }

  // バトルログ再生
  useEffect(() => {
    if (phase !== 'battle' || battleLog.length === 0 || logIndex >= battleLog.length) return;
    const entry = battleLog[logIndex];

    if (entry.result) {
      timerRef.current = setTimeout(() => {
        setBattleResult(entry.result);
        const won = entry.result === 'win';
        const reward = won ? selectedStage.winReward : selectedStage.loseReward;
        onEarnCoins(reward);
        setPhase('result');
      }, 800);
      return;
    }

    setAttackAnim(entry.attacker);
    timerRef.current = setTimeout(() => {
      setAttackAnim(null);
      if (entry.attacker === 'player') setEnemyHp(entry.enemyHp);
      else setPlayerHp(entry.playerHp);
      setShowDamage({ target: entry.attacker === 'player' ? 'enemy' : 'player', value: entry.damage, critical: entry.critical });
      timerRef.current = setTimeout(() => {
        setShowDamage(null);
        setLogIndex(i => i + 1);
      }, 400);
    }, 500);
  }, [phase, logIndex, battleLog]);

  // ===== ステージ選択 =====
  if (phase === 'pickStage') {
    return (
      <div className="min-h-screen flex flex-col" style={{ background: 'linear-gradient(180deg,#1e1b4b 0%,#312e81 100%)' }}>
        <div className="flex items-center gap-3 p-4">
          <button onClick={onBack} className="text-white text-2xl">←</button>
          <h2 className="text-xl font-black text-white">⚔️ バトル</h2>
          <span className="ml-auto text-yellow-300 font-bold">💰 {state.coins}</span>
        </div>

        <p className="text-purple-200 text-sm text-center px-4 mb-3">
          あいてを選ぼう！強い相手ほどコインをたくさんもらえる
        </p>

        {myInsects.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 p-6">
            <div className="text-6xl">🪲</div>
            <p className="text-white font-bold text-center">昆虫を持っていません！<br/>ガチャで昆虫をゲットしよう！</p>
            <button onClick={onBack}
                    className="px-8 py-3 rounded-xl text-white font-bold"
                    style={{ background: 'linear-gradient(135deg,#f472b6,#ec4899)' }}>
              ホームにもどる
            </button>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto px-3 pb-4 space-y-2">
            {BATTLE_STAGES.map(stage => {
              const locked = bestLevel < stage.requiredLevel;
              const enemyInsect = INSECTS.find(i => i.id === stage.insectId);
              const textColor = stage.darkText ? '#e2e8f0' : '#1c1917';

              return (
                <button
                  key={stage.id}
                  onClick={() => !locked && handleSelectStage(stage)}
                  disabled={locked}
                  className="w-full rounded-2xl p-3 text-left active:scale-[0.98] transition-transform disabled:opacity-60"
                  style={{
                    background: locked ? 'rgba(255,255,255,0.06)' : stage.bg,
                    border: stage.isBoss ? '2px solid #ffd700' : '2px solid rgba(255,255,255,0.15)',
                    boxShadow: stage.isBoss && !locked ? '0 0 16px rgba(255,215,0,0.4)' : 'none',
                  }}
                >
                  <div className="flex items-center gap-3">
                    {enemyInsect && (
                      <InsectAvatar insect={enemyInsect} size={52}/>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-black text-sm" style={{ color: textColor }}>{stage.label}</span>
                        {locked && (
                          <span className="text-xs bg-gray-500/30 text-gray-300 px-2 py-0.5 rounded-full">
                            🔒 Lv{stage.requiredLevel}〜
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <StarRow count={stage.stars} size={13} color={stage.darkText ? '#fbbf24' : '#f59e0b'}/>
                      </div>
                      <div className="text-xs mt-0.5" style={{ color: stage.darkText ? 'rgba(255,255,255,0.6)' : '#6b7280' }}>
                        {locked ? `🔒 Lv${stage.requiredLevel}のむしが必要` : stage.hint}
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="font-black text-yellow-400 text-sm">💰 +{stage.winReward}</div>
                      <div className="text-xs" style={{ color: stage.darkText ? 'rgba(255,255,255,0.4)' : '#9ca3af' }}>まけても+{stage.loseReward}</div>
                      <div className="text-xs font-bold mt-0.5" style={{ color: RARITY_COLOR[enemyInsect?.rarity] ?? '#9ca3af' }}>
                        Lv.{stage.level}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // ===== 昆虫選択 =====
  if (phase === 'pickInsect' && selectedStage && enemy) {
    const enemyStats = enemy.stats;
    return (
      <div className="min-h-screen flex flex-col" style={{ background: 'linear-gradient(180deg,#1e1b4b 0%,#312e81 100%)' }}>
        <div className="flex items-center gap-3 p-4">
          <button onClick={() => setPhase('pickStage')} className="text-white text-2xl">←</button>
          <h2 className="text-lg font-black text-white">むしを選ぼう</h2>
        </div>

        {/* 相手表示 */}
        <div className="mx-4 mb-3 rounded-2xl p-3 flex items-center gap-3"
             style={{ background: selectedStage.bg, border: selectedStage.isBoss ? '2px solid #ffd700' : '2px solid rgba(255,255,255,0.1)' }}>
          <InsectAvatar insect={enemy.insect} size={56}/>
          <div>
            <div className="font-black text-sm" style={{ color: selectedStage.darkText ? '#e2e8f0' : '#1c1917' }}>
              あいて：{enemy.insect.name}
            </div>
            <div className="text-xs font-bold" style={{ color: RARITY_COLOR[enemy.insect.rarity] }}>
              {RARITY_LABEL[enemy.insect.rarity]} Lv.{enemy.level}
            </div>
            <div className="text-xs mt-0.5" style={{ color: selectedStage.darkText ? 'rgba(255,255,255,0.5)' : '#6b7280' }}>
              ❤️{enemyStats.hp} &nbsp; ⚔️{enemyStats.atk} &nbsp; 💨{enemyStats.spd}
            </div>
          </div>
          <div className="ml-auto text-right">
            <div className="font-black text-yellow-400">💰 +{selectedStage.winReward}</div>
            <div className="text-xs text-gray-400">勝利報酬</div>
          </div>
        </div>

        <p className="text-purple-200 text-xs text-center mb-2">どのむしで挑む？</p>

        <div className="flex-1 overflow-y-auto px-4 pb-4">
          <div className="grid grid-cols-2 gap-3">
            {myInsects.map(insect => {
              const lv = state.insectLevels?.[insect.id] ?? 1;
              const stats = getInsectStats(insect, lv);
              return (
                <button key={insect.id}
                        onClick={() => handleSelectInsect(insect)}
                        className="rounded-2xl p-3 text-left active:scale-95 transition-transform border-2"
                        style={{ background: 'rgba(255,255,255,0.08)', borderColor: RARITY_COLOR[insect.rarity] ?? '#9ca3af' }}>
                  <div className="flex items-center gap-2 mb-2">
                    <InsectAvatar insect={insect} size={44}/>
                    <div>
                      <div className="text-white font-bold text-xs leading-tight truncate max-w-[80px]">{insect.name}</div>
                      <div className="text-xs font-black" style={{ color: RARITY_COLOR[insect.rarity] }}>
                        {RARITY_LABEL[insect.rarity]}
                      </div>
                      <div className="text-yellow-300 text-xs font-bold">
                        Lv.{lv}{lv >= MAX_INSECT_LEVEL ? ' MAX' : ''}
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-purple-200 space-y-0.5">
                    <div>❤️ {stats.hp} &nbsp; ⚔️ {stats.atk} &nbsp; 💨 {stats.spd}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // ===== バトル画面 =====
  if (phase === 'battle' && selectedInsect && enemy) {
    return (
      <div className="min-h-screen flex flex-col"
           style={{ background: 'linear-gradient(180deg,#064e3b 0%,#065f46 50%,#022c22 100%)' }}>
        <div className="flex items-center gap-3 p-4">
          <h2 className="text-xl font-black text-white">⚔️ バトル中！</h2>
          <span className="ml-auto text-yellow-300 text-sm font-bold">ターン {Math.floor(logIndex / 2) + 1}</span>
        </div>

        <div className="flex-1 flex flex-col justify-between p-4 gap-4">
          {/* 敵側 */}
          <div className="flex flex-col items-end gap-2">
            <div className="flex items-center gap-2">
              <div>
                <div className="text-white font-black text-right">{enemy.insect.name}</div>
                <div className="text-xs font-bold text-right" style={{ color: RARITY_COLOR[enemy.insect.rarity] }}>
                  {RARITY_LABEL[enemy.insect.rarity]} · Lv.{enemy.level}
                </div>
              </div>
              <div className="relative">
                <div style={{ transform: attackAnim === 'enemy' ? 'translateX(-20px)' : 'none', transition: 'transform 0.2s ease' }}>
                  <InsectAvatar insect={enemy.insect} size={80} flip={true}/>
                </div>
                {showDamage?.target === 'enemy' && (
                  <div className="absolute -top-6 -left-4 font-black text-xl animate-bounce"
                       style={{ color: showDamage.critical ? '#fbbf24' : '#ef4444' }}>
                    {showDamage.critical ? '💥 ' : ''}-{showDamage.value}
                  </div>
                )}
              </div>
            </div>
            <div className="w-48">
              <div className="text-xs text-green-300 text-right mb-1">{enemyHp}/{enemyMaxHp}</div>
              <HpBar hp={enemyHp} maxHp={enemyMaxHp}/>
            </div>
          </div>

          <div className="text-center">
            <span className="text-white/40 font-black text-4xl">VS</span>
          </div>

          {/* プレイヤー側 */}
          <div className="flex flex-col items-start gap-2">
            <div className="w-48">
              <div className="text-xs text-green-300 mb-1">{playerHp}/{playerMaxHp}</div>
              <HpBar hp={playerHp} maxHp={playerMaxHp}/>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <div style={{ transform: attackAnim === 'player' ? 'translateX(20px)' : 'none', transition: 'transform 0.2s ease' }}>
                  <InsectAvatar insect={selectedInsect.insect} size={80}/>
                </div>
                {showDamage?.target === 'player' && (
                  <div className="absolute -top-6 -right-4 font-black text-xl animate-bounce"
                       style={{ color: showDamage.critical ? '#fbbf24' : '#ef4444' }}>
                    {showDamage.critical ? '💥 ' : ''}-{showDamage.value}
                  </div>
                )}
              </div>
              <div>
                <div className="text-white font-black">{selectedInsect.insect.name}</div>
                <div className="text-xs font-bold" style={{ color: RARITY_COLOR[selectedInsect.insect.rarity] }}>
                  {RARITY_LABEL[selectedInsect.insect.rarity]} · Lv.{selectedInsect.level}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center pb-6 text-white/60 text-sm animate-pulse">バトル中…</div>
      </div>
    );
  }

  // ===== バトル結果 =====
  if (phase === 'result' && battleResult && selectedStage) {
    const won = battleResult === 'win';
    const reward = won ? selectedStage.winReward : selectedStage.loseReward;
    const isBoss = selectedStage.isBoss;

    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 p-6 text-center"
           style={{ background: won
             ? isBoss ? 'linear-gradient(180deg,#0f0a1e 0%,#1e1b4b 100%)'
                      : 'linear-gradient(180deg,#064e3b 0%,#065f46 100%)'
             : 'linear-gradient(180deg,#450a0a 0%,#7f1d1d 100%)' }}>

        {won && isBoss && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="absolute text-3xl animate-ping"
                   style={{ left:`${8+i*8}%`, top:`${15+(i%4)*20}%`,
                     animationDuration:`${0.8+i*0.15}s`, animationDelay:`${i*0.06}s` }}>
                {['👑','🌈','💎','✨','⚡'][i%5]}
              </div>
            ))}
          </div>
        )}

        <div className="text-9xl animate-bounce z-10">{won ? (isBoss ? '👑' : '🏆') : '💀'}</div>
        <h2 className="text-5xl font-black z-10" style={{ color: won ? '#fbbf24' : '#f87171' }}>
          {won ? (isBoss ? '伝説の勝利！！' : '勝った！！') : '負けた…'}
        </h2>

        <div className="bg-white/10 rounded-2xl p-4 w-full max-w-xs space-y-2 z-10">
          <div className="flex justify-between text-white font-bold">
            <span>あなた</span><span>{selectedInsect.insect.name} Lv.{selectedInsect.level}</span>
          </div>
          <div className="flex justify-between text-white font-bold">
            <span>あいて</span><span>{enemy.insect.name} Lv.{enemy.level}</span>
          </div>
          <div className="border-t border-white/20 pt-2 flex justify-between font-black"
               style={{ color: '#fbbf24' }}>
            <span>コイン獲得</span><span>💰 +{reward}</span>
          </div>
          {!won && (
            <p className="text-white/60 text-xs">
              {selectedStage.hint}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-3 w-full max-w-xs z-10">
          <button
            onClick={() => setPhase('pickStage')}
            className="w-full py-4 rounded-2xl font-black text-xl text-white active:scale-95 transition-transform"
            style={{ background: 'linear-gradient(135deg,#7c3aed,#4f46e5)', boxShadow: '0 6px 20px rgba(124,58,237,0.5)' }}>
            あいてを選びなおす
          </button>
          <button onClick={onBack}
                  className="w-full py-3 rounded-xl font-bold text-white/70 bg-white/10 active:scale-95 transition-transform">
            ホームにもどる
          </button>
        </div>
      </div>
    );
  }

  return null;
}
