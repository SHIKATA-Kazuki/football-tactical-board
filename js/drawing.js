/**
 * drawing.js
 *
 * フィールド上に SVG のオーバーレイを重ね、パス・ラン・ドリブルの矢印や
 * ゾーンを描けるようにする。
 *
 * 座標はすべてフィールドに対する % で保存し、描画時にピクセルへ変換する。
 * （矢じりが縦横比で歪まないよう、viewBox はフィールドの実ピクセルに合わせる）
 *
 * レイヤー順（下から）:
 *   ピッチのライン → [SVG: analysis → drawings → preview] → 選手 → ボール
 *
 * エクスポート:
 *   initDrawing()
 *   getOverlayLayer(name)          'analysis' | 'drawings' | 'preview'
 *   getFieldSize()                 { w, h }（px）
 *   setTool(tool) / getTool()      'move' | 'pass' | 'run' | 'dribble' | 'zone' | 'eraser'
 *   setColor(color) / getColor()
 *   getDrawings() / setDrawings(list) / clearDrawings()
 *   onDrawingStateChange(cb)
 */

import { commit } from './bus.js';

const SVG_NS = 'http://www.w3.org/2000/svg';

export const DRAW_COLORS = ['#ffffff', '#ffd23f', '#ff5a5f', '#4cc9f0'];

/** @typedef {{ t:'pass'|'run'|'dribble'|'zone', c:string, p:[number,number,number,number] }} Shape */

/** @type {Shape[]} */
let shapes = [];
let tool   = 'move';
let color  = DRAW_COLORS[0];

let field = null;
let svg   = null;
const layers = {};
const listeners = [];

// ─── 公開 API ────────────────────────────────────────────────────────────────

export function getOverlayLayer(name) {
  return layers[name];
}

export function getFieldSize() {
  return { w: field?.clientWidth ?? 0, h: field?.clientHeight ?? 0 };
}

export function getTool()  { return tool; }
export function getColor() { return color; }

export function setTool(next) {
  tool = next;
  field?.classList.toggle('is-drawing', tool !== 'move');
  field?.classList.toggle('is-erasing', tool === 'eraser');
  notify();
}

export function setColor(next) {
  color = next;
  notify();
}

/** @returns {Shape[]} */
export function getDrawings() {
  return shapes.map(s => ({ t: s.t, c: s.c, p: [...s.p] }));
}

/** @param {Shape[]} list */
export function setDrawings(list = []) {
  shapes = list
    .filter(s => s && Array.isArray(s.p) && s.p.length === 4)
    .map(s => ({ t: s.t, c: s.c, p: s.p.map(Number) }));
  render();
}

export function clearDrawings() {
  if (!shapes.length) return;
  shapes = [];
  render();
  commit();
}

/** ツール・色が変わったときに呼ばれる（ツールバーの表示更新用） */
export function onDrawingStateChange(cb) {
  listeners.push(cb);
}

function notify() {
  listeners.forEach(cb => cb({ tool, color }));
}

// ─── 初期化 ──────────────────────────────────────────────────────────────────

export function initDrawing() {
  field = document.getElementById('field');
  if (!field) return;

  svg = document.createElementNS(SVG_NS, 'svg');
  svg.classList.add('board-overlay');
  svg.setAttribute('aria-hidden', 'true');
  for (const name of ['analysis', 'drawings', 'preview']) {
    const g = document.createElementNS(SVG_NS, 'g');
    g.classList.add(`layer-${name}`);
    svg.appendChild(g);
    layers[name] = g;
  }

  // 選手より下に置く（選手ノードは後から append されるので、最初の選手の前へ）
  const firstPlayer = field.querySelector('.player');
  field.insertBefore(svg, firstPlayer);

  new ResizeObserver(() => {
    resizeSvg();
    render();
  }).observe(field);
  resizeSvg();

  attachPointerHandlers();
}

function resizeSvg() {
  const { w, h } = getFieldSize();
  svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
  svg.setAttribute('width',  w);
  svg.setAttribute('height', h);
}

// ─── 入力 ────────────────────────────────────────────────────────────────────

const round1 = v => Math.round(v * 10) / 10;

function toPercent(e) {
  const rect = field.getBoundingClientRect();
  return [
    round1(Math.min(100, Math.max(0, (e.clientX - rect.left) / rect.width  * 100))),
    round1(Math.min(100, Math.max(0, (e.clientY - rect.top)  / rect.height * 100))),
  ];
}

function attachPointerHandlers() {
  let draft = null;
  let pointerId = null;

  svg.addEventListener('pointerdown', e => {
    if (tool === 'move') return;
    e.preventDefault();
    e.stopPropagation();   // フィールド長押し（選手名トグル）と競合させない

    if (tool === 'eraser') {
      const hit = e.target.closest('[data-idx]');
      if (hit) {
        shapes.splice(Number(hit.dataset.idx), 1);
        render();
        commit();
      }
      return;
    }

    svg.setPointerCapture(e.pointerId);
    pointerId = e.pointerId;
    const [x, y] = toPercent(e);
    draft = { t: tool, c: color, p: [x, y, x, y] };
  });

  svg.addEventListener('pointermove', e => {
    if (!draft || e.pointerId !== pointerId) return;
    const [x, y] = toPercent(e);
    draft.p[2] = x;
    draft.p[3] = y;
    renderPreview(draft);
  });

  const finish = e => {
    if (!draft || e.pointerId !== pointerId) return;
    const { w, h } = getFieldSize();
    const [x1, y1, x2, y2] = draft.p;
    const lengthPx = Math.hypot((x2 - x1) / 100 * w, (y2 - y1) / 100 * h);
    if (e.type === 'pointerup' && lengthPx > 12) {
      shapes.push(draft);
      commit();
    }
    draft = null;
    pointerId = null;
    layers.preview.replaceChildren();
    render();
  };
  svg.addEventListener('pointerup',     finish);
  svg.addEventListener('pointercancel', finish);
}

// ─── 描画 ────────────────────────────────────────────────────────────────────

function el(name, attrs = {}) {
  const node = document.createElementNS(SVG_NS, name);
  for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, v);
  return node;
}

function render() {
  if (!svg) return;
  const g = layers.drawings;
  g.replaceChildren();
  shapes.forEach((shape, idx) => g.appendChild(buildShape(shape, idx)));
}

function renderPreview(shape) {
  layers.preview.replaceChildren(buildShape(shape, null));
}

/**
 * @param {Shape} shape
 * @param {number|null} idx  null = プレビュー（当たり判定なし）
 */
function buildShape(shape, idx) {
  const { w, h } = getFieldSize();
  const [x1, y1, x2, y2] = [shape.p[0] / 100 * w, shape.p[1] / 100 * h, shape.p[2] / 100 * w, shape.p[3] / 100 * h];
  const group = el('g', { class: `shape shape-${shape.t}` });
  if (idx !== null) group.dataset.idx = String(idx);

  if (shape.t === 'zone') {
    const rect = {
      x: Math.min(x1, x2), y: Math.min(y1, y2),
      width: Math.abs(x2 - x1), height: Math.abs(y2 - y1),
      rx: 10,
    };
    group.appendChild(el('rect', {
      ...rect,
      fill: shape.c, 'fill-opacity': 0.16,
      stroke: shape.c, 'stroke-width': 1.5, 'stroke-dasharray': '5 4',
    }));
    return group;
  }

  const len = Math.hypot(x2 - x1, y2 - y1);
  if (len < 1) return group;
  const ux = (x2 - x1) / len;
  const uy = (y2 - y1) / len;
  const head = 11;
  // 線の終点は矢じりの付け根まで（太線が矢じりからはみ出さないように）
  const bx = x2 - ux * head * 0.8;
  const by = y2 - uy * head * 0.8;

  // 当たり判定用の太い透明線（消しゴムで拾いやすく）
  if (idx !== null) {
    group.appendChild(el('line', {
      x1, y1, x2, y2, stroke: 'transparent', 'stroke-width': 16, class: 'hit',
    }));
  }

  const common = { fill: 'none', stroke: shape.c, 'stroke-width': 2.5, 'stroke-linecap': 'round' };

  if (shape.t === 'dribble') {
    group.appendChild(el('path', { ...common, d: wavyPath(x1, y1, bx, by), 'stroke-linejoin': 'round' }));
  } else {
    group.appendChild(el('line', {
      ...common, x1, y1, x2: bx, y2: by,
      ...(shape.t === 'run' ? { 'stroke-dasharray': '7 6' } : {}),
    }));
  }

  // 矢じり
  const px = -uy, py = ux;
  const points = [
    [x2, y2],
    [x2 - ux * head + px * head * 0.55, y2 - uy * head + py * head * 0.55],
    [x2 - ux * head - px * head * 0.55, y2 - uy * head - py * head * 0.55],
  ].map(p => p.join(',')).join(' ');
  group.appendChild(el('polygon', { points, fill: shape.c }));

  return group;
}

/** 始点→終点の波線（最後の少しは直線にして矢じりへつなぐ） */
function wavyPath(x1, y1, x2, y2) {
  const len = Math.hypot(x2 - x1, y2 - y1);
  const ux = (x2 - x1) / len, uy = (y2 - y1) / len;
  const px = -uy, py = ux;
  const wave = 14;
  const amp  = 4;
  const straightTail = Math.min(10, len * 0.25);
  const waveLen = Math.max(0, len - straightTail);
  const steps = Math.max(2, Math.floor(waveLen / 3));

  let d = `M ${x1} ${y1}`;
  for (let i = 1; i <= steps; i++) {
    const t = (i / steps) * waveLen;
    const off = Math.sin((t / wave) * Math.PI * 2) * amp;
    d += ` L ${x1 + ux * t + px * off} ${y1 + uy * t + py * off}`;
  }
  d += ` L ${x2} ${y2}`;
  return d;
}
