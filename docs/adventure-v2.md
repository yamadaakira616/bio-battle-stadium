# Adventure Update 2.0

2026-09-28にローカル実装・確認。公開・プッシュは未実施。

ホームを冒険基地に刷新し、そろばん道場、暗算トレーニング、5と10の補数練習、復習、3エリアのクエスト、デイリーミッション、成長記録を追加しました。既存のカード・合成・バトル・50レベルのフラッシュ暗算を維持しています。

## 開発

```sh
npm run dev -- --host 127.0.0.1 --port 5173
npm test
npm run build
```

URL: http://127.0.0.1:5173/bio-battle-stadium/

## 構成

- `src/components/AdventureShell.jsx`：共有メニューとヘッダー
- `src/screens/AdventureHome.jsx`：新ホーム
- `src/components/Soroban.jsx`：操作可能な4けたのそろばん
- `src/screens/LearningScreen.jsx`：練習設定・問題・解説・結果
- `src/screens/QuestScreen.jsx`：段階解放の冒険マップ
- `src/screens/RecordsScreen.jsx`：端末内の学習記録
- `src/utils/learning.js`：出題・解説・記録・報酬の純粋関数
- `src/adventure.css`：新画面の共通スタイル
- `public/assets/adventure/`：生成した密林・海底神殿・火山の画像3枚

保存キー `sticker-book-v1` は変更せず、`learning` と `soundEnabled` を追加します。完了した回だけ記録し、セッションIDと日付別ミッションIDで重複報酬を防ぎます。復習は50問、セッション履歴は200件を保存します。既存のフラッシュ暗算のコイン処理はそのままに、`legacyReward` で新機能側の追加加算を止めています。

確認：38テスト・本番ビルド・差分チェック成功。ブラウザーでクエスト完了、カード報酬、日次報酬、再読み込み、珠の操作、復習完了、図鑑を確認。390px / 1280pxで横はみ出しなし。

注意：端末間の同期はありません。旧バージョンの学習正答率は推定せず、新規セッションのみ集計します。公開は事前確認後に行ってください。

## 2.1：ログインと初クリアの記録（2026-09-28）

`attendance.days` に訪問日、`attendance.claims` に日付別報酬を保存します。1日1回、50/60/70/80/100/120/200コインを順番に受け取れます。累計・連続・最長日数と月別カレンダーを追加しました。

`levelFirstClears` と `learning.questFirstClears` に初クリア日を保存し、更新しません。過去のクリアで日付不明の場合は null のまま表示します。セッション履歴にも level/difficulty/zoneId を追加します。端末の現地日付で日付変更・再フォーカスを検出します。

49テストとビルド成功。受取・再読み込み・カレンダー表示・390pxのボーナス表示をブラウザーで確認。接続不安定のため実ゲームの初クリア完走とモバイル記録画面の最終操作は未確認（保存・表示の自動テストは成功）。未公開です。
