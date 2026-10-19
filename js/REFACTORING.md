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

---

## デバッグ（バグ修正）

| # | 症状 | 原因 | 修正ファイル |
|---|---|---|---|
| 1 | 「番号反映」で入力した番号が 1〜11 に戻り、フィールドにも反映されない | `renewSquad(…, null, …)` が入力欄をデフォルト番号で作り直していた／再描画していなかった | main.js, ui-events.js |
| 2 | アウェイ側のボタンを押すとページがリロードされる | `querySelector('form')` で最初のフォームにしか submit を登録していなかった | main.js |
| 3 | フリックで 4213・433・jp 系などを選んでも、スライダーやジョイスティックに触ると 8 種のどれかに戻る | `redrawAllPlayers` が毎回スライダーからフォーメーション名を再計算していた | ui-events.js |
| 4 | スライダーを触るとボタンのアクティブ表示が消える | `updateFormationButtons()` を引数なしで呼んでいた | main.js, ui-events.js |
| 5 | ドラッグした選手が、スライダー操作で元の位置に戻る | `manualPositions` に記録だけして使っていなかった | players.js |
| 6 | チーム変更・フォーメーション選択後、ドロワー(SP)のスライダー表示がずれる | PC 側スライダーだけ書き換えていた | ui-events.js |
| 7 | スマホ表示で #field の margin / 角丸などの指定が効かない | `@media` 内の `};` の余分な `;` で直後の `#field {}` ルールが丸ごと無効化 | field.css |
| 8 | 343◇ キーの 451 が選べない | `dir: 'bottom'` が重複（right の誤り） | formation-flick-ui.js |
| 9 | フリック中央のフォーメーション名ラベルが出ない | `previewLabel` が DOM に追加されていなかった | formation-flick-ui.js |
| 10 | touchcancel 時にポップアップが残る | ハンドラ未登録 | formation-flick-ui.js |
| 11 | チーム変更直後は番号を打っても横の名前が更新されない | `createInputs` に input リスナーがなかった | ui-events.js |
| 12 | アウェイのチーム変更時だけホームの戦術スライダーが効いてしまう | 再描画関数がホーム用の値を流用していた | ui-events.js |

その他: 選手番号の描画を `innerHTML` から `textContent` に変更、長押し判定を 8px の手ぶれ許容つき Pointer Events に統一、`pointercancel` でドラッグ状態を解除。
アウェイ側ボタンのラベルは「リセット」→「番号反映」に変更（index.html）。

---

## 追加機能

フィールドの横（スマホではフィールドの下）に道具レールを追加した。

| 機能 | 使い方 | 主なファイル |
|---|---|---|
| 矢印・ゾーン描画 | 「パス」（実線）「ラン」（破線）「ドリブル」（波線）「ゾーン」を選んでフィールド上をドラッグ。「消す」で個別削除、「全消去」で全部削除。色は 4 色。Esc で「動かす」に戻る | drawing.js |
| ボールと連動 | 「ボール」で表示、ドラッグで移動。「連動」をオンにすると両チームのブロックがボールの位置に合わせてスライドする | ball.js, players.js |
| 距離表示 | 「距離」で、ホームの最終ライン・最前線、縦幅・横幅（105m×68m 換算）、近い 2 人との距離を表示 | analysis.js |
| 局面 | 1〜4 の枠を選んで「保存」。枠を押すと呼び出し（選手が動いて移る）。「再生」で保存した局面を順に再生 | phases.js |
| 元に戻す / やり直す | ボタン、または Ctrl/⌘+Z、Ctrl/⌘+Shift+Z（Ctrl+Y）。チーム変更も含めて最大 100 手 | history.js, state.js |
| 共有リンク | 「リンク」で盤面ごと URL にしてコピー。開くと同じ盤面が復元される | share.js, state.js |
| 画像保存 | 「画像」でフィールドを PNG で保存 | export-image.js |
| 配置解除 | ドラッグや局面呼び出しで固定した位置を解除してフォーメーションどおりに戻す | ui-events.js |

### 仕組みのメモ

- **state.js** が盤面全体（チーム・背番号・フォーメーション・スライダー・スティック・手動配置・ボール・矢印・局面・表示設定）を 1 つのオブジェクトにまとめる。履歴と共有リンクは同じ仕組みを使う。
- **bus.js** の `commit()` を各操作の確定時に呼ぶと、history.js がスナップショットを積む。スライダーのような連続操作は `commit({ debounce: true })`。
- 共有リンクは `#b=` 以降に、JSON を deflate 圧縮して base64url にしたものを入れる（サーバー保存なし）。
- 画像化は html-to-image を最初に使うときだけ読み込む。jsDelivr が使えない環境では `js/vendor/html-to-image.js` を読む。
- 描画レイヤーは SVG。座標は % で保存し、矢じりが歪まないよう描画時にピクセルへ変換している。
