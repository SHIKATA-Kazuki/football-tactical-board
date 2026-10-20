/**
 * flip-ui.js
 *
 * 「左右」パネル。現在のホームのフォーメーションにある左右反転ユニットごとに
 * 左／右の切り替えを並べ、選び方のモード（手動・自動・ボール側）を切り替える。
 * iPad / PC はフォーメーショングリッドの下に 1 行で、
 * スマホは画面を圧迫しないようドロワー（戦術スライダーと同じ場所）に置く。
 * 補足説明は高さを増やさないよう title（ツールチップ）に入れる。
 */

import {
  getCurrentUnits,
  getUnitSide,
  setUnitSide,
  getFlipState,
  setFlipMode,
} from './ui-events.js';
import { getBallState, onBallStateChange } from './ball.js';

const MODES = [
  { id: 'manual', label: '手動',   title: 'スイッチで選ぶ' },
  { id: 'auto',   label: '自動',   title: 'フォーメーションを変えたとき、移動が少ない方を選ぶ' },
  { id: 'ball',   label: 'ボール側', title: 'ボールのある側の SB が高い位置を取る' },
];
const SIDE_LABEL = { L: '左', R: '右' };

/** @type {HTMLElement[]} */
const panels = [];

function segmented(options, current, onPick, ariaLabel) {
  const group = document.createElement('div');
  group.className = 'flip-seg';
  group.setAttribute('role', 'group');
  group.setAttribute('aria-label', ariaLabel);
  for (const opt of options) {
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = opt.label;
    if (opt.title) b.title = opt.title;
    b.setAttribute('aria-pressed', String(opt.id === current));
    b.addEventListener('click', () => onPick(opt.id));
    group.appendChild(b);
  }
  return group;
}

function hintText(units, mode) {
  if (!units.length) return 'このフォーメーションは左右どちらでも同じ配置です';
  if (mode === 'auto') return 'フォーメーションを変えると、移動が少ない方に自動でそろえます';
  if (mode === 'ball') {
    if (!units.some(u => u.lead)) return 'ボール側モードは SB の選択がある形（3 バック系）で働きます';
    if (!getBallState().show) return 'ボールを表示して動かすと、ボール側の SB が上がります';
    return 'ボールのある側の SB が高い位置を取ります';
  }
  return '';
}

function buildPanelContent() {
  const units = getCurrentUnits();
  const { mode } = getFlipState();

  const head = document.createElement('div');
  head.className = 'flip-head';
  const title = document.createElement('span');
  title.className = 'flip-title';
  title.textContent = '左右';
  head.append(title, segmented(MODES, mode, setFlipMode, '選び方'));

  const list = document.createElement('div');
  list.className = 'flip-units';
  for (const unit of units) {
    const row = document.createElement('div');
    row.className = 'flip-unit';
    const label = document.createElement('span');
    label.className = 'flip-label';
    label.textContent = unit.label;
    const sides = [{ id: 'L', label: SIDE_LABEL.L }, { id: 'R', label: SIDE_LABEL.R }];
    row.append(label, segmented(sides, getUnitSide(unit), side => setUnitSide(unit.id, side), unit.label));
    list.appendChild(row);
  }
  if (!units.length) {
    const none = document.createElement('span');
    none.className = 'flip-label flip-none';
    none.textContent = '左右対称の形です';
    list.appendChild(none);
  }
  return { nodes: [head, list], hint: hintText(units, mode), empty: !units.length };
}

function render() {
  for (const panel of panels) {
    const { nodes, hint, empty } = buildPanelContent();
    panel.classList.toggle('is-empty', empty);
    panel.title = hint;
    panel.replaceChildren(...nodes);
  }
}

let frame = 0;
function scheduleRender() {
  if (frame) return;
  frame = requestAnimationFrame(() => { frame = 0; render(); });
}

function createPanel(id) {
  const panel = document.createElement('section');
  panel.id = id;
  panel.className = 'flip-panel infopart';
  panel.setAttribute('aria-label', '左右の割り当て');
  panels.push(panel);
  return panel;
}

export function initFlipUI() {
  const anchor = document.getElementById('formation-buttons-touch');
  if (anchor) anchor.after(createPanel('flip-panel'));

  const drawerSquad = document.querySelector('#drawer .squadnum');
  if (drawerSquad) drawerSquad.before(createPanel('flip-panel-drawer'));

  document.addEventListener('flips:change', scheduleRender);
  document.querySelector('.home-formations')?.addEventListener('formation:change', scheduleRender);
  onBallStateChange(scheduleRender);
  render();
}
