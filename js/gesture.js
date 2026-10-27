/**
 * gesture.js
 *
 * ピッチ上の 2 本指ジェスチャー。1 本指の操作（選手を動かす・線を描く・ボール）はそのまま。
 *
 *   2 本指でスワイプ ↑ : 攻撃的な派生形（フリックの上方向）
 *                    ↓ : ブロック（下方向）
 *                    ← → : 平行移動（左右方向）
 *     派生形にいるときに逆方向へスワイプすると基本形に戻る。
 *   2 本指で縦につまむ / 広げる : ライン間（つまむ＝コンパクト）
 *   2 本指で横につまむ / 広げる : 幅（広げる＝幅を取る。ウイング用スティックと同じ）
 *
 * 動き始めの方向で「スワイプ」「縦ピンチ」「横ピンチ」のどれかに決め、指を離すまで変えない。
 * 2 本目の指が触れた時点で、1 本目の指で始まっていた操作（ドラッグ・描画・長押し）は取り消す。
 */

import { getCurrentFormation, selectHomeFormation, redrawAllPlayers, setSliderValue, syncJoystickKnobs } from './ui-events.js';
import { wingStick, sliderVal } from './players.js';
import { getFlickNeighbors } from './formation-flick-ui.js';
import { emit, commit, toast } from './bus.js';

const DECIDE_PX = 18;   // これだけ動いたら種類を決める
const SWIPE_PX  = 40;   // スワイプとみなす移動量
const LINE_GAIN = 1.5;  // フィールドの高さ分つまむと、ライン間スライダーが 1.5 動く
const WIDTH_GAIN = 2.5; // フィールドの幅分広げると、幅スティックが 2.5 動く

const DIR_TO_FLICK = { up: 'top', down: 'bottom', left: 'left', right: 'right' };
const OPPOSITE = { top: 'bottom', bottom: 'top', left: 'right', right: 'left' };
const ARROW = { up: '↑', down: '↓', left: '←', right: '→' };
const MEANING = { top: '攻撃的', bottom: 'ブロック', left: '平行移動', right: '平行移動', center: '基本形' };

let field = null;
let hud = null;

/** フィールド内で始まったタッチ（id → 現在位置） */
const touches = new Map();
/** 進行中のジェスチャー */
let g = null;
/** 直前にジェスチャーで使ったフリックキー（同じ形が複数キーにあるとき用） */
let lastKey = null;

// ─── HUD ─────────────────────────────────────────────────────────────────────

function showHud(main, sub = '', muted = false) {
  hud.replaceChildren();
  const a = document.createElement('div');
  a.className = 'gesture-hud-main';
  a.textContent = main;
  hud.appendChild(a);
  if (sub) {
    const b = document.createElement('div');
    b.className = 'gesture-hud-sub';
    b.textContent = sub;
    hud.appendChild(b);
  }
  hud.classList.toggle('is-muted', muted);
  hud.hidden = false;
}

function hideHud() {
  hud.hidden = true;
}

// ─── スワイプ先の決定 ────────────────────────────────────────────────────────

/**
 * 今のフォーメーションから、方向 dir に進んだ先を返す。
 * @returns {{ name:string|null, meaning:string, key:string|null }}
 */
function swipeTarget(dir) {
  const current = getCurrentFormation('home');
  const nb = current && getFlickNeighbors(current, lastKey);
  const flickDir = DIR_TO_FLICK[dir];
  if (!nb) return { name: null, meaning: MEANING[flickDir], key: null };

  if (nb.at === 'center') {
    return { name: nb.byDir[flickDir] ?? null, meaning: MEANING[flickDir], key: nb.key };
  }
  if (OPPOSITE[nb.at] === flickDir) {
    return { name: nb.byDir.center ?? null, meaning: MEANING.center, key: nb.key };
  }
  if (nb.at === flickDir) {
    return { name: null, meaning: 'これ以上ありません', key: nb.key };
  }
  return { name: nb.byDir[flickDir] ?? null, meaning: MEANING[flickDir], key: nb.key };
}

// ─── ジェスチャー本体 ────────────────────────────────────────────────────────

function pair() {
  const [a, b] = [...touches.values()];
  return { a, b };
}

function startGesture() {
  const { a, b } = pair();
  g = {
    kind: null,
    startCenter: { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 },
    startSpan: { x: Math.abs(a.x - b.x), y: Math.abs(a.y - b.y) },
    line0: sliderVal('lineSlider'),
    wing0: wingStick.x,
    swipeDir: null,
    frame: 0,
  };
  emit('board:gesture-start');   // 1 本指の操作を取り消す
}

function update() {
  if (!g) return;
  const { a, b } = pair();
  const rect = field.getBoundingClientRect();
  const move = { x: (a.x + b.x) / 2 - g.startCenter.x, y: (a.y + b.y) / 2 - g.startCenter.y };
  const span = { x: Math.abs(a.x - b.x) - g.startSpan.x, y: Math.abs(a.y - b.y) - g.startSpan.y };

  if (!g.kind) {
    const moved = Math.hypot(move.x, move.y);
    const pinched = Math.max(Math.abs(span.x), Math.abs(span.y));
    if (Math.max(moved, pinched) < DECIDE_PX) return;
    if (moved > pinched * 1.2) g.kind = 'swipe';
    else g.kind = Math.abs(span.y) >= Math.abs(span.x) ? 'pinch-v' : 'pinch-h';
  }

  if (g.kind === 'swipe') {
    const dist = Math.hypot(move.x, move.y);
    g.swipeDir = dist < SWIPE_PX ? null
      : Math.abs(move.x) > Math.abs(move.y) ? (move.x > 0 ? 'right' : 'left')
      : (move.y > 0 ? 'down' : 'up');
    if (!g.swipeDir) {
      showHud('2 本指スワイプ', '↑ 攻撃的　↓ ブロック　← → 平行移動', true);
      return;
    }
    const t = swipeTarget(g.swipeDir);
    if (t.name) showHud(`${ARROW[g.swipeDir]} ${t.name}`, t.meaning);
    else showHud(`${ARROW[g.swipeDir]} なし`, t.meaning === 'これ以上ありません' ? t.meaning : `${t.meaning}の形は未登録です`, true);
    return;
  }

  if (g.kind === 'pinch-v') {
    // 縦につまむ（span.y < 0）とコンパクト＝スライダー値が上がる
    const v = Math.min(1, Math.max(0, g.line0 - (span.y / rect.height) * LINE_GAIN));
    setSliderValue('lineSlider', Math.round(v * 50) / 50);
    const pct = Math.round(sliderVal('lineSlider') * 100);
    showHud(`ライン間 ${pct}%`, span.y < 0 ? 'コンパクトに' : '間隔を広げる');
  } else {
    const w = Math.min(1, Math.max(-1, g.wing0 + (span.x / rect.width) * WIDTH_GAIN));
    wingStick.x = Math.round(w * 100) / 100;
    syncJoystickKnobs();
    const pct = Math.round(wingStick.x * 100);
    showHud(`幅 ${pct > 0 ? '+' : ''}${pct}%`, span.x > 0 ? '幅を取る' : '絞る');
  }
  if (!g.frame) {
    g.frame = requestAnimationFrame(() => {
      if (g) g.frame = 0;
      redrawAllPlayers();
    });
  }
}

function endGesture() {
  if (!g) return;
  const done = g;
  g = null;
  if (done.frame) cancelAnimationFrame(done.frame);

  if (done.kind === 'swipe' && done.swipeDir) {
    const t = swipeTarget(done.swipeDir);
    if (t.name) {
      lastKey = t.key;
      selectHomeFormation(t.name);   // フリックで選んだのと同じ処理（履歴にも積まれる）
    }
  } else if (done.kind === 'pinch-v' || done.kind === 'pinch-h') {
    redrawAllPlayers();
    commit();
  }
  setTimeout(hideHud, done.kind === 'swipe' ? 450 : 250);
}

// ─── タッチの追跡 ────────────────────────────────────────────────────────────

function onStart(e) {
  for (const t of e.changedTouches) {
    touches.set(t.identifier, { x: t.clientX, y: t.clientY });
  }
  if (!g && touches.size >= 2) {
    // 3 本目以降は無視し、最初の 2 本で判定する
    while (touches.size > 2) touches.delete([...touches.keys()].pop());
    startGesture();
  }
  if (g) e.preventDefault();
}

function onMove(e) {
  let tracked = false;
  for (const t of e.changedTouches) {
    if (!touches.has(t.identifier)) continue;
    touches.set(t.identifier, { x: t.clientX, y: t.clientY });
    tracked = true;
  }
  if (g && tracked) {
    e.preventDefault();
    update();
  }
}

function onEnd(e) {
  for (const t of e.changedTouches) touches.delete(t.identifier);
  if (g && touches.size < 2) endGesture();
}

/** タッチ端末で最初の 1 回だけ使い方を出す */
function maybeShowHint() {
  if (!('ontouchstart' in window)) return;
  try {
    if (localStorage.getItem('board-gesture-hint')) return;
    localStorage.setItem('board-gesture-hint', '1');
  } catch {
    return;   // 保存できない環境では毎回出さない
  }
  setTimeout(() => toast('ヒント：ピッチを 2 本指でスワイプすると派生形、つまむとライン間・幅を調整できます', 5000), 1200);
}

export function initGestures() {
  field = document.getElementById('field');
  if (!field) return;

  hud = document.createElement('div');
  hud.className = 'gesture-hud';
  hud.setAttribute('role', 'status');
  hud.hidden = true;
  field.appendChild(hud);

  // 選手やボールの上で始まったタッチも拾うため、キャプチャ段階で受ける
  field.addEventListener('touchstart', onStart, { capture: true, passive: false });
  document.addEventListener('touchmove', onMove, { passive: false });
  document.addEventListener('touchend', onEnd);
  document.addEventListener('touchcancel', onEnd);

  maybeShowHint();
}
