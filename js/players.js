/**
 * players.js
 *
 * フィールド上の選手 DOM の生成・配置・ドラッグ操作を担う。
 * 戦術スライダー / ジョイスティックの値を読み取って座標を補正する。
 *
 * エクスポート:
 *   wingStick, compressStick — ジョイスティック状態オブジェクト（ui-events.js が直接書き込む）
 *   sliderVal(id)            — スライダー値のヘルパー
 *   resetManualPositions(side)
 *   readPlayersFromForm(formEl)
 *   placePlayers(players, positions, isOpponent, resetManual?)
 *   applyFormation(positions, resetManual?)
 *   onPlayerNodeCreated(callback)  — 新規 .player ノード生成時に呼ばれるフックを登録
 */

// ─── ジョイスティック状態 ────────────────────────────────────────────────────

/** @type {{x:number, y:number}} */
export let wingStick     = { x: 0, y: 0 };

/** @type {{x:number, y:number}} 圧縮スティック（-1〜+1） */
export let compressStick = { x: 0, y: 0 };

// ─── 新規ノード生成フック ────────────────────────────────────────────────────
//
// players.js は team-colors.js（ユニフォーム適用）に依存させたくないため
// （循環 import を避けるため）、コールバック登録方式にしている。
// team-colors.js 側が初期化時に「新規ノードへユニフォームを適用する関数」を
// ここへ登録し、placePlayers が新しい <div class="player"> を作るたびに
// 自動でユニフォームが当たるようにする。

/** @type {((el: HTMLElement, isOpponent: boolean) => void)[]} */
const playerNodeCreatedHooks = [];

/**
 * 新規 .player ノード生成時に呼ばれるコールバックを登録する。
 * @param {(el: HTMLElement, isOpponent: boolean) => void} callback
 */
export function onPlayerNodeCreated(callback) {
  playerNodeCreatedHooks.push(callback);
}

// ─── ユーティリティ ──────────────────────────────────────────────────────────

/** @param {string} id @returns {number} */
export function sliderVal(id) {
  return parseFloat(document.getElementById(id).value);
}

// ─── 戦術補正 ────────────────────────────────────────────────────────────────

/**
 * ウィング幅・圧縮スティックを反映して座標を補正する。
 * 自チーム（isOpponent=false）のみ適用。
 *
 * @param {number}           squadNum  1〜11
 * @param {[number,number]}  pos       フォーメーション由来の [x, y]
 * @param {boolean}          isOpponent
 * @returns {[number,number]}
 */
function applyTacticalAdjustments(squadNum, pos, isOpponent) {
  if (isOpponent) return pos;   // 相手チームは補正しない

  let [x, y] = pos;

  const backsVal  = sliderVal('backsSlider');
  const volante   = sliderVal('volanteSlider');
  const top       = sliderVal('topSlider');

  // ウィング幅補正（特定の選手番号・スライダー条件に合致する場合のみ）
  const wingShouldAdjust =
    (squadNum === 7  && backsVal > 0.5) ||
    (squadNum === 11 && backsVal > 0.5) ||
    (squadNum === 10 && backsVal < 0.5 && volante > 0.5 && top < 0.5) ||
    (squadNum === 11 && backsVal < 0.5 && volante > 0.5 && top < 0.5) ||
    (squadNum === 6  && backsVal < 0.5 && top > 0.5) ||
    (squadNum === 8  && backsVal < 0.5 && top > 0.5) ||
    (squadNum === 2  && backsVal + volante + top < 0.1) ||
    (squadNum === 5  && backsVal + volante + top < 0.1);

  if (wingShouldAdjust) {
    const wingW = wingStick.x * 15;
    const wingH = wingStick.y * 15;
    if ([7, 10, 8, 2].includes(squadNum)) x += wingW;
    if ([11, 6, 5].includes(squadNum))    x -= wingW;
    y -= wingH;
  }

  // 圧縮スティック補正
  const cx = compressStick.x;
  const cy = -compressStick.y;
  if (cx !== 0 || cy !== 0) {
    const COMPRESS_MAX = 30;
    const COMPRESS_Y   = 15;

    const xOffset = cx >= 0
      ? cx * COMPRESS_MAX * (1 - x / 100)
      : cx * COMPRESS_MAX * (x / 100);
    x += xOffset;

    if (squadNum !== 1) {
      const yOffset = cy >= 0
        ? +1.6 * cy * COMPRESS_Y * (1.7 - y / 60)
        : +2.5 * cy * COMPRESS_Y * (y / 100);
      y += yOffset;
    } else {
      y = 98;
    }
  }

  return [x, y];
}

// ─── 手動移動の記憶 ──────────────────────────────────────────────────────────

// ドラッグで動かしたノードの位置を保持する Map
// key: インデックス、value: { left, top }（% 文字列）
const manualPositions = {
  home: new Map(),
  away: new Map(),
};

/** 手動移動フラグをリセット */
export function resetManualPositions(side) {
  manualPositions[side].clear();
}

// ─── ドラッグ操作 ────────────────────────────────────────────────────────────

/**
 * 選手要素にポインタードラッグを付与する。
 * setPointerCapture を利用するためタッチアウト後も追従する。
 *
 * @param {HTMLElement} el
 * @param {'home'|'away'} sideKey
 * @param {number} index
 */
function attachDrag(el, sideKey, index) {
  el.style.cursor      = 'grab';
  el.style.touchAction = 'none';   // スクロール待機をキャンセル

  el.onpointerdown = (e) => {
    e.preventDefault();
    e.stopPropagation();
    el.setPointerCapture(e.pointerId);
    el.style.cursor     = 'grabbing';
    el.style.zIndex     = '100';
    el.style.transition = 'none';

    el.onpointermove = (ev) => {
      const field = document.getElementById('field');
      const rect  = field.getBoundingClientRect();
      const x = Math.min(100, Math.max(0, (ev.clientX - rect.left) / rect.width  * 100));
      const y = Math.min(100, Math.max(0, (ev.clientY - rect.top)  / rect.height * 100));
      el.style.left = `${x}%`;
      el.style.top  = `${y}%`;
      manualPositions[sideKey].set(index, { left: `${x}%`, top: `${y}%` });
    };

    el.onpointerup = () => {
      el.style.cursor     = 'grab';
      el.style.zIndex     = '';
      el.style.transition = '';
      el.onpointermove    = null;
      el.onpointerup      = null;
    };
  };
}

// ─── DOM 管理 ────────────────────────────────────────────────────────────────

let homePlayers = [];
let awayPlayers = [];

// ─── 公開 API ────────────────────────────────────────────────────────────────

/**
 * フォームから選手情報を読み取る。
 * @param {HTMLFormElement} formEl
 * @returns {{number:string, name:string}[]}
 */
export function readPlayersFromForm(formEl) {
  const fd = new FormData(formEl);
  return Array.from({ length: 11 }, (_, i) => ({
    number: fd.get(`number${i + 1}`),
    name:   fd.get(`name${i + 1}`),
  }));
}

// 名前情報は placePlayers の引数 members として受け取る（下記参照）

/**
 * 選手をフィールドに配置する。
 *
 * @param {{number:string, name:string}[]} players
 * @param {[number,number][]}              positions
 * @param {boolean}                        isOpponent  true = アウェイチーム
 * @param {boolean}                        [resetManual=false]
 * @param {Record<number,string>}          [members={}]  背番号→名前の辞書（名前バッジ用）
 */
export function placePlayers(players, positions, isOpponent, resetManual = false, members = {}) {
  const field   = document.getElementById('field');
  const arr     = isOpponent ? awayPlayers : homePlayers;
  const sideKey = isOpponent ? 'away' : 'home';

  if (resetManual) manualPositions[sideKey].clear();

  while (arr.length < players.length) {
    const div = document.createElement('div');
    div.className = isOpponent ? 'player away' : 'player home';
    field.appendChild(div);
    arr.push(div);
  }
  while (arr.length > players.length) {
    arr.pop().remove();
  }

  for (let i = 0; i < players.length; i++) {
    const el = arr[i];
    el.className = isOpponent ? 'player away' : 'player home';

    const [x, y] = applyTacticalAdjustments(i + 1, positions[i], isOpponent);
    el.style.left = `${x}%`;
    el.style.top  = `${y}%`;

    const num = parseInt(players[i].number, 10);
    el.innerHTML = `<strong>${players[i].number}</strong>`;

    // data-name に選手名をセット → CSS ::after で長押し時に表示
    el.dataset.name = members[num] ?? '';

    attachDrag(el, sideKey, i);

    // ユニフォーム（背景・テキストシャドウ・内側リング等）を適用する。
    // el.innerHTML の書き換えで中身は消えるが、style/class は消えないため
    // 既存ノードでも毎回呼んで問題ない（冪等処理）。
    // 新規生成ノードはここで初めてユニフォームが当たる。
    playerNodeCreatedHooks.forEach(cb => cb(el, isOpponent));
  }

  if (isOpponent) { awayPlayers = arr; } else { homePlayers = arr; }
}

/**
 * 自チームにフォーメーションを適用する。
 * @param {[number,number][]}     positions
 * @param {boolean}               [resetManual=false]
 * @param {Record<number,string>} [members={}]
 */
export function applyFormation(positions, resetManual = false, members = {}) {
  const players = readPlayersFromForm(document.getElementById('playerFormHome'));
  placePlayers(players, positions, false, resetManual, members);
}
