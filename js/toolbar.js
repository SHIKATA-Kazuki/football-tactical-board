/**
 * toolbar.js
 *
 * 道具は「よく使うものだけの細い帯」と「⋯ で開くシート」に分ける。
 *   帯   : 動かす・パス・ラン・ドリブル・ゾーン・消す・色・戻す・やり直す・⋯
 *          スマホはフィールドの下に 1 行、iPad / PC はフィールドの横に 1 列。
 *   シート: ボール・連動・距離・選手名・局面・全消去・配置解除・リンク・画像
 *          画面のレイアウトを押し広げないよう、上に重ねて表示する。
 *
 * どの画面でもスクロールなしで盤面を操作できることを優先している。
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
import { GK_PRESETS, getGkColors, setGkColor, onGkColorChange } from './gk-colors.js';

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
  more:     '<circle cx="5.5" cy="12" r="1.6" fill="currentColor"/><circle cx="12" cy="12" r="1.6" fill="currentColor"/><circle cx="18.5" cy="12" r="1.6" fill="currentColor"/>',
  close:    '<path d="M6 6l12 12M18 6L6 18"/>',
};

const icon = name =>
  `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name]}</svg>`;

// ─── DOM ヘルパー ────────────────────────────────────────────────────────────

/** 帯のボタン（アイコンのみ。名前は aria-label と title） */
function stripButton({ id, label, iconName, onClick, pressed }) {
  const b = document.createElement('button');
  b.type = 'button';
  b.className = 'strip-btn';
  if (id) b.dataset.id = id;
  b.setAttribute('aria-label', label);
  b.title = label;
  if (pressed !== undefined) b.setAttribute('aria-pressed', String(pressed));
  b.innerHTML = icon(iconName);
  b.addEventListener('click', onClick);
  return b;
}

/** シートのボタン（アイコン＋文字） */
function sheetButton({ label, caption = label, iconName, onClick, pressed }) {
  const b = document.createElement('button');
  b.type = 'button';
  b.className = 'sheet-btn';
  b.setAttribute('aria-label', label);
  b.title = label;
  if (pressed !== undefined) b.setAttribute('aria-pressed', String(pressed));
  b.innerHTML = `${icon(iconName)}<span>${caption}</span>`;
  b.addEventListener('click', onClick);
  return b;
}

function section(title, children) {
  const s = document.createElement('section');
  s.className = 'sheet-section';
  s.setAttribute('aria-label', title);
  const h = document.createElement('h3');
  h.textContent = title;
  const grid = document.createElement('div');
  grid.className = 'sheet-grid';
  grid.append(...children);
  s.append(h, grid);
  return s;
}

function divider() {
  const d = document.createElement('span');
  d.className = 'strip-divider';
  d.setAttribute('aria-hidden', 'true');
  return d;
}

// ─── 組み立て ────────────────────────────────────────────────────────────────

const TOOLS = [
  { id: 'move',    label: '選手を動かす' },
  { id: 'pass',    label: 'パスの矢印' },
  { id: 'run',     label: 'ランの矢印' },
  { id: 'dribble', label: 'ドリブルの矢印' },
  { id: 'zone',    label: 'ゾーン' },
  { id: 'eraser',  label: '消しゴム' },
];
const COLOR_NAMES = ['白', '黄', '赤', '水色'];

export function initToolbar() {
  const field = document.getElementById('field');
  if (!field) return;

  // ── 帯 ───────────────────────────────────────────────────────────────────────
  const strip = document.createElement('div');
  strip.id = 'board-tools';
  strip.setAttribute('role', 'toolbar');
  strip.setAttribute('aria-label', '作戦ボードの道具');

  const toolButtons = TOOLS.map(t => stripButton({
    id: `tool-${t.id}`, label: t.label, iconName: t.id, pressed: t.id === getTool(),
    onClick: () => setTool(t.id),
  }));

  // 色は 1 つのボタンで順に切り替える（帯の幅を節約）
  const colorBtn = document.createElement('button');
  colorBtn.type = 'button';
  colorBtn.className = 'strip-btn color-btn';
  colorBtn.innerHTML = '<span class="color-dot" aria-hidden="true"></span>';
  colorBtn.addEventListener('click', () => {
    const i = DRAW_COLORS.indexOf(getColor());
    setColor(DRAW_COLORS[(i + 1) % DRAW_COLORS.length]);
    if (getTool() === 'move' || getTool() === 'eraser') setTool('pass');
  });
  const syncColor = () => {
    const i = DRAW_COLORS.indexOf(getColor());
    colorBtn.style.setProperty('--swatch', getColor());
    colorBtn.setAttribute('aria-label', `線の色: ${COLOR_NAMES[i]}（押すと切り替え）`);
    colorBtn.title = `線の色: ${COLOR_NAMES[i]}（押すと切り替え）`;
  };
  syncColor();

  const undoBtn = stripButton({ label: '元に戻す', iconName: 'undo', onClick: undo });
  const redoBtn = stripButton({ label: 'やり直す', iconName: 'redo', onClick: redo });
  undoBtn.disabled = true;
  redoBtn.disabled = true;

  const moreBtn = stripButton({ label: 'その他の機能', iconName: 'more', onClick: () => toggleSheet() });
  moreBtn.setAttribute('aria-haspopup', 'dialog');
  moreBtn.setAttribute('aria-expanded', 'false');
  moreBtn.classList.add('more-btn');

  strip.append(...toolButtons, colorBtn, divider(), undoBtn, redoBtn, divider(), moreBtn);
  field.after(strip);

  // ── シート ───────────────────────────────────────────────────────────────────
  const backdrop = document.createElement('div');
  backdrop.className = 'sheet-backdrop';
  backdrop.hidden = true;

  const sheet = document.createElement('div');
  sheet.id = 'board-more';
  sheet.setAttribute('role', 'dialog');
  sheet.setAttribute('aria-label', 'その他の機能');
  sheet.hidden = true;

  const ballBtn = sheetButton({
    label: 'ボール', iconName: 'ball', pressed: getBallState().show,
    onClick: () => setBallVisible(!getBallState().show),
  });
  const linkBtn = sheetButton({
    label: 'ボール連動', caption: '連動', iconName: 'link', pressed: getBallState().link,
    onClick: () => setBallLinked(!getBallState().link),
  });
  const measureBtn = sheetButton({
    label: '距離表示', caption: '距離', iconName: 'measure', pressed: isAnalysisVisible(),
    onClick: () => { setAnalysisVisible(!isAnalysisVisible()); commit(); },
  });
  const namesBtn = sheetButton({
    label: '選手名', iconName: 'names', pressed: field.classList.contains('field-show-names'),
    onClick: () => { field.classList.toggle('field-show-names'); commit(); },
  });

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
  const saveBtn = sheetButton({ label: '局面を保存', caption: '保存', iconName: 'save', onClick: savePhase });
  const playBtn = sheetButton({
    label: '再生', iconName: 'play',
    onClick: () => { togglePlayback(); closeSheet(); },   // 再生中は盤面を見たいので閉じる
  });

  const clearBtn = sheetButton({ label: '線を全部消す', caption: '線を全消去', iconName: 'clear', onClick: clearDrawings });
  const unpinBtn = sheetButton({ label: '配置を戻す', caption: '配置解除', iconName: 'unpin', onClick: clearManualPositions });
  unpinBtn.title = 'ドラッグや局面で固定した位置を解除し、フォーメーションどおりに戻す';

  const shareBtn = sheetButton({ label: '共有リンクをコピー', caption: 'リンク', iconName: 'share', onClick: () => { closeSheet(); copyShareLink(); } });
  const imageBtn = sheetButton({ label: '画像として保存', caption: '画像', iconName: 'image', onClick: () => { closeSheet(); saveFieldImage(); } });

  // ── GK の色（ホーム・アウェイ） ──────────────────────────────────────────────
  const gkRows = ['home', 'away'].map(side => {
    const row = document.createElement('div');
    row.className = 'gk-row';
    const label = document.createElement('span');
    label.className = 'gk-label';
    label.textContent = side === 'home' ? 'ホーム' : 'アウェイ';
    row.appendChild(label);

    const team = document.createElement('button');
    team.type = 'button';
    team.className = 'gk-swatch gk-team';
    team.dataset.color = '';
    team.textContent = '同';
    team.setAttribute('aria-label', `${label.textContent} GK：チームと同じユニフォーム`);
    team.title = 'チームと同じユニフォーム';
    row.appendChild(team);

    for (const { color, name } of GK_PRESETS) {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'gk-swatch';
      b.dataset.color = color;
      b.style.setProperty('--swatch', color);
      b.setAttribute('aria-label', `${label.textContent} GK：${name}`);
      b.title = name;
      row.appendChild(b);
    }

    // 好きな色（端末の色選択）
    const custom = document.createElement('label');
    custom.className = 'gk-swatch gk-custom-pick';
    custom.title = '好きな色を選ぶ';
    const input = document.createElement('input');
    input.type = 'color';
    input.value = '#ffffff';
    input.setAttribute('aria-label', `${label.textContent} GK：好きな色`);
    input.addEventListener('input', () => setGkColor(side, input.value));
    custom.appendChild(input);
    row.appendChild(custom);

    row.addEventListener('click', e => {
      const btn = e.target.closest('button.gk-swatch');
      if (btn) setGkColor(side, btn.dataset.color || null);
    });
    return { side, row, team, custom, input };
  });

  const syncGk = colors => {
    for (const { side, row, custom, input } of gkRows) {
      const current = colors[side];
      let matched = false;
      row.querySelectorAll('button.gk-swatch').forEach(b => {
        const on = (b.dataset.color || null) === current;
        matched ||= on;
        b.setAttribute('aria-pressed', String(on));
      });
      const isCustom = !!current && !matched;
      custom.classList.toggle('is-on', isCustom);
      custom.style.setProperty('--swatch', isCustom ? current : 'transparent');
      if (isCustom) input.value = current;
    }
  };
  onGkColorChange(syncGk);
  syncGk(getGkColors());

  const gkSection = section('GK の色', []);
  gkSection.querySelector('.sheet-grid').replaceWith(...gkRows.map(r => r.row));

  const head = document.createElement('div');
  head.className = 'sheet-head';
  const title = document.createElement('span');
  title.textContent = 'その他の機能';
  const closeBtn = document.createElement('button');
  closeBtn.type = 'button';
  closeBtn.className = 'sheet-close';
  closeBtn.setAttribute('aria-label', '閉じる');
  closeBtn.innerHTML = icon('close');
  closeBtn.addEventListener('click', () => closeSheet());
  head.append(title, closeBtn);

  sheet.append(
    head,
    section('表示', [ballBtn, linkBtn, measureBtn, namesBtn]),
    section('局面', [slotRow, saveBtn, playBtn]),
    section('盤面', [clearBtn, unpinBtn, shareBtn, imageBtn]),
    gkSection,
  );
  document.body.append(backdrop, sheet);

  // ── 開閉 ─────────────────────────────────────────────────────────────────────
  function placeSheet() {
    if (window.matchMedia('(max-width: 600px)').matches) {
      sheet.style.left = sheet.style.top = '';   // スマホは CSS で下端に固定
      return;
    }
    // iPad / PC: 帯の右横（入りきらなければ左横）に出す
    const r = moreBtn.getBoundingClientRect();
    const w = sheet.offsetWidth;
    const h = sheet.offsetHeight;
    const left = r.right + 10 + w <= window.innerWidth ? r.right + 10 : Math.max(8, r.left - 10 - w);
    const top  = Math.min(Math.max(8, r.bottom - h), window.innerHeight - h - 8);
    sheet.style.left = `${left}px`;
    sheet.style.top  = `${top}px`;
  }

  function openSheet() {
    sheet.hidden = false;
    backdrop.hidden = false;
    moreBtn.setAttribute('aria-expanded', 'true');
    placeSheet();
    closeBtn.focus({ preventScroll: true });
  }
  function closeSheet({ restoreFocus = true } = {}) {
    if (sheet.hidden) return;
    sheet.hidden = true;
    backdrop.hidden = true;
    moreBtn.setAttribute('aria-expanded', 'false');
    if (restoreFocus) moreBtn.focus({ preventScroll: true });
  }
  function toggleSheet() {
    if (sheet.hidden) openSheet(); else closeSheet();
  }
  backdrop.addEventListener('pointerdown', e => { e.preventDefault(); closeSheet({ restoreFocus: false }); });
  window.addEventListener('resize', () => { if (!sheet.hidden) placeSheet(); });

  // ── 状態の購読 ───────────────────────────────────────────────────────────────
  onDrawingStateChange(({ tool }) => {
    toolButtons.forEach((b, i) => b.setAttribute('aria-pressed', String(TOOLS[i].id === tool)));
    syncColor();
  });

  const syncIndicators = () => {
    // シート内の表示系がオンなら ⋯ に小さな点を付ける（閉じていても状態が分かるように）
    const anyOn = getBallState().show || isAnalysisVisible() || field.classList.contains('field-show-names');
    moreBtn.classList.toggle('has-active', anyOn);
  };

  onBallStateChange(({ show, link }) => {
    ballBtn.setAttribute('aria-pressed', String(show));
    linkBtn.setAttribute('aria-pressed', String(link));
    syncIndicators();
  });
  onAnalysisChange(v => {
    measureBtn.setAttribute('aria-pressed', String(v));
    syncIndicators();
  });
  new MutationObserver(() => {
    namesBtn.setAttribute('aria-pressed', String(field.classList.contains('field-show-names')));
    syncIndicators();
  }).observe(field, { attributes: true, attributeFilter: ['class'] });

  const renderPhases = ({ phases, active, playing }) => {
    slotButtons.forEach((b, i) => {
      b.classList.toggle('is-filled', !!phases[i]);
      b.setAttribute('aria-pressed', String(i === active));
    });
    playBtn.innerHTML = `${icon(playing ? 'stop' : 'play')}<span>${playing ? '停止' : '再生'}</span>`;
    playBtn.setAttribute('aria-label', playing ? '停止' : '再生');
    playBtn.title = playing ? '停止' : '保存した局面を順に再生';
  };
  onPhasesChange(renderPhases);
  renderPhases({ phases: getPhases(), active: getActivePhase(), playing: false });

  document.addEventListener('history:change', e => {
    undoBtn.disabled = !e.detail.canUndo;
    redoBtn.disabled = !e.detail.canRedo;
  });

  document.addEventListener('keydown', e => {
    if (e.key !== 'Escape') return;
    if (!sheet.hidden) closeSheet();
    else if (getTool() !== 'move') setTool('move');
  });
}
