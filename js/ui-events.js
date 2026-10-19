/**
 * ui-events.js
 *
 * UI イベントの登録とフォーメーション操作ロジック。
 *
 * 責務:
 *   - フォーメーションの選択状態（ホーム・アウェイ）の保持
 *   - フォーメーションボタン（ホーム・アウェイ）のクリックイベント
 *   - スライダー値の読み取りと選手再描画
 *   - チーム変更時の再描画
 *   - ジョイスティック初期化
 *   - スクワッド入力フィールドの生成・番号反映
 *   - 左右反転ユニットの選択（手動 / 自動 / ボール側）
 */

import {
  formations,
  getFormationName,
  formationSliderMap,
  getMirrorUnits,
  mirrorSources,
} from './formations.js';
import { getLineup } from './config.js';
import { commit, emit } from './bus.js';
import {
  readPlayersFromForm,
  placePlayers,
  resetManualPositions,
  clearManualFor,
  getPlayerElements,
  applyFormation,
  wingStick,
  compressStick,
  sliderVal,
} from './players.js';

// ─── フォーメーション状態 ────────────────────────────────────────────────────
//
// 【修正】以前はスライダーを動かすたびに getFormationName() で
// 8 種のどれかに戻してしまい、フリック UI や config で選んだ
// 4213 / 433 / 352Mjp などが消えていた。
// 「選んだフォーメーション」と「そのときのスライダー値」を覚えておき、
// backs / DMF / Top スライダーが実際に動かされたときだけ切り替える。

const formationState = {
  // flips: ユニット ID → 'R' | 'L'（formations.js の「左右反転ユニット」参照）
  // flipMode: 'manual' = 手動、'auto' = 移動が少ない方、'ball' = ボール側
  home: { key: null, sliderSnapshot: null, flips: {}, flipMode: 'manual' },
  away: { key: null },
};

/** 現在のフォーメーション名を返す */
export function getCurrentFormation(side = 'home') {
  return formationState[side].key;
}

// ─── 内部ユーティリティ ──────────────────────────────────────────────────────

/**
 * 現在のサイドのラインナップを取得する。
 * 循環 import を避けるため DOM の 3 段セレクトから直接読む。
 * @param {boolean} isHome
 */
function getCurrentLineup(isHome) {
  const side     = isHome ? 'home' : 'away';
  const teamEl   = document.querySelector(`.${side}-team-select`);
  const seasonEl = document.querySelector(`.${side}-season-select`);
  const lineupEl = document.querySelector(`.${side}-lineup-select`);
  if (!teamEl || !seasonEl || !lineupEl) return null;
  return getLineup(teamEl.value, seasonEl.value, lineupEl.value);
}

/** 戦術スライダー値（ライン・SB・圧縮）をまとめて読み取る。 */
function readTacticalSliders() {
  const lineValue = sliderVal('lineSlider');
  return {
    cx:      compressStick.x * 5 + 50,
    cy:      compressStick.y * (-5) + 50,
    DF_line: 26 - (lineValue - 0.33) * 15,
    FW_line: -22 + (lineValue - 0.33) * 15,
    SBvalue: sliderVal('sidbackUpDown'),
  };
}

/** backs / DMF / Top の 3 スイッチを読む */
function readFormationSliders() {
  return {
    backs:   sliderVal('backsSlider'),
    volante: sliderVal('volanteSlider'),
    top:     sliderVal('topSlider'),
  };
}

function sameSnapshot(a, b) {
  return !!a && !!b && a.backs === b.backs && a.volante === b.volante && a.top === b.top;
}

/**
 * PC スライダーと SP（ドロワー）スライダーの両方に値をセットする。
 * 【修正】以前は PC 側だけ書き換えていたため、チーム変更や
 * フォーメーション選択後に SP 側の表示がずれていた。
 */
export function setSliderValue(id, value) {
  const pc = document.getElementById(id);
  const sp = document.getElementById(`${id}-sp`);
  if (pc) pc.value = value;
  if (sp) sp.value = value;
}

/** フォーメーションに対応するスライダー位置へ合わせ、スナップショットを更新 */
function syncFormationSliders(key) {
  const config = formationSliderMap[key];
  if (config) {
    setSliderValue('backsSlider',   config.backs);
    setSliderValue('volanteSlider', config.volante);
    setSliderValue('topSlider',     config.top);
  }
  formationState.home.sliderSnapshot = readFormationSliders();
}

function normalizeKey(formation) {
  return Array.isArray(formation) ? formation[0] : formation;
}

// ─── 幅取り役（ウイングスティックの対象）────────────────────────────────────
//
// 以前 players.js で背番号を使って決めていた条件を「スロット」（反転前の役割の位置）
// として表したもの。反転後は、そのスロットの位置（または鏡像）に立つ選手が対象になる。

function wideSlots() {
  const b = sliderVal('backsSlider');
  const v = sliderVal('volanteSlider');
  const t = sliderVal('topSlider');
  const W = new Set();
  if (b > 0.5)                       { W.add(6); W.add(10); }  // RWG / LWG
  if (b < 0.5 && v > 0.5 && t < 0.5) { W.add(9); W.add(10); }  // 3421 の 2 シャドー
  if (b < 0.5 && t > 0.5)            { W.add(5); W.add(7); }   // 352 の 2 ボランチ
  if (b + v + t < 0.1)               { W.add(1); W.add(4); }   // 343◇ の SB
  return W;
}

/**
 * ホームの座標と、選手ごとの幅取りの向きを計算する。
 * @param {string} key
 * @param {Record<string,'R'|'L'>} [flips]
 */
function homeLayout(key, flips = formationState.home.flips) {
  const { cx, cy, DF_line, FW_line, SBvalue } = readTacticalSliders();
  const pos = formations(key, { anchor: [cx, cy], DF: DF_line, FW: FW_line, SB: SBvalue, flips });
  if (!pos) return null;
  const W = wideSlots();
  const wide = mirrorSources(key, flips).map(({ src }, i) =>
    (i === 0 || !W.has(src)) ? 0 : (pos[i][0] - cx > 0 ? 1 : -1));
  return { pos, wide };
}

// ─── 描画 ────────────────────────────────────────────────────────────────────

function drawHome(key, resetManual) {
  const layout = homeLayout(key);
  if (!layout) {
    console.warn(`[ui-events] 未定義のフォーメーション: ${key}`);
    return;
  }
  const members = getCurrentLineup(true)?.members ?? {};
  applyFormation(layout.pos, resetManual, members, { wide: layout.wide });
  updateFormationButtons(key, 'home');
}

function drawAway(key, resetManual) {
  const pos = formations(key, {});   // アウェイは戦術スライダーの影響を受けない
  if (!pos) {
    console.warn(`[ui-events] 未定義のフォーメーション: ${key}`);
    return;
  }
  const flipped = pos.map(([x, y]) => [100 - x, 100 - y]);
  const players = readPlayersFromForm(document.getElementById('playerFormAway'));
  const members = getCurrentLineup(false)?.members ?? {};
  placePlayers(players, flipped, true, resetManual, members);
  updateFormationButtons(key, 'away');
}

// ─── 左右反転ユニット ────────────────────────────────────────────────────────

const SIDE_ALIASES = { R: 'R', L: 'L', right: 'R', left: 'L', '右': 'R', '左': 'L' };

/** config.js などで書かれた値（'左' / 'left' / 'L'）を 'R' | 'L' にそろえる */
function normalizeFlips(raw = {}) {
  const out = {};
  for (const [id, v] of Object.entries(raw ?? {})) {
    const side = SIDE_ALIASES[String(v).trim()];
    if (side) out[id] = side;
  }
  return out;
}

/** ユニットが今どちら側になっているか */
export function getUnitSide(unit, side = 'home') {
  return formationState[side].flips?.[unit.id] ?? unit.sides[0];
}

/** 現在のホームのフォーメーションにあるユニット */
export function getCurrentUnits() {
  const key = formationState.home.key;
  return key ? getMirrorUnits(key) : [];
}

export function getFlipState() {
  const st = formationState.home;
  return { flips: { ...st.flips }, mode: st.flipMode };
}

/** 状態の復元用（描画しない） */
export function setFlipState({ flips = {}, mode = 'manual' } = {}) {
  formationState.home.flips    = normalizeFlips(flips);
  formationState.home.flipMode = ['manual', 'auto', 'ball'].includes(mode) ? mode : 'manual';
  emit('flips:change');
}

/** チームを選んだときの既定値（config.js の lineup.flips）。チーム変更でリセット */
export function setTeamFlips(isHome, raw) {
  if (!isHome) return;   // アウェイへの適用は今後
  formationState.home.flips = normalizeFlips(raw);
  emit('flips:change');
}

/**
 * ユニットの側を切り替える（UI のスイッチから）。
 * ボール側モード中に手で選んだら手動モードへ切り替える。
 */
export function setUnitSide(unitId, sideValue) {
  const st   = formationState.home;
  const unit = getCurrentUnits().find(u => u.id === unitId);
  if (!unit) return;
  if (getUnitSide(unit) === sideValue) {
    // 自動で選ばれている側を押した＝その側で固定したい、とみなす
    if (st.flipMode === 'ball') {
      st.flipMode = 'manual';
      emit('flips:change');
      commit();
    }
    return;
  }

  st.flips = { ...st.flips, [unitId]: sideValue };
  if (st.flipMode === 'ball') st.flipMode = 'manual';
  clearManualFor('home', unit.members);   // 入れ替わる選手は固定を外して動かす
  drawHome(st.key, false);
  emit('flips:change');
  commit();
}

export function setFlipMode(mode) {
  const st = formationState.home;
  if (st.flipMode === mode) return;
  st.flipMode = mode;
  if (mode === 'ball' && chooseBallSide()) drawHome(st.key, false);
  if (mode === 'auto' && st.key && chooseLeastMovement(st.key)) drawHome(st.key, false);
  emit('flips:change');
  commit();
}

/** 全組み合わせのうち、今の位置からの移動距離（m 換算）の合計が最も小さいものを選ぶ */
function chooseLeastMovement(key) {
  const st    = formationState.home;
  const units = getMirrorUnits(key);
  const nodes = getPlayerElements('home');
  if (!units.length || nodes.length !== 11) return false;
  const current = nodes.map(n => [parseFloat(n.style.left), parseFloat(n.style.top)]);
  if (current.some(([x, y]) => !Number.isFinite(x) || !Number.isFinite(y))) return false;

  const cost = flips => homeLayout(key, flips).pos.reduce((sum, [x, y], i) =>
    sum + ((x - current[i][0]) * 0.68) ** 2 + ((y - current[i][1]) * 1.05) ** 2, 0);

  let best = st.flips;
  let bestCost = cost(st.flips);   // 同点なら今の選択を維持
  for (let c = 0; c < (1 << units.length); c++) {
    const candidate = { ...st.flips };
    units.forEach((u, i) => { candidate[u.id] = u.sides[(c >> i) & 1]; });
    const v = cost(candidate);
    if (v < bestCost - 1e-6) { best = candidate; bestCost = v; }
  }
  const changed = units.some(u => (best[u.id] ?? u.sides[0]) !== getUnitSide(u));
  st.flips = best;
  if (changed) emit('flips:change');
  return changed;
}

// ── ボール側 ──────────────────────────────────────────────────────────────────
let lastBall = { show: false, x: 50, y: 50 };
const BALL_DEADZONE = 8;   // 中央 ±8% では切り替えない（ちらつき防止）

/**
 * ボールの位置が変わったときに ball.js から呼ばれる。
 * ボール側モードなら、高い位置を取る側（＝後ろに残る側の反対）をボール側にそろえる。
 */
export function notifyBallPosition(ball) {
  lastBall = { ...ball };
  if (formationState.home.flipMode !== 'ball') return;
  if (chooseBallSide()) {
    drawHome(formationState.home.key, false);
    emit('flips:change');
  }
}

function chooseBallSide() {
  const st = formationState.home;
  if (st.flipMode !== 'ball' || !lastBall.show || !st.key) return false;
  const ballSide = lastBall.x > 50 + BALL_DEADZONE ? 'R'
                 : lastBall.x < 50 - BALL_DEADZONE ? 'L' : null;
  if (!ballSide) return false;
  const stay = ballSide === 'R' ? 'L' : 'R';

  let changed = false;
  for (const unit of getMirrorUnits(st.key)) {
    if (!unit.lead || getUnitSide(unit) === stay) continue;
    st.flips = { ...st.flips, [unit.id]: stay };
    clearManualFor('home', unit.members);
    changed = true;
  }
  return changed;
}

/** ホームのフォーメーションを明示的に選択する（ボタン・フリック・チーム変更） */
export function selectHomeFormation(formation) {
  const key = normalizeKey(formation);
  if (!formations(key)) return;
  formationState.home.key = key;
  syncFormationSliders(key);
  if (formationState.home.flipMode === 'auto') chooseLeastMovement(key);
  if (formationState.home.flipMode === 'ball') chooseBallSide();
  drawHome(key, true);
  emit('flips:change');
  commit();
}

/** アウェイのフォーメーションを明示的に選択する */
export function selectAwayFormation(formation) {
  const key = normalizeKey(formation);
  if (!formations(key)) return;
  formationState.away.key = key;
  drawAway(key, true);
  commit();
}

/**
 * 保存状態の復元用：フォーメーション名だけをセットする（描画しない）。
 * スライダーは呼び出し側で先に合わせておくこと。
 */
export function setFormationKeys({ home, away } = {}) {
  if (home && formations(home)) {
    formationState.home.key = home;
    formationState.home.sliderSnapshot = readFormationSliders();
  }
  if (away && formations(away)) formationState.away.key = away;
}

/** アウェイを現在のフォーメーションで描き直す */
export function redrawAway({ resetManual = false } = {}) {
  if (formationState.away.key) drawAway(formationState.away.key, resetManual);
}

/** 両チームを描き直す（手動配置は維持） */
export function redrawBoth() {
  redrawAllPlayers();
  redrawAway();
}

/** ドラッグや局面呼び出しで固定した位置をすべて解除する */
export function clearManualPositions() {
  resetManualPositions('home');
  resetManualPositions('away');
  redrawBoth();
  commit();
}

/**
 * スライダー・ジョイスティック操作時の再描画。
 * backs / DMF / Top が選択時から変わっていればスライダー由来の
 * フォーメーションに切り替え、変わっていなければ現在のものを維持する。
 */
export function redrawAllPlayers({ resetManual = false } = {}) {
  const sliders = readFormationSliders();
  let key = formationState.home.key;

  if (!key || !sameSnapshot(sliders, formationState.home.sliderSnapshot)) {
    const sliderKey = getFormationName(sliders.backs, sliders.volante, sliders.top);
    if (sliderKey !== key) {
      resetManual = true;   // 形が変わったら手動配置は破棄
      if (formationState.home.flipMode === 'auto') chooseLeastMovement(sliderKey);
      if (formationState.home.flipMode === 'ball') { formationState.home.key = sliderKey; chooseBallSide(); }
      queueMicrotask(() => emit('flips:change'));
    }
    key = sliderKey;
    formationState.home.key = key;
    formationState.home.sliderSnapshot = sliders;
  }
  drawHome(key, resetManual);
}

/** 後方互換: チーム変更後に指定フォーメーションで再描画する */
export function redrawAllPlayers_if_team_changed(formation, side = 'home') {
  if (side === 'home') selectHomeFormation(formation);
  else                 selectAwayFormation(formation);
}

/**
 * 番号入力の内容をフィールドに反映する（手動ドラッグ位置は維持）。
 * 【修正】以前の renewSquad(…, null, …) は入力欄を 1〜11 に作り直してしまい、
 * 入力した番号が消えたうえフィールドにも反映されていなかった。
 * @param {boolean} isHome
 */
export function applySquadNumbers(isHome) {
  if (isHome) {
    redrawAllPlayers();
  } else if (formationState.away.key) {
    drawAway(formationState.away.key, false);
  }
  commit();
}

// ─── フォーメーションボタン ───────────────────────────────────────────────────

/**
 * ホーム・アウェイのフォーメーションコンテナにイベント委譲で
 * クリックリスナーを登録する。initFlickFormationUI() の後に呼ぶこと。
 */
export function initializeFormationButtons() {
  document.querySelector('.home-formations')?.addEventListener('click', e => {
    const btn = e.target.closest('button[data-formation]');
    if (btn) selectHomeFormation(btn.dataset.formation);
  });
  document.querySelector('.away-formations')?.addEventListener('click', e => {
    const btn = e.target.closest('button[data-formation]');
    if (btn) selectAwayFormation(btn.dataset.formation);
  });
}

/**
 * フォーメーションボタンのアクティブ状態を更新し、
 * コンテナに 'formation:change' イベントを発火する（フリック UI の表示同期用）。
 *
 * @param {string|string[]} formation
 * @param {'home'|'away'}   [side='home']
 */
export function updateFormationButtons(formation, side = 'home') {
  const key       = normalizeKey(formation);
  const container = document.querySelector(side === 'away' ? '.away-formations' : '.home-formations');
  if (!container) return;

  container.querySelectorAll('button[data-formation]').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.formation === key);
  });
  container.dispatchEvent(new CustomEvent('formation:change', { detail: { key } }));
}

// ─── スクワッド入力フィールド ─────────────────────────────────────────────────

/**
 * スクワッド入力フィールドを（再）生成する。
 * 【修正】番号を打ち替えると横の選手名もその場で更新されるようにした
 * （以前は innerHTML 生成のみでリスナーがなかった）。
 *
 * @param {string}   containerId
 * @param {number[]} squadNumbers  ラインナップの bestMember 配列
 * @param {boolean}  isHome
 */
export function createInputs(containerId, squadNumbers, isHome) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const members = getCurrentLineup(isHome)?.members ?? {};
  const numbers = squadNumbers?.length === 11
    ? squadNumbers
    : [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

  container.replaceChildren();
  for (let i = 10; i >= 0; i--) {
    const row = document.createElement('div');
    row.className = 'squad-input';

    const nameSpan = document.createElement('span');
    nameSpan.className        = 'player-name-label';
    nameSpan.dataset.squadIdx = String(i);
    nameSpan.textContent      = members[numbers[i]] ?? '';

    const input = document.createElement('input');
    input.type     = 'number';
    input.name     = `number${i + 1}`;
    input.value    = numbers[i];
    input.required = true;
    input.addEventListener('input', () => {
      nameSpan.textContent = members[Number(input.value)] ?? '';
    });

    row.append(nameSpan, input);
    container.appendChild(row);
  }
}

// ─── ジョイスティック ────────────────────────────────────────────────────────

let animationQueued = false;
function requestRedraw() {
  if (animationQueued) return;
  animationQueued = true;
  requestAnimationFrame(() => {
    animationQueued = false;
    redrawAllPlayers();
  });
}

/**
 * ジョイスティックを初期化する。
 * @param {string}              areaId
 * @param {string}              knobId
 * @param {{x:number,y:number}} targetStick
 */
const joysticks = [];

/** スティックの値に合わせてノブの表示位置を更新する（状態復元用） */
export function syncJoystickKnobs() {
  for (const { area, knob, stick } of joysticks) {
    const w = area.clientWidth;
    const h = area.clientHeight;
    if (!w || !h) continue;   // 非表示中（ドロワーが閉じている等）
    const r = Math.max(1, w / 2 - 20);
    knob.style.left = `${w / 2 + stick.x * r}px`;
    knob.style.top  = `${h / 2 - stick.y * r}px`;
  }
}

function initJoystick(areaId, knobId, targetStick) {
  const area = document.getElementById(areaId);
  const knob = document.getElementById(knobId);
  if (!area || !knob) return;
  joysticks.push({ area, knob, stick: targetStick });

  area.style.touchAction = 'none';
  let activePointerId = null;

  function applyMove(clientX, clientY) {
    const rect      = area.getBoundingClientRect();
    const centerX   = rect.width  / 2;
    const centerY   = rect.height / 2;
    const maxRadius = Math.max(1, rect.width / 2 - 20);   // 0 除算防止

    let x = clientX - rect.left - centerX;
    let y = clientY - rect.top  - centerY;

    const dist = Math.hypot(x, y);
    if (dist > maxRadius) {
      x = x / dist * maxRadius;
      y = y / dist * maxRadius;
    }

    knob.style.left = `${centerX + x}px`;
    knob.style.top  = `${centerY + y}px`;

    targetStick.x =  x / maxRadius;
    targetStick.y = -y / maxRadius;

    requestRedraw();
  }

  area.addEventListener('pointerdown', e => {
    e.preventDefault();
    area.setPointerCapture(e.pointerId);
    activePointerId = e.pointerId;
    applyMove(e.clientX, e.clientY);
  });
  area.addEventListener('pointermove', e => {
    if (activePointerId === e.pointerId) applyMove(e.clientX, e.clientY);
  });
  const release = e => {
    if (activePointerId !== e.pointerId) return;
    activePointerId = null;
    syncJoystickKnobs();   // PC / SP の両ノブをそろえる
    commit();
  };
  area.addEventListener('pointerup',     release);
  area.addEventListener('pointercancel', release);
}

// ウィング用（PC / SP）
initJoystick('joystick-area',    'knob',    wingStick);
initJoystick('joystick-area-sp', 'knob-sp', wingStick);

// 圧縮用（PC / SP）※現在 HTML ではコメントアウト中
initJoystick('joystick-area-compress',    'knob-compress',    compressStick);
initJoystick('joystick-area-compress-sp', 'knob-compress-sp', compressStick);
