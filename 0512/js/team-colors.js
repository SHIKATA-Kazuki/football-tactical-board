import { teamColors, teamStyles , infomation } from './config.js';
import { createInputs, redrawAllPlayers_if_team_changed, updateFormationButtons} from './ui-events.js';

function updateTeamColor(isHome, teamKey) {
  const homeSelect = document.getElementById("homeTeamSelect");
  const awaySelect = document.getElementById("awayTeamSelect");

  const select = isHome ? homeSelect : awaySelect;

  const s = teamColors[teamKey];
  const t = teamStyles[teamKey];      
  const chip = isHome ? document.querySelector('.home-chip') : document.querySelector('.away-chip');

  // ラベル更新
  chip.style.background = s.color;
  chip.style.color = t.text;
  chip.textContent = `${t.name} : ${isHome ? 'ホーム' : 'アウェイ'}`;

  createInputs("inputsHome", infomation[homeSelect.value]["BestMember"]);
  createInputs("inputsAway", infomation[awaySelect.value]["BestMember"]);
  document.querySelectorAll(isHome ? '.player.home' : '.player.away')
    .forEach(p => {
      p.style.background = t.style;
      p.style.color = t.text;
      // p.style.webkit-text-stroke = t.color;
      // p.style.text-stroke = t.color;
    });
    const formation = infomation[select.value]["formation_key"];
    // console.log(formation);
    redrawAllPlayers_if_team_changed(formation);
    updateFormationButtons(formation);
}

export function initializeTeamSelects() {
    const homeSelect = document.getElementById('homeTeamSelect');
    const awaySelect = document.getElementById('awayTeamSelect');

    homeSelect.addEventListener('change', e => updateTeamColor(true,  e.target.value));
    awaySelect.addEventListener('change', e => updateTeamColor(false, e.target.value));

    // Initial setup
    updateTeamColor(true,  homeSelect.value);
    updateTeamColor(false, awaySelect.value);
    // updateFormationButtons(infomation[homeSelect.value]["formation_key"]);
    return { homeSelect, awaySelect };
}