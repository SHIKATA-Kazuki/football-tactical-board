/**
 * formation-flick-ui.js
 *
 * 呼び出し順:
 *   initFlickFormationUI();      // ← 先
 *   initializeFormationButtons(); // ← 後
 */

// ─── フォーメーション定義 ───────────────────────────────────────────────────
//
// 各フォーメーションの img に表示したいSVGパスを直接指定してください。
//   img: "figure/4231.svg"  → そのパスのSVGを表示
//   img: null               → 画像なし
//
const FLICK_KEYS = [
  {
    label: "4231", sub: "バランス",
    formations: [
      { dir: "center", name: "4231",        img: "figure/4231.svg"        },
      { dir: "top",    name: "4213",          img: "figure/4213.svg"         },
      { dir: "bottom", name: "4411",         img: "figure/4411.svg"        },
      { dir: "left",   name: null,         img: null },
      { dir: "right",  name: null,         img: null },
    ],
  },
  {
    label: "442", sub: "堅守速攻",
    formations: [
      { dir: "center", name: "442", img: "figure/442.svg" },
      { dir: "top",    name: "424", img: "figure/424.svg" },
      { dir: "bottom", name: "442block",  img: "figure/442block.svg"  },
      { dir: "left",   name: null,         img: null },
      { dir: "right",  name: null,         img: null },
    ],
  },
  {
    label: "442ダイヤ", sub: "中央制圧",
    formations: [
      { dir: "center", name: "442_diamond",      img: "figure/442_diamond.svg"      },
      { dir: "top",    name: "4114", img: "figure/4114.svg" },
      { dir: "bottom", name: "451",     img: "figure/451.svg"     },
      { dir: "left", name: "4132",     img: "figure/4132.svg"     },
      { dir: "right", name: "2134",     img: "figure/2134.svg"     },
    ],
  },
  {
    label: "433", sub: "ポゼッション",
    formations: [
      { dir: "center", name: "4123",        img: "figure/4123.svg"        },
      { dir: "top",    name: "235", img: "figure/235.svg" },
      { dir: "bottom", name: "4141",         img: "figure/4141.svg"         },
      { dir: "left",   name: "460",       img: "figure/460.svg"        },
      { dir: "right",  name: "433",         img: "figure/433.svg"         },
    ],
  },
  {
    label: "3421", sub: "安定型",
    formations: [
      { dir: "center", name: "3421", img: "figure/3421.svg" },
      { dir: "top",    name: "325", img: "figure/325.svg" },
      { dir: "bottom", name: "541",  img: "figure/541.svg"  },
      { dir: "left",   name: "343",         img: "figure/343.svg" },
      { dir: "right",  name: null,   img: null               },
    ],
  },
  {
    label: "352", sub: "可変式",
    formations: [
      { dir: "center", name: "352W", img: "figure/352W.svg" },
      { dir: "top",   name: "334",   img: "figure/334.svg"  },
      { dir: "bottom", name: "532",  img: "figure/532.svg"  },
      { dir: "left",    name: "352M", img: "figure/352M.svg" },
      { dir: "right",  name: null,   img: null               },
    ],
  },
  {
    label: "343ダイヤ", sub: "超攻撃的",
    formations: [
      { dir: "center", name: "343_diamond",  img: "figure/343_diamond.svg"  },
      { dir: "top",    name: null,  img: null },
      { dir: "bottom", name: null, img: null },
      { dir: "left",   name: null,   img: null },
      { dir: "right",  name: null,   img: null },
    ],
  },
  {
    label: "その他", sub: "misc",
    formations: [
      { dir: "center", name: "4321", img: "figure/4321.svg" },
      { dir: "top",    name: "253", img: "figure/253.svg" },
      { dir: "bottom", name: null, img: null },
      { dir: "left",   name: null, img: null },
      { dir: "right",  name: null, img: null },
    ],
  },
];

const DIRS = ["center", "top", "bottom", "left", "right"];

// img プロパティから直接パスを取得
function toImgSrc(formation) {
  return formation?.img ?? null;
}

// ポップアップ表示ラベル
function toLabel(name) {
  if (!name) return "—";
  return name.replace("_diamond", "◇").replace("block", "B");
}

// ─── CSS（<style> タグで一度だけ注入）─────────────────────────────────────
const FLICK_CSS = `
.flick-wrap {
  box-sizing: border-box;
  width: 100%;
  font-family: system-ui, sans-serif;
  padding: 6px 0;
}
.flick-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #f0f0f0;
  border-radius: 8px;
  padding: 7px 12px;
  margin-bottom: 8px;
  min-height: 36px;
}
.flick-bar-label { font-size: 12px; color: #888; white-space: nowrap; }
.flick-bar-value { font-size: 16px; font-weight: 700; color: #111; }
.flick-hint { font-size: 11px; color: #bbb; margin: 0 0 8px; }
.flick-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 6px;
  width: 100%;
}
.flick-key {
  box-sizing: border-box;
  width: 100%;
  padding-top: 50%; /* aspect-ratio 代替 */
  position: relative;
  border-radius: 8px;
  border: 1px solid #ccc;
  background: #fff;
  cursor: pointer;
  user-select: none;
  -webkit-user-select: none;
  touch-action: none;
}
.flick-key-inner {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}
.flick-key.is-active   { background: #ff8585; border-color: #ffbbbb; }
.flick-key.is-selected { background: #ffcccc; border-color: #5e0209; }
.flick-key-main {
  font-size: 11px;
  font-weight: 700;
  color: #222;
  text-align: center;
  white-space: pre-line;
  line-height: 1.35;
}
.flick-key-sub { font-size: 10px; color: #aaa; margin-top: 2px; }

/* ポップアップ */
.flick-popup {
  position: fixed;
  display: none;
  width: 160px;
  height: 160px;
  pointer-events: none;
  z-index: 99999;
}
.flick-popup.is-visible { display: block; }
.flick-pcell {
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
}
.flick-pcell[data-dir="center"] { left:56px; top:56px; background:#eee; color:#111; border-color:#aaa; }
.flick-pcell[data-dir="top"]    { left:56px; top:4px; }
.flick-pcell[data-dir="bottom"] { left:56px; top:108px; }
.flick-pcell[data-dir="left"]   { left:4px;  top:56px; }
.flick-pcell[data-dir="right"]  { left:108px; top:56px; }
.flick-key-img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: contain;
  opacity: 0.18;
  pointer-events: none;
  padding: 4px;
  box-sizing: border-box;
}
.flick-key.is-selected .flick-key-img { opacity: 0.35; }
.flick-key.is-active   .flick-key-img { opacity: 0.25; }
.flick-pcell-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  padding: 3px;
  box-sizing: border-box;
  position: absolute;
  inset: 0;
  opacity: 0.5;
  pointer-events: none;
}
.flick-pcell.is-highlight .flick-pcell-img { filter: brightness(10); opacity: 0.85; }
.flick-pcell-label {
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

  // 既存の中身をリセット
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
  wrap.className = "flick-wrap";

  // 選択バー
  const bar = document.createElement("div");
  bar.className = "flick-bar";
  const barLabel = document.createElement("span");
  barLabel.className = "flick-bar-label";
  barLabel.textContent = "フォーメーション：";
  const barValue = document.createElement("span");
  barValue.className = "flick-bar-value";
  barValue.textContent = "—";
  bar.appendChild(barLabel);
  bar.appendChild(barValue);
  wrap.appendChild(bar);

  // ヒント
  const hint = document.createElement("p");
  hint.className = "flick-hint";
  hint.textContent = "キーを押したままドラッグ → 離して確定";
  wrap.appendChild(hint);

  // グリッド
  const grid = document.createElement("div");
  grid.className = "flick-grid";
  FLICK_KEYS.forEach((k, i) => {
    const key = document.createElement("div");
    key.className = "flick-key";
    key.dataset.idx = String(i);

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
  });
  wrap.appendChild(grid);
  container.appendChild(wrap);

  // ③ ポップアップ（body 直下）
  const popup = document.createElement("div");
  popup.className = "flick-popup";
  document.body.appendChild(popup);

  console.log(`[FlickUI] DOM built for side=${side}`);

  // ④ インタラクション
  attachInteraction({ grid, popup, hiddenWrap, barValue, side });
}

// ─── インタラクション ────────────────────────────────────────────────────────
function attachInteraction({ grid, popup, hiddenWrap, barValue, side }) {
  const THRESHOLD = 18;
  let activeIdx = null;
  let flickDir  = null;
  let startX = 0, startY = 0;

  function onStart(idx, x, y) {
    activeIdx = idx;
    flickDir  = "center";
    startX = x;
    startY = y;
    grid.querySelectorAll(".flick-key").forEach((k, i) => {
      k.classList.toggle("is-active", i === idx);
    });
    renderPopup(idx, x, y, "center");
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
    if (f && f.name) triggerFormation(f.name, activeIdx);
    popup.classList.remove("is-visible");
    grid.querySelectorAll(".flick-key").forEach(k => k.classList.remove("is-active"));
    activeIdx = null;
    flickDir  = null;
  }

  function triggerFormation(name, keyIdx) {
    barValue.textContent = name;
    // 選択済みキーをハイライト
    grid.querySelectorAll(".flick-key").forEach((k, i) => {
      k.classList.toggle("is-selected",
        FLICK_KEYS[i].formations.some(f => f.name === name)
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
        // SVG画像
        const src = toImgSrc(f);
        if (src) {
          const img = document.createElement("img");
          img.className = "flick-pcell-img";
          img.src = src;
          img.alt = "";
          img.draggable = false;
          cell.appendChild(img);
        }
        // テキストラベル（画像の上に重ねる）
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

  // ── イベント登録 ──
  // grid 上のポインター開始
  grid.addEventListener("mousedown", e => {
    const key = e.target.closest(".flick-key");
    if (!key) return;
    e.preventDefault();
    onStart(+key.dataset.idx, e.clientX, e.clientY);
  });
  grid.addEventListener("touchstart", e => {
    const key = e.target.closest(".flick-key");
    if (!key) return;
    e.preventDefault();
    onStart(+key.dataset.idx, e.touches[0].clientX, e.touches[0].clientY);
  }, { passive: false });

  // document 全体でポインター移動・終了を拾う
  // ※ side ごとに重複登録しないよう once フラグを使わず、
  //   activeIdx === null チェックで無効時は何もしない設計にしている
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
