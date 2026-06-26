/**
 * ui-events.js
 *
 * UI イベントの登録とフォーメーション操作ロジック。
 *
 * 責務:
 *   - フォーメーションボタン（ホーム・アウェイ）のクリックイベント
 *   - スライダー値の読み取りと選手再描画
 *   - チーム変更時の再描画
 *   - ジョイスティック初期化
 *   - スクワッド入力フィールドの生成・更新
 */

import { formations, getFormationName, formationSliderMap } from './formations.js';
import { TEAM_CATALOG, getLineup } from './config.js';
import {
  readPlayersFromForm,
  placePlayers,
  applyFormation,
  wingStick,
  compressStick,
  resetManualPositions,
  sliderVal,
} from './players.js';

// ─── 内部ユーティリティ ──────────────────────────────────────────────────────

/**
 * 現在のサイドのラインナップを取得する。
 * team-colors.js の getCurrentSelection に依存するが循環 import を避けるため
 * DOM から直接読む（3 段セレクトの value を参照）。
 *
 * @param {boolean} isHome
 * @returns {{ members: Record<number,string> } | null}
 */
function getCurrentLineup(isHome) {
  const side     = isHome ? 'home' : 'away';
  const teamEl   = document.querySelector(`.${side}-team-select`);
  const seasonEl = document.querySelector(`.${side}-season-select`);
  const lineupEl = document.querySelector(`.${side}-lineup-select`);
  if (!teamEl || !seasonEl || !lineupEl) return null;
  return getLineup(teamEl.value, seasonEl.value, lineupEl.value);
}

/**
 * 戦術スライダー値をまとめて読み取る。
 * @returns {{ cx:number, cy:number, DF_line:number, FW_line:number, SBvalue:number }}
 */
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

// ─── フォーメーションボタン ───────────────────────────────────────────────────

/**
 * ホーム・アウェイのフォーメーションコンテナにイベント委譲で
 * クリックリスナーを登録する。
 *
 * initFlickFormationUI() による隠しボタン生成後に呼ぶこと。
 */
export function initializeFormationButtons() {
  // ── ホーム ──────────────────────────────────────────────────────────────────
  const homeContainer = document.querySelector('.home-formations');
  if (homeContainer) {
    homeContainer.addEventListener('click', e => {
      const btn = e.target.closest('button[data-formation]');
      if (!btn) return;

      homeContainer.querySelectorAll('button').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const key = btn.dataset.formation;
      const { cx, cy, DF_line, FW_line, SBvalue } = readTacticalSliders();
      const pos = formations(key, { anchor: [cx, cy], DF: DF_line, FW: FW_line, SB: SBvalue });
      if (!pos) return;

      // スライダー値を該当フォーメーションに合わせる
      const config = formationSliderMap[key];
      if (config) {
        document.getElementById('backsSlider').value   = config.backs;
        document.getElementById('volanteSlider').value = config.volante;
        document.getElementById('topSlider').value     = config.top;
      }

      const players = readPlayersFromForm(document.getElementById('playerFormHome'));
      placePlayers(players, pos, false, true);
    });
  }

  // ── アウェイ ────────────────────────────────────────────────────────────────
  const awayContainer = document.querySelector('.away-formations');
  if (awayContainer) {
    awayContainer.addEventListener('click', e => {
      const btn = e.target.closest('button[data-formation]');
      if (!btn) return;

      awayContainer.querySelectorAll('button').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const key = btn.dataset.formation;
      const pos = formations(key, {});
      if (!pos) return;

      const players = readPlayersFromForm(document.getElementById('playerFormAway'));
      const flipped = pos.map(([x, y]) => [100 - x, 100 - y]);
      placePlayers(players, flipped, true, true);
    });
  }
}

/**
 * フォーメーションボタンのアクティブ状態を更新する。
 *
 * @param {string|string[]} formation  フォーメーション名（または [名前, ...] の配列）
 * @param {'home'|'away'}   [side='home']
 */
export function updateFormationButtons(formation, side = 'home') {
  const key      = Array.isArray(formation) ? formation[0] : formation;
  const selector = side === 'away'
    ? '.away-formations button'
    : '.home-formations button';

  document.querySelectorAll(selector).forEach(btn => {
    btn.classList.toggle('active', btn.dataset.formation === key);
  });
}

// ─── スクワッド入力フィールド ─────────────────────────────────────────────────

/**
 * スクワッド入力フィールドを（再）生成する。
 * シンプルに innerHTML で構築するため、初回描画向け。
 *
 * @param {string}   containerId
 * @param {number[]} squadNumbers  ラインナップの bestMember 配列
 * @param {boolean}  isHome
 */
export function createInputs(containerId, squadNumbers, isHome) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const lineup  = getCurrentLineup(isHome);
  const members = lineup?.members ?? {};
  const numbers = squadNumbers?.length === 11
    ? squadNumbers
    : [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

  container.innerHTML = '';
  for (let i = 10; i >= 0; i--) {
    container.innerHTML += `
      <div class="squad-input">
        ${members[numbers[i]] ?? ''}
        <input type="number" name="number${i + 1}" value="${numbers[i]}" required>
      </div>
    `;
  }
}

/**
 * スクワッド入力フィールドを更新する。
 * 選手名の動的更新（input イベント）を含む。
 *
 * @param {string}   containerId
 * @param {number[]} squadNumbers
 * @param {boolean}  isHome
 */
export function renewSquad(containerId, squadNumbers, isHome) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const lineup  = getCurrentLineup(isHome);
  const members = lineup?.members ?? {};
  const numbers = squadNumbers?.length === 11
    ? squadNumbers
    : [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

  container.innerHTML = '';
  for (let i = 10; i >= 0; i--) {
    const row      = document.createElement('div');
    row.className  = 'squad-input';

    const nameSpan = document.createElement('span');
    nameSpan.textContent = members[numbers[i]] ?? '';

    const input    = document.createElement('input');
    input.type     = 'number';
    input.name     = `number${i + 1}`;
    input.value    = numbers[i];
    input.required = true;
    input.addEventListener('input', () => {
      nameSpan.textContent = members[Number(input.value)] ?? '';
    });

    row.appendChild(nameSpan);
    row.appendChild(input);
    container.appendChild(row);
  }
}

// ─── 再描画 ──────────────────────────────────────────────────────────────────

/**
 * スライダー値からフォーメーションを決定し、全選手を再描画する。
 * スライダー変更・ジョイスティック操作時に呼ぶ。
 *
 * @param {Object}  [options]
 * @param {boolean} [options.resetManual=false]
 */
export function redrawAllPlayers({ resetManual = false } = {}) {
  const backs   = parseFloat(document.getElementById('backsSlider').value);
  const volante = parseFloat(document.getElementById('volanteSlider').value);
  const top     = parseFloat(document.getElementById('topSlider').value);

  const { cx, cy, DF_line, FW_line, SBvalue } = readTacticalSliders();
  const name      = getFormationName(backs, volante, top);
  const formation = structuredClone(
    formations(name, { anchor: [cx, cy], DF: DF_line, FW: FW_line, SB: SBvalue })
  );

  applyFormation(formation, resetManual);
}

/**
 * チーム変更後に指定フォーメーションで再描画する。
 *
 * @param {string|string[]} formation
 * @param {'home'|'away'}   [side='home']
 */
export function redrawAllPlayers_if_team_changed(formation, side = 'home') {
  const { cx, cy, DF_line, FW_line, SBvalue } = readTacticalSliders();
  const key       = Array.isArray(formation) ? formation[0] : formation;
  const positions = structuredClone(
    formations(key, { anchor: [cx, cy], DF: DF_line, FW: FW_line, SB: SBvalue })
  );
  if (!positions) return;

  const config = formationSliderMap[key];

  if (side === 'home') {
    if (config) {
      document.getElementById('backsSlider').value   = config.backs;
      document.getElementById('volanteSlider').value = config.volante;
      document.getElementById('topSlider').value     = config.top;
    }
    applyFormation(positions, true);
  } else {
    const flipped = positions.map(([x, y]) => [100 - x, 100 - y]);
    const players = readPlayersFromForm(document.getElementById('playerFormAway'));
    placePlayers(players, flipped, true, true);
  }
}

// ─── ジョイスティック ────────────────────────────────────────────────────────

// requestAnimationFrame で連続入力をまとめる
let animationQueued = false;
function requestRedraw() {
  if (animationQueued) return;
  animationQueued = true;
  requestAnimationFrame(() => {
    redrawAllPlayers();
    animationQueued = false;
  });
}

/**
 * ジョイスティックを初期化する。
 *
 * @param {string}             areaId      操作エリア要素の ID
 * @param {string}             knobId      ノブ要素の ID
 * @param {{x:number,y:number}} targetStick 書き込み先のスティック状態
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
    const maxRadius = rect.width  / 2 - 20;

    let x = clientX - rect.left - centerX;
    let y = clientY - rect.top  - centerY;

    const dist = Math.sqrt(x * x + y * y);
    if (dist > maxRadius) {
      const angle = Math.atan2(y, x);
      x = Math.cos(angle) * maxRadius;
      y = Math.sin(angle) * maxRadius;
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
  }, { passive: false });

  area.addEventListener('pointermove', e => {
    if (activePointerId !== e.pointerId) return;
    applyMove(e.clientX, e.clientY);
  });

  area.addEventListener('pointerup', e => {
    if (activePointerId !== e.pointerId) return;
    activePointerId = null;
  });

  area.addEventListener('pointercancel', e => {
    if (activePointerId !== e.pointerId) return;
    activePointerId = null;
  });
}

// ウィング用（PC / SP）
initJoystick('joystick-area',    'knob',    wingStick);
initJoystick('joystick-area-sp', 'knob-sp', wingStick);

// 圧縮用（PC / SP）
initJoystick('joystick-area-compress',    'knob-compress',    compressStick);
initJoystick('joystick-area-compress-sp', 'knob-compress-sp', compressStick);
