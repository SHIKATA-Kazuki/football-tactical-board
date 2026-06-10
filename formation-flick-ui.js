/**
 * formation-flick-ui.js
 *
 * 役割: FLICK_KEYS定義・CSS注入・DOM構築・インタラクション
 * レイアウト定義・スタイル上書きは formation-flick-ui.html 側で行う
 *
 * 呼び出し順:
 *   initFlickFormationUI();       // ← 先
 *   initializeFormationButtons();  // ← 後
 */

// ─── フォーメーション定義 ───────────────────────────────────────────────────
//
// 各フォーメーションの img に表示したいSVGパスを直接指定してください。
//   img: "figure/4231.svg"  → そのパスのSVGを表示
//   img: null               → 画像なし
//
const FLICK_KEYS = [
  {
    label: "4バック\nFW2", sub: "4-x-2",
    formations: [
      { dir: "center", name: "4231",        img: "figure/4231.svg"        },
      { dir: "top",    name: "442",          img: "figure/442.svg"         },
      { dir: "bottom", name: "4213",         img: "figure/4213.svg"        },
      { dir: "left",   name: "442_diamond",  img: "figure/442_diamond.svg" },
      { dir: "right",  name: "4321",         img: "figure/4321.svg"        },
    ],
  },
  {
    label: "4バック\nFW1", sub: "4-x-1",
    formations: [
      { dir: "center", name: "4141", img: "figure/4141.svg" },
      { dir: "top",    name: "4411", img: "figure/4411.svg" },
      { dir: "bottom", name: "451",  img: "figure/451.svg"  },
      { dir: "left",   name: "4132", img: "figure/4132.svg" },
      { dir: "right",  name: "4123", img: "figure/4123.svg" },
    ],
  },
  {
    label: "4バック\n変形", sub: "4-x-x",
    formations: [
      { dir: "center", name: "433",      img: "figure/433.svg"      },
      { dir: "top",    name: "442block", img: "figure/442block.svg" },
      { dir: "bottom", name: "4114",     img: "figure/4114.svg"     },
      { dir: "left",   name: "424",      img: "figure/424.svg"      },
      { dir: "right",  name: "460",      img: "figure/460.svg"      },
    ],
  },
  {
    label: "3バック\n攻撃", sub: "3-4-x",
    formations: [
      { dir: "center", name: "3421",        img: "figure/3421.svg"        },
      { dir: "top",    name: "343_diamond", img: "figure/343_diamond.svg" },
      { dir: "bottom", name: "343",         img: "figure/343.svg"         },
      { dir: "left",   name: "3421R",       img: "figure/3421.svg"        },
      { dir: "right",  name: "334",         img: "figure/334.svg"         },
    ],
  },
  {
    label: "3バック\nWB", sub: "3-5-x",
    formations: [
      { dir: "center", name: "352W", img: "figure/352W.svg" },
      { dir: "top",    name: "352M", img: "figure/352M.svg" },
      { dir: "bottom", name: "325",  img: "figure/325.svg"  },
      { dir: "left",   name: null,   img: null               },
      { dir: "right",  name: null,   img: null               },
    ],
  },
  {
    label: "5バック", sub: "5-x-x",
    formations: [
      { dir: "center", name: "541", img: "figure/541.svg" },
      { dir: "top",    name: "532", img: "figure/532.svg" },
      { dir: "bottom", name: null,  img: null              },
      { dir: "left",   name: null,  img: null              },
      { dir: "right",  name: null,  img: null              },
    ],
  },
  {
    label: "前線\n厚め", sub: "x-x-3+",
    formations: [
      { dir: "center", name: "235",  img: "figure/235.svg"  },
      { dir: "top",    name: "253",  img: "figure/253.svg"  },
      { dir: "bottom", name: "2134", img: "figure/2134.svg" },
      { dir: "left",   name: null,   img: null               },
      { dir: "right",  name: null,   img: null               },
    ],
  },
  {
    label: "その他", sub: "misc",
    formations: [
      { dir: "center", name: null, img: null },
      { dir: "top",    name: null, img: null },
      { dir: "bottom", name: null, img: null },
      { dir: "left",   name: null, img: null },
      { dir: "right",  name: null, img: null },
    ],
  },
];

// グリッド上の位置定義（3×3、index=4 が中央プレビューセル）
// index:  0 1 2
//         3 4 5  ← 4 が選択中SVG表示セル
//         6 7 8
// FLICK_KEYS[0〜3] → index 0〜3、FLICK_KEYS[4〜7] → index 5〜8
const KEY_POSITIONS = [0, 1, 2, 3, 5, 6, 7, 8]; // 中央(4)を除いた8箇所

const DIRS = ["center", "top", "bottom", "left", "right"];

function toImgSrc(formation) {
  return formation?.img ?? null;
}

function toLabel(name) {
  if (!name) return "—";
  return name.replace("_diamond", "◇").replace("block", "B");
}

// ─── CSS注入（.flick-ui / .flick-popup スコープで既存CSSに干渉しない）───────
const FLICK_CSS = `
/* ── フリックUI本体（.flick-ui 以下） ─────────────────────────── */
.flick-ui {
  box-sizing: border-box;
  width: 100%;
  min-width: 0;
  overflow: hidden;
  font-family: system-ui, sans-serif;
  padding: 6px 0;
}
.flick-ui .flick-hint {
  font-size: clamp(9px, 1.5vw, 11px);
  color: #bbb;
  margin: 0 0 6px;
}
.flick-ui .flick-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: clamp(2px, 1vw, 6px);
  width: 100%;
  min-width: 0;
}
/* フリックキー */
.flick-ui .flick-key {
  box-sizing: border-box;
  width: 100%;
  aspect-ratio: 1 / 1;
  position: relative;
  border-radius: clamp(4px, 1vw, 8px);
  border: 1px solid #ccc;
  background: #fff;
  cursor: pointer;
  user-select: none;
  -webkit-user-select: none;
  touch-action: none;
  overflow: hidden;
}
@supports not (aspect-ratio: 1) {
  .flick-ui .flick-key { padding-top: 100%; height: 0; }
}
.flick-ui .flick-key.is-active   { background: #e8e8e8; border-color: #999; }
.flick-ui .flick-key.is-selected { background: #ddeeff; border-color: #185FA5; }
.flick-ui .flick-key-inner {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}
.flick-ui .flick-key-main {
  font-size: clamp(8px, 1.8vw, 11px);
  font-weight: 700;
  color: #222;
  text-align: center;
  white-space: pre-line;
  line-height: 1.3;
}
.flick-ui .flick-key-sub { font-size: clamp(7px, 1.2vw, 10px); color: #aaa; margin-top: 1px; }
.flick-ui .flick-key-img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: contain;
  opacity: 0.18;
  pointer-events: none;
  padding: 3px;
  box-sizing: border-box;
}
.flick-ui .flick-key.is-selected .flick-key-img { opacity: 0.35; }
.flick-ui .flick-key.is-active   .flick-key-img { opacity: 0.25; }

/* 中央プレビューセル */
.flick-ui .flick-preview {
  box-sizing: border-box;
  width: 100%;
  aspect-ratio: 1 / 1;
  position: relative;
  border-radius: clamp(4px, 1vw, 8px);
  border: 1px solid #ddd;
  background: #fafafa;
  overflow: hidden;
}
@supports not (aspect-ratio: 1) {
  .flick-ui .flick-preview { padding-top: 100%; height: 0; }
}
.flick-ui .flick-preview-inner {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}
.flick-ui .flick-preview-img {
  width: 90%;
  height: 90%;
  object-fit: contain;
  display: block;
}
.flick-ui .flick-preview-label {
  font-size: clamp(8px, 1.5vw, 11px);
  color: #555;
  margin-top: 2px;
  font-weight: 700;
}
.flick-ui .flick-preview-placeholder {
  font-size: clamp(9px, 1.5vw, 11px);
  color: #ccc;
}

/* ── ポップアップ（body直下、.flick-popup スコープ） ───────────── */
.flick-popup {
  position: fixed;
  display: none;
  width: 160px;
  height: 160px;
  pointer-events: none;
  z-index: 99999;
}
.flick-popup.is-visible { display: block; }
.flick-popup .flick-pcell {
  position: absolute;
  width: 48px;
  height: 48px;
  border-radius: 7px;
  border: 1px solid #ccc;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 700;
  color: #555;
  box-sizing: border-box;
  overflow: hidden;
}
.flick-popup .flick-pcell[data-dir="center"] { left:56px; top:56px; background:#eee; color:#111; border-color:#aaa; }
.flick-popup .flick-pcell[data-dir="top"]    { left:56px; top:4px; }
.flick-popup .flick-pcell[data-dir="bottom"] { left:56px; top:108px; }
.flick-popup .flick-pcell[data-dir="left"]   { left:4px;  top:56px; }
.flick-popup .flick-pcell[data-dir="right"]  { left:108px; top:56px; }
.flick-popup .flick-pcell.is-empty     { opacity: 0.3; }
.flick-popup .flick-pcell.is-highlight { background: #185FA5; color: #fff; border-color: #185FA5; }
.flick-popup .flick-pcell-img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: contain;
  padding: 3px;
  box-sizing: border-box;
  opacity: 0.5;
  pointer-events: none;
}
.flick-popup .flick-pcell.is-highlight .flick-pcell-img { filter: brightness(10); opacity: 0.85; }
.flick-popup .flick-pcell-label {
  position: relative;
  z-index: 1;
  font-size: 11px;
  font-weight: 700;
}
`;

function injectCSS() {
  if (document.getElementById("flick-ui-css")) return;
  const s = document.createElement("style");
  s.id = "flick-ui-css";
  s.textContent = FLICK_CSS;
  document.head.appendChild(s);
}

// ─── UI 構築 ────────────────────────────────────────────────────────────────
function buildFlickUI(container, side) {
  console.log(`[FlickUI] buildFlickUI start: side=${side}`, container);
  container.innerHTML = "";

  // ① 隠しボタン群（initializeFormationButtons の querySelectorAll に引っかかる）
  const hiddenWrap = document.createElement("div");
  hiddenWrap.setAttribute("aria-hidden", "true");
  hiddenWrap.style.cssText = "position:absolute;width:0;height:0;overflow:hidden;";
  const allNames = [...new Set(
    FLICK_KEYS.flatMap(k => k.formations.map(f => f.name)).filter(Boolean)
  )];
  allNames.forEach(name => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.dataset.formation = name;
    hiddenWrap.appendChild(btn);
  });
  container.appendChild(hiddenWrap);
  console.log(`[FlickUI] hidden buttons created: ${allNames.length}個`);

  // ② フリックUI本体
  const wrap = document.createElement("div");
  wrap.className = "flick-ui";

  // ヒント
  const hint = document.createElement("p");
  hint.className = "flick-hint";
  hint.textContent = "押したままドラッグ → 離して確定";
  wrap.appendChild(hint);

  // 3×3グリッド
  const grid = document.createElement("div");
  grid.className = "flick-grid";

  // 中央プレビューセルを作成（後で参照するため先に作る）
  const preview = document.createElement("div");
  preview.className = "flick-preview";
  const previewInner = document.createElement("div");
  previewInner.className = "flick-preview-inner";
  const previewImg = document.createElement("img");
  previewImg.className = "flick-preview-img";
  previewImg.alt = "";
  previewImg.draggable = false;
  previewImg.style.display = "none";
  const previewLabel = document.createElement("span");
  previewLabel.className = "flick-preview-label";
  previewLabel.style.display = "none";
  const previewPlaceholder = document.createElement("span");
  previewPlaceholder.className = "flick-preview-placeholder";
  previewPlaceholder.textContent = "未選択";
  previewInner.appendChild(previewImg);
  previewInner.appendChild(previewLabel);
  previewInner.appendChild(previewPlaceholder);
  preview.appendChild(previewInner);

  // 9セルを順番に配置（index=4 が中央プレビュー）
  for (let cellIdx = 0; cellIdx < 9; cellIdx++) {
    if (cellIdx === 4) {
      // 中央: プレビューセル
      grid.appendChild(preview);
    } else {
      // それ以外: フリックキー
      const keyIdx = KEY_POSITIONS.indexOf(cellIdx);
      const k = FLICK_KEYS[keyIdx];

      const key = document.createElement("div");
      key.className = "flick-key";
      key.dataset.idx = String(keyIdx);

      // centerフォーメーションのSVGを背景に薄く表示
      const centerFormation = k.formations.find(f => f.dir === "center");
      const imgSrc = toImgSrc(centerFormation);
      if (imgSrc) {
        const img = document.createElement("img");
        img.className = "flick-key-img";
        img.src = imgSrc;
        img.alt = "";
        img.draggable = false;
        key.appendChild(img);
      }

      const inner = document.createElement("div");
      inner.className = "flick-key-inner";
      const main = document.createElement("span");
      main.className = "flick-key-main";
      main.textContent = k.label;
      const sub = document.createElement("span");
      sub.className = "flick-key-sub";
      sub.textContent = k.sub;
      inner.appendChild(main);
      inner.appendChild(sub);
      key.appendChild(inner);
      grid.appendChild(key);
    }
  }

  wrap.appendChild(grid);
  container.appendChild(wrap);

  // ③ ポップアップ（body 直下）
  const popup = document.createElement("div");
  popup.className = "flick-popup";
  document.body.appendChild(popup);

  console.log(`[FlickUI] DOM built for side=${side}`);

  // ④ インタラクション
  attachInteraction({ grid, popup, hiddenWrap, previewImg, previewLabel, previewPlaceholder, side });
}

// ─── インタラクション ────────────────────────────────────────────────────────
function attachInteraction({ grid, popup, hiddenWrap, previewImg, previewLabel, previewPlaceholder, side }) {
  const THRESHOLD = 18;
  let activeIdx = null;
  let flickDir  = null;
  let startX = 0, startY = 0;

  function onStart(idx, touchX, touchY, popX, popY) {
    activeIdx = idx;
    flickDir  = "center";
    startX = touchX;   // フリック判定はタッチ開始点を基準
    startY = touchY;
    grid.querySelectorAll(".flick-key").forEach((k) => {
      k.classList.toggle("is-active", +k.dataset.idx === idx);
    });
    renderPopup(idx, popX, popY, "center");  // ポップアップは画面中央に表示
  }

  function onMove(x, y) {
    if (activeIdx === null) return;
    const dx = x - startX;
    const dy = y - startY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    let dir;
    if (dist < THRESHOLD) {
      dir = "center";
    } else {
      const a = Math.atan2(dy, dx) * 180 / Math.PI;
      if      (a > -45  && a <=  45)  dir = "right";
      else if (a >  45  && a <= 135)  dir = "bottom";
      else if (a >  135 || a <= -135) dir = "left";
      else                            dir = "top";
    }
    if (dir !== flickDir) {
      flickDir = dir;
      highlightPopup(dir);
    }
  }

  function onEnd() {
    if (activeIdx === null) return;
    const f = FLICK_KEYS[activeIdx].formations.find(f => f.dir === flickDir);
    if (f && f.name) triggerFormation(f.name);
    popup.classList.remove("is-visible");
    grid.querySelectorAll(".flick-key").forEach(k => k.classList.remove("is-active"));
    activeIdx = null;
    flickDir  = null;
  }

  function triggerFormation(name) {
    // 中央プレビューセルを更新
    const selectedKey = FLICK_KEYS.find(k => k.formations.some(f => f.name === name));
    const selectedF   = selectedKey?.formations.find(f => f.name === name);
    const src = toImgSrc(selectedF);
    if (src) {
      previewImg.src = src;
      previewImg.style.display = "block";
      previewLabel.textContent = toLabel(name);
      previewLabel.style.display = "block";
      previewPlaceholder.style.display = "none";
    }

    // 選択済みキーをハイライト
    grid.querySelectorAll(".flick-key").forEach(k => {
      const idx = +k.dataset.idx;
      k.classList.toggle("is-selected",
        FLICK_KEYS[idx].formations.some(f => f.name === name)
      );
    });

    // 隠しボタンをクリックして既存ロジックを起動
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
    popup.innerHTML = "";
    DIRS.forEach(dir => {
      const f    = key.formations.find(f => f.dir === dir);
      const cell = document.createElement("div");
      cell.className   = "flick-pcell";
      cell.dataset.dir = dir;
      if (!f || !f.name) {
        cell.classList.add("is-empty");
        cell.textContent = "—";
      } else {
        const src = toImgSrc(f);
        if (src) {
          const img = document.createElement("img");
          img.className = "flick-pcell-img";
          img.src = src;
          img.alt = "";
          img.draggable = false;
          cell.appendChild(img);
        }
        const label = document.createElement("span");
        label.className = "flick-pcell-label";
        label.textContent = toLabel(f.name);
        cell.appendChild(label);
        if (dir === highlightDir) cell.classList.add("is-highlight");
      }
      popup.appendChild(cell);
    });
    popup.style.left = (x - 80) + "px";
    popup.style.top  = (y - 80) + "px";
    popup.classList.add("is-visible");
  }

  function highlightPopup(dir) {
    popup.querySelectorAll(".flick-pcell").forEach(c => {
      c.classList.toggle(
        "is-highlight",
        c.dataset.dir === dir && !c.classList.contains("is-empty")
      );
    });
  }

  // ポップアップの表示座標: 画面中央に固定
  function popupCenter() {
    return {
      x: window.innerWidth  / 2,
      y: window.innerHeight / 2,
    };
  }

  // イベント登録
  // ポップアップは画面中央に出すが、フリック方向の判定は
  // タッチ/クリック開始点を基準にする（指の動きと方向を合わせるため）
  grid.addEventListener("mousedown", e => {
    const key = e.target.closest(".flick-key");
    if (!key) return;
    e.preventDefault();
    const { x, y } = popupCenter();
    onStart(+key.dataset.idx, e.clientX, e.clientY, x, y);
  });
  grid.addEventListener("touchstart", e => {
    const key = e.target.closest(".flick-key");
    if (!key) return;
    e.preventDefault();
    const { x, y } = popupCenter();
    onStart(+key.dataset.idx, e.touches[0].clientX, e.touches[0].clientY, x, y);
  }, { passive: false });

  document.addEventListener("mousemove", e => onMove(e.clientX, e.clientY));
  document.addEventListener("touchmove", e => {
    if (activeIdx === null) return;
    e.preventDefault();
    onMove(e.touches[0].clientX, e.touches[0].clientY);
  }, { passive: false });
  document.addEventListener("mouseup",  onEnd);
  document.addEventListener("touchend", onEnd);
}

// ─── エントリポイント ────────────────────────────────────────────────────────
export function initFlickFormationUI() {
  injectCSS();

  const homeEl = document.querySelector(".home-formations");
  const awayEl = document.querySelector(".away-formations");

  if (homeEl) {
    buildFlickUI(homeEl, "home");
  } else {
    console.warn("[FlickUI] .home-formations が見つかりません");
  }

  if (awayEl) {
    buildFlickUI(awayEl, "away");
  } else {
    console.warn("[FlickUI] .away-formations が見つかりません");
  }
}