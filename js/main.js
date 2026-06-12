import { information } from './config.js';
import { initializeTeamSelects } from './team-colors.js';
import { formationSliderMap } from './formations_new.js';
import {
  initializeFormationButtons,
  updateFormationButtons,
  createInputs,
  redrawAllPlayers,
  renewSquad
} from './ui-events.js';
import { initFlickFormationUI } from './formation-flick-ui.js';


document.addEventListener('DOMContentLoaded', () => {
  document.querySelector('.forms-wrapper.infopart').style.display = 'flex';

  initializeTeamSelects();
  initFlickFormationUI();       // 先：隠しボタンを DOM に生成
  initializeFormationButtons(); // 後：生成済みボタンに click リスナーを登録

  const homeSelect = document.getElementById('homeTeamSelect');
  const awaySelect = document.getElementById('awayTeamSelect');

  createInputs('inputsHome',    information[homeSelect.value]?.BestMember, true);
  createInputs('inputsAway',    information[awaySelect.value]?.BestMember, false);
  createInputs('inputsHome-sp', information[homeSelect.value]?.BestMember, true);
  createInputs('inputsAway-sp', information[awaySelect.value]?.BestMember, false);

  // スライダー変更 → home のみ再描画
  document.querySelectorAll('input[type="range"]').forEach(slider => {
    slider.addEventListener('input', () => {
      updateFormationButtons();
      redrawAllPlayers();
    });
  });

  // スクワッド送信
  document.querySelector('form').addEventListener('submit', event => {
    event.preventDefault();
    const home = document.getElementById('homeTeamSelect');
    const away = document.getElementById('awayTeamSelect');
    renewSquad('inputsHome',    information[home.value]?.BestMember, true);
    renewSquad('inputsAway',    information[away.value]?.BestMember, false);
    renewSquad('inputsHome-sp', information[home.value]?.BestMember, true);
    renewSquad('inputsAway-sp', information[away.value]?.BestMember, false);
  });

  redrawAllPlayers();
});


/* 終了 */
