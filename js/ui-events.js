import { formations, getFormationName, formationSliderMap} from './formations.js';
import { playerRoles } from './config.js';
import { 
    readPlayersFromForm, 
    placePlayers, 
    applyFormation, 
    wingStick
} from './players.js';


export function initializeFormationButtons() {
  // Home side
  document.querySelectorAll('.home-formations button').forEach(btn => {
    btn.addEventListener('click', e => {
      document.querySelectorAll('.home-formations button').forEach(b => b.classList.remove('active'));
      const button = e.currentTarget;
      button.classList.add('active');
      const f = button.dataset.formation;

      const players = readPlayersFromForm(document.getElementById("playerFormHome"));
      const pos = formations[f];
      if (pos) placePlayers(players, pos, false);
    });
  });

  // Away side
  document.querySelectorAll('.away-formations button').forEach(btn => {
    btn.addEventListener('click', e => {
      document.querySelectorAll('.away-formations button').forEach(b => b.classList.remove('active'));
      const button = e.currentTarget;
      button.classList.add('active');
      const f = button.dataset.formation;
      
      const players = readPlayersFromForm(document.getElementById("playerFormAway"));
      const pos = formations[f];
      if (pos) {
        const flipped = pos.map(([x, y]) => [100 - x, 100 - y]);
        placePlayers(players, flipped, true);
      }
    });
  });
}


export function updateFormationButtons(formation) {
    let buttons =
        document.querySelectorAll(
            ".home-formations button"
        );

    buttons.forEach(button => {
        button.classList.remove("active");
        if (
            button.dataset.formation
            === formation
        ) {
            button.classList.add("active");
        }
    });
    // buttons =
    //     document.querySelectorAll(
    //         ".away-formations button"
    //     );

    // buttons.forEach(button => {
    //     button.classList.remove("active");
    //     if (
    //         button.dataset.formation
    //         === formation
    //     ) {
    //         button.classList.add("active");
    //     }
    // });
}

export function createInputs(containerId, squad_number) {
    const container = document.getElementById(containerId);
    container.innerHTML = "";
    let numbers;
    if (squad_number && squad_number.length === 11) {
        numbers = squad_number;
    } else {
        numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
    }
    for (let i = 0; i <= 10; i++) {
        container.innerHTML += `
          <div>
            ${playerRoles[i]} <input type="number" name="number${i+1}" value="${numbers[i]}" required>
          </div>
        `;
    }
}


export function redrawAllPlayers() {
    const top     = parseFloat( document.getElementById("topSlider").value );
    const volante = parseFloat( document.getElementById("volanteSlider").value );
    const backs   = parseFloat( document.getElementById("backsSlider").value);
        
    const BASE_FORMATION_NAME = getFormationName(backs, volante, top);
    let formation = structuredClone(formations[BASE_FORMATION_NAME]);
    applyFormation(formation);
}

export function redrawAllPlayers_if_team_changed(formation) {
    let positions =
      structuredClone(
        formations[formation]
      );

    const topSlider = document.getElementById("topSlider");
    const volanteSlider = document.getElementById("volanteSlider");
    const backsSlider = document.getElementById("backsSlider");

    const config = formationSliderMap[formation];
    
    backsSlider.value = config.backs;
    volanteSlider.value = config.volante;
    topSlider.value = config.top;

    console.log("Redrawing players for formation:", formation);
    console.log("Positions:", positions);
    applyFormation(positions);
}

let animationQueued = false;

function requestRedraw() {
    if (animationQueued) return;
    animationQueued = true;
    requestAnimationFrame(() => {
        redrawAllPlayers();
        animationQueued = false;
    });
}

const area = document.getElementById('joystick-area');
const knob = document.getElementById('knob');
const status = document.getElementById('status');
let isDragging = false;
// コントローラーの中心座標
const rect = area.getBoundingClientRect();
const centerX = rect.width / 2;
const centerY = rect.height / 2;
function move(e) {

  if (!isDragging) return;

  const clientX =
    e.touches
    ? e.touches[0].clientX
    : e.clientX;

  const clientY =
    e.touches
    ? e.touches[0].clientY
    : e.clientY;

  const rect = area.getBoundingClientRect();

  let x = clientX - rect.left - centerX;
  let y = clientY - rect.top - centerY;

  const distance = Math.sqrt(x*x + y*y);
  const maxRadius = rect.width / 2 - 20;

  if (distance > maxRadius) {
    const angle = Math.atan2(y, x);
    x = Math.cos(angle) * maxRadius;
    y = Math.sin(angle) * maxRadius;
  }

  knob.style.left = `${centerX + x}px`;
  knob.style.top = `${centerY + y}px`;

  const valX = x / maxRadius;
  const valY =-y / maxRadius;

  wingStick.x = valX;
  wingStick.y = valY;
  requestRedraw();
}
// イベントリスナーの登録
area.addEventListener('mousedown', () => isDragging = true);
window.addEventListener('mouseup', () => {
  isDragging = false;
  // 指を離した時に中央に戻すなら以下（戻さないならコメントアウト）
  // knob.style.left = '50%'; knob.style.top = '50%';
});
window.addEventListener('mousemove', move);
// タッチ対応
area.addEventListener('touchstart', () => isDragging = true);
window.addEventListener('touchend', () => isDragging = false);
window.addEventListener('touchmove', move);