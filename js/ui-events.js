import { formations, getFormationName, formationSliderMap } from './formations.js';
import { playerRoles } from './config.js';
import {
  readPlayersFromForm,
  placePlayers,
  applyFormation,
  wingStick,
  resetManualPositions
} from './players.js';


// =====================================================
// フォーメーションボタン初期化
// =====================================================
export function initializeFormationButtons() {
  // Home
  document.querySelectorAll('.home-formations button').forEach(btn => {
    btn.addEventListener('click', e => {
      document.querySelectorAll('.home-formations button').forEach(b => b.classList.remove('active'));
      const button = e.currentTarget;
      button.classList.add('active');
      const f   = button.dataset.formation;
      const pos = formations[f];
      if (!pos) return;

      const players = readPlayersFromForm(document.getElementById("playerFormHome"));
      // ボタン押下 → 手動移動リセットして再配置
      placePlayers(players, pos, false, true);
    });
  });

  // Away
  document.querySelectorAll('.away-formations button').forEach(btn => {
    btn.addEventListener('click', e => {
      document.querySelectorAll('.away-formations button').forEach(b => b.classList.remove('active'));
      const button = e.currentTarget;
      button.classList.add('active');
      const f   = button.dataset.formation;
      const pos = formations[f];
      if (!pos) return;

      const players  = readPlayersFromForm(document.getElementById("playerFormAway"));
      const flipped  = pos.map(([x, y]) => [100 - x, 100 - y]);
      placePlayers(players, flipped, true, true);
    });
  });
}


// =====================================================
// フォーメーションボタンのアクティブ状態更新
// =====================================================
export function updateFormationButtons(formation) {
  // formation が配列のとき先頭要素を使う
  const key = Array.isArray(formation) ? formation[0] : formation;

  document.querySelectorAll(".home-formations button").forEach(button => {
    button.classList.toggle("active", button.dataset.formation === key);
  });
  // Away も同期したければ以下のコメントを外す
  // document.querySelectorAll(".away-formations button").forEach(button => {
  //   button.classList.toggle("active", button.dataset.formation === key);
  // });
}


// =====================================================
// 番号入力欄を生成
// =====================================================
export function createInputs(containerId, squad_number) {
  const container = document.getElementById(containerId);
  container.innerHTML = "";
  const numbers = (squad_number && squad_number.length === 11)
    ? squad_number
    : [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

  for (let i = 0; i <= 10; i++) {
    container.innerHTML += `
      <div>
        ${playerRoles[i]}
        <input type="number" name="number${i + 1}" value="${numbers[i]}" required>
      </div>
    `;
  }
}


// =====================================================
// 全選手を再描画（スライダー変更時など）
// resetManual: true のとき手動移動をリセット
// side: 'home' | 'away' | 'both'（省略時は 'both'）
// =====================================================
export function redrawAllPlayers({ resetManual = false, side = 'both' } = {}) {
  const top     = parseFloat(document.getElementById("topSlider").value);
  const volante = parseFloat(document.getElementById("volanteSlider").value);
  const backs   = parseFloat(document.getElementById("backsSlider").value);

  const BASE_FORMATION_NAME = getFormationName(backs, volante, top);
  const formation = structuredClone(formations[BASE_FORMATION_NAME]);

  if (side === 'home' || side === 'both') {
    applyFormation(formation, resetManual);
  }

  if (side === 'away' || side === 'both') {
    // Away は上下反転
    const flipped  = formation.map(([x, y]) => [100 - x, 100 - y]);
    const players  = readPlayersFromForm(document.getElementById("playerFormAway"));
    placePlayers(players, flipped, true, resetManual);
  }
}


// =====================================================
// チーム変更時の再描画（フォーメーション指定）
// =====================================================
export function redrawAllPlayers_if_team_changed(formation) {
  // 配列で渡されることがあるので先頭要素を使う
  const key       = Array.isArray(formation) ? formation[0] : formation;
  const positions = structuredClone(formations[key]);
  if (!positions) return;

  const topSlider     = document.getElementById("topSlider");
  const volanteSlider = document.getElementById("volanteSlider");
  const backsSlider   = document.getElementById("backsSlider");

  const config = formationSliderMap[key];
  if (config) {
    backsSlider.value   = config.backs;
    volanteSlider.value = config.volante;
    topSlider.value     = config.top;
  }

  // チーム変更時は手動移動をリセット
  applyFormation(positions, true);
  updateFormationButtons(key);
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
// ジョイスティック（サイドプレイヤー位置調整）
// =====================================================
const area   = document.getElementById('joystick-area');
const knob   = document.getElementById('knob');
let isDragging = false;

function move(e) {
  if (!isDragging) return;

  const clientX = e.touches ? e.touches[0].clientX : e.clientX;
  const clientY = e.touches ? e.touches[0].clientY : e.clientY;
  const rect    = area.getBoundingClientRect();
  const centerX = rect.width  / 2;
  const centerY = rect.height / 2;

  let x = clientX - rect.left - centerX;
  let y = clientY - rect.top  - centerY;

  const distance  = Math.sqrt(x * x + y * y);
  const maxRadius = rect.width / 2 - 20;

  if (distance > maxRadius) {
    const angle = Math.atan2(y, x);
    x = Math.cos(angle) * maxRadius;
    y = Math.sin(angle) * maxRadius;
  }

  knob.style.left = `${centerX + x}px`;
  knob.style.top  = `${centerY + y}px`;

  wingStick.x =  x / maxRadius;
  wingStick.y = -y / maxRadius;

  requestRedraw();
}

area.addEventListener('mousedown',  () => isDragging = true);
window.addEventListener('mouseup',  () => isDragging = false);
window.addEventListener('mousemove', move);
area.addEventListener('touchstart', () => isDragging = true);
window.addEventListener('touchend', () => isDragging = false);
window.addEventListener('touchmove', move, { passive: true });
