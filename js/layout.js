/**
 * layout.js
 *
 * 画面にぴったり収める（ページをスクロールさせない）。
 *
 *   スマホ（〜600px）: 縦積み（フィールド → 道具の帯 → フォーメーション）。
 *                      はみ出す分だけフィールドを縦横比を保って縮める。
 *   iPad / PC 横     : [フィールド][道具][コントロール] の 3 列。
 *                      フィールドを画面の高さいっぱいに取り、コントロール欄が
 *                      入りきらなければジョイスティックを小さくする。
 *   iPad / PC 縦     : フィールドと道具を上、コントロールを下に 2 列。
 *                      コントロールの高さを引いた残りをフィールドに使う。
 */

import { syncJoystickKnobs } from './ui-events.js';

const ROOT = document.documentElement;
const MIN_PITCH_HEIGHT = 300;
const MAX_PITCH_HEIGHT = 1100;
const PITCH_RATIO = 4 / 6;          // iPad / PC のフィールドの縦横比（field.css と同じ）
const JOY_MAX = 170;
const JOY_MIN = 96;

let field = null;
let info  = null;
let tools = null;
let header = null;
let frame = 0;

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
const setVar = (name, px) => ROOT.style.setProperty(name, `${Math.round(px)}px`);

function isPhone() {
  return window.matchMedia('(max-width: 600px)').matches;
}

function setPitch(h, ratio) {
  setVar('--pitch-height', h);
  setVar('--pitch-width',  h * ratio);
}

function clearVars() {
  for (const v of ['--pitch-height', '--pitch-width', '--controls-w', '--avail-h', '--main-top', '--joy-size']) {
    ROOT.style.removeProperty(v);
  }
}

function overflowY() {
  return Math.ceil(ROOT.scrollHeight - window.innerHeight);
}

// ─── スマホ ──────────────────────────────────────────────────────────────────

function fitPhone() {
  let h = field.offsetHeight;
  const ratio = field.offsetWidth / h;
  if (!h || !ratio) return;
  for (let i = 0; i < 12 && overflowY() > 0 && h > MIN_PITCH_HEIGHT; i++) {
    h = Math.max(MIN_PITCH_HEIGHT, Math.floor(h - overflowY() - 2));
    setPitch(h, ratio);
  }
}

// ─── iPad / PC ───────────────────────────────────────────────────────────────

function fitWide() {
  const W = window.innerWidth;
  const H = window.innerHeight;
  const top = Math.ceil(header?.getBoundingClientRect().bottom ?? 60) + 8;
  const bottomPad = 10;
  const sidePad = 24;
  const gap = 14;
  const toolsW = tools?.offsetWidth || 50;
  setVar('--main-top', top);

  const availH = H - top - bottomPad - 2;   // 小数の丸め分の余裕
  setVar('--avail-h', availH);

  if (W > H) {
    // 横：フィールドを最優先で高さいっぱいに
    const controlsW = clamp(Math.round(W * 0.4), 300, 520);
    setVar('--controls-w', controlsW);
    const maxFieldW = W - controlsW - toolsW - gap * 2 - sidePad;
    let h = clamp(Math.min(availH, maxFieldW / PITCH_RATIO), MIN_PITCH_HEIGHT, MAX_PITCH_HEIGHT);
    setPitch(h, PITCH_RATIO);
    h = trimOverflow(h);   // コーナーアークの張り出しなど、実際のはみ出し分を詰める

    // コントロール欄が入りきらなければジョイスティックを小さく
    let joy = JOY_MAX;
    setVar('--joy-size', joy);
    while (info.scrollHeight > availH && joy > JOY_MIN) {
      joy -= 8;
      setVar('--joy-size', joy);
    }
    // 丸めなどで残った数 px は、コントロール欄の上限を下げて吸収する
    let limit = availH;
    for (let i = 0; i < 3 && overflowY() > 0; i++) {
      limit -= overflowY();
      setVar('--avail-h', limit);
    }
  } else {
    // 縦：コントロールを下に置き、残りをフィールドに
    setVar('--controls-w', W - sidePad);
    let joy = JOY_MAX;
    setVar('--joy-size', joy);
    const fieldFor = () => Math.min(
      availH - info.offsetHeight - 10,
      (W - toolsW - gap - sidePad) / PITCH_RATIO,
      MAX_PITCH_HEIGHT,
    );
    // フィールドが小さくなりすぎる場合はジョイスティックを詰める
    while (fieldFor() < availH * 0.55 && joy > JOY_MIN) {
      joy -= 8;
      setVar('--joy-size', joy);
    }
    setPitch(Math.max(MIN_PITCH_HEIGHT, fieldFor()), PITCH_RATIO);
    trimOverflow(field.offsetHeight);
  }
}

/** 計算どおりに置いても残る縦のはみ出しを、フィールドを縮めて解消する */
function trimOverflow(h) {
  for (let i = 0; i < 4 && overflowY() > 0 && h > MIN_PITCH_HEIGHT; i++) {
    h = Math.max(MIN_PITCH_HEIGHT, h - overflowY() - 1);
    setPitch(h, PITCH_RATIO);
  }
  return h;
}

export function fitToScreen() {
  if (!field) return;
  clearVars();
  if (isPhone()) fitPhone();
  else fitWide();
  syncJoystickKnobs();
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
  field  = document.getElementById('field');
  info   = document.getElementById('info');
  tools  = document.getElementById('board-tools');
  header = document.querySelector('header');
  if (!field || !info) return;

  fitToScreen();
  window.addEventListener('resize', schedule);
  window.addEventListener('orientationchange', schedule);
  window.addEventListener('load', schedule);   // 画像の読み込みで高さが変わることがある
  document.fonts?.ready?.then(schedule);
}
