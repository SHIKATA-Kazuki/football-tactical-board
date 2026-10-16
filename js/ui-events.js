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
 */

import { formations, getFormationName, formationSliderMap } from './formations.js';
import { getLineup } from './config.js';
import {
  readPlayersFromForm,
  placePlayers,
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
  home: { key: null, sliderSnapshot: null },
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

// ─── 描画 ────────────────────────────────────────────────────────────────────

function drawHome(key, resetManual) {
  const { cx, cy, DF_line, FW_line, SBvalue } = readTacticalSliders();
  const pos = formations(key, { anchor: [cx, cy], DF: DF_line, FW: FW_line, SB: SBvalue });
  if (!pos) {
    console.warn(`[ui-events] 未定義のフォーメーション: ${key}`);
    return;
  }
  const members = getCurrentLineup(true)?.members ?? {};
  applyFormation(pos, resetManual, members);
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

/** ホームのフォーメーションを明示的に選択する（ボタン・フリック・チーム変更） */
export function selectHomeFormation(formation) {
  const key = normalizeKey(formation);
  if (!formations(key)) return;
  formationState.home.key = key;
  syncFormationSliders(key);
  drawHome(key, true);
}

/** アウェイのフォーメーションを明示的に選択する */
export function selectAwayFormation(formation) {
  const key = normalizeKey(formation);
  if (!formations(key)) return;
  formationState.away.key = key;
  drawAway(key, true);
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
    if (sliderKey !== key) resetManual = true;   // 形が変わったら手動配置は破棄
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
function initJoystick(areaId, knobId, targetStick) {
  const area = document.getElementById(areaId);
  const knob = document.getElementById(knobId);
  if (!area || !knob) return;

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
  const release = e => { if (activePointerId === e.pointerId) activePointerId = null; };
  area.addEventListener('pointerup',     release);
  area.addEventListener('pointercancel', release);
}

// ウィング用（PC / SP）
initJoystick('joystick-area',    'knob',    wingStick);
initJoystick('joystick-area-sp', 'knob-sp', wingStick);

// 圧縮用（PC / SP）※現在 HTML ではコメントアウト中
initJoystick('joystick-area-compress',    'knob-compress',    compressStick);
initJoystick('joystick-area-compress-sp', 'knob-compress-sp', compressStick);
