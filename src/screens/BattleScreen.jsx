import { useEffect, useRef, useState, useCallback } from 'react';
import { STICKERS } from '../data/stickers.js';
import {
  getCardStats,
  calcDamage,
  isCritical,
  STATUS_DAMAGE,
  SPECIAL_MOVES,
} from '../utils/battleEngine.js';
import {
  playBattleAttack,
  playBattleHit,
  playBattleCritical,
  playBattleWin,
  playBattleLose,
  playBattleStart,
} from '../utils/sound.js';

const stickerMap = Object.fromEntries(STICKERS.map(s => [s.id, s]));

const STATUS_META = {
  burn:   { emoji: '🔥', color: '#f97316', glow: '#f97316' },
  poison: { emoji: '☠️', color: '#22c55e', glow: '#22c55e' },
  shock:  { emoji: '⚡', color: '#fbbf24', glow: '#fbbf24' },
  freeze: { emoji: '❄️', color: '#7dd3fc', glow: '#7dd3fc' },
};

const SERIES_COLORS = {
  bio: '#22c55e',
  arms: '#f59e0b',
  armbio: '#ef4444',
  corps: '#a855f7',
  catsle: '#fbbf24',
};

const FLASH_COLORS = {
  bio:    'rgba(34,197,94,0.35)',
  arms:   'rgba(245,158,11,0.35)',
  armbio: 'rgba(239,68,68,0.35)',
  corps:  'rgba(168,85,247,0.35)',
  catsle: 'rgba(251,191,36,0.35)',
};

function buildUnit(card, scaleMult, side, index, cardLevel = 1) {
  const stats = getCardStats(card, scaleMult, cardLevel);
  return {
    ...stats,
    uid: `${card.id}-${side}-${index}`,
    side,
    attackAnim: false,
    hitAnim: false,
  };
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function BattleScreen({ state, nation, teamCardIds, cardLevels = {}, onBack, onVictory, onDefeat }) {
  const [tick, setTick] = useState(0);
  const [phase, setPhase] = useState('intro'); // intro | battle | victory | defeat
  const [speed, setSpeed] = useState(1);
  const [flashColor, setFlashColor] = useState(null);
  const [screenFlash, setScreenFlash] = useState(false);
  const [specialCooldown, setSpecialCooldown] = useState({});

  const gameRef = useRef(null);
  const battleTimerRef = useRef(null);
  const floatIdRef = useRef(0);
  const renderRef = useRef(null);

  renderRef.current = () => setTick(t => t + 1);

  // Initialize game
  useEffect(() => {
    const playerCards = teamCardIds.map(id => stickerMap[id]).filter(Boolean);
    const enemyCards = nation.team;
    const owned = new Set(state.collection || []);

    // 未所持のスターターカードは0.5倍の弱体化ペナルティ
    const playerTeam = playerCards.map((card, i) => {
      const isStarter = !owned.has(card.id);
      return buildUnit(card, isStarter ? 0.5 : 1.0, 'player', i, isStarter ? 1 : (cardLevels[card.id] || 1));
    });
    const enemyTeam = enemyCards.map((card, i) => buildUnit(card, nation.scaleMult, 'enemy', i, 1));

    gameRef.current = {
      playerTeam,
      enemyTeam,
      turnOrder: [],
      turnIndex: 0,
      round: 1,
      log: [],
      floats: [],
      battleOver: false,
      pendingSpecial: null,
    };

    // Show intro for 2s
    playBattleStart();
    const introTimer = setTimeout(() => {
      setPhase('battle');
      scheduleTick();
    }, 2200);

    return () => {
      clearTimeout(introTimer);
      clearTimeout(battleTimerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function getDelay() { return Math.round(1400 / speed); }

  function scheduleTick() {
    clearTimeout(battleTimerRef.current);
    battleTimerRef.current = setTimeout(() => doTick(), getDelay());
  }

  function addLog(text, color = '#e2e8f0') {
    const g = gameRef.current;
    g.log = [{ text, color, id: Date.now() + Math.random() }, ...g.log].slice(0, 3);
  }

  function addFloat(uid, text, color, size = 'normal') {
    const g = gameRef.current;
    const id = floatIdRef.current++;
    g.floats = [...g.floats, { id, uid, text, color, size, ts: Date.now() }];
    setTimeout(() => {
      if (!gameRef.current) return;
      gameRef.current.floats = gameRef.current.floats.filter(f => f.id !== id);
      renderRef.current?.();
    }, 1200);
  }

  function triggerFlash(color) {
    setFlashColor(color);
    setTimeout(() => setFlashColor(null), 400);
  }

  function buildTurnOrder(playerTeam, enemyTeam) {
    const all = [...playerTeam, ...enemyTeam].filter(u => u.alive);
    return all.sort((a, b) => b.spd - a.spd).map(u => u.uid);
  }

  const doTick = useCallback(() => {
    const g = gameRef.current;
    if (!g || g.battleOver) return;

    // Check win/loss
    const playerAlive = g.playerTeam.filter(u => u.alive);
    const enemyAlive = g.enemyTeam.filter(u => u.alive);

    if (playerAlive.length === 0) {
      g.battleOver = true;
      playBattleLose();
      setPhase('defeat');
      renderRef.current?.();
      return;
    }
    if (enemyAlive.length === 0) {
      g.battleOver = true;
      playBattleWin();
      setPhase('victory');
      renderRef.current?.();
      return;
    }

    // Rebuild turn order each round start
    if (g.turnOrder.length === 0 || g.turnIndex >= g.turnOrder.length) {
      g.turnOrder = buildTurnOrder(g.playerTeam, g.enemyTeam);
      g.turnIndex = 0;
      if (g.turnIndex === 0 && g.round > 1) {
        // nothing extra
      }
    }

    // Find current acting unit
    let attacker = null;
    let found = false;
    while (!found && g.turnIndex < g.turnOrder.length) {
      const uid = g.turnOrder[g.turnIndex];
      const u = [...g.playerTeam, ...g.enemyTeam].find(x => x.uid === uid);
      if (u && u.alive) {
        attacker = u;
        found = true;
      }
      if (!found) g.turnIndex++;
    }

    if (!attacker) {
      // Advance round
      g.round++;
      g.turnOrder = buildTurnOrder(g.playerTeam, g.enemyTeam);
      g.turnIndex = 0;
      renderRef.current?.();
      scheduleTick();
      return;
    }

    g.turnIndex++;

    // Check freeze/shock skip
    if (attacker.status === 'freeze') {
      attacker.statusTurns--;
      if (attacker.statusTurns <= 0) { attacker.status = null; attacker.statusTurns = 0; }
      addLog(`${attacker.name.slice(0, 8)} は凍結中でスキップ`, '#7dd3fc');
      addFloat(attacker.uid, '❄️ FROZEN', '#7dd3fc', 'normal');
      renderRef.current?.();
      scheduleTick();
      return;
    }
    if (attacker.status === 'shock' && Math.random() < 0.3) {
      addLog(`${attacker.name.slice(0, 8)} は麻痺でスキップ`, '#fbbf24');
      addFloat(attacker.uid, '⚡ PARA', '#fbbf24', 'normal');
      renderRef.current?.();
      scheduleTick();
      return;
    }

    // Status damage at turn start
    if (attacker.status && STATUS_DAMAGE[attacker.status] > 0) {
      const dmg = STATUS_DAMAGE[attacker.status];
      attacker.hp = Math.max(0, attacker.hp - dmg);
      const meta = STATUS_META[attacker.status];
      addFloat(attacker.uid, `-${dmg} ${meta.emoji}`, meta.color, 'normal');
      if (attacker.hp <= 0) {
        attacker.alive = false;
        attacker.hp = 0;
        addLog(`${attacker.name.slice(0, 8)} がダメージで倒れた！`, '#94a3b8');
        attacker.statusTurns--;
        if (attacker.statusTurns <= 0) { attacker.status = null; attacker.statusTurns = 0; }
        renderRef.current?.();
        scheduleTick();
        return;
      }
      attacker.statusTurns--;
      if (attacker.statusTurns <= 0) { attacker.status = null; attacker.statusTurns = 0; }
    }

    // Check if pending special (player triggered)
    if (g.pendingSpecial && g.pendingSpecial.uid === attacker.uid) {
      executeSpecial(attacker, g);
      g.pendingSpecial = null;
    } else {
      // Normal attack
      const targets = attacker.side === 'player' ? g.enemyTeam : g.playerTeam;
      const alive = targets.filter(u => u.alive);
      if (alive.length === 0) {
        scheduleTick();
        return;
      }
      const target = alive[Math.floor(Math.random() * alive.length)];

      const crit = isCritical();
      const dmg = calcDamage(attacker, target, crit);

      target.hp = Math.max(0, target.hp - dmg);
      // SP charge
      attacker.spCharge = Math.min(100, attacker.spCharge + 15);
      target.spCharge = Math.min(100, target.spCharge + 8);

      attacker.attackAnim = true;
      target.hitAnim = true;

      setTimeout(() => {
        if (!gameRef.current) return;
        attacker.attackAnim = false;
        target.hitAnim = false;
        renderRef.current?.();
      }, 350);

      if (crit) {
        playBattleCritical();
        addFloat(target.uid, `CRIT! -${dmg}`, '#fbbf24', 'crit');
        triggerFlash('rgba(251,191,36,0.2)');
      } else {
        playBattleAttack();
        playBattleHit();
        addFloat(target.uid, `-${dmg}`, '#fff', 'normal');
      }

      if (target.hp <= 0) {
        target.alive = false;
        target.hp = 0;
        addLog(`${target.name.slice(0, 8)} が倒れた！`, '#94a3b8');
      } else {
        const logColor = attacker.side === 'player' ? '#60a5fa' : '#f87171';
        addLog(
          `${attacker.name.slice(0,8)} → ${target.name.slice(0,8)} ${crit ? '💥CRIT ' : ''}${dmg}ダメージ`,
          logColor
        );
      }
    }

    // SP full indicator
    if (attacker.spCharge >= 100 && !attacker.spFull) {
      attacker.spFull = true;
    }

    renderRef.current?.();
    scheduleTick();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [speed]);

  function executeSpecial(unit, g) {
    const move = SPECIAL_MOVES[unit.series];
    if (!move) return;

    const enemies = unit.side === 'player' ? g.enemyTeam : g.playerTeam;
    const allies  = unit.side === 'player' ? g.playerTeam : g.enemyTeam;
    const alive = enemies.filter(u => u.alive);

    triggerFlash(FLASH_COLORS[unit.series] || 'rgba(255,255,255,0.25)');

    unit.spCharge = 0;
    unit.spFull = false;

    addLog(`✨ ${unit.name.slice(0,8)} の ${move.name}！`, SERIES_COLORS[unit.series]);

    if (move.type === 'aoe') {
      // bio: all enemies 1.8x
      alive.forEach(target => {
        const dmg = Math.round(calcDamage(unit, target) * move.mult);
        target.hp = Math.max(0, target.hp - dmg);
        addFloat(target.uid, `✨ -${dmg}`, '#4ade80', 'special');
        if (target.hp <= 0) { target.alive = false; target.hp = 0; }
      });
      playBattleCritical();
    } else if (move.type === 'single') {
      // arms: 3x highest HP enemy
      const target = alive.reduce((a, b) => a.hp > b.hp ? a : b, alive[0]);
      if (target) {
        const dmg = Math.round(calcDamage(unit, target) * move.mult);
        target.hp = Math.max(0, target.hp - dmg);
        addFloat(target.uid, `💥 -${dmg}`, '#fb923c', 'special');
        if (target.hp <= 0) { target.alive = false; target.hp = 0; }
        playBattleCritical();
      }
    } else if (move.type === 'burn') {
      // armbio: 2.5x + burn
      const target = alive[Math.floor(Math.random() * alive.length)];
      if (target) {
        const dmg = Math.round(calcDamage(unit, target) * move.mult);
        target.hp = Math.max(0, target.hp - dmg);
        target.status = 'burn';
        target.statusTurns = 3;
        addFloat(target.uid, `🔥 -${dmg}`, '#f97316', 'special');
        if (target.hp <= 0) { target.alive = false; target.hp = 0; }
        playBattleCritical();
      }
    } else if (move.type === 'multi') {
      // corps: 3 random enemies 2x
      const targets = shuffle(alive).slice(0, Math.min(3, alive.length));
      targets.forEach(target => {
        const dmg = Math.round(calcDamage(unit, target) * move.mult);
        target.hp = Math.max(0, target.hp - dmg);
        addFloat(target.uid, `👥 -${dmg}`, '#c084fc', 'special');
        if (target.hp <= 0) { target.alive = false; target.hp = 0; }
      });
      playBattleCritical();
    } else if (move.type === 'heal') {
      // catsle: 3x single + heal allies 20HP
      const target = alive[Math.floor(Math.random() * alive.length)];
      if (target) {
        const dmg = Math.round(calcDamage(unit, target) * move.mult);
        target.hp = Math.max(0, target.hp - dmg);
        addFloat(target.uid, `👑 -${dmg}`, '#fbbf24', 'special');
        if (target.hp <= 0) { target.alive = false; target.hp = 0; }
      }
      allies.filter(u => u.alive).forEach(ally => {
        ally.hp = Math.min(ally.maxHp, ally.hp + 20);
        addFloat(ally.uid, `+20 ❤️`, '#34d399', 'normal');
      });
      playBattleWin();
    }
  }

  function triggerPlayerSpecial(unit) {
    if (!unit.alive || unit.spCharge < 100) return;
    if (phase !== 'battle') return;
    const g = gameRef.current;
    if (!g) return;
    // Execute immediately if it's player's turn, or queue
    g.pendingSpecial = { uid: unit.uid };
    // Execute now for responsiveness
    executeSpecial(unit, g);
    g.pendingSpecial = null;
    renderRef.current?.();
  }

  function changeSpeed(s) {
    setSpeed(s);
    // Reschedule with new speed
    clearTimeout(battleTimerRef.current);
    battleTimerRef.current = setTimeout(() => doTick(), Math.round(1400 / s));
  }

  const g = gameRef.current;

  // ===== INTRO SCREEN =====
  if (phase === 'intro') {
    const playerCards = teamCardIds.map(id => stickerMap[id]).filter(Boolean);
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden"
        style={{ background: '#0a0f1e' }}
      >
        <style>{`
          @keyframes vsEntrance { from{opacity:0;transform:scale(2.5) rotate(-10deg)} to{opacity:1;transform:scale(1) rotate(0deg)} }
          @keyframes slideFromLeft { from{opacity:0;transform:translateX(-80px)} to{opacity:1;transform:translateX(0)} }
          @keyframes slideFromRight { from{opacity:0;transform:translateX(80px)} to{opacity:1;transform:translateX(0)} }
          @keyframes pulseBg { 0%,100%{opacity:0.3} 50%{opacity:0.6} }
        `}</style>

        {/* Background glow */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse at 30% 50%, rgba(59,130,246,0.15) 0%, transparent 60%), radial-gradient(ellipse at 70% 50%, rgba(239,68,68,0.15) 0%, transparent 60%)',
          animation: 'pulseBg 1.5s ease-in-out infinite',
        }} />

        {/* Player team */}
        <div style={{ animation: 'slideFromLeft 0.5s ease-out', display: 'flex', gap: 8, marginBottom: 16 }}>
          {playerCards.map(card => (
            <div key={card.id} style={{ textAlign: 'center' }}>
              <div style={{
                width: 56, height: 56, borderRadius: 12,
                border: '2px solid #3b82f6',
                background: 'rgba(0,0,0,0.5)',
                overflow: 'hidden',
                boxShadow: '0 0 12px rgba(59,130,246,0.5)',
              }}>
                <img src={card.imagePath} alt={card.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              </div>
            </div>
          ))}
        </div>

        {/* VS text */}
        <div style={{
          fontSize: 64,
          fontWeight: 900,
          color: '#fff',
          textShadow: '0 0 30px rgba(255,215,0,0.8), 0 0 60px rgba(255,165,0,0.5)',
          animation: 'vsEntrance 0.6s cubic-bezier(0.175,0.885,0.32,1.275)',
          letterSpacing: '-2px',
          marginBottom: 16,
        }}>
          VS
        </div>

        {/* Enemy team */}
        <div style={{ animation: 'slideFromRight 0.5s ease-out', display: 'flex', gap: 8, marginBottom: 24 }}>
          {nation.team.map(card => (
            <div key={card.id} style={{ textAlign: 'center' }}>
              <div style={{
                width: 56, height: 56, borderRadius: 12,
                border: '2px solid #ef4444',
                background: 'rgba(0,0,0,0.5)',
                overflow: 'hidden',
                boxShadow: '0 0 12px rgba(239,68,68,0.5)',
              }}>
                <img src={card.imagePath} alt={card.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              </div>
            </div>
          ))}
        </div>

        {/* Nation name */}
        <div style={{
          fontSize: 20,
          fontWeight: 900,
          color: nation.color,
          textShadow: `0 0 16px ${nation.color}`,
        }}>
          {nation.emoji} {nation.name}
        </div>
        <div style={{ color: '#94a3b8', fontSize: 14, marginTop: 4 }}>
          難易度 {'★'.repeat(nation.difficulty)}{'☆'.repeat(8 - nation.difficulty)}
        </div>
      </div>
    );
  }

  // ===== BATTLE PHASE =====
  if (!g) return null;

  function UnitCard({ unit, side }) {
    const hpPct = unit.maxHp > 0 ? (unit.hp / unit.maxHp) * 100 : 0;
    const hpColor = hpPct > 60 ? '#22c55e' : hpPct > 30 ? '#fbbf24' : '#ef4444';
    const spPct = unit.spCharge;
    const statusMeta = unit.status ? STATUS_META[unit.status] : null;

    const myFloats = g.floats.filter(f => f.uid === unit.uid);

    return (
      <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', width: 62 }}>
        {/* Floating damage numbers */}
        {myFloats.map(f => (
          <div
            key={f.id}
            style={{
              position: 'absolute',
              top: f.size === 'special' ? -36 : f.size === 'crit' ? -28 : -20,
              left: '50%',
              transform: 'translateX(-50%)',
              color: f.color,
              fontWeight: 900,
              fontSize: f.size === 'special' ? 15 : f.size === 'crit' ? 14 : 12,
              whiteSpace: 'nowrap',
              animation: 'floatUpDmg 1.1s ease-out forwards',
              zIndex: 20,
              textShadow: `0 0 8px ${f.color}`,
              pointerEvents: 'none',
            }}
          >
            {f.text}
          </div>
        ))}

        {/* Card image container */}
        <div
          style={{
            width: 60,
            height: 60,
            borderRadius: 12,
            overflow: 'hidden',
            position: 'relative',
            background: 'rgba(0,0,0,0.4)',
            border: unit.attackAnim
              ? '2px solid #fbbf24'
              : unit.hitAnim
              ? '2px solid #ef4444'
              : statusMeta
              ? `2px solid ${statusMeta.glow}`
              : unit.spCharge >= 100
              ? '2px solid #3b82f6'
              : '2px solid rgba(255,255,255,0.12)',
            boxShadow: unit.attackAnim
              ? '0 0 16px rgba(251,191,36,0.7)'
              : unit.hitAnim
              ? '0 0 16px rgba(239,68,68,0.7)'
              : statusMeta
              ? `0 0 10px ${statusMeta.glow}88`
              : unit.spCharge >= 100
              ? '0 0 14px rgba(59,130,246,0.7), 0 0 28px rgba(59,130,246,0.4)'
              : 'none',
            opacity: unit.alive ? 1 : 0.3,
            filter: unit.alive ? 'none' : 'grayscale(100%)',
            animation: unit.hitAnim
              ? 'unitShake 0.3s ease-out'
              : unit.attackAnim
              ? (side === 'player' ? 'attackUp 0.4s ease-out' : 'attackDown 0.4s ease-out')
              : 'none',
          }}
        >
          <img
            src={unit.imagePath}
            alt={unit.name}
            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
          />
          {!unit.alive && (
            <div style={{
              position: 'absolute', inset: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 22,
              background: 'rgba(0,0,0,0.5)',
            }}>
              💀
            </div>
          )}
          {statusMeta && unit.alive && (
            <div style={{
              position: 'absolute', top: 1, right: 1,
              fontSize: 10,
              lineHeight: 1,
            }}>
              {statusMeta.emoji}
            </div>
          )}
        </div>

        {/* HP bar */}
        <div style={{
          width: 60, height: 5, background: 'rgba(255,255,255,0.1)',
          borderRadius: 3, overflow: 'hidden', marginTop: 3,
        }}>
          <div style={{
            width: `${Math.max(0, hpPct)}%`,
            height: '100%',
            background: hpColor,
            borderRadius: 3,
            transition: 'width 0.25s ease',
          }} />
        </div>

        {/* HP numbers */}
        <div style={{ fontSize: 9, color: '#94a3b8', marginTop: 1, lineHeight: 1 }}>
          {unit.hp}/{unit.maxHp}
        </div>

        {/* SP bar */}
        <div style={{
          width: 60, height: 3, background: 'rgba(59,130,246,0.15)',
          borderRadius: 2, overflow: 'hidden', marginTop: 2,
          animation: unit.spCharge >= 100 ? 'spPulse 1s ease-in-out infinite' : 'none',
        }}>
          <div style={{
            width: `${spPct}%`,
            height: '100%',
            background: 'linear-gradient(90deg, #3b82f6, #60a5fa)',
            borderRadius: 2,
            transition: 'width 0.2s',
            boxShadow: unit.spCharge >= 100 ? '0 0 6px #3b82f6' : 'none',
          }} />
        </div>

        {/* Name */}
        <div style={{
          fontSize: 8,
          color: '#cbd5e1',
          marginTop: 2,
          textAlign: 'center',
          maxWidth: 62,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          lineHeight: 1.2,
        }}>
          {unit.name.slice(0, 8)}
        </div>
      </div>
    );
  }

  // ===== VICTORY / DEFEAT OVERLAYS =====
  const SERIES_COLORS_V = { bio:'#22c55e', arms:'#f59e0b', armbio:'#ef4444', corps:'#a855f7', catsle:'#fbbf24' };

  const VictoryScreen = () => {
    const [picked, setPicked] = useState(null);
    const [confirmed, setConfirmed] = useState(false);
    const [confetti] = useState(() =>
      Array.from({ length: 30 }, (_, i) => ({
        id: i,
        left: `${Math.random() * 100}%`,
        delay: `${Math.random() * 1.5}s`,
        color: ['#fbbf24','#22c55e','#60a5fa','#f472b6','#a78bfa'][i % 5],
        size: 6 + Math.random() * 8,
      }))
    );
    const owned = new Set(state.collection || []);
    const isFirstClear = !(state.battleProgress?.conquered || []).includes(nation.id);
    const allowedSeries = new Set(nation.rewardSeries || ['bio', 'arms', 'armbio', 'corps', 'catsle']);
    const rewardableCards = nation.team.filter(c => allowedSeries.has(c.series));

    return (
      <div style={{
        position: 'fixed', inset: 0, zIndex: 50,
        background: 'rgba(0,0,0,0.92)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        overflow: 'hidden', padding: '0 16px',
      }}>
        {confetti.map(c => (
          <div key={c.id} style={{
            position: 'absolute', left: c.left, top: -20,
            width: c.size, height: c.size, background: c.color, borderRadius: 2,
            animation: `confettiFall ${1.5 + Math.random()}s ease-in ${c.delay} forwards`,
          }} />
        ))}

        <div style={{ textAlign: 'center', animation: 'victoryPop 0.6s cubic-bezier(0.175,0.885,0.32,1.275)', width: '100%', maxWidth: 400 }}>
          <div style={{ fontSize: 48, marginBottom: 4 }}>🎉</div>
          <div style={{ fontSize: 36, fontWeight: 900, color: '#fbbf24', textShadow: '0 0 30px rgba(251,191,36,0.8)', marginBottom: 4 }}>
            VICTORY!
          </div>
          <div style={{ color: '#e2e8f0', fontSize: 16, marginBottom: 4 }}>
            {nation.emoji} {nation.name} を制覇！
          </div>
          <div style={{ fontSize: 22, fontWeight: 900, color: '#fbbf24', marginBottom: 20 }}>
            🪙 +{nation.reward}
          </div>

          {/* カード選択（初回クリア時のみ） */}
          {!isFirstClear ? (
            <button
              onClick={() => onVictory(nation.id, teamCardIds, nation.reward, null)}
              style={{
                padding: '14px 28px', borderRadius: 16, border: 'none', cursor: 'pointer',
                background: 'linear-gradient(135deg, #fbbf24, #d97706)',
                color: '#000', fontWeight: 900, fontSize: 18,
                boxShadow: '0 8px 24px rgba(251,191,36,0.4)',
              }}
            >
              🗺️ マップへ戻る
            </button>
          ) : !confirmed ? (
            <>
              <div style={{ color: '#94a3b8', fontSize: 13, fontWeight: 700, marginBottom: 12 }}>
                ⚔️ 敵カードを1枚ゲット！
              </div>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 16, flexWrap: 'wrap' }}>
                {rewardableCards.map(card => {
                  const isOwned = owned.has(card.id);
                  const isSelected = picked?.id === card.id;
                  const color = SERIES_COLORS_V[card.series] || '#64748b';
                  return (
                    <button
                      key={card.id}
                      onClick={() => setPicked(card)}
                      style={{
                        width: 72, padding: '8px 4px',
                        borderRadius: 12,
                        background: isSelected ? `${color}33` : 'rgba(255,255,255,0.07)',
                        border: isSelected ? `2px solid ${color}` : '2px solid rgba(255,255,255,0.15)',
                        boxShadow: isSelected ? `0 0 16px ${color}66` : 'none',
                        cursor: 'pointer',
                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                        transition: 'all 0.15s',
                        position: 'relative',
                      }}
                    >
                      {isOwned && (
                        <div style={{
                          position: 'absolute', top: -6, right: -6,
                          background: '#22c55e', borderRadius: '50%',
                          width: 18, height: 18, fontSize: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontWeight: 900, color: '#fff',
                        }}>✓</div>
                      )}
                      <img src={card.imagePath} alt={card.name} style={{ width: 52, height: 52, objectFit: 'contain' }} />
                      <div style={{ fontSize: 9, color: isSelected ? color : '#94a3b8', fontWeight: 700, lineHeight: 1.2, textAlign: 'center' }}>
                        {card.name.length > 12 ? card.name.slice(0, 12) + '…' : card.name}
                      </div>
                      <div style={{ fontSize: 8, color: color, fontWeight: 700 }}>
                        {card.series}
                      </div>
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => { if (picked) setConfirmed(true); }}
                disabled={!picked}
                style={{
                  padding: '12px 28px', borderRadius: 14, border: 'none', cursor: picked ? 'pointer' : 'not-allowed',
                  background: picked ? 'linear-gradient(135deg, #22c55e, #16a34a)' : 'rgba(255,255,255,0.1)',
                  color: '#fff', fontWeight: 900, fontSize: 16,
                  boxShadow: picked ? '0 4px 16px rgba(34,197,94,0.4)' : 'none',
                  opacity: picked ? 1 : 0.5,
                  marginBottom: 8,
                }}
              >
                {picked ? `✅ ${picked.name.slice(0,14)} をゲット！` : 'カードを選んでください'}
              </button>
            </>
          ) : (
            <>
              {/* 確定後の表示 */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 8 }}>ゲットしたカード</div>
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  <div style={{
                    width: 90, padding: '12px 8px', borderRadius: 16,
                    background: `${SERIES_COLORS_V[picked.series] || '#64748b'}22`,
                    border: `2px solid ${SERIES_COLORS_V[picked.series] || '#64748b'}`,
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                    animation: 'victoryPop 0.5s cubic-bezier(0.175,0.885,0.32,1.275)',
                  }}>
                    <img src={picked.imagePath} alt={picked.name} style={{ width: 70, height: 70, objectFit: 'contain' }} />
                    <div style={{ fontSize: 10, color: '#e2e8f0', fontWeight: 700, textAlign: 'center' }}>{picked.name}</div>
                  </div>
                </div>
                {owned.has(picked.id) && (
                  <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 8 }}>※ すでに所持済み（重複）</div>
                )}
              </div>
              <button
                onClick={() => onVictory(nation.id, teamCardIds, nation.reward, picked.id)}
                style={{
                  padding: '14px 28px', borderRadius: 16, border: 'none', cursor: 'pointer',
                  background: 'linear-gradient(135deg, #fbbf24, #d97706)',
                  color: '#000', fontWeight: 900, fontSize: 18,
                  boxShadow: '0 8px 24px rgba(251,191,36,0.4)',
                }}
              >
                🗺️ マップへ戻る
              </button>
            </>
          )}
        </div>
      </div>
    );
  };

  const DefeatScreen = () => (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 50,
      background: 'rgba(0,0,0,0.88)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{ textAlign: 'center', animation: 'victoryPop 0.5s ease-out' }}>
        <div style={{ fontSize: 64, marginBottom: 8 }}>💀</div>
        <div style={{
          fontSize: 48, fontWeight: 900, color: '#ef4444',
          textShadow: '0 0 30px rgba(239,68,68,0.8)',
          marginBottom: 12,
        }}>
          DEFEAT
        </div>
        <div style={{ color: '#94a3b8', fontSize: 16, marginBottom: 28 }}>
          {nation.emoji} {nation.name} に敗れた…
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, minWidth: 240 }}>
          <button
            onClick={() => onDefeat('retry')}
            style={{
              padding: '14px 24px', borderRadius: 16,
              background: 'linear-gradient(135deg, #ef4444, #b91c1c)',
              color: '#fff', fontWeight: 900, fontSize: 18,
              border: 'none', cursor: 'pointer',
              boxShadow: '0 8px 24px rgba(239,68,68,0.3)',
            }}
          >
            🔄 リトライ
          </button>
          <button
            onClick={() => onDefeat('changeTeam')}
            style={{
              padding: '14px 24px', borderRadius: 16,
              background: 'rgba(255,255,255,0.1)',
              color: '#e2e8f0', fontWeight: 700, fontSize: 16,
              border: '1px solid rgba(255,255,255,0.2)', cursor: 'pointer',
            }}
          >
            🔧 チーム変更
          </button>
          <button
            onClick={() => onDefeat('back')}
            style={{
              padding: '12px 24px', borderRadius: 16,
              background: 'transparent',
              color: '#64748b', fontWeight: 600, fontSize: 15,
              border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer',
            }}
          >
            🗺️ マップへ戻る
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#0a0f1e',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden',
        userSelect: 'none',
      }}
    >
      {/* CSS Animations */}
      <style>{`
        @keyframes attackUp { 0%,100%{transform:translateY(0)} 40%{transform:translateY(-18px)} }
        @keyframes attackDown { 0%,100%{transform:translateY(0)} 40%{transform:translateY(18px)} }
        @keyframes unitShake { 0%,100%{transform:translateX(0)} 25%{transform:translateX(-8px)} 75%{transform:translateX(8px)} }
        @keyframes floatUpDmg { 0%{opacity:1;transform:translateY(0) translateX(-50%)} 100%{opacity:0;transform:translateY(-48px) translateX(-50%)} }
        @keyframes deathFade { 0%{opacity:1;transform:scale(1)} 100%{opacity:0;transform:scale(0.5)} }
        @keyframes spPulse { 0%,100%{box-shadow:0 0 4px #3b82f6} 50%{box-shadow:0 0 14px #60a5fa,0 0 28px #3b82f6} }
        @keyframes screenFlash { 0%,100%{opacity:0} 30%{opacity:1} }
        @keyframes battleBgPulse { 0%,100%{opacity:0.4} 50%{opacity:0.8} }
        @keyframes vsEntrance { from{opacity:0;transform:scale(2.5)} to{opacity:1;transform:scale(1)} }
        @keyframes victoryPop { 0%{opacity:0;transform:scale(0.3)} 80%{transform:scale(1.08)} 100%{opacity:1;transform:scale(1)} }
        @keyframes battleLogSlide { from{opacity:0;transform:translateX(30px)} to{opacity:1;transform:translateX(0)} }
        @keyframes confettiFall { to{transform:translateY(110vh) rotate(720deg);opacity:0} }
        @keyframes specialGlow { 0%,100%{box-shadow:0 0 8px #3b82f6,0 0 16px #3b82f6} 50%{box-shadow:0 0 20px #60a5fa,0 0 40px #3b82f6,0 0 60px rgba(96,165,250,0.3)} }
      `}</style>

      {/* Screen flash overlay */}
      {flashColor && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 40,
          background: flashColor,
          animation: 'screenFlash 0.35s ease-out forwards',
          pointerEvents: 'none',
        }} />
      )}

      {/* HEADER */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '8px 12px',
        background: 'rgba(10,15,30,0.97)',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        flexShrink: 0,
        zIndex: 10,
      }}>
        <button
          onClick={onBack}
          style={{
            fontSize: 20, color: '#94a3b8', background: 'none',
            border: 'none', cursor: 'pointer', padding: '4px 8px',
          }}
        >
          ←
        </button>
        <div style={{ fontSize: 14, fontWeight: 900, color: nation.color }}>
          {nation.emoji} {nation.name}
        </div>
        <div style={{ flex: 1 }} />
        <div style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600 }}>
          Round {g.round}
        </div>
        <div style={{ display: 'flex', gap: 4, marginLeft: 8 }}>
          {[1, 2, 3].map(s => (
            <button
              key={s}
              onClick={() => changeSpeed(s)}
              style={{
                padding: '3px 8px',
                borderRadius: 8,
                fontSize: 11,
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
                background: speed === s ? '#3b82f6' : 'rgba(255,255,255,0.1)',
                color: speed === s ? '#fff' : '#94a3b8',
                transition: 'all 0.15s',
              }}
            >
              {s}x
            </button>
          ))}
        </div>
      </div>

      {/* ENEMY ZONE */}
      <div style={{
        background: 'linear-gradient(180deg, rgba(127,29,29,0.25) 0%, transparent 100%)',
        padding: '10px 8px 6px',
        flexShrink: 0,
      }}>
        <div style={{ fontSize: 9, color: '#f87171', fontWeight: 700, textAlign: 'center', marginBottom: 6, letterSpacing: 1 }}>
          ⚔ ENEMY
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 6 }}>
          {g.enemyTeam.map(unit => (
            <UnitCard key={unit.uid} unit={unit} side="enemy" />
          ))}
        </div>
      </div>

      {/* BATTLE CENTER */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '0 12px',
        minHeight: 100,
        position: 'relative',
      }}>
        {/* Battle log */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {g.log.map((line, i) => (
            <div
              key={line.id}
              style={{
                fontSize: 11,
                color: line.color,
                fontWeight: i === 0 ? 700 : 500,
                opacity: i === 0 ? 1 : i === 1 ? 0.7 : 0.45,
                animation: i === 0 ? 'battleLogSlide 0.2s ease-out' : 'none',
                background: i === 0 ? 'rgba(255,255,255,0.05)' : 'transparent',
                borderRadius: 6,
                padding: '3px 8px',
                borderLeft: i === 0 ? `2px solid ${line.color}` : 'none',
              }}
            >
              {line.text}
            </div>
          ))}
          {g.log.length === 0 && (
            <div style={{ fontSize: 12, color: '#475569', textAlign: 'center' }}>
              バトル開始！
            </div>
          )}
        </div>
      </div>

      {/* PLAYER ZONE */}
      <div style={{
        background: 'linear-gradient(0deg, rgba(29,78,216,0.25) 0%, transparent 100%)',
        padding: '6px 8px 8px',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 6 }}>
          {g.playerTeam.map(unit => (
            <UnitCard key={unit.uid} unit={unit} side="player" />
          ))}
        </div>
        <div style={{ fontSize: 9, color: '#60a5fa', fontWeight: 700, textAlign: 'center', marginTop: 6, letterSpacing: 1 }}>
          PLAYER ⚔
        </div>
      </div>

      {/* SPECIAL BAR */}
      <div style={{
        background: 'rgba(0,0,0,0.5)',
        borderTop: '1px solid rgba(255,255,255,0.08)',
        padding: '8px 8px 12px',
        flexShrink: 0,
      }}>
        <div style={{ fontSize: 10, color: '#94a3b8', textAlign: 'center', marginBottom: 6, fontWeight: 600 }}>
          ✨ 必殺技
        </div>
        <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
          {g.playerTeam.map(unit => {
            const move = SPECIAL_MOVES[unit.series];
            const ready = unit.alive && unit.spCharge >= 100;
            const color = SERIES_COLORS[unit.series] || '#3b82f6';
            return (
              <button
                key={unit.uid}
                onClick={() => triggerPlayerSpecial(unit)}
                disabled={!ready || phase !== 'battle'}
                style={{
                  flex: 1,
                  maxWidth: 68,
                  padding: '6px 4px',
                  borderRadius: 10,
                  border: ready ? `2px solid ${color}` : '2px solid rgba(255,255,255,0.1)',
                  background: ready ? `${color}22` : 'rgba(255,255,255,0.04)',
                  cursor: ready ? 'pointer' : 'default',
                  opacity: unit.alive ? 1 : 0.3,
                  animation: ready ? 'specialGlow 1.5s ease-in-out infinite' : 'none',
                  transition: 'all 0.2s',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 2,
                }}
              >
                <div style={{ fontSize: 16 }}>{move?.emoji || '⚡'}</div>
                <div style={{ fontSize: 8, color: ready ? color : '#64748b', fontWeight: 700, textAlign: 'center', lineHeight: 1.2 }}>
                  {move?.name || '必殺'}
                </div>
                {/* SP progress bar */}
                <div style={{
                  width: '100%',
                  height: 3,
                  background: 'rgba(255,255,255,0.1)',
                  borderRadius: 2,
                  overflow: 'hidden',
                  marginTop: 2,
                }}>
                  <div style={{
                    width: `${unit.spCharge}%`,
                    height: '100%',
                    background: ready
                      ? `linear-gradient(90deg, ${color}, #fff)`
                      : `linear-gradient(90deg, ${color}88, ${color})`,
                    borderRadius: 2,
                    transition: 'width 0.3s',
                  }} />
                </div>
                <div style={{ fontSize: 8, color: ready ? '#fff' : '#475569', fontWeight: 600 }}>
                  {ready ? 'READY!' : `${Math.round(unit.spCharge)}%`}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Overlays */}
      {phase === 'victory' && <VictoryScreen />}
      {phase === 'defeat' && <DefeatScreen />}
    </div>
  );
}
