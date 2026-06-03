import { formations } from './formations.js';

// ==========ジョイスティック状態===========
export let wingStick = { x: 0, y: 0 };

// ==========スライダー参照ヘルパー===========
function sliderVal(id) {
  return parseFloat(document.getElementById(id).value);
}

// ==========戦術調整===========
function applyTacticalAdjustments(squadNum, pos, isOpponent) {
  let [x, y] = pos;

  const sbValue   = sliderVal("sidbackUpDown");
  const lineValue = sliderVal("lineSlider");
  const backsVal  = sliderVal("backsSlider");
  const volante   = sliderVal("volanteSlider");
  const top       = sliderVal("topSlider");

  const wingWidthOffset  = wingStick.x * 15;
  const wingHeightOffset = wingStick.y * 15;
  let sbOffset = (sbValue - 0.22) * 20;

  const lineOffset = (lineValue - 0.5) * 20;

  if (
    (squadNum === 2 && backsVal > 0.5)
    || (squadNum === 5 && backsVal + volante + top > 0.1)
    || (squadNum === 7 && backsVal < 0.5 && backsVal + volante + top > 0.1)
    || (squadNum === 3 && backsVal + volante + top < 0.1)
    || (squadNum === 4 && backsVal + volante + top < 0.1)
  ) {
    if (backsVal < 0.5 && backsVal + volante + top > 0.1) {
      sbOffset = (sbValue - 0.4) * 37;
    }
    if (isOpponent) { y += sbOffset; } else { y -= sbOffset; }
  }

  if (
    (squadNum === 7  && backsVal > 0.5)
    || (squadNum === 11 && backsVal > 0.5)
    || (squadNum === 10 && backsVal < 0.5 && volante > 0.5 && top < 0.5)
    || (squadNum === 11 && backsVal < 0.5 && volante > 0.5 && top < 0.5)
    || (squadNum === 6  && backsVal < 0.5 && top > 0.5)
    || (squadNum === 8  && backsVal < 0.5 && top > 0.5)
    || (squadNum === 2  && backsVal + volante + top < 0.1)
    || (squadNum === 5  && backsVal + volante + top < 0.1)
  ) {
    if (isOpponent) {
      if ([7, 10, 8, 2].includes(squadNum)) x -= wingWidthOffset;
      if ([11, 6, 5].includes(squadNum))    x += wingWidthOffset;
    } else {
      if ([7, 10, 8, 2].includes(squadNum)) x += wingWidthOffset;
      if ([11, 6, 5].includes(squadNum))    x -= wingWidthOffset;
    }
    if (isOpponent) { y += wingHeightOffset; } else { y -= wingHeightOffset; }
  }

  if ([2,3,4,5,6,7,8,9,10,11].includes(squadNum)) {
    if (isOpponent) { y += lineOffset; } else { y -= lineOffset; }
  }

  return [x, y];
}

// ==========プレイヤー DOM 管理===========
let homePlayers = [];
let awayPlayers = [];

// ドラッグで動かしたノードの位置を保持する Map
// key: "home-i" or "away-i"、value: { left, top } (% 文字列)
const manualPositions = {
  home: new Map(),
  away: new Map()
};

/** 手動移動フラグをリセット */
export function resetManualPositions(side) {
  manualPositions[side].clear();
}

/** 1プレイヤーにドラッグ操作を付ける */
function attachDrag(el, sideKey, index) {
  el.style.cursor     = 'grab';
  // ブラウザのスクロール待機を即座にキャンセルし、遅延なく反応させる
  el.style.touchAction = 'none';

  el.onpointerdown = (e) => {
    // タッチ時のスクロール・ページ移動を防ぐ
    e.preventDefault();
    e.stopPropagation();
    el.setPointerCapture(e.pointerId);
    el.style.cursor     = 'grabbing';
    el.style.zIndex     = '100';
    el.style.transition = 'none'; // ドラッグ中はアニメOFF

    el.onpointermove = (ev) => {
      // setPointerCapture 済みなので指が外れても追従する
      const field = document.getElementById('field');
      const rect  = field.getBoundingClientRect();
      const x = Math.min(100, Math.max(0, (ev.clientX - rect.left)  / rect.width  * 100));
      const y = Math.min(100, Math.max(0, (ev.clientY - rect.top)   / rect.height * 100));

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

export function readPlayersFromForm(formEl) {
  const fd  = new FormData(formEl);
  const arr = [];
  for (let i = 1; i <= 11; i++) {
    arr.push({ number: fd.get(`number${i}`), name: fd.get(`name${i}`) });
  }
  return arr;
}

/**
 * @param {object[]} players
 * @param {number[][]} positions
 * @param {boolean} isOpponent
 * @param {boolean} resetManual  true のとき手動移動をリセットして再配置
 */
export function placePlayers(players, positions, isOpponent, resetManual = false) {
  const field   = document.getElementById("field");
  const arr     = isOpponent ? awayPlayers : homePlayers;
  const sideKey = isOpponent ? 'away' : 'home';

  if (resetManual) manualPositions[sideKey].clear();

  // DOM 数を合わせる
  while (arr.length < players.length) {
    const div = document.createElement("div");
    div.className = isOpponent ? "player away" : "player home";
    field.appendChild(div);
    arr.push(div);
  }
  while (arr.length > players.length) {
    arr.pop().remove();
  }

  for (let i = 0; i < players.length; i++) {
    const el = arr[i];
    el.className = isOpponent ? "player away" : "player home";

    // 手動移動済みのノードはフォーメーション計算をスキップ
    if (manualPositions[sideKey].has(i)) {
      const saved = manualPositions[sideKey].get(i);
      el.style.left = saved.left;
      el.style.top  = saved.top;
    } else {
      const [x, y] = applyTacticalAdjustments(i + 1, positions[i], isOpponent);
      el.style.left = `${x}%`;
      el.style.top  = `${y}%`;
    }

    el.innerHTML = `<strong>${players[i].number}</strong>`;

    // ドラッグイベントを付け直す（innerHTML 書き換え後なので毎回必要）
    attachDrag(el, sideKey, i);
  }

  if (isOpponent) { awayPlayers = arr; } else { homePlayers = arr; }
}

// ==========フォーメーションの適用===========
export function applyFormation(positions, resetManual = false) {
  const players = readPlayersFromForm(document.getElementById("playerFormHome"));
  placePlayers(players, positions, false, resetManual);
}

/* 終了 */