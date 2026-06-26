/**
 * formation-flick-ui.js
 *
 * スマートフォン向けのフリック操作でフォーメーションを選択する UI。
 *
 * 呼び出し順:
 *   1. initFlickFormationUI()       ← 先（隠しボタンを DOM に生成）
 *   2. initializeFormationButtons() ← 後（ボタンに click リスナーを登録）
 *
 * フリック UI の構造:
 *   - 3×3 グリッド（中央がプレビュー、外周 8 セルがフォーメーションキー）
 *   - キーを押しながらフリックすると方向ごとのフォーメーションを選択
 *   - 選択確定時、隠しボタン経由で ui-events.js の既存ロジックを起動
 */

// ─── フォーメーション定義 ────────────────────────────────────────────────────

/**
 * @typedef {'center'|'top'|'bottom'|'left'|'right'} FlickDir
 *
 * @typedef {Object} FlickFormation
 * @property {FlickDir}     dir   フリック方向
 * @property {string|null}  name  フォーメーション名（null = 未割当）
 * @property {string|null}  img   SVG パス（null = 未割当）
 *
 * @typedef {Object} FlickKey
 * @property {string}           label      グリッドキーのラベル
 * @property {string}           sub        サブラベル（戦術コンセプト等）
 * @property {FlickFormation[]} formations 方向別フォーメーション（5 方向）
 */

/** @type {FlickKey[]} */
const FLICK_KEYS = [
  {
    label: '4231', sub: 'バランス',
    formations: [
      { dir: 'center', name: '4231', img: 'figure/4231.svg' },
      { dir: 'top',    name: '4213', img: 'figure/4213.svg' },
      { dir: 'bottom', name: '4411', img: 'figure/4411.svg' },
      { dir: 'left',   name: null,   img: null },
      { dir: 'right',  name: null,   img: null },
    ],
  },
  {
    label: '442', sub: '堅守速攻',
    formations: [
      { dir: 'center', name: '442',      img: 'figure/442.svg' },
      { dir: 'top',    name: '424',      img: 'figure/424.svg' },
      { dir: 'bottom', name: '442block', img: 'figure/442block.svg' },
      { dir: 'left',   name: null,       img: null },
      { dir: 'right',  name: null,       img: null },
    ],
  },
  {
    label: '442◇', sub: '中央制圧',
    formations: [
      { dir: 'center', name: '442◇', img: 'figure/442_diamond.svg' },
      { dir: 'top',    name: '4114',  img: 'figure/4114.svg' },
      { dir: 'bottom', name: '451',   img: 'figure/451.svg' },
      { dir: 'left',   name: '4132',  img: 'figure/4132.svg' },
      { dir: 'right',  name: '2134',  img: 'figure/2134.svg' },
    ],
  },
  {
    label: '433', sub: '保持',
    formations: [
      { dir: 'center', name: '4123', img: 'figure/4123.svg' },
      { dir: 'top',    name: '235',  img: 'figure/235.svg' },
      { dir: 'bottom', name: '4141', img: 'figure/4141.svg' },
      { dir: 'left',   name: '460',  img: 'figure/460.svg' },
      { dir: 'right',  name: '433',  img: 'figure/433.svg' },
    ],
  },
  {
    label: '3421', sub: '安定型',
    formations: [
      { dir: 'center', name: '3421',  img: 'figure/3421.svg' },
      { dir: 'top',    name: '325',   img: 'figure/325.svg' },
      { dir: 'bottom', name: '541',   img: 'figure/541.svg' },
      { dir: 'left',   name: '343',   img: 'figure/343.svg' },
      { dir: 'right',  name: '3421R', img: 'figure/3421.svg' },
    ],
  },
  {
    label: '352', sub: '可変式',
    formations: [
      { dir: 'center', name: '352W', img: 'figure/352W.svg' },
      { dir: 'top',    name: '334',  img: 'figure/334.svg' },
      { dir: 'bottom', name: '532',  img: 'figure/532.svg' },
      { dir: 'left',   name: '352M', img: 'figure/352M.svg' },
      { dir: 'right',  name: null,   img: null },
    ],
  },
  {
    label: '343◇', sub: '超攻撃的',
    formations: [
      { dir: 'center', name: '343◇', img: 'figure/343_diamond.svg' },
      { dir: 'top',    name: null,    img: null },
      { dir: 'bottom', name: null,    img: null },
      { dir: 'left',   name: null,    img: null },
      { dir: 'right',  name: null,    img: null },
    ],
  },
  {
    label: '日本', sub: 'misc',
    formations: [
      { dir: 'center', name: '3421',    img: 'uniform/japan2026_home.svg' },
      { dir: 'left',   name: '343◇jp', img: 'figure/343_diamond.svg' },
      { dir: 'right',  name: '541',     img: 'figure/541.svg' },
      { dir: 'top',    name: '352Mjp',  img: 'figure/352M.svg' },
      { dir: 'bottom', name: '4123jp',  img: 'figure/4123.svg' },
    ],
  },
];

// 3×3 グリッドの中央（index=4）を除いた 8 セルと FLICK_KEYS のマッピング
const KEY_POSITIONS = [0, 1, 2, 3, 5, 6, 7, 8];

/** @type {FlickDir[]} */
const ALL_DIRS = ['center', 'top', 'bottom', 'left', 'right'];

// ─── ユーティリティ ──────────────────────────────────────────────────────────

/** @param {FlickFormation|null|undefined} f @returns {string|null} */
function toImgSrc(f) { return f?.img ?? null; }

/**
 * 内部フォーメーション名を表示用ラベルに変換する。
 * @param {string|null} name
 * @returns {string}
 */
function toLabel(name) {
  if (!name) return '—';
  return name.replace('_diamond', '◇').replace('block', 'B');
}

// ─── CSS 注入 ────────────────────────────────────────────────────────────────

// スタイルは style.css 側で定義することを推奨。
// 動的に追加が必要な場合はここに記述する。
const FLICK_CSS = `/* フリックUI は外部 CSS (style.css) で管理 */`;

function injectCSS() {
  if (document.getElementById('flick-ui-css')) return;
  const style = document.createElement('style');
  style.id          = 'flick-ui-css';
  style.textContent = FLICK_CSS;
  document.head.appendChild(style);
}

// ─── DOM 構築 ────────────────────────────────────────────────────────────────

/**
 * フリック UI 全体を構築して container に挿入する。
 *
 * @param {HTMLElement}  container
 * @param {'home'|'away'} side
 */
function buildFlickUI(container, side) {
  console.log(`[FlickUI] buildFlickUI start: side=${side}`);
  container.innerHTML = '';

  // ① 隠しボタン群（initializeFormationButtons の querySelectorAll に引っかかる）
  const hiddenWrap = buildHiddenButtons();
  container.appendChild(hiddenWrap);

  // ② フリック UI 本体
  const wrap = document.createElement('div');
  wrap.className = 'flick-ui';

  const grid = document.createElement('div');
  grid.className = 'flick-grid';

  // 中央プレビューセルを先に作成（attachInteraction で参照）
  const previewRefs = buildPreviewCell();

  for (let cellIdx = 0; cellIdx < 9; cellIdx++) {
    if (cellIdx === 4) {
      grid.appendChild(previewRefs.preview);
    } else {
      const keyIdx = KEY_POSITIONS.indexOf(cellIdx);
      grid.appendChild(buildKeyCell(keyIdx));
    }
  }

  wrap.appendChild(grid);
  container.appendChild(wrap);

  // ③ ポップアップ（body 直下）
  const popup = document.createElement('div');
  popup.className = 'flick-popup';
  document.body.appendChild(popup);

  // ④ インタラクション登録
  attachInteraction({ grid, popup, hiddenWrap, side, ...previewRefs });
}

/**
 * 全フォーメーション名に対応する隠しボタンをまとめたラッパーを作成する。
 * @returns {HTMLDivElement}
 */
function buildHiddenButtons() {
  const wrap = document.createElement('div');
  wrap.setAttribute('aria-hidden', 'true');
  wrap.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden;';

  const allNames = [
    ...new Set(
      FLICK_KEYS.flatMap(k => k.formations.map(f => f.name)).filter(Boolean)
    ),
  ];
  allNames.forEach(name => {
    const btn = document.createElement('button');
    btn.type             = 'button';
    btn.dataset.formation = name;
    wrap.appendChild(btn);
  });

  console.log(`[FlickUI] hidden buttons: ${allNames.length}個`);
  return wrap;
}

/**
 * 中央プレビューセルを作成する。
 * @returns {{ preview:HTMLElement, previewImg:HTMLImageElement, previewLabel:HTMLElement, previewPlaceholder:HTMLElement }}
 */
function buildPreviewCell() {
  const preview      = document.createElement('div');
  preview.className  = 'flick-preview';

  const inner        = document.createElement('div');
  inner.className    = 'flick-preview-inner';

  const previewImg   = document.createElement('img');
  previewImg.className  = 'flick-preview-img';
  previewImg.alt        = '';
  previewImg.draggable  = false;
  previewImg.style.display = 'none';

  const previewLabel = document.createElement('span');
  previewLabel.className    = 'flick-preview-label';
  previewLabel.style.display = 'none';

  const previewPlaceholder = document.createElement('span');
  previewPlaceholder.className = 'flick-preview-placeholder';

  inner.appendChild(previewImg);
  inner.appendChild(previewPlaceholder);
  preview.appendChild(inner);

  return { preview, previewImg, previewLabel, previewPlaceholder };
}

/**
 * フォーメーションキーセルを作成する。
 * center フォーメーションの SVG を背景として薄く表示する。
 *
 * @param {number} keyIdx
 * @returns {HTMLElement}
 */
function buildKeyCell(keyIdx) {
  const k = FLICK_KEYS[keyIdx];

  const key            = document.createElement('div');
  key.className        = 'flick-key';
  key.dataset.idx      = String(keyIdx);

  const centerFormation = k.formations.find(f => f.dir === 'center');
  const imgSrc          = toImgSrc(centerFormation);
  if (imgSrc) {
    const img       = document.createElement('img');
    img.className   = 'flick-key-img';
    img.src         = imgSrc;
    img.alt         = '';
    img.draggable   = false;
    key.appendChild(img);
  }

  const inner = document.createElement('div');
  inner.className = 'flick-key-inner';

  const main  = document.createElement('span');
  main.className = 'flick-key-main';

  const sub   = document.createElement('span');
  sub.className    = 'flick-key-sub';
  sub.textContent  = k.sub;

  inner.appendChild(main);
  inner.appendChild(sub);
  key.appendChild(inner);

  return key;
}

// ─── インタラクション ────────────────────────────────────────────────────────

const FLICK_THRESHOLD = 18;   // フリック判定の最低移動距離（px）

/**
 * グリッドにフリック操作を登録する。
 *
 * @param {Object} refs
 * @param {HTMLElement}      refs.grid
 * @param {HTMLElement}      refs.popup
 * @param {HTMLElement}      refs.hiddenWrap
 * @param {HTMLImageElement} refs.previewImg
 * @param {HTMLElement}      refs.previewLabel
 * @param {HTMLElement}      refs.previewPlaceholder
 * @param {'home'|'away'}    refs.side
 */
function attachInteraction({ grid, popup, hiddenWrap, previewImg, previewLabel, previewPlaceholder, side }) {
  let activeIdx = null;
  let flickDir  = null;
  let startX = 0;
  let startY = 0;

  // ── ポインター開始 ──────────────────────────────────────────────────────────
  function onStart(idx, touchX, touchY, popX, popY) {
    activeIdx = idx;
    flickDir  = 'center';
    startX    = touchX;
    startY    = touchY;

    grid.querySelectorAll('.flick-key').forEach(k => {
      k.classList.toggle('is-active', +k.dataset.idx === idx);
    });
    renderPopup(idx, popX, popY, 'center');
  }

  // ── ポインター移動 ──────────────────────────────────────────────────────────
  function onMove(x, y) {
    if (activeIdx === null) return;

    const dx   = x - startX;
    const dy   = y - startY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    let dir;

    if (dist < FLICK_THRESHOLD) {
      dir = 'center';
    } else {
      const angle = Math.atan2(dy, dx) * 180 / Math.PI;
      if      (angle > -45  && angle <=  45)  dir = 'right';
      else if (angle >  45  && angle <= 135)  dir = 'bottom';
      else if (angle >  135 || angle <= -135) dir = 'left';
      else                                    dir = 'top';
    }

    if (dir !== flickDir) {
      flickDir = dir;
      highlightPopup(dir);
    }
  }

  // ── ポインター終了 ──────────────────────────────────────────────────────────
  function onEnd() {
    if (activeIdx === null) return;

    const f = FLICK_KEYS[activeIdx].formations.find(f => f.dir === flickDir);
    if (f?.name) triggerFormation(f.name);

    popup.classList.remove('is-visible');
    grid.querySelectorAll('.flick-key').forEach(k => k.classList.remove('is-active'));
    activeIdx = null;
    flickDir  = null;
  }

  // ── フォーメーション確定 ────────────────────────────────────────────────────
  function triggerFormation(name) {
    // 中央プレビューを更新
    const selectedKey = FLICK_KEYS.find(k => k.formations.some(f => f.name === name));
    const selectedF   = selectedKey?.formations.find(f => f.name === name);
    const src         = toImgSrc(selectedF);

    if (src) {
      previewImg.src               = src;
      previewImg.style.display     = 'block';
      previewLabel.textContent     = toLabel(name);
      previewLabel.style.display   = 'block';
      previewPlaceholder.style.display = 'none';
    }

    // 選択済みキーをハイライト
    grid.querySelectorAll('.flick-key').forEach(k => {
      const idx = +k.dataset.idx;
      k.classList.toggle('is-selected',
        FLICK_KEYS[idx].formations.some(f => f.name === name)
      );
    });

    // 隠しボタンをクリックして ui-events.js の既存ロジックを起動
    const btn = hiddenWrap.querySelector(`button[data-formation="${name}"]`);
    if (btn) {
      btn.click();
      console.log(`[FlickUI] triggered: ${name}`);
    } else {
      console.warn(`[FlickUI] hidden button not found: ${name}`);
    }
  }

  // ── ポップアップ描画 ────────────────────────────────────────────────────────
  function renderPopup(idx, x, y, highlightDir) {
    const key = FLICK_KEYS[idx];
    popup.innerHTML = '';

    ALL_DIRS.forEach(dir => {
      const f    = key.formations.find(f => f.dir === dir);
      const cell = document.createElement('div');
      cell.className   = 'flick-pcell';
      cell.dataset.dir = dir;

      if (!f?.name) {
        cell.classList.add('is-empty');
        cell.textContent = '—';
      } else {
        const src = toImgSrc(f);
        if (src) {
          const img     = document.createElement('img');
          img.className = 'flick-pcell-img';
          img.src       = src;
          img.alt       = '';
          img.draggable = false;
          cell.appendChild(img);
        }
        const label        = document.createElement('span');
        label.className    = 'flick-pcell-label';
        label.textContent  = toLabel(f.name);
        cell.appendChild(label);

        if (dir === highlightDir) cell.classList.add('is-highlight');
      }
      popup.appendChild(cell);
    });

    popup.style.left = `${x - 400 / 3}px`;
    popup.style.top  = `${y - 400 / 3}px`;
    popup.classList.add('is-visible');
  }

  function highlightPopup(dir) {
    popup.querySelectorAll('.flick-pcell').forEach(c => {
      c.classList.toggle(
        'is-highlight',
        c.dataset.dir === dir && !c.classList.contains('is-empty')
      );
    });
  }

  // ポップアップは画面中央に固定、フリック判定はタッチ開始点を基準
  function getPopupCenter() {
    return { x: window.innerWidth / 2, y: window.innerHeight / 2 };
  }

  // ── イベントリスナー登録 ────────────────────────────────────────────────────
  grid.addEventListener('mousedown', e => {
    const key = e.target.closest('.flick-key');
    if (!key) return;
    e.preventDefault();
    const { x, y } = getPopupCenter();
    onStart(+key.dataset.idx, e.clientX, e.clientY, x, y);
  });

  grid.addEventListener('touchstart', e => {
    const key = e.target.closest('.flick-key');
    if (!key) return;
    e.preventDefault();
    const { x, y } = getPopupCenter();
    onStart(+key.dataset.idx, e.touches[0].clientX, e.touches[0].clientY, x, y);
  }, { passive: false });

  document.addEventListener('mousemove', e => onMove(e.clientX, e.clientY));

  document.addEventListener('touchmove', e => {
    if (activeIdx === null) return;
    e.preventDefault();
    onMove(e.touches[0].clientX, e.touches[0].clientY);
  }, { passive: false });

  document.addEventListener('mouseup',  onEnd);
  document.addEventListener('touchend', onEnd);
}

// ─── エントリポイント ────────────────────────────────────────────────────────

/**
 * ホーム / アウェイの両コンテナにフリック UI を構築する。
 * main.js の DOMContentLoaded 内で initializeFormationButtons() より先に呼ぶこと。
 */
export function initFlickFormationUI() {
  injectCSS();

  const homeEl = document.querySelector('.home-formations');
  const awayEl = document.querySelector('.away-formations');

  if (homeEl) {
    buildFlickUI(homeEl, 'home');
  } else {
    console.warn('[FlickUI] .home-formations が見つかりません');
  }

  if (awayEl) {
    buildFlickUI(awayEl, 'away');
  } else {
    console.warn('[FlickUI] .away-formations が見つかりません');
  }
}
