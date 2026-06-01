import { teamColors, teamStyles } from './config.js';

export function updateTeamColor(isHome, teamKey) {
  const s = teamColors[teamKey];
  const t = teamStyles[teamKey];      
  const chip = isHome ? document.querySelector('.home-chip') : document.querySelector('.away-chip');

  // ラベル更新
  chip.style.background = s.color;
  chip.style.color = t.text;
  chip.textContent = `${t.name} : ${isHome ? 'ホーム' : 'アウェイ'}`;

  // フィールド上の色更新
  document.querySelectorAll(isHome ? '.player.home' : '.player.away')
    .forEach(p => {
      p.style.background = t.style;
      p.style.color = t.text;
    });
}

export function initializeTeamSelects() {
    const homeSelect = document.getElementById('homeTeamSelect');
    const awaySelect = document.getElementById('awayTeamSelect');

    homeSelect.addEventListener('change', e => updateTeamColor(true, e.target.value));
    awaySelect.addEventListener('change', e => updateTeamColor(false, e.target.value));

    // Initial setup
    updateTeamColor(true,  homeSelect.value);
    updateTeamColor(false, awaySelect.value);
}