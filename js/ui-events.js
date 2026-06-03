import { formations, getFormationName, formationSliderMap } from './formations.js';
import { playerRoles } from './config.js';
import {
  readPlayersFromForm,
  placePlayers,
  applyFormation,
  wingStick,
  resetManualPositions
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

      const f   = e.currentTarget.dataset.formation;
      const pos = formations[f];
      if (!pos) return;

      // スライダーも連動させる
      const config = formationSliderMap[f];
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

      const f   = e.currentTarget.dataset.formation;
      const pos = formations[f];
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
export function createInputs(containerId, squad_number) {
  const container = document.getElementById(containerId);
  if (!container) return;
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
// 全選手を再描画（スライダー・ジョイスティック変更時）
// home のみ対象。away はフォーメーションボタンかチーム選択で動く
// =====================================================
export function redrawAllPlayers({ resetManual = false } = {}) {
  const top     = parseFloat(document.getElementById("topSlider").value);
  const volante = parseFloat(document.getElementById("volanteSlider").value);
  const backs   = parseFloat(document.getElementById("backsSlider").value);

  const name     = getFormationName(backs, volante, top);
  const formation = structuredClone(formations[name]);

  applyFormation(formation, resetManual);  // home のみ
}


// =====================================================
// チーム変更時の再描画（フォーメーション指定、サイド指定）
// =====================================================
export function redrawAllPlayers_if_team_changed(formation, side = 'home') {
  const key       = Array.isArray(formation) ? formation[0] : formation;
  const positions = structuredClone(formations[key]);
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
// ジョイスティック（home のサイドプレイヤー位置調整）
// =====================================================
const area = document.getElementById('joystick-area');
const knob = document.getElementById('knob');
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

  requestRedraw(); // home のみ再描画
}

area.addEventListener('mousedown',  () => isDragging = true);
window.addEventListener('mouseup',  () => isDragging = false);
window.addEventListener('mousemove', move);
area.addEventListener('touchstart', (e) => { e.preventDefault(); isDragging = true; }, { passive: false });
window.addEventListener('touchend', () => isDragging = false);
window.addEventListener('touchmove', move, { passive: true });