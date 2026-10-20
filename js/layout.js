/**
 * layout.js
 *
 * 画面にぴったり収める。
 * フィールドの大きさは本来 CSS（幅基準 / 75vh 基準）で決まるが、画面の高さが足りないと
 * ページがスクロールし、選手を動かそうとして画面が動いてしまう。
 * そこで、はみ出す分だけフィールドを縦横比を保ったまま縮める。
 *
 *   スマホ            : 縦積み（フィールド → 道具の帯 → フォーメーション）を画面の高さに収める
 *   iPad / PC（横長） : フィールドとコントロールを 1 行に並べ、画面の高さに収める
 *   iPad（縦長）      : 元のレイアウトのまま（縮めるとフィールドが小さくなりすぎるため）
 *
 * 縮めるだけで、CSS の既定サイズより大きくはしない。
 */

const MIN_PITCH_HEIGHT = 300;   // これ以上は縮めない（それでも入らない画面はスクロールを許す）
const ROOT = document.documentElement;

let field = null;
let info  = null;
let frame = 0;

function isPhone() {
  return window.matchMedia('(max-width: 600px)').matches;
}

function setPitch(h, ratio) {
  ROOT.style.setProperty('--pitch-height', `${h}px`);
  ROOT.style.setProperty('--pitch-width',  `${h * ratio}px`);
}

function clearPitch() {
  ROOT.style.removeProperty('--pitch-height');
  ROOT.style.removeProperty('--pitch-width');
}

/** 縦にはみ出している量（px） */
function overflowY() {
  return Math.ceil(ROOT.scrollHeight - window.innerHeight);
}

/** iPad / PC でコントロールがフィールドの下に回り込んでいるか */
function wrapped() {
  if (!info) return false;
  return info.getBoundingClientRect().top >= field.getBoundingClientRect().bottom - 4;
}

export function fitToScreen() {
  if (!field) return;
  clearPitch();

  const phone = isPhone();
  const landscape = window.innerWidth > window.innerHeight;
  if (!phone && !landscape) return;   // iPad 縦は元のまま

  let h = field.offsetHeight;
  const ratio = field.offsetWidth / h;
  if (!h || !ratio) return;

  const fits = () => overflowY() <= 0 && (phone || !wrapped());
  if (fits()) return;

  for (let i = 0; i < 12 && !fits() && h > MIN_PITCH_HEIGHT; i++) {
    const over = overflowY();
    // 回り込みは高さだけでは測れないので少しずつ、縦のはみ出しは差分だけ縮める
    const next = (!phone && wrapped()) || over <= 0 ? h * 0.93 : h - over - 2;
    h = Math.max(MIN_PITCH_HEIGHT, Math.floor(next));
    setPitch(h, ratio);
  }
  window.dispatchEvent(new Event('board:resized'));
}

function schedule() {
  if (frame) return;
  frame = requestAnimationFrame(() => {
    frame = 0;
    fitToScreen();
  });
}

export function initLayout() {
  field = document.getElementById('field');
  info  = document.getElementById('info');
  if (!field) return;

  fitToScreen();
  window.addEventListener('resize', schedule);
  window.addEventListener('orientationchange', schedule);
  // フォーメーション図などの画像が読み込まれて高さが変わることがある
  window.addEventListener('load', schedule);
  document.fonts?.ready?.then(schedule);
}
