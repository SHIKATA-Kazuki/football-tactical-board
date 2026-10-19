/**
 * analysis.js
 *
 * 自チーム（手前＝ホーム）のコンパクトさを可視化する。
 *   - 最終ライン（最も深いフィールドプレーヤー）と最前線を横線で表示
 *   - 縦幅・横幅を m 換算で表示（ピッチ 105m × 68m として計算）
 *   - 各選手から近い 2 人へ線を引き、距離（m）を表示
 *
 * エクスポート:
 *   initAnalysis()
 *   isAnalysisVisible() / setAnalysisVisible(bool)
 */

import { getPlayerElements } from './players.js';
import { getOverlayLayer, getFieldSize } from './drawing.js';

const PITCH_LENGTH_M = 105;
const PITCH_WIDTH_M  = 68;
const SVG_NS = 'http://www.w3.org/2000/svg';
const ACCENT = '#4cc9f0';

let visible = false;
let frame = 0;
const listeners = [];

export function isAnalysisVisible() {
  return visible;
}

export function setAnalysisVisible(next) {
  visible = !!next;
  scheduleRender();
  listeners.forEach(cb => cb(visible));
}

export function onAnalysisChange(cb) {
  listeners.push(cb);
}

export function initAnalysis() {
  document.addEventListener('players:placed', scheduleRender);
  window.addEventListener('resize', scheduleRender);
}

function scheduleRender() {
  if (frame) return;
  frame = requestAnimationFrame(() => {
    frame = 0;
    render();
  });
}

function el(name, attrs = {}, text) {
  const node = document.createElementNS(SVG_NS, name);
  for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, v);
  if (text !== undefined) node.textContent = text;
  return node;
}

/** 背景つきの小さなラベル */
function label(x, y, text, { anchor = 'middle', size = 10 } = {}) {
  const g = el('g', { class: 'analysis-label' });
  const width = text.length * size * 0.62 + 8;
  const left = anchor === 'start' ? x : anchor === 'end' ? x - width : x - width / 2;
  g.appendChild(el('rect', {
    x: left, y: y - size * 0.75 - 3, width, height: size + 5, rx: 3,
    fill: 'rgba(8, 20, 26, 0.78)',
  }));
  g.appendChild(el('text', {
    x: left + width / 2, y: y + size * 0.25,
    'text-anchor': 'middle', 'font-size': size, 'font-weight': 600, fill: '#fff',
  }, text));
  return g;
}

function render() {
  const layer = getOverlayLayer('analysis');
  if (!layer) return;
  layer.replaceChildren();
  if (!visible) return;

  const { w, h } = getFieldSize();
  // フィールドプレーヤー（GK = index 0 は除外）
  const pts = getPlayerElements('home').slice(1)
    .map(node => [parseFloat(node.style.left), parseFloat(node.style.top)])
    .filter(([x, y]) => Number.isFinite(x) && Number.isFinite(y));
  if (pts.length < 2) return;

  const meters = ([ax, ay], [bx, by]) =>
    Math.hypot((bx - ax) / 100 * PITCH_WIDTH_M, (by - ay) / 100 * PITCH_LENGTH_M);
  const px = ([x, y]) => [x / 100 * w, y / 100 * h];

  // ── 近い 2 人を結ぶ線 ───────────────────────────────────────────────────────
  const edges = new Map();
  pts.forEach((p, i) => {
    pts.map((q, j) => ({ j, d: meters(p, q) }))
      .filter(o => o.j !== i)
      .sort((a, b) => a.d - b.d)
      .slice(0, 2)
      .forEach(({ j, d }) => edges.set([i, j].sort((a, b) => a - b).join('-'), d));
  });

  const edgeGroup = el('g', { class: 'analysis-edges' });
  const labelGroup = el('g');
  for (const [key, d] of edges) {
    const [i, j] = key.split('-').map(Number);
    const [x1, y1] = px(pts[i]);
    const [x2, y2] = px(pts[j]);
    edgeGroup.appendChild(el('line', {
      x1, y1, x2, y2, stroke: ACCENT, 'stroke-opacity': 0.55, 'stroke-width': 1.5,
    }));
    labelGroup.appendChild(label((x1 + x2) / 2, (y1 + y2) / 2, `${d.toFixed(0)}m`, { size: 9 }));
  }

  // ── 最終ライン・最前線 ─────────────────────────────────────────────────────
  const ys = pts.map(p => p[1]);
  const xs = pts.map(p => p[0]);
  const back  = Math.max(...ys);   // ホームは手前（下）から攻めるので y が大きい方が深い
  const front = Math.min(...ys);
  const depthM = (back - front) / 100 * PITCH_LENGTH_M;
  const widthM = (Math.max(...xs) - Math.min(...xs)) / 100 * PITCH_WIDTH_M;

  const lines = el('g', { class: 'analysis-lines' });
  for (const y of [back, front]) {
    lines.appendChild(el('line', {
      x1: 0, x2: w, y1: y / 100 * h, y2: y / 100 * h,
      stroke: ACCENT, 'stroke-width': 1.5, 'stroke-dasharray': '10 6', 'stroke-opacity': 0.9,
    }));
  }
  // 右端に縦幅の寸法線
  const bracketX = w - 14;
  lines.appendChild(el('line', {
    x1: bracketX, x2: bracketX, y1: front / 100 * h, y2: back / 100 * h,
    stroke: ACCENT, 'stroke-width': 2,
  }));

  layer.append(lines, edgeGroup, labelGroup);
  layer.appendChild(label(bracketX - 4, ((front + back) / 2) / 100 * h, `縦 ${depthM.toFixed(1)}m`, { anchor: 'end', size: 11 }));
  layer.appendChild(label(8, Math.min(back / 100 * h + 16, h - 10), `横 ${widthM.toFixed(1)}m`, { anchor: 'start', size: 11 }));
}
