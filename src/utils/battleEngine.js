// ===== Battle Engine =====
// Pure battle logic - no React/UI imports

function seedFloat(str, idx) {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  h ^= (idx * 0x9e3779b9) >>> 0;
  h = (Math.imul(h ^ (h >>> 16), 0x45d9f3b)) >>> 0;
  return (h & 0xffff) / 0xffff;
}

const SERIES_STATS = {
  bio:    { hp:[80,130],  atk:[45,80],   def:[35,70],  spd:[55,95]  },
  arms:   { hp:[55,90],   atk:[75,115],  def:[45,80],  spd:[65,105] },
  armbio: { hp:[95,145],  atk:[85,125],  def:[55,95],  spd:[45,85]  },
  corps:  { hp:[115,165], atk:[65,100],  def:[75,115], spd:[35,70]  },
  catsle: { hp:[145,205], atk:[95,145],  def:[95,145], spd:[25,60]  },
};

const SP_DMG_MULT = {
  bio: 1.5,
  arms: 2.5,
  armbio: 2.0,
  corps: 1.8,
  catsle: 2.2,
};

function lerp(a, b, t) { return Math.round(a + (b - a) * t); }

// レベルアップコスト（Lv.1→2 が index 0）
export const LEVEL_UP_COSTS = [50, 80, 120, 170, 230, 300, 380, 470, 570];
export const MAX_CARD_LEVEL = 10;

// Lv.1 を基準に各レベルのステータス倍率を計算
function levelMult(level) {
  const lv = Math.max(1, Math.min(level || 1, MAX_CARD_LEVEL));
  return {
    hp:  1 + (lv - 1) * 0.08,
    atk: 1 + (lv - 1) * 0.07,
    def: 1 + (lv - 1) * 0.07,
    spd: 1 + (lv - 1) * 0.04,
  };
}

export function getCardStats(card, scaleMult = 1, cardLevel = 1) {
  const series = card.series || 'bio';
  const ranges = SERIES_STATS[series] || SERIES_STATS.bio;
  const t0 = seedFloat(card.id, 0);
  const t1 = seedFloat(card.id, 1);
  const t2 = seedFloat(card.id, 2);
  const t3 = seedFloat(card.id, 3);
  const lm = levelMult(cardLevel);

  const maxHp  = Math.round(lerp(ranges.hp[0],  ranges.hp[1],  t0) * scaleMult * lm.hp);
  const atk    = Math.round(lerp(ranges.atk[0], ranges.atk[1], t1) * scaleMult * lm.atk);
  const def    = Math.round(lerp(ranges.def[0], ranges.def[1], t2) * scaleMult * lm.def);
  const spd    = Math.round(lerp(ranges.spd[0], ranges.spd[1], t3) * scaleMult * lm.spd);
  const spDmg  = Math.round(atk * (SP_DMG_MULT[series] || 1.5));

  return {
    id: card.id,
    name: card.name,
    series,
    imagePath: card.imagePath,
    maxHp,
    hp: maxHp,
    atk,
    def,
    spd,
    spMax: 100,
    spCharge: 0,
    spDmg,
    alive: true,
    status: null,
    statusTurns: 0,
  };
}

export function calcDamage(attacker, target, isCrit = false) {
  const variation = 0.85 + Math.random() * 0.30;
  const base = attacker.atk * 100 / (100 + target.def) * variation;
  const dmg = Math.round(base * (isCrit ? 2.0 : 1.0));
  return Math.max(1, dmg);
}

export function isCritical() {
  return Math.random() < 0.15;
}

export const STATUS_DAMAGE = {
  burn: 8,
  poison: 12,
  shock: 6,
  freeze: 0,
};

export const SPECIAL_MOVES = {
  bio:    { name: '野生の咆哮', emoji: '🌿', desc: '全敵1.8倍',    type: 'aoe',    mult: 1.8 },
  arms:   { name: '一斉砲撃',   emoji: '💥', desc: '単体3倍',      type: 'single', mult: 3.0 },
  armbio: { name: '武装突進',   emoji: '⚔️', desc: '2.5倍+炎上',  type: 'burn',   mult: 2.5 },
  corps:  { name: '軍団突撃',   emoji: '👥', desc: '3体2倍',       type: 'multi',  mult: 2.0 },
  catsle: { name: '王の裁き',   emoji: '👑', desc: '3倍+回復20',   type: 'heal',   mult: 3.0 },
};
