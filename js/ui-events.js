import { formations, getFormationName, formationSliderMap } from './formations_new.js';
import { TEAMS, team_member, information } from './config.js';
import {
  readPlayersFromForm,
  placePlayers,
  applyFormation,
  wingStick,
  compressStick,
  resetManualPositions,
  sliderVal
} from './players.js';

function isAwayReady() {
  return document.querySelectorAll('.player.away').length > 0;
}


// =====================================================
// フォーメーションボタン初期化
// イベント委譲で登録するため、隠しボタンの生成タイミングに依存しない
// =====================================================
export function initializeFormationButtons() {
  // Home: .home-formations コンテナにまとめて登録
  const homeContainer = document.querySelector('.home-formations');
  if (homeContainer) {
    homeContainer.addEventListener('click', e => {
      const btn = e.target.closest('button[data-formation]');
      if (!btn) return;

      homeContainer.querySelectorAll('button').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const SBvalue   = sliderVal('sidbackUpDown');
      const lineValue = sliderVal('lineSlider');
      const DF_line = 26 - (lineValue - 0.33) * 15;
      const FW_line = -22 + (lineValue - 0.33) * 15;
      const cx = compressStick.x * 5 + 50;
      const cy = compressStick.y * (-5) + 50;

      const key = btn.dataset.formation;
      const pos = formations(key, { anchor: [cx, cy], DF: DF_line, FW: FW_line, SB: SBvalue });
      if (!pos) return;

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

  // Away: .away-formations コンテナにまとめて登録
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


// =====================================================
// フォーメーションボタンのアクティブ状態更新
// side: 'home' | 'away'（省略時は 'home'）
// =====================================================
export function updateFormationButtons(formation, side = 'home') {
  const key = Array.isArray(formation) ? formation[0] : formation;
  const selector = side === 'away' ? '.away-formations button' : '.home-formations button';

  document.querySelectorAll(selector).forEach(button => {
    button.classList.toggle('active', button.dataset.formation === key);
  });
}


// =====================================================
// 番号入力欄を生成
// =====================================================
export function createInputs(containerId, squadNumbers, isHome) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const teamKey = document.getElementById(isHome ? 'homeTeamSelect' : 'awayTeamSelect').value;
  const members = team_member[teamKey] ?? team_member[teamKey.replace('_AwayVer', '')] ?? {};
  const numbers = (squadNumbers?.length === 11) ? squadNumbers : [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

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

export function renewSquad(containerId, squadNumbers, isHome) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const teamKey = document.getElementById(isHome ? 'homeTeamSelect' : 'awayTeamSelect').value;
  const members = team_member[teamKey] ?? team_member[teamKey.replace('_AwayVer', '')] ?? {};
  const numbers = (squadNumbers?.length === 11) ? squadNumbers : [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

  container.innerHTML = '';
  for (let i = 10; i >= 0; i--) {
    const row = document.createElement('div');
    row.className = 'squad-input';

    const nameSpan = document.createElement('span');
    nameSpan.textContent = members[numbers[i]] ?? '';

    const input = document.createElement('input');
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


// =====================================================
// 全選手を再描画（スライダー・ジョイスティック変更時）
// =====================================================
export function redrawAllPlayers({ resetManual = false } = {}) {
  const top     = parseFloat(document.getElementById('topSlider').value);
  const volante = parseFloat(document.getElementById('volanteSlider').value);
  const backs   = parseFloat(document.getElementById('backsSlider').value);

  const SBvalue   = sliderVal('sidbackUpDown');
  const lineValue = sliderVal('lineSlider');
  const DF_line = 26 - (lineValue - 0.33) * 15;
  const FW_line = -22 + (lineValue - 0.33) * 15;
  const cx = compressStick.x * 5 + 50;
  const cy = compressStick.y * (-5) + 50;

  const name      = getFormationName(backs, volante, top);
  const formation = structuredClone(formations(name, { anchor: [cx, cy], DF: DF_line, FW: FW_line, SB: SBvalue }));

  applyFormation(formation, resetManual);
}


// =====================================================
// チーム変更時の再描画
// =====================================================
export function redrawAllPlayers_if_team_changed(formation, side = 'home') {
  const SBvalue   = sliderVal('sidbackUpDown');
  const lineValue = sliderVal('lineSlider');
  const DF_line = 26 - (lineValue - 0.33) * 15;
  const FW_line = -22 + (lineValue - 0.33) * 15;
  const cx = compressStick.x * 5 + 50;
  const cy = compressStick.y * (-5) + 50;

  const key       = Array.isArray(formation) ? formation[0] : formation;
  const positions = structuredClone(formations(key, { anchor: [cx, cy], DF: DF_line, FW: FW_line, SB: SBvalue }));
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


// =====================================================
// アニメーション制御（連続入力対策）
// =====================================================
let animationQueued = false;

function requestRedraw() {
  if (animationQueued) return;
  animationQueued = true;
  requestAnimationFrame(() => {
    redrawAllPlayers();
    animationQueued = false;
  });
}


// =====================================================
// ジョイスティック汎用初期化
// =====================================================
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

// wing 用（PC / SP）
initJoystick('joystick-area',    'knob',    wingStick);
initJoystick('joystick-area-sp', 'knob-sp', wingStick);

// 圧縮用
initJoystick('joystick-area-compress',    'knob-compress',    compressStick);
initJoystick('joystick-area-compress-sp', 'knob-compress-sp', compressStick);
