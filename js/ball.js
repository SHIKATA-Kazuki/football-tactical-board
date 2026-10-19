/**
 * ball.js
 *
 * フィールド上のボール。ドラッグで動かせる。
 * 「ボール連動」をオンにすると、ボール位置に合わせて両チームのブロックがスライドする。
 *
 * エクスポート:
 *   initBall()
 *   getBallState() / setBallState(state, { redraw })
 *   setBallVisible(bool) / setBallLinked(bool)
 *   onBallStateChange(cb)
 */

import { setBallLink } from './players.js';
import { redrawBoth } from './ui-events.js';
import { commit } from './bus.js';

const state = { show: false, link: false, x: 50, y: 50 };
let ballEl = null;
const listeners = [];

export function getBallState() {
  return { ...state };
}

/**
 * @param {{show?:boolean, link?:boolean, x?:number, y?:number}} next
 * @param {{redraw?:boolean}} [opts]
 */
export function setBallState(next = {}, { redraw = true } = {}) {
  Object.assign(state, next);
  // 非表示のボールにチームが連動しないようにする
  if (!state.show) state.link = false;
  setBallLink(state.link, state.x, state.y);
  render();
  if (redraw) redrawBoth();
  listeners.forEach(cb => cb(getBallState()));
}

export function setBallVisible(show) {
  setBallState({ show });
  commit();
}

export function setBallLinked(link) {
  setBallState({ link, show: link ? true : state.show });
  commit();
}

export function onBallStateChange(cb) {
  listeners.push(cb);
}

function render() {
  if (!ballEl) return;
  ballEl.hidden = !state.show;
  ballEl.style.left = `${state.x}%`;
  ballEl.style.top  = `${state.y}%`;
}

export function initBall() {
  const field = document.getElementById('field');
  if (!field) return;

  ballEl = document.createElement('div');
  ballEl.className = 'ball';
  ballEl.setAttribute('role', 'img');
  ballEl.setAttribute('aria-label', 'ボール');
  field.appendChild(ballEl);
  render();

  let rect = null;
  let frame = 0;

  ballEl.addEventListener('pointerdown', e => {
    e.preventDefault();
    e.stopPropagation();
    ballEl.setPointerCapture(e.pointerId);
    ballEl.classList.add('is-dragging');
    rect = field.getBoundingClientRect();
  });

  ballEl.addEventListener('pointermove', e => {
    if (!rect) return;
    state.x = Math.round(Math.min(100, Math.max(0, (e.clientX - rect.left) / rect.width  * 100)) * 10) / 10;
    state.y = Math.round(Math.min(100, Math.max(0, (e.clientY - rect.top)  / rect.height * 100)) * 10) / 10;
    render();
    if (state.link && !frame) {
      frame = requestAnimationFrame(() => {
        frame = 0;
        setBallLink(true, state.x, state.y);
        redrawBoth();
      });
    }
  });

  const end = () => {
    if (!rect) return;
    rect = null;
    ballEl.classList.remove('is-dragging');
    commit();
  };
  ballEl.addEventListener('pointerup', end);
  ballEl.addEventListener('pointercancel', end);
}
