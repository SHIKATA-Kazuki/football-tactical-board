import { formations, getFormationName, formationSliderMap } from './formations_new.js';
import { playerRoles, team_member, infomation } from './config.js';
import {
  readPlayersFromForm,
  placePlayers,
  applyFormation,
  wingStick,
  compressStick,
  resetManualPositions,
  sliderVal
} from './players.js';

// away が初期化済みかを team-colors から参照（循環回避のため関数で遅延取得）
function isAwayReady() {
  // players.js 側の awayPlayers 長で判定（0 なら未描画）
  return document.querySelectorAll('.player.away').length > 0;
}


// =====================================================
// フォーメーションボタン初期化
// =====================================================
export function initializeFormationButtons() {
  // Home ボタン
  document.querySelectorAll('.home-formations button').forEach(btn => {
    btn.addEventListener('click', e => {
      document.querySelectorAll('.home-formations button').forEach(b => b.classList.remove('active'));
      e.currentTarget.classList.add('active');

      const SBvalue   = sliderVal("sidbackUpDown");
      const lineValue = sliderVal("lineSlider");
      let DF_line = 26 - lineValue * 15;
      let FW_line = -26 + lineValue * 15;

      const key   = e.currentTarget.dataset.formation;
      const pos = formations(key, {DF:DF_line, FW:FW_line, SB:SBvalue});
      if (!pos) return;

      // スライダーも連動させる
      const config = formationSliderMap[key];
      if (config) {
        document.getElementById("backsSlider").value   = config.backs;
        document.getElementById("volanteSlider").value = config.volante;
        document.getElementById("topSlider").value     = config.top;
      }

      const players = readPlayersFromForm(document.getElementById("playerFormHome"));
      placePlayers(players, pos, false, true);  // resetManual=true
    });
  });

  // Away ボタン
  document.querySelectorAll('.away-formations button').forEach(btn => {
    btn.addEventListener('click', e => {
      document.querySelectorAll('.away-formations button').forEach(b => b.classList.remove('active'));
      e.currentTarget.classList.add('active');

      const key   = e.currentTarget.dataset.formation;
      const pos = formations(key, {});
      if (!pos) return;

      const players = readPlayersFromForm(document.getElementById("playerFormAway"));
      const flipped = pos.map(([x, y]) => [100 - x, 100 - y]);
      placePlayers(players, flipped, true, true);  // resetManual=true
    });
  });
}


// =====================================================
// フォーメーションボタンのアクティブ状態更新
// side: 'home' | 'away'（省略時は 'home'）
// =====================================================
export function updateFormationButtons(formation, side = 'home') {
  const key = Array.isArray(formation) ? formation[0] : formation;
  const selector = side === 'away'
    ? '.away-formations button'
    : '.home-formations button';

  document.querySelectorAll(selector).forEach(button => {
    button.classList.toggle("active", button.dataset.formation === key);
  });
}


// =====================================================
// 番号入力欄を生成
// =====================================================
export function createInputs(containerId, squad_number, homeaway) {
    const container = document.getElementById(containerId)
    let team = document.getElementById("homeTeamSelect").value;
  if (!homeaway){
      team = document.getElementById("awayTeamSelect").value;
  }
  if (!container) return;
  container.innerHTML = "";
  const numbers = (squad_number && squad_number.length === 11)
    ? squad_number
    : [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
  document.getElementById
  for (let i = 10; i >= 0; i--) {
    container.innerHTML += `
      <div class="squad-input">
        ${playerRoles[i]}
        ${team_member[team]?.[numbers[i]]}
        <input type="number" name="number${i + 1}" value="${numbers[i]}" required>
        </div>
    `;
  }
}


// =====================================================
// 全選手を再描画（スライダー・ジョイスティック変更時）
// home のみ対象。away はフォーメーションボタンかチーム選択で動く
// =====================================================
export function redrawAllPlayers({ resetManual = false } = {}) {
  const top     = parseFloat(document.getElementById("topSlider").value);
  const volante = parseFloat(document.getElementById("volanteSlider").value);
  const backs   = parseFloat(document.getElementById("backsSlider").value);
  
  const SBvalue   = sliderVal("sidbackUpDown");
  const lineValue = sliderVal("lineSlider");
  let DF_line = 26 - lineValue * 15;
  let FW_line = -26 + lineValue * 15;

  const name     = getFormationName(backs, volante, top);
  const formation = structuredClone(formations(name,{DF:DF_line, FW:FW_line, SB:SBvalue}));

  applyFormation(formation, resetManual);  // home のみ
}


// =====================================================
// チーム変更時の再描画（フォーメーション指定、サイド指定）
// =====================================================
export function redrawAllPlayers_if_team_changed(formation, side = 'home') {
  const SBvalue   = sliderVal("sidbackUpDown");
  const lineValue = sliderVal("lineSlider");
  let DF_line = 26 - lineValue * 15;
  let FW_line = -26 + lineValue * 15;
  console.log("lineValue", lineValue, "DF_line", DF_line, "FW_line", FW_line, "SBvalue", SBvalue)
  const key       = Array.isArray(formation) ? formation[0] : formation;
  const positions = structuredClone(formations(key, {DF:DF_line, FW:FW_line, SB:SBvalue}));
  if (!positions) return;

  const config = formationSliderMap[key];

  if (side === 'home') {
    // スライダー更新
    if (config) {
      document.getElementById("backsSlider").value   = config.backs;
      document.getElementById("volanteSlider").value = config.volante;
      document.getElementById("topSlider").value     = config.top;
    }
    applyFormation(positions, true);

  } else {
    // away: 上下反転して配置
    const flipped = positions.map(([x, y]) => [100 - x, 100 - y]);
    const players = readPlayersFromForm(document.getElementById("playerFormAway"));
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
// targetStick: 値の書き込み先オブジェクト（wingStick or compressStick）
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

    // 書き込み先に応じて値をセット
    targetStick.x =  x / maxRadius;  // 左:-1 〜 右:+1
    targetStick.y = -y / maxRadius;  // 下:-1 〜 上:+1

    requestRedraw();
  }

  area.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    area.setPointerCapture(e.pointerId);
    activePointerId = e.pointerId;
    applyMove(e.clientX, e.clientY);
  }, { passive: false });

  area.addEventListener('pointermove', (e) => {
    if (activePointerId !== e.pointerId) return;
    applyMove(e.clientX, e.clientY);
  });

  area.addEventListener('pointerup', (e) => {
    if (activePointerId !== e.pointerId) return;
    activePointerId = null;
  });

  area.addEventListener('pointercancel', (e) => {
    if (activePointerId !== e.pointerId) return;
    activePointerId = null;
  });
}

// wing 用（PC / SP）
initJoystick('joystick-area',    'knob',    wingStick);
initJoystick('joystick-area-sp', 'knob-sp', wingStick);

// 圧縮用（PC / SP で共用する場合は -sp 版も追加）
initJoystick('joystick-area-compress',    'knob-compress',    compressStick);
initJoystick('joystick-area-compress-sp', 'knob-compress-sp', compressStick);