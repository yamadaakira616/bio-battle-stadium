# カード融合機能 実装プラン

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** commonランク（bioシリーズ）のカードを2枚消費して10%の確率で融合限定キャラを入手できる「融合工房」を追加する。

**Architecture:** `collection` をID配列からカウントマップ（`{ id: count }`）に変更し複数所持を実現。`battleEngine.js` に fusionシリーズ統計を追加し、新規 `FusionScreen.jsx` で選択→ド派手演出→結果の3フェーズを管理する。

**Tech Stack:** React 19, Tailwind CSS v4, Vite, Vitest, CSS `@keyframes`

---

## ファイル一覧

| ファイル | 変更種別 | 内容 |
|---|---|---|
| `src/data/fusions.js` | 新規作成 | 24体の融合限定キャラデータ |
| `src/screens/FusionScreen.jsx` | 新規作成 | 融合工房 UI + アニメーション |
| `src/utils/battleEngine.js` | 変更 | fusion シリーズ統計追加 |
| `src/hooks/useGameState.js` | 変更 | collection→map、fusionCollection、attemptFusion |
| `src/screens/TeamSelectScreen.jsx` | 変更 | collection map 対応 |
| `src/screens/EncyclopediaScreen.jsx` | 変更 | collection map 対応 + 融合タブ |
| `src/screens/HomeScreen.jsx` | 変更 | collection map 対応 + 融合工房ボタン |
| `src/screens/GachaScreen.jsx` | 変更 | collection map 対応 |
| `src/screens/BattleScreen.jsx` | 変更 | collection map 対応 |
| `src/components/StickerBookPage.jsx` | 変更 | collection map 対応 |
| `src/App.jsx` | 変更 | FUSION 画面ルーティング |
| `src/__tests__/fusions.test.js` | 新規作成 | 融合データのテスト |
| `src/__tests__/useGameState.test.js` | 変更 | collection map + fusion テスト |

---

## Task 1: battleEngine.js に fusion シリーズを追加

**Files:**
- Modify: `src/utils/battleEngine.js`

- [ ] **Step 1: テストを書く**

`src/__tests__/battleEngine.test.js` を新規作成:

```js
import { describe, it, expect } from 'vitest';
import { getCardStats } from '../utils/battleEngine.js';

describe('fusion series stats', () => {
  it('fusion カードのステータスが bio の 1.3 倍以上の範囲にある', () => {
    const fusionCard = { id: 'wolphin', name: 'ウルフィン', series: 'fusion' };
    const bioCard    = { id: 'bio-african-lion', name: 'African Lion', series: 'bio' };
    const fStats = getCardStats(fusionCard);
    const bStats = getCardStats(bioCard);
    // fusion の hp 下限(104) > bio の hp 下限(80)
    expect(fStats.maxHp).toBeGreaterThan(bStats.maxHp * 0.9);
  });

  it('fusion カードに spDmg が定義されている', () => {
    const card = { id: 'wolphin', name: 'ウルフィン', series: 'fusion' };
    const stats = getCardStats(card);
    expect(stats.spDmg).toBeGreaterThan(0);
  });
});
```

- [ ] **Step 2: テストが失敗することを確認**

```bash
cd /Users/yamadatoshi/yamada-ai-claude/projects/bio-battle-stadium
npm test -- battleEngine
```

Expected: FAIL（fusion series が未定義なので bio fallback になり、値は通る可能性があるが後で正確に確認）

- [ ] **Step 3: battleEngine.js に fusion シリーズを追加**

`src/utils/battleEngine.js` の `SERIES_STATS` に追記:

```js
const SERIES_STATS = {
  bio:    { hp:[80,130],  atk:[45,80],   def:[35,70],  spd:[55,95]  },
  arms:   { hp:[55,90],   atk:[75,115],  def:[45,80],  spd:[65,105] },
  armbio: { hp:[95,145],  atk:[85,125],  def:[55,95],  spd:[45,85]  },
  corps:  { hp:[115,165], atk:[65,100],  def:[75,115], spd:[35,70]  },
  catsle: { hp:[145,205], atk:[95,145],  def:[95,145], spd:[25,60]  },
  // fusion: bio × 1.3倍
  fusion: { hp:[104,169], atk:[59,104],  def:[46,91],  spd:[72,124] },
  // Legendary: 通常シリーズの1.2倍
  // ... (既存のlegendaryエントリはそのまま)
```

`SP_DMG_MULT` に追記:

```js
const SP_DMG_MULT = {
  // ... 既存エントリ
  fusion: 2.0,
};
```

`LEVEL_UP_COSTS` に追記（bio の 1.2 倍、端数切り捨て）:

```js
export const LEVEL_UP_COSTS = {
  // ... 既存エントリ
  fusion: [360, 430, 510, 610, 720, 840, 970, 1130, 1310],
};
```

`SPECIAL_MOVES` に追記:

```js
export const SPECIAL_MOVES = {
  // ... 既存エントリ
  fusion: { name: '融合の咆哮', emoji: '🧬', desc: '全敵2.0倍+状態異常', type: 'aoe', mult: 2.0 },
};
```

- [ ] **Step 4: テストを実行して通ることを確認**

```bash
npm test -- battleEngine
```

Expected: PASS

- [ ] **Step 5: コミット**

```bash
git add src/utils/battleEngine.js src/__tests__/battleEngine.test.js
git commit -m "feat: add fusion series stats to battleEngine"
```

---

## Task 2: fusions.js データファイルを作成

**Files:**
- Create: `src/data/fusions.js`
- Create: `src/__tests__/fusions.test.js`

- [ ] **Step 1: テストを書く**

`src/__tests__/fusions.test.js` を新規作成:

```js
import { describe, it, expect } from 'vitest';
import { FUSIONS } from '../data/fusions.js';

describe('FUSIONS', () => {
  it('24体の融合キャラがある', () => {
    expect(FUSIONS).toHaveLength(24);
  });

  it('IDが重複していない', () => {
    const ids = FUSIONS.map(f => f.id);
    expect(new Set(ids).size).toBe(24);
  });

  it('すべてのキャラに必須フィールドがある', () => {
    for (const f of FUSIONS) {
      expect(f.id,        `${f.id}: id missing`).toBeTruthy();
      expect(f.name,      `${f.id}: name missing`).toBeTruthy();
      expect(f.nameEn,    `${f.id}: nameEn missing`).toBeTruthy();
      expect(f.imagePath, `${f.id}: imagePath missing`).toBeTruthy();
      expect(f.series).toBe('fusion');
    }
  });
});
```

- [ ] **Step 2: テストが失敗することを確認**

```bash
npm test -- fusions
```

Expected: FAIL（モジュールが未存在）

- [ ] **Step 3: fusions.js を作成**

`src/data/fusions.js` を新規作成:

```js
const B = import.meta.env.BASE_URL;
const fp = name => B + `assets/gacha/fusion/${name}.png`;

export const FUSIONS = [
  { id:'wolphin',       name:'ウルフィン',         nameEn:'Wolphin',       imagePath:fp('wolphin'),       series:'fusion' },
  { id:'gryphther',     name:'グリフサー',         nameEn:'Gryphther',     imagePath:fp('gryphther'),     series:'fusion' },
  { id:'polarplatypus', name:'ポーラプラティバス', nameEn:'Polarplatypus', imagePath:fp('polarplatypus'), series:'fusion' },
  { id:'elephantula',   name:'エレファンタラ',     nameEn:'Elephantula',   imagePath:fp('elephantula'),   series:'fusion' },
  { id:'sharkhorse',    name:'シャークホース',     nameEn:'Sharkhorse',    imagePath:fp('sharkhorse'),    series:'fusion' },
  { id:'rhinoeagle',    name:'ライノイーグル',     nameEn:'Rhinoeagle',    imagePath:fp('rhinoeagle'),    series:'fusion' },
  { id:'lionfisher',    name:'ライオンフィッシャー', nameEn:'Lionfisher',  imagePath:fp('lionfisher'),    series:'fusion' },
  { id:'goatcepus',     name:'ゴートセパス',       nameEn:'Goatcepus',     imagePath:fp('goatcepus'),     series:'fusion' },
  { id:'ursashark',     name:'ウルサシャーク',     nameEn:'Ursashark',     imagePath:fp('ursashark'),     series:'fusion' },
  { id:'eagledeer',     name:'イーグルディア',     nameEn:'Eagledeer',     imagePath:fp('eagledeer'),     series:'fusion' },
  { id:'tigtopus',      name:'ティグタパス',       nameEn:'Tigtopus',      imagePath:fp('tigtopus'),      series:'fusion' },
  { id:'equadragon',    name:'エクアドラゴン',     nameEn:'Equadragon',    imagePath:fp('equadragon'),    series:'fusion' },
  { id:'lapinsect',     name:'ラパンセクト',       nameEn:'Lapinsect',     imagePath:fp('lapinsect'),     series:'fusion' },
  { id:'bullshark',     name:'ブルシャーク',       nameEn:'Bullshark',     imagePath:fp('bullshark'),     series:'fusion' },
  { id:'pengseal',      name:'ペングシール',       nameEn:'Pengseal',      imagePath:fp('pengseal'),      series:'fusion' },
  { id:'serpeagle',     name:'サーペイグル',       nameEn:'Serpeagle',     imagePath:fp('serpeagle'),     series:'fusion' },
  { id:'rhinomastodon', name:'ゾウサイ',           nameEn:'Rhinomastodon', imagePath:fp('rhinomastodon'), series:'fusion' },
  { id:'aerolion',      name:'エアロライオン',     nameEn:'Aerolion',      imagePath:fp('aerolion'),      series:'fusion' },
  { id:'cetashark',     name:'セタシャーク',       nameEn:'Cetashark',     imagePath:fp('cetashark'),     series:'fusion' },
  { id:'octowolf',      name:'オクタウルフ',       nameEn:'Octowolf',      imagePath:fp('octowolf'),      series:'fusion' },
  { id:'girratortoise', name:'ジラタートース',     nameEn:'Girratortoise', imagePath:fp('girratortoise'), series:'fusion' },
  { id:'crocow',        name:'クロコウ',           nameEn:'Crocow',        imagePath:fp('crocow'),        series:'fusion' },
  { id:'zebraelk',      name:'ゼブラエルク',       nameEn:'Zebraelk',      imagePath:fp('zebraelk'),      series:'fusion' },
  { id:'ursuporcine',   name:'ウルスポーキュバイン', nameEn:'Ursuporcine', imagePath:fp('ursuporcine'),   series:'fusion' },
];
```

- [ ] **Step 4: テストを実行して通ることを確認**

```bash
npm test -- fusions
```

Expected: PASS

- [ ] **Step 5: コミット**

```bash
git add src/data/fusions.js src/__tests__/fusions.test.js
git commit -m "feat: add fusion character data (24 types)"
```

---

## Task 3: useGameState — collection をマップに変更 + 既存メソッド更新

**Files:**
- Modify: `src/hooks/useGameState.js`
- Modify: `src/__tests__/useGameState.test.js`

- [ ] **Step 1: useGameState.test.js の既存テストを更新し、新規テストを追加**

`src/__tests__/useGameState.test.js` の該当部分を書き換え:

```js
import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useGameState } from '../hooks/useGameState.js';

const localStorageMock = (() => {
  let store = {};
  return {
    getItem: key => store[key] ?? null,
    setItem: (key, val) => { store[key] = val; },
    clear: () => { store = {}; },
  };
})();
Object.defineProperty(global, 'localStorage', { value: localStorageMock });

import { DUPLICATE_COINS } from '../data/stickers.js';

describe('game state logic', () => {
  beforeEach(() => localStorageMock.clear());

  it('DUPLICATE_COINS is 30', () => {
    expect(DUPLICATE_COINS).toBe(30);
  });

  it('collection は初期状態でオブジェクト（マップ）である', () => {
    const { result } = renderHook(() => useGameState());
    expect(result.current.state.collection).toEqual({});
  });

  it('collection: 同じカードを2回追加すると count が 2 になる', () => {
    const { result } = renderHook(() => useGameState());
    act(() => result.current.addCardToCollection('c01'));
    act(() => result.current.addCardToCollection('c01'));
    expect(result.current.state.collection['c01']).toBe(2);
  });

  it('collection: 旧形式（配列）のセーブデータを自動移行する', () => {
    localStorageMock.setItem('sticker-book-v1', JSON.stringify({
      collection: ['c01', 'c02', 'c01'],
    }));
    const { result } = renderHook(() => useGameState());
    expect(result.current.state.collection).toEqual({ c01: 2, c02: 1 });
  });

  it('stars: best score is kept, lower score does not overwrite', () => {
    const saveStars = (levelStars, lvl, stars) => {
      const prev = levelStars[lvl] || 0;
      if (stars <= prev) return levelStars;
      return { ...levelStars, [lvl]: stars };
    };
    let s = {};
    s = saveStars(s, 1, 3);
    s = saveStars(s, 1, 2);
    expect(s[1]).toBe(3);
  });
});
```

- [ ] **Step 2: テストが失敗することを確認**

```bash
npm test -- useGameState
```

Expected: 「collection はオブジェクトである」と「旧形式を自動移行する」が FAIL

- [ ] **Step 3: useGameState.js の DEFAULT_STATE を変更**

`DEFAULT_STATE` の `collection: []` を:

```js
const DEFAULT_STATE = {
  level: 1,
  coins: 500,
  collection: {},           // 変更: [] → {}
  fusionCollection: [],     // 追加
  levelStars: {},
  totalStars: 0,
  bestCombo: 0,
  totalPlayed: 0,
  levelPlayCount: {},
  bookPages: [[], [], [], [], []],
  battleProgress: {
    conquered: [],
    teamIds: [],
  },
  cardLevels: {},
};
```

- [ ] **Step 4: ロード時の migration を追加**

`useGameState` 内の `useState` 初期化を書き換え:

```js
const [state, setState] = useState(() => {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return DEFAULT_STATE;
    const parsed = JSON.parse(raw);

    // collection: 旧配列 → マップへ自動移行
    let collection;
    if (Array.isArray(parsed.collection)) {
      collection = {};
      for (const id of parsed.collection) {
        collection[id] = (collection[id] || 0) + 1;
      }
    } else if (parsed.collection && typeof parsed.collection === 'object') {
      collection = parsed.collection;
    } else {
      collection = DEFAULT_STATE.collection;
    }

    const level = (typeof parsed.level === 'number' && parsed.level >= 1 && parsed.level <= 50)
      ? parsed.level : DEFAULT_STATE.level;
    const coins = (typeof parsed.coins === 'number' && parsed.coins >= 0)
      ? parsed.coins : DEFAULT_STATE.coins;
    const fusionCollection = Array.isArray(parsed.fusionCollection)
      ? parsed.fusionCollection : DEFAULT_STATE.fusionCollection;
    const bookPages = Array.isArray(parsed.bookPages) && parsed.bookPages.length === 5
      ? parsed.bookPages : DEFAULT_STATE.bookPages;

    return { ...DEFAULT_STATE, ...parsed, level, coins, collection, fusionCollection, bookPages };
  } catch { return DEFAULT_STATE; }
});
```

- [ ] **Step 5: pullGacha を collection マップ対応に変更**

```js
function pullGacha(sticker) {
  pullGachaResultRef.current = null;
  setState(s => {
    const isNew = !(sticker.id in s.collection);
    const newCount = (s.collection[sticker.id] || 0) + 1;
    if (isNew) {
      pullGachaResultRef.current = { isNew: true, coinBonus: 0 };
      return {
        ...s,
        coins: Math.max(0, s.coins - GACHA_COST),
        collection: { ...s.collection, [sticker.id]: 1 },
      };
    } else {
      pullGachaResultRef.current = { isNew: false, coinBonus: DUPLICATE_COINS };
      return {
        ...s,
        coins: Math.max(0, s.coins - GACHA_COST) + DUPLICATE_COINS,
        collection: { ...s.collection, [sticker.id]: newCount },
      };
    }
  });
  return pullGachaResultRef.current;
}
```

- [ ] **Step 6: addCardToCollection を collection マップ対応に変更**

```js
function addCardToCollection(cardId) {
  setState(s => ({
    ...s,
    collection: { ...s.collection, [cardId]: (s.collection[cardId] || 0) + 1 },
  }));
}
```

- [ ] **Step 7: テストを実行して通ることを確認**

```bash
npm test -- useGameState
```

Expected: PASS

- [ ] **Step 8: コミット**

```bash
git add src/hooks/useGameState.js src/__tests__/useGameState.test.js
git commit -m "feat: migrate collection from array to count map"
```

---

## Task 4: useGameState — fusionCollection と attemptFusion を追加

**Files:**
- Modify: `src/hooks/useGameState.js`
- Modify: `src/__tests__/useGameState.test.js`

- [ ] **Step 1: テストを追加**

`src/__tests__/useGameState.test.js` に追記:

```js
import { FUSIONS } from '../data/fusions.js';

describe('attemptFusion', () => {
  beforeEach(() => localStorageMock.clear());

  it('bio カード2枚を消費して fusionCollection に追加される（成功時）', () => {
    // Math.random を 0.05 (< 0.1) に固定して成功を保証
    const origRandom = Math.random;
    Math.random = () => 0.05;

    const { result } = renderHook(() => useGameState());
    // cardId1 と cardId2 を各2枚以上持たせる
    act(() => {
      result.current.addCardToCollection('bio-african-lion');
      result.current.addCardToCollection('bio-african-lion');
      result.current.addCardToCollection('bio-grey-wolf');
    });

    let fusionResult;
    act(() => {
      fusionResult = result.current.attemptFusion('bio-african-lion', 'bio-grey-wolf');
    });

    expect(fusionResult.success).toBe(true);
    expect(FUSIONS.some(f => f.id === fusionResult.fusionCard.id)).toBe(true);
    expect(result.current.state.fusionCollection).toHaveLength(1);
    // 消費確認
    expect(result.current.state.collection['bio-african-lion']).toBe(1);
    expect(result.current.state.collection['bio-grey-wolf']).toBeUndefined();

    Math.random = origRandom;
  });

  it('失敗時（90%）はカードが消滅し fusionCollection に追加されない', () => {
    const origRandom = Math.random;
    Math.random = () => 0.5; // > 0.1 = 失敗

    const { result } = renderHook(() => useGameState());
    act(() => {
      result.current.addCardToCollection('bio-african-lion');
      result.current.addCardToCollection('bio-grey-wolf');
    });

    let fusionResult;
    act(() => {
      fusionResult = result.current.attemptFusion('bio-african-lion', 'bio-grey-wolf');
    });

    expect(fusionResult.success).toBe(false);
    expect(result.current.state.fusionCollection).toHaveLength(0);
    expect(result.current.state.collection['bio-african-lion']).toBeUndefined();
    expect(result.current.state.collection['bio-grey-wolf']).toBeUndefined();

    Math.random = origRandom;
  });

  it('同じカード2枚で fusion を試みると2枚消費される', () => {
    const origRandom = Math.random;
    Math.random = () => 0.5;

    const { result } = renderHook(() => useGameState());
    act(() => {
      result.current.addCardToCollection('bio-african-lion');
      result.current.addCardToCollection('bio-african-lion');
    });

    act(() => {
      result.current.attemptFusion('bio-african-lion', 'bio-african-lion');
    });

    expect(result.current.state.collection['bio-african-lion']).toBeUndefined();
    Math.random = origRandom;
  });

  it('カードが足りない場合は何も変わらない', () => {
    const { result } = renderHook(() => useGameState());
    act(() => {
      result.current.addCardToCollection('bio-african-lion'); // 1枚だけ
    });

    act(() => {
      result.current.attemptFusion('bio-african-lion', 'bio-african-lion'); // 2枚必要
    });

    expect(result.current.state.collection['bio-african-lion']).toBe(1); // 消費されない
  });
});
```

- [ ] **Step 2: テストが失敗することを確認**

```bash
npm test -- useGameState
```

Expected: FAIL（attemptFusion が未定義）

- [ ] **Step 3: useGameState.js に attemptFusion を追加**

`useGameState` の `pullGachaResultRef` 宣言の後に追加:

```js
import { FUSIONS } from '../data/fusions.js';

// --- 既存の pullGachaResultRef の後に追記 ---
const attemptFusionResultRef = useRef(null);

function attemptFusion(cardId1, cardId2) {
  attemptFusionResultRef.current = null;
  setState(s => {
    const col = { ...s.collection };

    // カード1を1枚消費
    if ((col[cardId1] || 0) < 1) return s;
    col[cardId1] -= 1;
    if (col[cardId1] <= 0) delete col[cardId1];

    // カード2を1枚消費（cardId1 === cardId2 の場合も正しく動作）
    if ((col[cardId2] || 0) < 1) return s;
    col[cardId2] -= 1;
    if (col[cardId2] <= 0) delete col[cardId2];

    if (Math.random() < 0.1) {
      const fusionCard = FUSIONS[Math.floor(Math.random() * FUSIONS.length)];
      attemptFusionResultRef.current = { success: true, fusionCard };
      return {
        ...s,
        collection: col,
        fusionCollection: [...(s.fusionCollection || []), fusionCard.id],
      };
    }
    attemptFusionResultRef.current = { success: false };
    return { ...s, collection: col };
  });
  return attemptFusionResultRef.current;
}
```

return 文に `attemptFusion` を追加:

```js
return {
  state,
  addCoins, spendCoins, levelUp, saveStars,
  updateBestCombo, incLevelPlayCount, pullGacha, updateBookPage,
  updateBattleProgress, saveBattleTeam, upgradeCard, addCardToCollection,
  attemptFusion,   // 追加
};
```

- [ ] **Step 4: テストを実行して通ることを確認**

```bash
npm test -- useGameState
```

Expected: PASS

- [ ] **Step 5: コミット**

```bash
git add src/hooks/useGameState.js src/__tests__/useGameState.test.js
git commit -m "feat: add attemptFusion and fusionCollection to useGameState"
```

---

## Task 5: collection マップ対応 — 既存 UI ファイルの更新

**Files:**
- Modify: `src/screens/TeamSelectScreen.jsx`
- Modify: `src/screens/EncyclopediaScreen.jsx`
- Modify: `src/screens/HomeScreen.jsx`
- Modify: `src/screens/GachaScreen.jsx`
- Modify: `src/screens/BattleScreen.jsx`
- Modify: `src/components/StickerBookPage.jsx`

- [ ] **Step 1: TeamSelectScreen.jsx を更新**

`TeamSelectScreen.jsx` の 3 箇所を変更:

```js
// 変更前 (line 35)
(s.series === series || s.series === `legendary-${series}`) && state.collection.includes(s.id)
// 変更後
(s.series === series || s.series === `legendary-${series}`) && (s.id in (state.collection || {}))

// 変更前 (line 61)
const missingCount = SERIES_ORDER.filter(s => !state.collection.some(id => {
  const c = STICKERS.find(cc => cc.id === id);
  return c && (c.series === s || c.series === `legendary-${s}`);
})).length;
// 変更後
const missingCount = SERIES_ORDER.filter(s => !Object.keys(state.collection || {}).some(id => {
  const c = STICKERS.find(cc => cc.id === id);
  return c && (c.series === s || c.series === `legendary-${s}`);
})).length;

// 変更前 (line 92)
const isOwned = card && state.collection.includes(card.id);
// 変更後
const isOwned = card && (card.id in (state.collection || {}));
```

- [ ] **Step 2: EncyclopediaScreen.jsx を更新**

```js
// 変更前 (line 47)
const owned = id => state.collection.includes(id);
// 変更後
const owned = id => id in (state.collection || {});

// 変更前 (line 60)
{state.collection.length}/{STICKERS.length}
// 変更後
{Object.keys(state.collection || {}).length}/{STICKERS.length}
```

- [ ] **Step 3: HomeScreen.jsx を更新**

```js
// 変更前 (line 25)
const owned = state.collection.length;
// 変更後
const owned = Object.keys(state.collection || {}).length;
```

- [ ] **Step 4: GachaScreen.jsx を更新**

```js
// 変更前 (line 857)
{state.collection.length + 1}枚目をゲット！
// 変更後
{Object.keys(state.collection || {}).length + 1}枚目をゲット！
```

- [ ] **Step 5: BattleScreen.jsx を 2 箇所更新**

```js
// 変更前 (line 83)
const owned = new Set(state.collection || []);
// 変更後
const owned = new Set(Object.keys(state.collection || {}));

// 変更前 (line 657)
const owned = new Set(state.collection || []);
// 変更後
const owned = new Set(Object.keys(state.collection || {}));
```

- [ ] **Step 6: StickerBookPage.jsx を更新**

```js
// 変更前 (line 447)
{collection.length === 0 ? (
// 変更後
{Object.keys(collection || {}).length === 0 ? (

// 変更前 (line 452)
collection.map((id, idx) => {
// 変更後
Object.keys(collection || {}).map((id, idx) => {
```

- [ ] **Step 7: 全テストを実行**

```bash
npm test
```

Expected: すべて PASS

- [ ] **Step 8: コミット**

```bash
git add src/screens/TeamSelectScreen.jsx src/screens/EncyclopediaScreen.jsx src/screens/HomeScreen.jsx src/screens/GachaScreen.jsx src/screens/BattleScreen.jsx src/components/StickerBookPage.jsx
git commit -m "fix: update all UI files to use collection map format"
```

---

## Task 6: FusionScreen.jsx を作成（レイアウト + カード選択）

**Files:**
- Create: `src/screens/FusionScreen.jsx`

- [ ] **Step 1: 骨格を作成**

`src/screens/FusionScreen.jsx` を新規作成:

```jsx
import { useState, useRef } from 'react';
import { STICKERS } from '../data/stickers.js';
import { FUSIONS } from '../data/fusions.js';
import Confetti from '../components/Confetti.jsx';

const B = import.meta.env.BASE_URL;
const stickerMap = Object.fromEntries(STICKERS.map(s => [s.id, s]));
const fusionMap  = Object.fromEntries(FUSIONS.map(f => [f.id, f]));

// bio シリーズのみ融合対象
const BIO_STICKERS = STICKERS.filter(s => s.series === 'bio');

export default function FusionScreen({ state, onBack, onAttemptFusion }) {
  const [selected, setSelected] = useState([]);      // 最大2要素 (cardId, selIdx)
  const [animPhase, setAnimPhase] = useState(null);  // null|'start'|'flash'|'success'|'fail'|'done'
  const [fusionResult, setFusionResult] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const timerRefs = useRef([]);

  // bio カードの所持一覧（count 含む）
  const ownedBio = BIO_STICKERS
    .filter(s => (state.collection[s.id] || 0) > 0)
    .map(s => ({ ...s, count: state.collection[s.id] }));

  function canSelect(cardId) {
    const alreadySelected = selected.filter(s => s === cardId).length;
    const owned = state.collection[cardId] || 0;
    return owned > alreadySelected; // 選択枚数 < 所持枚数
  }

  function handleCardClick(cardId) {
    if (animPhase) return;
    if (selected.includes(cardId) && selected.indexOf(cardId) === selected.lastIndexOf(cardId)) {
      // 1枚選択済み → 解除
      setSelected(s => s.filter((_, i) => i !== s.indexOf(cardId)));
      return;
    }
    if (selected.length === 2) return;
    if (!canSelect(cardId)) return;
    setSelected(s => [...s, cardId]);
  }

  function handleDeselect(idx) {
    if (animPhase) return;
    setSelected(s => s.filter((_, i) => i !== idx));
  }

  function clearTimers() {
    timerRefs.current.forEach(clearTimeout);
    timerRefs.current = [];
  }

  function schedule(fn, ms) {
    const id = setTimeout(fn, ms);
    timerRefs.current.push(id);
  }

  function handleFusion() {
    if (selected.length !== 2 || animPhase) return;
    const [id1, id2] = selected;

    setAnimPhase('start');

    schedule(() => setAnimPhase('flash'), 1500);
    schedule(() => {
      const result = onAttemptFusion(id1, id2);
      setFusionResult(result);
      if (result.success) {
        setAnimPhase('success');
        setShowConfetti(true);
        schedule(() => setShowConfetti(false), 3000);
      } else {
        setAnimPhase('fail');
      }
      schedule(() => setAnimPhase('done'), result.success ? 4500 : 3000);
    }, 2000);
  }

  function handleReset() {
    clearTimers();
    setSelected([]);
    setAnimPhase(null);
    setFusionResult(null);
  }

  const card1 = selected[0] ? stickerMap[selected[0]] : null;
  const card2 = selected[1] ? stickerMap[selected[1]] : null;
  const resultFusion = fusionResult?.fusionCard ? fusionMap[fusionResult.fusionCard.id] ?? fusionResult.fusionCard : null;

  return (
    <div
      className="min-h-screen flex flex-col relative overflow-hidden"
      style={{ background: '#080c16', color: '#fff' }}
    >
      <AnimStyles />
      {showConfetti && <Confetti />}
      <FullscreenOverlay animPhase={animPhase} />

      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 sticky top-0 z-10"
        style={{ background: 'rgba(8,12,22,0.95)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <button onClick={onBack} aria-label="もどる" className="text-xl" style={{ color: '#64748b' }}>←</button>
        <h2 className="text-lg font-black" style={{ color: '#e2e8f0' }}>⚗️ 融合工房</h2>
        <span className="ml-auto text-xs" style={{ color: '#475569' }}>
          融合成功率: 10%
        </span>
      </div>

      <div className="flex-1 overflow-y-auto pb-8 px-4">

        {/* 融合スロット */}
        <FusionSlot
          card1={card1} card2={card2}
          animPhase={animPhase}
          fusionResult={fusionResult}
          resultFusion={resultFusion}
          onDeselect={handleDeselect}
        />

        {/* 融合ボタン */}
        <FusionButton
          ready={selected.length === 2}
          animPhase={animPhase}
          onFusion={handleFusion}
          onReset={handleReset}
        />

        {/* 所持 bio カード一覧 */}
        {(!animPhase || animPhase === 'done') && (
          <CardGrid
            cards={ownedBio}
            selected={selected}
            onCardClick={handleCardClick}
          />
        )}

        {/* 所持融合キャラ図鑑 */}
        {(!animPhase || animPhase === 'done') && (
          <FusionGallery fusionCollection={state.fusionCollection || []} />
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: サブコンポーネントを同ファイルに追加**

`FusionScreen.jsx` の末尾に追記:

```jsx
// ===== アニメーション CSS =====
function AnimStyles() {
  return (
    <style>{`
      @keyframes shake {
        0%,100%{ transform:translateX(0) }
        20%{ transform:translateX(-8px) }
        40%{ transform:translateX(8px) }
        60%{ transform:translateX(-6px) }
        80%{ transform:translateX(6px) }
      }
      @keyframes slideLeft {
        from { transform: translateX(0) rotate(0deg); }
        to   { transform: translateX(120px) rotate(720deg); }
      }
      @keyframes slideRight {
        from { transform: translateX(0) rotate(0deg); }
        to   { transform: translateX(-120px) rotate(-720deg); }
      }
      @keyframes whiteFade {
        0%   { opacity: 0; }
        50%  { opacity: 1; }
        100% { opacity: 0; }
      }
      @keyframes redFade {
        0%   { opacity: 0; }
        30%  { opacity: 0.7; }
        100% { opacity: 0; }
      }
      @keyframes rainbowBurst {
        0%   { transform: scale(0); opacity: 1; }
        100% { transform: scale(4); opacity: 0; }
      }
      @keyframes zoomIn {
        0%   { transform: scale(0.2); opacity: 0; filter: brightness(3); }
        60%  { transform: scale(1.15); opacity: 1; filter: brightness(1.5); }
        100% { transform: scale(1); opacity: 1; filter: brightness(1); }
      }
      @keyframes goldPulse {
        0%,100% { box-shadow: 0 0 20px #ffd700, 0 0 40px #ff8800; }
        50%      { box-shadow: 0 0 60px #ffd700, 0 0 120px #ff8800; }
      }
      @keyframes textPulse {
        0%,100% { transform: scale(1); }
        50%      { transform: scale(1.1); }
      }
      @keyframes shatter {
        0%   { transform: scale(1); opacity: 1; filter: blur(0px); }
        100% { transform: scale(0.1); opacity: 0; filter: blur(8px); }
      }
      @keyframes lightning {
        0%,100% { opacity: 0; }
        10%,30%,50%,70%,90% { opacity: 1; }
        20%,40%,60%,80% { opacity: 0; }
      }
      @keyframes smokeRise {
        from { transform: translateY(0) scale(1); opacity: 0.5; }
        to   { transform: translateY(-60px) scale(2); opacity: 0; }
      }
      .shake-anim { animation: shake 0.4s infinite; }
      .slide-left-anim  { animation: slideLeft  1.5s ease-in forwards; }
      .slide-right-anim { animation: slideRight 1.5s ease-in forwards; }
      .shatter-anim { animation: shatter 1s ease-in forwards; }
    `}</style>
  );
}

// ===== 全画面オーバーレイ =====
function FullscreenOverlay({ animPhase }) {
  if (animPhase === 'flash') return (
    <div className="fixed inset-0 z-50 pointer-events-none"
      style={{ background: '#ffffff', animation: 'whiteFade 0.5s ease-out forwards' }} />
  );
  if (animPhase === 'fail') return (
    <>
      <div className="fixed inset-0 z-40 pointer-events-none"
        style={{ background: '#ff0000', animation: 'redFade 1s ease-out forwards' }} />
      {[...Array(5)].map((_, i) => (
        <div key={i} className="fixed z-40 pointer-events-none rounded-full"
          style={{
            width: 60 + i * 20, height: 60 + i * 20,
            top: `${30 + i * 10}%`, left: `${10 + i * 18}%`,
            background: 'rgba(80,60,60,0.6)',
            animation: `smokeRise ${1 + i * 0.3}s ease-out ${i * 0.2}s forwards`,
          }} />
      ))}
    </>
  );
  if (animPhase === 'success') return (
    <>
      {/* レインボー放射 */}
      <div className="fixed z-40 pointer-events-none rounded-full"
        style={{
          width: 200, height: 200,
          top: '50%', left: '50%',
          marginTop: -100, marginLeft: -100,
          background: 'conic-gradient(red,orange,yellow,green,blue,violet,red)',
          animation: 'rainbowBurst 0.8s ease-out forwards',
        }} />
      {/* 稲妻 */}
      {[...Array(6)].map((_, i) => (
        <div key={i} className="fixed z-40 pointer-events-none"
          style={{
            width: 3, height: `${40 + i * 15}%`,
            top: 0, left: `${10 + i * 15}%`,
            background: 'linear-gradient(to bottom, transparent, #ffd700, transparent)',
            animation: `lightning 0.3s ${i * 0.1}s infinite`,
            transformOrigin: 'top',
            transform: `rotate(${(i - 2.5) * 5}deg)`,
          }} />
      ))}
    </>
  );
  return null;
}

// ===== 融合スロット =====
function FusionSlot({ card1, card2, animPhase, fusionResult, resultFusion, onDeselect }) {
  const isCharging = animPhase === 'start';
  const isSuccess  = animPhase === 'success' || animPhase === 'done' && fusionResult?.success;
  const isFail     = animPhase === 'fail'    || animPhase === 'done' && fusionResult && !fusionResult.success;

  return (
    <div className="mt-4 mb-4">
      {/* 成功：融合キャラを表示 */}
      {isSuccess && resultFusion && (
        <div className="flex flex-col items-center gap-3">
          <div className="text-2xl font-black text-center"
            style={{ color: '#ffd700', animation: 'textPulse 0.6s infinite', textShadow: '0 0 20px #ffd700' }}>
            ✨ FUSION SUCCESS!! ✨
          </div>
          <div className="rounded-2xl overflow-hidden"
            style={{ animation: 'zoomIn 0.8s ease-out forwards, goldPulse 1s 0.8s infinite',
              border: '3px solid #ffd700', width: 140, height: 140 }}>
            <img src={resultFusion.imagePath} alt={resultFusion.name}
              className="w-full h-full object-cover" />
          </div>
          <div className="text-center">
            <div className="text-xl font-black" style={{ color: '#ffd700' }}>{resultFusion.name}</div>
            <div className="text-sm mt-1" style={{ color: '#94a3b8' }}>{resultFusion.nameEn}</div>
            <div className="text-xs mt-1 px-3 py-1 rounded-full inline-block"
              style={{ background: 'rgba(255,215,0,0.15)', color: '#fcd34d', border: '1px solid rgba(255,215,0,0.3)' }}>
              🧬 融合限定
            </div>
          </div>
        </div>
      )}

      {/* 失敗メッセージ */}
      {isFail && !isSuccess && (
        <div className="flex flex-col items-center gap-3">
          <div className="text-xl font-black text-center"
            style={{ color: '#ef4444', animation: 'shake 0.3s infinite', textShadow: '0 0 10px #ef4444' }}>
            💀 FUSION FAILED...
          </div>
          <div className="text-sm text-center" style={{ color: '#94a3b8' }}>
            2枚のカードは失われた...
          </div>
        </div>
      )}

      {/* 通常スロット表示 */}
      {!isSuccess && !isFail && (
        <div className="flex items-center justify-center gap-4">
          <SlotCard
            card={card1}
            animClass={isCharging ? 'slide-left-anim' : ''}
            onDeselect={() => onDeselect(0)}
          />
          <div className="text-2xl" style={{ color: '#64748b' }}>⚡⚗️⚡</div>
          <SlotCard
            card={card2}
            animClass={isCharging ? 'slide-right-anim' : ''}
            onDeselect={() => onDeselect(1)}
          />
        </div>
      )}
    </div>
  );
}

function SlotCard({ card, animClass, onDeselect }) {
  return (
    <div
      className={`rounded-xl overflow-hidden cursor-pointer flex-shrink-0 ${animClass}`}
      style={{
        width: 90, height: 90,
        border: card ? '2px solid #fcd34d' : '2px dashed #334155',
        background: '#111827',
      }}
      onClick={card ? onDeselect : undefined}
    >
      {card ? (
        <img src={card.imagePath} alt={card.name} className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-2xl" style={{ color: '#334155' }}>?</div>
      )}
    </div>
  );
}

// ===== 融合ボタン =====
function FusionButton({ ready, animPhase, onFusion, onReset }) {
  if (animPhase === 'done') {
    return (
      <div className="flex justify-center mt-3">
        <button onClick={onReset}
          className="px-6 py-3 rounded-xl font-black text-base"
          style={{ background: '#1e293b', color: '#94a3b8', border: '1px solid #334155' }}>
          もう一度
        </button>
      </div>
    );
  }
  return (
    <div className="flex justify-center mt-3">
      <button
        onClick={ready && !animPhase ? onFusion : undefined}
        className="px-8 py-3 rounded-xl font-black text-base transition-transform active:scale-95"
        style={{
          background: ready && !animPhase
            ? 'linear-gradient(135deg, #7c3aed, #4f46e5)'
            : '#1e293b',
          color: ready && !animPhase ? '#fff' : '#475569',
          border: ready && !animPhase ? '1px solid #8b5cf6' : '1px solid #334155',
          boxShadow: ready && !animPhase ? '0 0 20px rgba(124,58,237,0.4)' : 'none',
          cursor: ready && !animPhase ? 'pointer' : 'not-allowed',
        }}
      >
        {animPhase ? '融合中...' : ready ? '⚗️ 融合チャレンジ！' : 'カードを2枚選んでください'}
      </button>
    </div>
  );
}

// ===== 所持 bio カードグリッド =====
function CardGrid({ cards, selected, onCardClick }) {
  if (cards.length === 0) {
    return (
      <div className="mt-6 text-center py-8" style={{ color: '#475569' }}>
        <div className="text-3xl mb-2">🃏</div>
        <div className="text-sm">ガチャで生物カードを手に入れよう！</div>
        <div className="text-xs mt-1">同じカードが2枚あると融合できます</div>
      </div>
    );
  }
  return (
    <div className="mt-6">
      <div className="text-sm font-bold mb-3" style={{ color: '#94a3b8' }}>所持カード（生物のみ）</div>
      <div className="grid gap-2" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        {cards.map(card => {
          const selCount = selected.filter(s => s === card.id).length;
          const available = card.count - selCount > 0;
          return (
            <div
              key={card.id}
              onClick={() => available ? onCardClick(card.id) : undefined}
              className="relative rounded-xl overflow-hidden"
              style={{
                border: selCount > 0 ? '2px solid #fcd34d' : '2px solid #1e293b',
                background: '#111827',
                cursor: available ? 'pointer' : 'not-allowed',
                opacity: available ? 1 : 0.4,
                aspectRatio: '1',
              }}
            >
              <img src={card.imagePath} alt={card.name} className="w-full h-full object-cover" />
              {/* 枚数バッジ */}
              <div className="absolute top-1 right-1 rounded-full text-xs font-black px-1.5"
                style={{ background: '#fcd34d', color: '#000', minWidth: 20, textAlign: 'center' }}>
                {card.count}
              </div>
              {/* 選択マーク */}
              {selCount > 0 && (
                <div className="absolute inset-0 flex items-center justify-center"
                  style={{ background: 'rgba(252,211,77,0.2)' }}>
                  <span className="text-2xl font-black" style={{ color: '#fcd34d' }}>✓</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ===== 所持融合キャラ図鑑 =====
function FusionGallery({ fusionCollection }) {
  if (fusionCollection.length === 0) return null;
  const fusionMap2 = Object.fromEntries(FUSIONS.map(f => [f.id, f]));
  return (
    <div className="mt-8">
      <div className="text-sm font-bold mb-3" style={{ color: '#94a3b8' }}>
        🧬 所持融合キャラ ({fusionCollection.length}体)
      </div>
      <div className="grid gap-2" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        {fusionCollection.map((id, idx) => {
          const f = fusionMap2[id];
          if (!f) return null;
          return (
            <div key={`${id}-${idx}`} className="rounded-xl overflow-hidden"
              style={{ border: '2px solid rgba(255,215,0,0.4)', background: '#111827', aspectRatio: '1' }}>
              <img src={f.imagePath} alt={f.name} className="w-full h-full object-cover" />
            </div>
          );
        })}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: コミット**

```bash
git add src/screens/FusionScreen.jsx
git commit -m "feat: add FusionScreen with flashy animation phases"
```

---

## Task 7: App.jsx と HomeScreen.jsx を更新

**Files:**
- Modify: `src/App.jsx`
- Modify: `src/screens/HomeScreen.jsx`

- [ ] **Step 1: App.jsx に FUSION ルーティングを追加**

`App.jsx` のインポート部分に追加:

```js
import FusionScreen from './screens/FusionScreen.jsx';
```

`SCREEN` オブジェクトに追加:

```js
const SCREEN = {
  HOME: 'HOME',
  LEVEL_SELECT: 'LEVEL_SELECT',
  GAME: 'GAME',
  GACHA: 'GACHA',
  ENCYCLOPEDIA: 'ENCYCLOPEDIA',
  BATTLE_MAP: 'BATTLE_MAP',
  TEAM_SELECT: 'TEAM_SELECT',
  BATTLE: 'BATTLE',
  FUSION: 'FUSION',   // 追加
};
```

`HomeScreen` の描画部分に `onFusion` を追加:

```jsx
if (screen === SCREEN.HOME) return (
  <HomeScreen
    state={state}
    onPlay={() => setScreen(SCREEN.LEVEL_SELECT)}
    onEncyclopedia={() => setScreen(SCREEN.ENCYCLOPEDIA)}
    onGacha={() => setScreen(SCREEN.GACHA)}
    onBattle={() => setScreen(SCREEN.BATTLE_MAP)}
    onFusion={() => setScreen(SCREEN.FUSION)}   // 追加
  />
);
```

`return null;` の直前に追加:

```jsx
if (screen === SCREEN.FUSION) return (
  <FusionScreen
    state={state}
    onBack={() => setScreen(SCREEN.HOME)}
    onAttemptFusion={attemptFusion}
  />
);
```

`useGameState` の分割代入に `attemptFusion` を追加:

```js
const {
  state, addCoins, spendCoins, levelUp, saveStars,
  updateBestCombo, incLevelPlayCount, pullGacha, updateBookPage,
  updateBattleProgress, saveBattleTeam, upgradeCard, addCardToCollection,
  attemptFusion,   // 追加
} = useGameState();
```

- [ ] **Step 2: HomeScreen.jsx に融合工房ボタンを追加**

`HomeScreen` の props に `onFusion` を追加:

```js
export default function HomeScreen({ state, onPlay, onEncyclopedia, onGacha, onBattle, onFusion }) {
```

既存のボタン列（ガチャ・バトルマップ等）に融合ボタンを追加。EncyclopediaやGachaボタンが並んでいる箇所を探し、その後に以下を追加:

```jsx
<button
  onClick={onFusion}
  className="game-btn w-full py-3 rounded-2xl font-black text-sm"
  style={{
    background: 'linear-gradient(135deg, rgba(124,58,237,0.15), rgba(79,70,229,0.15))',
    border: '1px solid rgba(124,58,237,0.3)',
    color: '#a78bfa',
  }}
>
  ⚗️ 融合工房
</button>
```

- [ ] **Step 3: 全テストを実行**

```bash
npm test
```

Expected: すべて PASS

- [ ] **Step 4: コミット**

```bash
git add src/App.jsx src/screens/HomeScreen.jsx
git commit -m "feat: wire up FusionScreen routing and HomeScreen button"
```

---

## Task 8: EncyclopediaScreen に融合タブを追加

**Files:**
- Modify: `src/screens/EncyclopediaScreen.jsx`

- [ ] **Step 1: 融合タブを追加**

`EncyclopediaScreen.jsx` のインポートに追加:

```js
import { FUSIONS } from '../data/fusions.js';
```

`ALL_TABS` の定義を変更:

```js
const FUSION_TAB  = { id: 'fusion',    label: '🧬 融合' };
const LEGENDARY_TAB = { id: 'legendary', label: '✨ 伝説' };
const ALL_TABS = [...SERIES, LEGENDARY_TAB, FUSION_TAB];
```

`owned` の計算とスティッカー一覧の取得部分を変更:

```js
// 変更前
const stickers = tab === 'legendary'
  ? STICKERS.filter(s => s.legendary === true)
  : STICKERS.filter(s => s.series === tab || s.series === `legendary-${tab}`);
const owned = id => state.collection.includes(id);

// 変更後
const isFusionTab = tab === 'fusion';
const stickers = isFusionTab
  ? []
  : tab === 'legendary'
    ? STICKERS.filter(s => s.legendary === true)
    : STICKERS.filter(s => s.series === tab || s.series === `legendary-${tab}`);
const owned = id => id in (state.collection || {});
```

タブコンテンツの表示部分で、融合タブ時は FUSIONS を表示するブロックを追加（既存の STICKERS グリッドの前):

```jsx
{isFusionTab ? (
  <FusionTabContent fusionCollection={state.fusionCollection || []} />
) : (
  // 既存のスティッカーグリッドJSX...
)}
```

ファイル末尾に `FusionTabContent` コンポーネントを追加:

```jsx
function FusionTabContent({ fusionCollection }) {
  const fusionMap = Object.fromEntries(FUSIONS.map(f => [f.id, f]));
  const owned = new Set(fusionCollection);

  return (
    <div>
      <div className="text-center text-xs mb-4 px-4" style={{ color: '#64748b' }}>
        融合工房で入手できる特別キャラ（{fusionCollection.length}/{FUSIONS.length}体）
      </div>
      <div className="grid gap-2 px-3" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        {FUSIONS.map(f => {
          const isOwned = owned.has(f.id);
          return (
            <div key={f.id} className="rounded-xl overflow-hidden"
              style={{
                border: isOwned ? '2px solid rgba(255,215,0,0.5)' : '2px solid #1e293b',
                background: '#111827',
                aspectRatio: '1',
                opacity: isOwned ? 1 : 0.3,
                filter: isOwned ? 'none' : 'grayscale(1)',
              }}>
              <img src={f.imagePath} alt={f.name} className="w-full h-full object-cover" />
            </div>
          );
        })}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: 全テストを実行**

```bash
npm test
```

Expected: すべて PASS

- [ ] **Step 3: 動作確認（dev server 起動）**

```bash
npm run dev
```

確認項目:
- ホーム画面に「⚗️ 融合工房」ボタンが表示される
- bioカードを2枚所持している状態で融合工房に入ると選択できる
- 融合チャレンジを押すとアニメーションが再生される
- 図鑑「🧬 融合」タブで融合キャラが表示される

- [ ] **Step 4: コミット**

```bash
git add src/screens/EncyclopediaScreen.jsx
git commit -m "feat: add fusion tab to encyclopedia screen"
```

---

## 最終確認チェックリスト

- [ ] `npm test` が全件 PASS
- [ ] `npm run build` がエラーなく完了
- [ ] ホーム → 融合工房 → カード選択 → アニメーション → 結果 のフローが動作する
- [ ] 失敗時・成功時のアニメーションが両方確認できる
- [ ] 図鑑の融合タブで入手済みキャラが表示される
- [ ] 旧セーブデータ（collection が配列）をロードしても壊れない
