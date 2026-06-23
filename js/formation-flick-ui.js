/**
 * formation-flick-ui.js
 *
 * 呼び出し順:
 *   initFlickFormationUI();       // ← 先
 *   initializeFormationButtons(); // ← 後
 *
 * config.js の TEAMS / information を直接参照しないが、
 * 隠しボタン経由で ui-events.js の initializeFormationButtons と連携する。
 */

// ─── フォーメーション定義 ───────────────────────────────────────────────────
const FLICK_KEYS = [
  {
    label: '4231', sub: 'バランス',
    formations: [
      { dir: 'center', name: '4231',     img: 'figure/4231.svg'       },
      { dir: 'top',    name: '4213',     img: 'figure/4213.svg'       },
      { dir: 'bottom', name: '4411',     img: 'figure/4411.svg'       },
      { dir: 'left',   name: null,       img: null                    },
      { dir: 'right',  name: null,       img: null                    },
    ],
  },
  {
    label: '442', sub: '堅守速攻',
    formations: [
      { dir: 'center', name: '442',      img: 'figure/442.svg'        },
      { dir: 'top',    name: '424',      img: 'figure/424.svg'        },
      { dir: 'bottom', name: '442block', img: 'figure/442block.svg'   },
      { dir: 'left',   name: null,       img: null                    },
      { dir: 'right',  name: null,       img: null                    },
    ],
  },
  {
    label: '442◇', sub: '中央制圧',
    formations: [
      { dir: 'center', name: '442◇',    img: 'figure/442_diamond.svg' },
      { dir: 'top',    name: '4114',    img: 'figure/4114.svg'        },
      { dir: 'bottom', name: '451',     img: 'figure/451.svg'         },
      { dir: 'left',   name: '4132',    img: 'figure/4132.svg'        },
      { dir: 'right',  name: '2134',    img: 'figure/2134.svg'        },
    ],
  },
  {
    label: '433', sub: '保持',
    formations: [
      { dir: 'center', name: '4123',    img: 'figure/4123.svg'        },
      { dir: 'top',    name: '235',     img: 'figure/235.svg'         },
      { dir: 'bottom', name: '4141',    img: 'figure/4141.svg'        },
      { dir: 'left',   name: '460',     img: 'figure/460.svg'         },
      { dir: 'right',  name: '433',     img: 'figure/433.svg'         },
    ],
  },
  {
    label: '3421', sub: '安定型',
    formations: [
      { dir: 'center', name: '3421',    img: 'figure/3421.svg'        },
      { dir: 'top',    name: '325',     img: 'figure/325.svg'         },
      { dir: 'bottom', name: '541',     img: 'figure/541.svg'         },
      { dir: 'left',   name: '343',     img: 'figure/343.svg'         },
      { dir: 'right',  name: '3421R',   img: 'figure/3421.svg'        },
    ],
  },
  {
    label: '352', sub: '可変式',
    formations: [
      { dir: 'center', name: '352W',    img: 'figure/352W.svg'        },
      { dir: 'top',    name: '334',     img: 'figure/334.svg'         },
      { dir: 'bottom', name: '532',     img: 'figure/532.svg'         },
      { dir: 'left',   name: '352M',    img: 'figure/352M.svg'        },
      { dir: 'right',  name: null,      img: null                     },
    ],
  },
  {
    label: '343◇', sub: '超攻撃的',
    formations: [
      { dir: 'center', name: '343◇',   img: 'figure/343_diamond.svg' },
      { dir: 'top',    name: null,      img: null                     },
      { dir: 'bottom', name: null,      img: null                     },
      { dir: 'left',   name: null,      img: null                     },
      { dir: 'right',  name: null,      img: null                     },
    ],
  },
  {
    label: '日本', sub: 'misc',
    formations: [
      { dir: 'center', name: '3421',    img: 'uniform/japan2026_home.svg'        },
      { dir: 'top',    name: '343◇jp',      img: 'figure/343_diamond.svg'},
      // { dir: 'top',    name: '253',     img: 'figure/253.svg'         },
      { dir: 'bottom', name: '541',     img: 'figure/541.svg'         },
      { dir: 'left',   name: '4231jp',      img: 'figure/4231.svg'},
      // { dir: 'right',  name: null,      img: null                     },
      { dir: 'right', name: '4123jp',      img: 'figure/4123.svg'     },
    ],
  },
];

// 3×3グリッドで中央(index=4)を除いた8箇所とFLICK_KEYSのマッピング
const KEY_POSITIONS = [0, 1, 2, 3, 5, 6, 7, 8];
const DIRS = ['center', 'top', 'bottom', 'left', 'right'];

// ─── ユーティリティ ──────────────────────────────────────────────────────────
function toImgSrc(formation) {
  return formation?.img ?? null;
}

function toLabel(name) {
  if (!name) return '—';
  return name.replace('_diamond', '◇').replace('block', 'B');
}

// ─── CSS注入 ─────────────────────────────────────────────────────────────────
const FLICK_CSS = `
/* ── フリックUI本体（.flick-ui 以下） ─────────────────────────── */
`;

function injectCSS() {
  if (document.getElementById('flick-ui-css')) return;
  const s = document.createElement('style');
  s.id = 'flick-ui-css';
  s.textContent = FLICK_CSS;
  document.head.appendChild(s);
}

// ─── UI 構築 ─────────────────────────────────────────────────────────────────
function buildFlickUI(container, side) {
  console.log(`[FlickUI] buildFlickUI start: side=${side}`);
  container.innerHTML = '';

  // ① 隠しボタン群（initializeFormationButtons の querySelectorAll に引っかかる）
  const hiddenWrap = document.createElement('div');
  hiddenWrap.setAttribute('aria-hidden', 'true');
  hiddenWrap.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden;';

  const allNames = [...new Set(
    FLICK_KEYS.flatMap(k => k.formations.map(f => f.name)).filter(Boolean)
  )];
  allNames.forEach(name => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.dataset.formation = name;
    hiddenWrap.appendChild(btn);
  });
  container.appendChild(hiddenWrap);
  console.log(`[FlickUI] hidden buttons: ${allNames.length}個`);

  // ② フリックUI本体
  const wrap = document.createElement('div');
  wrap.className = 'flick-ui';

  const grid = document.createElement('div');
  grid.className = 'flick-grid';

  // 中央プレビューセルを先に作成（attachInteraction で参照）
  const { preview, previewImg, previewLabel, previewPlaceholder } = buildPreviewCell();

  // 9セルを配置（index=4 が中央プレビュー）
  for (let cellIdx = 0; cellIdx < 9; cellIdx++) {
    if (cellIdx === 4) {
      grid.appendChild(preview);
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

  console.log(`[FlickUI] DOM built for side=${side}`);

  // ④ インタラクション
  attachInteraction({ grid, popup, hiddenWrap, previewImg, previewLabel, previewPlaceholder, side });
}

function buildPreviewCell() {
  const preview = document.createElement('div');
  preview.className = 'flick-preview';

  const previewInner = document.createElement('div');
  previewInner.className = 'flick-preview-inner';

  const previewImg = document.createElement('img');
  previewImg.className = 'flick-preview-img';
  previewImg.alt = '';
  previewImg.draggable = false;
  previewImg.style.display = 'none';

  const previewLabel = document.createElement('span');
  previewLabel.className = 'flick-preview-label';
  previewLabel.style.display = 'none';

  const previewPlaceholder = document.createElement('span');
  previewPlaceholder.className = 'flick-preview-placeholder';

  previewInner.appendChild(previewImg);
  previewInner.appendChild(previewPlaceholder);
  preview.appendChild(previewInner);

  return { preview, previewImg, previewLabel, previewPlaceholder };
}

function buildKeyCell(keyIdx) {
  const k = FLICK_KEYS[keyIdx];

  const key = document.createElement('div');
  key.className = 'flick-key';
  key.dataset.idx = String(keyIdx);

  // center フォーメーションの SVG を背景に薄く表示
  const centerFormation = k.formations.find(f => f.dir === 'center');
  const imgSrc = toImgSrc(centerFormation);
  if (imgSrc) {
    const img = document.createElement('img');
    img.className = 'flick-key-img';
    img.src = imgSrc;
    img.alt = '';
    img.draggable = false;
    key.appendChild(img);
  }

  const inner = document.createElement('div');
  inner.className = 'flick-key-inner';

  const main = document.createElement('span');
  main.className = 'flick-key-main';

  const sub = document.createElement('span');
  sub.className = 'flick-key-sub';
  sub.textContent = k.sub;

  inner.appendChild(main);
  inner.appendChild(sub);
  key.appendChild(inner);

  return key;
}

// ─── インタラクション ────────────────────────────────────────────────────────
function attachInteraction({ grid, popup, hiddenWrap, previewImg, previewLabel, previewPlaceholder, side }) {
  const THRESHOLD = 18;
  let activeIdx = null;
  let flickDir  = null;
  let startX = 0, startY = 0;

  function onStart(idx, touchX, touchY, popX, popY) {
    activeIdx = idx;
    flickDir  = 'center';
    startX = touchX;
    startY = touchY;
    grid.querySelectorAll('.flick-key').forEach(k => {
      k.classList.toggle('is-active', +k.dataset.idx === idx);
    });
    renderPopup(idx, popX, popY, 'center');
  }

  function onMove(x, y) {
    if (activeIdx === null) return;
    const dx   = x - startX;
    const dy   = y - startY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    let dir;
    if (dist < THRESHOLD) {
      dir = 'center';
    } else {
      const a = Math.atan2(dy, dx) * 180 / Math.PI;
      if      (a > -45  && a <=  45)  dir = 'right';
      else if (a >  45  && a <= 135)  dir = 'bottom';
      else if (a >  135 || a <= -135) dir = 'left';
      else                            dir = 'top';
    }
    if (dir !== flickDir) {
      flickDir = dir;
      highlightPopup(dir);
    }
  }

  function onEnd() {
    if (activeIdx === null) return;
    const f = FLICK_KEYS[activeIdx].formations.find(f => f.dir === flickDir);
    if (f?.name) triggerFormation(f.name);
    popup.classList.remove('is-visible');
    grid.querySelectorAll('.flick-key').forEach(k => k.classList.remove('is-active'));
    activeIdx = null;
    flickDir  = null;
  }

  function triggerFormation(name) {
    // 中央プレビューを更新
    const selectedKey = FLICK_KEYS.find(k => k.formations.some(f => f.name === name));
    const selectedF   = selectedKey?.formations.find(f => f.name === name);
    const src = toImgSrc(selectedF);
    if (src) {
      previewImg.src            = src;
      previewImg.style.display  = 'block';
      previewLabel.textContent  = toLabel(name);
      previewLabel.style.display = 'block';
      previewPlaceholder.style.display = 'none';
    }

    // 選択済みキーをハイライト
    grid.querySelectorAll('.flick-key').forEach(k => {
      const idx = +k.dataset.idx;
      k.classList.toggle('is-selected',
        FLICK_KEYS[idx].formations.some(f => f.name === name)
      );
    });

    // 隠しボタン経由で ui-events.js の既存ロジックを起動
    const btn = hiddenWrap.querySelector(`button[data-formation="${name}"]`);
    if (btn) {
      btn.click();
      console.log(`[FlickUI] triggered: ${name}`);
    } else {
      console.warn(`[FlickUI] hidden button not found: ${name}`);
    }
  }

  function renderPopup(idx, x, y, highlightDir) {
    const key = FLICK_KEYS[idx];
    popup.innerHTML = '';
    DIRS.forEach(dir => {
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
          const img = document.createElement('img');
          img.className = 'flick-pcell-img';
          img.src = src;
          img.alt = '';
          img.draggable = false;
          cell.appendChild(img);
        }
        const label = document.createElement('span');
        label.className   = 'flick-pcell-label';
        label.textContent = toLabel(f.name);
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
  function popupCenter() {
    return { x: window.innerWidth / 2, y: window.innerHeight / 2 };
  }

  grid.addEventListener('mousedown', e => {
    const key = e.target.closest('.flick-key');
    if (!key) return;
    e.preventDefault();
    const { x, y } = popupCenter();
    onStart(+key.dataset.idx, e.clientX, e.clientY, x, y);
  });

  grid.addEventListener('touchstart', e => {
    const key = e.target.closest('.flick-key');
    if (!key) return;
    e.preventDefault();
    const { x, y } = popupCenter();
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
