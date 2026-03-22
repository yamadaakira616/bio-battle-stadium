// 50レベル分のテーブル
const LEVEL_TABLE = [
  // 1桁
  { digits:1, count:2, ms:2000, label:'1けた 2こ', world:1 },  // Lv1
  { digits:1, count:2, ms:1700, label:'1けた 2こ', world:1 },
  { digits:1, count:2, ms:1400, label:'1けた 2こ', world:1 },
  { digits:1, count:3, ms:2000, label:'1けた 3こ', world:1 },
  { digits:1, count:3, ms:1700, label:'1けた 3こ', world:1 },
  { digits:1, count:3, ms:1400, label:'1けた 3こ', world:1 },
  { digits:1, count:3, ms:1200, label:'1けた 3こ', world:1 },
  { digits:1, count:4, ms:1800, label:'1けた 4こ', world:1 },
  { digits:1, count:4, ms:1500, label:'1けた 4こ', world:1 },
  { digits:1, count:4, ms:1200, label:'1けた 4こ', world:1 }, // Lv10
  { digits:1, count:5, ms:1800, label:'1けた 5こ', world:1 },
  { digits:1, count:5, ms:1500, label:'1けた 5こ', world:1 },
  { digits:1, count:5, ms:1200, label:'1けた 5こ', world:1 },
  { digits:1, count:5, ms:1000, label:'1けた 5こ', world:1 },
  { digits:1, count:6, ms:1500, label:'1けた 6こ', world:1 },
  { digits:1, count:6, ms:1200, label:'1けた 6こ', world:1 },
  { digits:1, count:6, ms:1000, label:'1けた 6こ', world:1 },
  { digits:1, count:7, ms:1200, label:'1けた 7こ', world:1 },
  { digits:1, count:7, ms:1000, label:'1けた 7こ', world:1 },
  { digits:1, count:8, ms:1000, label:'1けた 8こ', world:1 }, // Lv20
  // 2桁
  { digits:2, count:2, ms:2000, label:'2けた 2こ', world:2 },
  { digits:2, count:2, ms:1700, label:'2けた 2こ', world:2 },
  { digits:2, count:3, ms:2000, label:'2けた 3こ', world:2 },
  { digits:2, count:3, ms:1700, label:'2けた 3こ', world:2 },
  { digits:2, count:3, ms:1500, label:'2けた 3こ', world:2 },
  { digits:2, count:4, ms:1800, label:'2けた 4こ', world:2 },
  { digits:2, count:4, ms:1500, label:'2けた 4こ', world:2 },
  { digits:2, count:4, ms:1300, label:'2けた 4こ', world:2 },
  { digits:2, count:5, ms:1700, label:'2けた 5こ', world:2 },
  { digits:2, count:5, ms:1400, label:'2けた 5こ', world:2 }, // Lv30
  { digits:2, count:5, ms:1200, label:'2けた 5こ', world:2 },
  { digits:2, count:6, ms:1500, label:'2けた 6こ', world:2 },
  { digits:2, count:6, ms:1200, label:'2けた 6こ', world:2 },
  { digits:2, count:7, ms:1400, label:'2けた 7こ', world:2 },
  { digits:2, count:7, ms:1200, label:'2けた 7こ', world:2 }, // Lv35
  // 3桁
  { digits:3, count:2, ms:2000, label:'3けた 2こ', world:3 },
  { digits:3, count:2, ms:1700, label:'3けた 2こ', world:3 },
  { digits:3, count:3, ms:2000, label:'3けた 3こ', world:3 },
  { digits:3, count:3, ms:1700, label:'3けた 3こ', world:3 },
  { digits:3, count:3, ms:1500, label:'3けた 3こ', world:3 }, // Lv40
  { digits:3, count:4, ms:1700, label:'3けた 4こ', world:3 },
  { digits:3, count:4, ms:1500, label:'3けた 4こ', world:3 },
  { digits:3, count:4, ms:1300, label:'3けた 4こ', world:3 },
  { digits:3, count:5, ms:1500, label:'3けた 5こ', world:3 },
  { digits:3, count:5, ms:1300, label:'3けた 5こ', world:3 }, // Lv45
  { digits:3, count:6, ms:1300, label:'3けた 6こ', world:3 },
  { digits:3, count:6, ms:1100, label:'3けた 6こ', world:3 },
  { digits:3, count:7, ms:1200, label:'3けた 7こ', world:3 },
  { digits:3, count:7, ms:1000, label:'3けた 7こ', world:3 },
  { digits:3, count:8, ms:900,  label:'3けた 8こ', world:3 }, // Lv50
];

export const TOTAL_LEVELS = LEVEL_TABLE.length;

export function getLevelConfig(level) {
  const idx = Math.max(0, Math.min(level - 1, LEVEL_TABLE.length - 1));
  return { ...LEVEL_TABLE[idx], level };
}

function randomNum(digits) {
  if (digits === 1) return Math.floor(Math.random() * 9) + 1;
  if (digits === 2) return Math.floor(Math.random() * 90) + 10;
  return Math.floor(Math.random() * 900) + 100;
}

export function generateFlashProblem(level) {
  const { digits, count } = getLevelConfig(level);
  const numbers = Array.from({ length: count }, () => randomNum(digits));
  const answer = numbers.reduce((a, b) => a + b, 0);
  return { numbers, answer };
}

export function generateChoices(answer, digits) {
  const delta = digits === 1 ? 3 : digits === 2 ? 20 : 150;
  const set = new Set([answer]);
  while (set.size < 4) {
    const d = (Math.floor(Math.random() * 4) + 1) * delta * (Math.random() < 0.5 ? 1 : -1);
    const c = answer + d;
    if (c > 0) set.add(c);
  }
  return [...set].sort(() => Math.random() - 0.5);
}

export const QUESTIONS_PER_LEVEL = 5;
export const GACHA_COST = 100;
export const COINS_PER_CORRECT = 100; // 1問正解で100コイン
export const MAX_COINS_PER_PLAY = 400; // 1回のプレイの上限
export const WORLD_COLORS = {
  1: { bg: '#fef9c3', accent: '#f97316', name: '1けたワールド 🌱' },
  2: { bg: '#dbeafe', accent: '#3b82f6', name: '2けたワールド 🌊' },
  3: { bg: '#ede9fe', accent: '#a855f7', name: '3けたワールド 🌌' },
};

// 1回のプレイで獲得できるコイン（正解数×100、上限400）
// 1問=100, 2問=200, 3問=300, 4問=400, 5問=400
export function calcPlayReward(correctCount) {
  return Math.min(correctCount * COINS_PER_CORRECT, MAX_COINS_PER_PLAY);
}

export function starsCoins(stars) { return [0, 3, 6, 10][stars] || 0; }
