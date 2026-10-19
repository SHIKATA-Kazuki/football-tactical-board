/**
 * history.js
 *
 * 元に戻す / やり直す。
 * 'board:commit' を受けるたびに盤面全体のスナップショットを積む（スライダーなど連続操作は 250ms まとめる）。
 * 同じ内容が続く場合は積まない。
 *
 * ショートカット: Ctrl/⌘ + Z（戻す）、Ctrl/⌘ + Shift + Z または Ctrl + Y（やり直す）
 */

import { serializeState, restoreState } from './state.js';
import { emit } from './bus.js';

const LIMIT = 100;
const DEBOUNCE_MS = 250;

/** @type {string[]} JSON 文字列のスタック */
let stack = [];
let index = -1;
let timer = null;

export function canUndo() { return index > 0; }
export function canRedo() { return index < stack.length - 1; }

function notify() {
  emit('history:change', { canUndo: canUndo(), canRedo: canRedo() });
}

/** 保留中の変更があれば即座に記録する */
function flush() {
  clearTimeout(timer);
  timer = null;
  const json = JSON.stringify(serializeState());
  if (json === stack[index]) return;
  stack = stack.slice(0, index + 1);
  stack.push(json);
  if (stack.length > LIMIT) stack.shift();
  index = stack.length - 1;
  notify();
}

function restoreAt(i) {
  index = i;
  restoreState(JSON.parse(stack[index]));
  // 復元中に発生した commit は記録しない
  clearTimeout(timer);
  timer = null;
  // 復元後の状態を基準として上書き（小数の丸めなどで差が出ても redo を失わない）
  stack[index] = JSON.stringify(serializeState());
  notify();
}

export function undo() {
  if (timer) flush();
  if (canUndo()) restoreAt(index - 1);
}

export function redo() {
  if (timer) flush();
  if (canRedo()) restoreAt(index + 1);
}

/** 現在の盤面を起点に履歴を始める（初期化・URL 復元のあとに呼ぶ） */
export function initHistory() {
  stack = [JSON.stringify(serializeState())];
  index = 0;
  notify();

  document.addEventListener('board:commit', e => {
    clearTimeout(timer);
    if (e.detail?.debounce) {
      timer = setTimeout(flush, DEBOUNCE_MS);
    } else {
      // 同じ操作の中で続けて起きた変更をまとめるため、現在の処理が終わってから記録
      timer = -1;
      queueMicrotask(() => { if (timer === -1) flush(); });
    }
  });

  document.addEventListener('keydown', e => {
    if (!(e.ctrlKey || e.metaKey)) return;
    if (e.target.closest?.('input, select, textarea')) return;
    const key = e.key.toLowerCase();
    if (key === 'z' && !e.shiftKey) { e.preventDefault(); undo(); }
    else if ((key === 'z' && e.shiftKey) || key === 'y') { e.preventDefault(); redo(); }
  });
}
