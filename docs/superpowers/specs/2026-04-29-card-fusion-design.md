# カード融合機能 設計書

**日付:** 2026-04-29
**対象プロジェクト:** bio-battle-stadium

---

## 概要

同ランク（common）のカード2枚を消費して、ガチャ非排出の「融合限定キャラ」へのチャレンジができる新機能。成功率10%、失敗時はカード2枚消滅のハイリスク設計。

---

## データ設計

### 1. コレクション構造変更（アプローチB）

```js
// 変更前
collection: ['c01', 'c02', 'c01']

// 変更後
collection: { 'c01': 2, 'c02': 1 }   // カードID → 所持枚数マップ
fusionCollection: ['wolphin']         // 融合キャラIDの配列
```

**移行処理:** `useGameState` 初期化時に `Array.isArray(collection)` を検出したら自動変換する。変換後は `collection` が配列の各IDを `{ id: 1 }` に変換する。

### 2. 新ファイル `src/data/fusions.js`

24体の融合限定キャラを定義する。

```js
export const FUSIONS = [
  { id: 'wolphin',       name: 'ウルフィン',       nameEn: 'Wolphin',
    imagePath: '/assets/gacha/fusion/wolphin.png',       series: 'fusion' },
  { id: 'gryphther',     name: 'グリフサー',       nameEn: 'Gryphther',
    imagePath: '/assets/gacha/fusion/gryphther.png',     series: 'fusion' },
  // ... 24体すべて
];
```

**全24体:**
wolphin, gryphther, polarplatypus, elephantula, sharkhorse, rhinoeagle, lionfisher, goatcepus,
ursashark, eagledeer, tigtopus, equadragon, lapinsect, bullshark, pengseal, serpeagle,
rhinomastodon, aerolion, cetashark, octowolf, girratortoise, crocow, zebraelk, ursuporcine

### 3. `battleEngine.js` に fusion シリーズを追加

commonカード（fallback: bio系）の1.3倍。

```js
fusion: { hp:[104,169], atk:[59,104], def:[46,91], spd:[72,124] }
```

SP_DMG_MULT に `fusion: 1.8` を追加。
LEVEL_UP_COSTS に `fusion` を追加（bioの1.2倍）。

### 4. `useGameState.js` に追加する状態・メソッド

**DEFAULT_STATE に追加:**
```js
fusionCollection: [],
```

**追加メソッド:**
```js
// cardId1, cardId2 は同じcommonランクのカードID（それぞれ1枚消費）
attemptFusion(cardId1, cardId2)
// → collection から各カードを1枚ずつ減らす（0になればキーを削除）
// → Math.random() < 0.1 なら成功: FUSIONS からランダムに1体を fusionCollection に追加
// → 成功/失敗を返す: { success: boolean, fusionCard?: FusionCard }
```

**変更が必要な既存メソッド:**
- `pullGacha`: `collection[id] = (collection[id] || 0) + 1` 形式に更新
- `addCardToCollection`: 同上
- `upgradeCard`: `cardLevels` のキー存在チェックを `collection` マップに合わせる

---

## 画面設計

### 新画面: `src/screens/FusionScreen.jsx`

#### レイアウト（縦スクロール）

```
[←戻る]         ⚗️ 融合工房

[所持commonカード一覧 - グリッド]
 各カードに所持枚数バッジ表示
 1枚以上所持しているカードは選択可能（同じカードを2枚選ぶには2枚以上の所持が必要）
 選択済みは金枠ハイライト

[融合スロット]
 [カードA] ⚡→⚗️→⚡ [カードB]
 ↑2枚選択後に表示

[融合チャレンジ！ボタン]
 2枚未選択時はグレーアウト

[融合キャラ図鑑（所持済みのみ）]
```

#### アニメーション詳細（ド派手仕様）

**チャレンジボタン押下後のフェーズ:**

| フェーズ | 時間 | 内容 |
|---------|------|------|
| 1. チャージ | 0〜1.5s | カード2枚が中央に向かって高速スライド＋回転。画面全体がシェイク |
| 2. 衝突フラッシュ | 1.5〜2.0s | 中央で激突→全画面ホワイトアウト（opacity 0→1→0） |
| 3-A. 成功演出 | 2.0〜4.5s | レインボー放射爆発 → Confettiコンフェッティ → 融合キャラがズームイン（ゴールドグロウ） → 「FUSION SUCCESS!! ✨」テキストパルス、稲妻・光柱エフェクト |
| 3-B. 失敗演出 | 2.0〜3.5s | 全画面レッドフラッシュ → カード2枚が縮小＋砕け散り → 「FUSION FAILED...」テキストがシェイク → CSS blurの煙エフェクト |

**実装方法:**
- CSS `@keyframes` + `animation` で各フェーズを順次発火
- `useState` で `phase: 'idle' | 'charging' | 'flash' | 'success' | 'fail'` を管理
- 既存の `Confetti.jsx` を成功時に流用
- `setTimeout` チェーンでフェーズ遷移

### HomeScreen.jsx の変更

既存ボタン列（ガチャ・バトル）に「⚗️ 融合工房」ボタンを追加。

### EncyclopediaScreen.jsx の変更

図鑑に「融合限定」タブを追加し、`fusionCollection` に入っているキャラを表示。

---

## App.jsx の変更

```js
const SCREEN = {
  // 既存...
  FUSION: 'FUSION',  // 追加
};
```

`FusionScreen` の import と描画ロジックを追加。
`HomeScreen` の `onFusion` プロップを追加。

---

## 実装ファイル一覧

| ファイル | 変更種別 | 内容 |
|---------|---------|------|
| `src/data/fusions.js` | 新規作成 | 24体の融合キャラデータ |
| `src/screens/FusionScreen.jsx` | 新規作成 | 融合工房UI |
| `src/utils/battleEngine.js` | 変更 | fusionシリーズ統計を追加 |
| `src/hooks/useGameState.js` | 変更 | collection構造変更・移行処理・attemptFusion追加 |
| `src/App.jsx` | 変更 | FUSION画面追加・ルーティング |
| `src/screens/HomeScreen.jsx` | 変更 | 融合工房ボタン追加 |
| `src/screens/EncyclopediaScreen.jsx` | 変更 | 融合限定タブ追加 |

---

## 制約・仕様まとめ

- 融合できるのは **commonランクのカードのみ**（現時点）。後で他ランクに拡張できる構造にする
- 融合チャレンジには **commonランクのカード2枚**（異なるカードでも可、同じカードでも可）が必要。同じカードを2枚使う場合は2枚以上の所持が必要
- 成功率 **10%**、失敗時は選択した2枚のカードが消滅
- 成功時の結果は **24体の融合キャラからランダム**（固定の組み合わせなし）
- 融合キャラの強さは commonカードの **1.3倍**（fusionシリーズとして定義）
- 融合キャラは **ガチャでは排出しない**
- 融合キャラは **複数体所持可能**（fusionCollectionは配列で重複を許す）
- 融合キャラ同士の融合は **不可**
