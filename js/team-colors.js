import { teamColors, teamUniformColor, infomation } from './config.js';
import { createInputs, redrawAllPlayers_if_team_changed, updateFormationButtons } from './ui-events.js';
import { placePlayers, resetManualPositions } from './players.js';

// Away が一度でも選択されたか
let awayInitialized = false;

function updateTeamColor(isHome, teamKey) {
  const homeSelect = document.getElementById("homeTeamSelect");
  const awaySelect = document.getElementById("awayTeamSelect");
  const select     = isHome ? homeSelect : awaySelect;

  const s    = teamColors[teamKey];
  const t    = teamUniformColor[teamKey];
  const chip = isHome
    ? document.querySelector('.home-chip')
    : document.querySelector('.away-chip');

  chip.style.background = s.color;
  chip.style.color      = t.text;
  chip.textContent      = `${t.name}`;
  // chip.textContent      = `${t.name} : ${isHome ? 'ホーム' : 'アウェイ'}`;

  // 入力欄更新（home のみ。away は awayInitialized 後）
  createInputs("inputsHome", infomation[homeSelect.value]?.["BestMember"], true);
  if (awayInitialized) {
    createInputs("inputsAway", infomation[awaySelect.value]?.["BestMember"], false);
  }

  // ユニフォーム色更新
  document.querySelectorAll(isHome ? '.player.home' : '.player.away')
    .forEach(p => {
      p.style.background = t.style;
      p.style.color      = t.text;
      if (t.color){
        p.style.textShadow = `
          -0.5px 0.5px 0 ${t.color},
          -0.5px -0.5px 0 ${t.color},
          0.5px 0.5px 0 ${t.color},
          0.5px -0.5px 0 ${t.color}
        `;
      }
      // p.style.border     = `2px solid ${t.color}`;
      // ここ！！！枠線を付け加える
    });

  const formation = infomation[select.value]?.["formation_key"];
  if (!formation) return;

  if (isHome) {
    // Home: スライダー連動で再描画
    redrawAllPlayers_if_team_changed(formation);
    updateFormationButtons(formation, 'home');
  } else {
    // Away: awayInitialized フラグを立てて描画
    awayInitialized = true;
    redrawAllPlayers_if_team_changed(formation, 'away');
    updateFormationButtons(formation, 'away');
  }
}

export function initializeTeamSelects() {
  const homeSelect = document.getElementById('homeTeamSelect');
  const awaySelect = document.getElementById('awayTeamSelect');

  homeSelect.addEventListener('change', e => updateTeamColor(true,  e.target.value));
  awaySelect.addEventListener('change', e => updateTeamColor(false, e.target.value));

  // 初期描画: home のみ。away は「default」なので描画しない
  updateTeamColor(true, homeSelect.value);
  // away は未選択扱い → ノード描画しない

  return { homeSelect, awaySelect };
}

export function isAwayInitialized() {
  return awayInitialized;
}
