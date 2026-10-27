/**
 * gk-colors.js
 *
 * GK だけユニフォームの色を変える（ホーム・アウェイ別）。
 * 色を選ぶと、その GK はチームのユニフォーム（SVG・グラデーション）の代わりに単色で表示される。
 * 背番号の色は背景の明るさから白／黒を自動で選ぶ。
 *
 * 既定値は config.js の lineup に gk: '#f4d03f' のように書ける（チーム変更でリセット）。
 *
 * エクスポート:
 *   GK_PRESETS
 *   initGkColors()
 *   getGkColors() / setGkColors({ home, away })   状態の保存・復元用
 *   setGkColor(side, color | null, { record })
 *   onGkColorChange(cb)
 */

import { getPlayerElements } from './players.js';
import { commit } from './bus.js';

export const GK_PRESETS = [
  { color: '#f4d03f', name: '黄' },
  { color: '#2ecc71', name: '緑' },
  { color: '#ff8c1a', name: 'オレンジ' },
  { color: '#ff6fa8', name: 'ピンク' },
  { color: '#4cc9f0', name: '水色' },
  { color: '#7d4cdb', name: '紫' },
  { color: '#1c1c1c', name: '黒' },
];

const state = { home: null, away: null };
const listeners = [];

const HEX = /^#[0-9a-f]{6}$/i;

function textColorFor(hex) {
  const n = parseInt(hex.slice(1), 16);
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  // 相対輝度（sRGB の簡易版）で白黒を決める
  const lum = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
  return lum > 0.6 ? '#111' : '#fff';
}

/** 現在の GK ノードに色を当てる（選手が描き直されるたびに呼ばれる） */
function apply() {
  for (const side of ['home', 'away']) {
    const gk = getPlayerElements(side)[0];
    if (!gk) continue;
    const color = state[side];
    gk.classList.toggle('gk-custom', !!color);
    if (color) {
      gk.style.setProperty('--gk-bg', color);
      gk.style.setProperty('--gk-text', textColorFor(color));
    } else {
      gk.style.removeProperty('--gk-bg');
      gk.style.removeProperty('--gk-text');
    }
  }
}

export function getGkColors() {
  return { ...state };
}

/** 状態の復元用（履歴には積まない） */
export function setGkColors({ home = null, away = null } = {}) {
  state.home = HEX.test(home ?? '') ? home : null;
  state.away = HEX.test(away ?? '') ? away : null;
  apply();
  listeners.forEach(cb => cb(getGkColors()));
}

/**
 * @param {'home'|'away'} side
 * @param {string|null} color  '#rrggbb'、null でチームのユニフォームに戻す
 */
export function setGkColor(side, color, { record = true } = {}) {
  const next = HEX.test(color ?? '') ? color.toLowerCase() : null;
  if (state[side] === next) return;
  state[side] = next;
  apply();
  listeners.forEach(cb => cb(getGkColors()));
  if (record) commit();
}

export function onGkColorChange(cb) {
  listeners.push(cb);
}

export function initGkColors() {
  // placePlayers が class を付け直すので、配置のたびに当て直す
  document.addEventListener('players:placed', apply);
  apply();
}
