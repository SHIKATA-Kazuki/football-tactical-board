/**
 * phases.js
 *
 * 局面（配置のスナップショット）を最大 4 つ保存し、呼び出し・連続再生する。
 * 選手の位置・ボール・描いた矢印をまとめて 1 局面とする。
 * 呼び出すと全選手が手動配置として固定され、CSS の transition でなめらかに動く。
 *
 * エクスポート:
 *   PHASE_COUNT
 *   getPhases() / setPhases(list)
 *   getActivePhase() / selectPhase(i)
 *   savePhase()            選択中の枠に現在の配置を保存
 *   recallPhase(i)
 *   togglePlayback()
 *   onPhasesChange(cb)
 */

import { getPlayerElements, setManualPositions } from './players.js';
import { redrawBoth } from './ui-events.js';
import { getBallState, setBallState } from './ball.js';
import { getDrawings, setDrawings } from './drawing.js';
import { commit, toast } from './bus.js';

export const PHASE_COUNT = 4;
const PLAY_INTERVAL_MS = 1500;

/** @type {(object|null)[]} */
let phases = Array(PHASE_COUNT).fill(null);
let active = 0;
let playTimer = null;
const listeners = [];

function notify() {
  listeners.forEach(cb => cb({ phases: getPhases(), active, playing: !!playTimer }));
}

export function onPhasesChange(cb) {
  listeners.push(cb);
}

export function getPhases() {
  return phases.map(p => (p ? structuredClone(p) : null));
}

export function setPhases(list = []) {
  phases = Array.from({ length: PHASE_COUNT }, (_, i) => (list[i] ? structuredClone(list[i]) : null));
  notify();
}

export function getActivePhase() {
  return active;
}

export function selectPhase(i) {
  active = i;
  if (phases[i]) recallPhase(i);
  notify();
}

function readPositions(side) {
  return getPlayerElements(side).map(node => [
    Math.round(parseFloat(node.style.left) * 10) / 10,
    Math.round(parseFloat(node.style.top)  * 10) / 10,
  ]);
}

export function savePhase() {
  const { x, y, show } = getBallState();
  phases[active] = {
    home: readPositions('home'),
    away: readPositions('away'),
    ball: { x, y, show },
    draw: getDrawings(),
  };
  toast(`局面 ${active + 1} に保存しました`);
  notify();
  commit();
}

export function recallPhase(i, { record = true } = {}) {
  const phase = phases[i];
  if (!phase) return;
  setManualPositions('home', phase.home.map(([x, y], idx) => [idx, x, y]));
  setManualPositions('away', phase.away.map(([x, y], idx) => [idx, x, y]));
  // 局面再現中はボール連動を切る（位置は保存されたものを優先）
  setBallState({ ...phase.ball, link: false }, { redraw: false });
  redrawBoth();
  setDrawings(phase.draw ?? []);
  if (record) commit();
}

export function togglePlayback() {
  if (playTimer) {
    stopPlayback();
    return;
  }
  const order = phases.map((p, i) => (p ? i : -1)).filter(i => i >= 0);
  if (order.length < 2) {
    toast('再生するには局面を 2 つ以上保存してください');
    return;
  }
  let step = 0;
  const tick = () => {
    active = order[step];
    recallPhase(active, { record: false });
    notify();
    step += 1;
    if (step >= order.length) {
      playTimer = setTimeout(stopPlayback, PLAY_INTERVAL_MS);
    } else {
      playTimer = setTimeout(tick, PLAY_INTERVAL_MS);
    }
  };
  playTimer = -1;   // tick 内の notify で「再生中」と表示させる
  tick();
}

function stopPlayback() {
  clearTimeout(playTimer);
  playTimer = null;
  notify();
  commit();   // 再生後の配置を 1 回だけ履歴に積む
}
