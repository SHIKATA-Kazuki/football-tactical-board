# リファクタリング メモ

## ファイル名の変更

| 変更前 | 変更後 | 理由 |
|---|---|---|
| `formations_new.js` | `formations.js` | `_new` サフィックスは命名規則として不適切 |

import 側（`main.js` / `ui-events.js`）のパスもあわせて更新済み。

---

## 各ファイルの変更点

### config.js

- **選手名簿の重複排除**  
  `KOBE_MEMBERS25` / `KOBE_MEMBERS23` は `KOBE_MEMBERS24` との差分だけ `...spread` で記述。
  `ANTLERS_MEMBERS` を定数として切り出し（元コードはオブジェクトリテラル直書き）。

- **チーム定義の整理**  
  元コードは `japan` が中ほどに埋もれていた。  
  「デフォルト → 日本代表 → 神戸系 → その他 J リーグ」の順にグループ化。

- **JSDoc 追加**  
  `UniformDef` / `ChipDef` / `AwayDef` / `TeamDef` 型を定義。

- **後方互換レイヤー**  
  `buildUniformEntry` の引数から `name` を削除（不要だったため）。  
  ロジックは変更なし。

---

### formations.js（旧 formations_new.js）

- **座標定義を関数に分離**  
  `DF` / `FW` / `sb` / `wb` に依存する座標を `buildCoordinates(DF, FW, sb, wb)` として切り出し。  
  `formations()` がその都度生成するため、グローバルなオブジェクトリテラルを廃止。

- **フォーメーションのグループ化**  
  コメントで「4 バック系 / 3 バック系 / ハイプレス / ブロック / 日本代表専用」に整理。

- **`getFormationName` のネスト削減**  
  4 段ネストを論理演算子で 1 行ずつに整理（同じ判定ロジックを維持）。

- **`formationSliderMap` のグループコメント追加**  
  主要 8・派生・ハイプレス・ブロックの 4 グループに分類。

---

### players.js

- **`applyTacticalAdjustments` のリファクタリング**  
  `isOpponent` が `true` の場合は即 return（相手チームに補正不要）。  
  「ウィングを調整すべき選手か」を `wingShouldAdjust` 変数に切り出し、条件式を読みやすく整理。

- **`readPlayersFromForm` を `Array.from` に統一**  
  `for` ループを `Array.from({ length: 11 }, ...)` に書き換え。

- **コメントの整理**  
  `manualPositions` の `if (false)` ブロック（無効化されたコード）を削除。  
  ドラッグ処理の意図を JSDoc で説明。

---

### ui-events.js

- **`readTacticalSliders()` ヘルパーを抽出**  
  `lineSlider` / `sidbackUpDown` / `compressStick` の読み取りが `initializeFormationButtons` / `redrawAllPlayers` / `redrawAllPlayers_if_team_changed` の 3 箇所で重複していた。  
  共通処理を 1 つの関数にまとめた。

- **`import` パスを `formations.js` に更新**  
  （旧 `formations_new.js` から変更）

- **不要な `isAwayReady()` を削除**  
  定義はあったが呼び出し箇所がなかったため削除。

---

### team-colors.js

- **`applyUniformToPlayer()` を抽出**  
  SVG / グラデーション / テキストシャドウの適用ロジックを独立した関数に分離。

- **`applyUniform()` の可読性向上**  
  チップ・選手・ボタンの各処理ブロックにコメントを追加。  
  `document.querySelector` の重複呼び出しを変数化。

---

### formation-flick-ui.js

- **ビルド関数の分割**  
  `buildFlickUI` から `buildHiddenButtons()` / `buildPreviewCell()` / `buildKeyCell()` を分離。  
  それぞれ独立してテスト・読解できる単位に。

- **定数の命名変更**  
  `DIRS` → `ALL_DIRS`（スコープが明確になるよう）  
  `THRESHOLD` → `FLICK_THRESHOLD`（定数の意味を明示）

- **JSDoc 追加**  
  `FlickDir` / `FlickFormation` / `FlickKey` 型を定義。

- **`onStart` / `onMove` / `onEnd` の変数整理**  
  `startX` / `startY` の宣言を `let` に統一し、`const` との使い分けを明確化。

---

### main.js

- **初期化順序のコメントを詳述**  
  依存関係がある呼び出し順をファイル冒頭に明示。

- **冗長な中間変数を削除**  
  実質的な処理の変更なし。

---

## 変更していないもの

- 動作ロジック（座標計算・イベント処理・DOM 操作）はすべて変更なし。
- `index.html` は変更なし（`formations_new.js` の import パスは HTML 側に存在しないため不要）。
- CSS / SVG / ユニフォーム画像は対象外。
