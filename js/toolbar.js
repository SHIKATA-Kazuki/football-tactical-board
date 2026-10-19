/**
 * toolbar.js
 *
 * フィールド横のツールレール（スマホではフィールド下の横並び）を組み立てる。
 * 各機能モジュールの状態変化を購読して、ボタンの表示を同期する。
 */

import { setTool, setColor, getTool, getColor, clearDrawings, onDrawingStateChange, DRAW_COLORS } from './drawing.js';
import { getBallState, setBallVisible, setBallLinked, onBallStateChange } from './ball.js';
import { isAnalysisVisible, setAnalysisVisible, onAnalysisChange } from './analysis.js';
import { PHASE_COUNT, selectPhase, savePhase, togglePlayback, onPhasesChange, getActivePhase, getPhases } from './phases.js';
import { undo, redo } from './history.js';
import { clearManualPositions } from './ui-events.js';
import { copyShareLink } from './share.js';
import { saveFieldImage } from './export-image.js';
import { commit } from './bus.js';

// ─── アイコン（24×24、線は currentColor）──────────────────────────────────────

const ICONS = {
  move:     '<path d="M6 3l12 9-5.5 1.2L15 19l-2.6 1.2-2.6-5.9L6 18z"/>',
  pass:     '<path d="M4 20L19 5"/><path d="M11 5h8v8"/>',
  run:      '<path d="M4 20L19 5" stroke-dasharray="3.2 3"/><path d="M11 5h8v8"/>',
  dribble:  '<path d="M3 17c1.6-3 3.2-3 4.8 0s3.2 3 4.8 0 3.2-3 4.8 0"/><path d="M17 12.5l4 4.5-5 1.5"/>',
  zone:     '<rect x="3.5" y="5.5" width="17" height="13" rx="3" stroke-dasharray="3 2.6"/>',
  eraser:   '<path d="M14.5 4.5l5 5L10 19H5.5l-2-2z"/><path d="M9 10l5 5"/><path d="M13 20h7"/>',
  clear:    '<path d="M4 7h16"/><path d="M9 7V4.5h6V7"/><path d="M6.5 7l1 13h9l1-13"/>',
  ball:     '<circle cx="12" cy="12" r="8.5"/><path d="M12 8.2l3.4 2.5-1.3 4h-4.2l-1.3-4z"/><path d="M12 3.5v4.7M15.4 10.7l4.3-1.4M14.1 14.7l2.6 3.7M9.9 14.7l-2.6 3.7M8.6 10.7L4.3 9.3"/>',
  link:     '<circle cx="12" cy="12" r="3.2"/><path d="M3 12h4.5M16.5 12H21"/><path d="M5.5 9.5L3 12l2.5 2.5M18.5 9.5L21 12l-2.5 2.5"/>',
  measure:  '<path d="M3 16.5L16.5 3 21 7.5 7.5 21z"/><path d="M7 13l2 2M10 10l2 2M13 7l2 2"/>',
  names:    '<path d="M3.5 12.2V4.5h7.7l9.3 9.3-7.7 7.7z"/><circle cx="8" cy="9" r="1.4"/>',
  undo:     '<path d="M9 4L4 9l5 5"/><path d="M4 9h10a5.5 5.5 0 010 11h-4"/>',
  redo:     '<path d="M15 4l5 5-5 5"/><path d="M20 9H10a5.5 5.5 0 000 11h4"/>',
  unpin:    '<path d="M4 12a8 8 0 0113.7-5.6L20 9"/><path d="M20 4v5h-5"/><path d="M20 12a8 8 0 01-13.7 5.6L4 15"/><path d="M4 20v-5h5"/>',
  share:    '<path d="M10 14a4.5 4.5 0 006.4 0l3-3a4.5 4.5 0 00-6.4-6.4l-1 1"/><path d="M14 10a4.5 4.5 0 00-6.4 0l-3 3a4.5 4.5 0 006.4 6.4l1-1"/>',
  image:    '<rect x="3.5" y="4.5" width="17" height="15" rx="2"/><circle cx="9" cy="10" r="1.8"/><path d="M20.5 16l-5-5-8.5 8.5"/>',
  save:     '<path d="M12 4v11"/><path d="M7.5 10.5L12 15l4.5-4.5"/><path d="M4.5 19.5h15"/>',
  play:     '<path d="M8 5v14l11-7z" fill="currentColor"/>',
  stop:     '<rect x="6.5" y="6.5" width="11" height="11" rx="1.5" fill="currentColor"/>',
};

const icon = name =>
  `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name]}</svg>`;

// ─── DOM ヘルパー ────────────────────────────────────────────────────────────

function button({ id, label, caption = label, iconName, onClick, pressed }) {
  const b = document.createElement('button');
  b.type = 'button';
  b.className = 'tool-btn';
  if (id) b.dataset.id = id;
  b.setAttribute('aria-label', label);
  b.title = label;
  if (pressed !== undefined) b.setAttribute('aria-pressed', String(pressed));
  b.innerHTML = `${icon(iconName)}<span class="tool-caption">${caption}</span>`;
  b.addEventListener('click', onClick);
  return b;
}

function group(title, children, extraClass = '') {
  const section = document.createElement('section');
  section.className = `tool-group ${extraClass}`.trim();
  section.setAttribute('aria-label', title);
  const h = document.createElement('h3');
  h.className = 'tool-title';
  h.textContent = title;
  const grid = document.createElement('div');
  grid.className = 'tool-grid';
  grid.append(...children);
  section.append(h, grid);
  return section;
}

// ─── 組み立て ────────────────────────────────────────────────────────────────

const TOOLS = [
  { id: 'move',    label: '選手を動かす', caption: '動かす' },
  { id: 'pass',    label: 'パスの矢印',   caption: 'パス' },
  { id: 'run',     label: 'ランの矢印',   caption: 'ラン' },
  { id: 'dribble', label: 'ドリブルの矢印', caption: 'ドリブル' },
  { id: 'zone',    label: 'ゾーン',       caption: 'ゾーン' },
  { id: 'eraser',  label: '消しゴム',     caption: '消す' },
];

const COLOR_NAMES = ['白', '黄', '赤', '水色'];

export function initToolbar() {
  const field = document.getElementById('field');
  if (!field) return;

  const rail = document.createElement('aside');
  rail.id = 'board-tools';
  rail.setAttribute('aria-label', '作戦ボードの道具');

  // ── 描く ─────────────────────────────────────────────────────────────────────
  const toolButtons = TOOLS.map(t => button({
    id: `tool-${t.id}`, label: t.label, caption: t.caption, iconName: t.id, pressed: t.id === getTool(),
    onClick: () => setTool(t.id),
  }));

  const swatches = DRAW_COLORS.map((c, i) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'swatch';
    b.style.setProperty('--swatch', c);
    b.setAttribute('aria-label', `線の色: ${COLOR_NAMES[i]}`);
    b.title = `線の色: ${COLOR_NAMES[i]}`;
    b.setAttribute('aria-pressed', String(c === getColor()));
    b.addEventListener('click', () => {
      setColor(c);
      if (getTool() === 'move' || getTool() === 'eraser') setTool('pass');
    });
    return b;
  });
  const swatchRow = document.createElement('div');
  swatchRow.className = 'swatch-row';
  swatchRow.append(...swatches);

  const clearBtn = button({ label: '線を全部消す', caption: '全消去', iconName: 'clear', onClick: clearDrawings });

  // ── 表示 ─────────────────────────────────────────────────────────────────────
  const ballBtn = button({
    label: 'ボール', iconName: 'ball', pressed: getBallState().show,
    onClick: () => setBallVisible(!getBallState().show),
  });
  const linkBtn = button({
    label: 'ボール連動', caption: '連動', iconName: 'link', pressed: getBallState().link,
    onClick: () => setBallLinked(!getBallState().link),
  });
  const measureBtn = button({
    label: '距離', iconName: 'measure', pressed: isAnalysisVisible(),
    onClick: () => { setAnalysisVisible(!isAnalysisVisible()); commit(); },
  });
  const namesBtn = button({
    label: '選手名', iconName: 'names', pressed: field.classList.contains('field-show-names'),
    onClick: () => {
      field.classList.toggle('field-show-names');
      syncNames();
      commit();
    },
  });

  // ── 局面 ─────────────────────────────────────────────────────────────────────
  const slotButtons = Array.from({ length: PHASE_COUNT }, (_, i) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'phase-slot';
    b.textContent = String(i + 1);
    b.setAttribute('aria-label', `局面 ${i + 1}`);
    b.addEventListener('click', () => selectPhase(i));
    return b;
  });
  const slotRow = document.createElement('div');
  slotRow.className = 'phase-row';
  slotRow.append(...slotButtons);

  const saveBtn = button({ label: '局面を保存', caption: '保存', iconName: 'save', onClick: savePhase });
  const playBtn = button({ label: '再生', iconName: 'play', onClick: togglePlayback });

  // ── 操作 ─────────────────────────────────────────────────────────────────────
  const undoBtn  = button({ label: '元に戻す', caption: '戻す', iconName: 'undo', onClick: undo });
  const redoBtn  = button({ label: 'やり直す', iconName: 'redo', onClick: redo });
  const unpinBtn = button({ label: '配置を戻す', caption: '配置解除', iconName: 'unpin', onClick: clearManualPositions });
  undoBtn.disabled = true;
  redoBtn.disabled = true;
  unpinBtn.title = 'ドラッグや局面で固定した位置を解除し、フォーメーションどおりに戻す';

  // ── 書き出し ─────────────────────────────────────────────────────────────────
  const shareBtn = button({ label: 'リンク', iconName: 'share', onClick: copyShareLink });
  shareBtn.title = '盤面ごと共有できるリンクをコピー';
  const imageBtn = button({ label: '画像保存', caption: '画像', iconName: 'image', onClick: saveFieldImage });

  rail.append(
    group('描く', [...toolButtons, clearBtn], 'group-draw'),
    group('線の色', [swatchRow], 'group-color'),
    group('表示', [ballBtn, linkBtn, measureBtn, namesBtn], 'group-view'),
    group('局面', [slotRow, saveBtn, playBtn], 'group-phase'),
    group('操作', [undoBtn, redoBtn, unpinBtn], 'group-edit'),
    group('書き出し', [shareBtn, imageBtn], 'group-export'),
  );

  field.after(rail);

  // ── 状態の購読 ───────────────────────────────────────────────────────────────
  onDrawingStateChange(({ tool, color }) => {
    toolButtons.forEach((b, i) => b.setAttribute('aria-pressed', String(TOOLS[i].id === tool)));
    swatches.forEach((b, i) => b.setAttribute('aria-pressed', String(DRAW_COLORS[i] === color)));
  });

  onBallStateChange(({ show, link }) => {
    ballBtn.setAttribute('aria-pressed', String(show));
    linkBtn.setAttribute('aria-pressed', String(link));
  });

  onAnalysisChange(v => measureBtn.setAttribute('aria-pressed', String(v)));

  function syncNames() {
    namesBtn.setAttribute('aria-pressed', String(field.classList.contains('field-show-names')));
  }
  // 長押しや状態復元で切り替わった場合にも追従
  new MutationObserver(syncNames).observe(field, { attributes: true, attributeFilter: ['class'] });

  const renderPhases = ({ phases, active, playing }) => {
    slotButtons.forEach((b, i) => {
      b.classList.toggle('is-filled', !!phases[i]);
      b.setAttribute('aria-pressed', String(i === active));
    });
    playBtn.innerHTML = `${icon(playing ? 'stop' : 'play')}<span class="tool-caption">${playing ? '停止' : '再生'}</span>`;
    playBtn.setAttribute('aria-label', playing ? '停止' : '再生');
    playBtn.title = playing ? '停止' : '保存した局面を順に再生';
  };
  onPhasesChange(renderPhases);
  renderPhases({ phases: getPhases(), active: getActivePhase(), playing: false });

  document.addEventListener('history:change', e => {
    undoBtn.disabled = !e.detail.canUndo;
    redoBtn.disabled = !e.detail.canRedo;
  });

  // Esc で「選手を動かす」に戻す
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && getTool() !== 'move') setTool('move');
  });
}
