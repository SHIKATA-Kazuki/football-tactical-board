/**
 * bus.js
 *
 * モジュール間の小さなイベントバス。
 *   'board:commit'   … 盤面が確定的に変わった（履歴に積む合図）
 *   'players:placed' … 選手の位置が変わった（距離表示などの再描画用）
 */
export function emit(name, detail) {
  document.dispatchEvent(new CustomEvent(name, { detail }));
}

/**
 * 盤面の変更を確定したことを通知する（history.js が記録）。
 * スライダーのように連続して発生する操作は { debounce: true } を付けると、
 * 動かし終わったところで 1 回だけ記録される。
 */
export function commit({ debounce = false } = {}) {
  emit('board:commit', { debounce });
}

/** 画面下部に短いメッセージを出す */
let toastTimer = null;
export function toast(message, duration = 2200) {
  let el = document.getElementById('board-toast');
  if (!el) {
    el = document.createElement('div');
    el.id = 'board-toast';
    el.setAttribute('role', 'status');
    document.body.appendChild(el);
  }
  el.textContent = message;
  el.classList.add('is-visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('is-visible'), duration);
}
