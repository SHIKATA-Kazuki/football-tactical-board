import { teamColors, infomation } from './config.js';
import { initializeTeamSelects } from './team-colors.js';
import { formations, formationSliderMap } from './formations.js';
import {
  initializeFormationButtons,
  updateFormationButtons,
  createInputs,
  redrawAllPlayers
} from './ui-events.js';

document.addEventListener("DOMContentLoaded", () => {

  const homeSelect = document.getElementById("homeTeamSelect");
  const awaySelect = document.getElementById("awayTeamSelect");

  /* =====================================================
     初期化
  ===================================================== */
  createInputs("inputsHome", infomation[homeSelect.value]?.["BestMember"]);
  createInputs("inputsAway", infomation[awaySelect.value]?.["BestMember"]);

  initializeTeamSelects();      // home を描画、away は描画しない
  initializeFormationButtons(); // ボタンにイベント付与

  /* =====================================================
     スライダー変更 → home のみ再描画
  ===================================================== */
  document.querySelectorAll('input[type="range"]').forEach(slider => {
    slider.addEventListener("input", () => {
      updateFormationButtons(); // home ボタンのアクティブ状態更新
      redrawAllPlayers();       // home のみ
    });
  });

  redrawAllPlayers();
});

/* 終了 */
