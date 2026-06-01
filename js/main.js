import { teamColors, infomation } from './config.js';
import { initializeTeamSelects } from './team-colors.js';
import {formations, formationSliderMap} from './formations.js';
import {
  initializeFormationButtons, 
  updateFormationButtons, 
  createInputs, 
  redrawAllPlayers
} from './ui-events.js';

document.addEventListener("DOMContentLoaded", () => {

  /* =====================================================
     チームセレクト
  ===================================================== */
  const homeSelect = document.getElementById("homeTeamSelect");
  const awaySelect = document.getElementById("awayTeamSelect");
  const homeChip = document.querySelector(".home-chip");
  const awayChip = document.querySelector(".away-chip");


  homeSelect.addEventListener("change", () => {

    const t =
      teamColors[homeSelect.value];

    homeChip.style.background = t.color;
    homeChip.style.color = t.text;
    homeChip.textContent = t.name;
    // const info_home = infomation[homeSelect.value]["formation_key"];
  });


  awaySelect.addEventListener("change", () => {

    const t =
      teamColors[awaySelect.value];

    awayChip.style.background = t.color;
    awayChip.style.color = t.text;
    awayChip.textContent = t.name;
    // const info_away = infomation[awaySelect.value]["formation_key"];
  });


  /* =====================================================
     初期化
  ===================================================== */

  createInputs("inputsHome", infomation[homeSelect.value]["BestMember"]);
  createInputs("inputsAway", infomation[awaySelect.value]["BestMember"]);

  initializeTeamSelects();
  initializeFormationButtons();


  /* =====================================================
     スライダー
  ===================================================== */

  const topSlider = document.getElementById("topSlider");
  const volanteSlider = document.getElementById("volanteSlider");
  const backsSlider = document.getElementById("backsSlider");
  // topSlider.value =info[2];
  // volanteSlider.value =info[1];
  // backsSlider.value = info[0];

  /* =====================================================
     全スライダーイベント
  ===================================================== */
  document
    .querySelectorAll('input[type="range"]')
    .forEach(slider => {

      slider.addEventListener(
        "input",
        redrawAllPlayers
      );

    });
  redrawAllPlayers();
});

// formation buttons → スライダー変化
document
  .querySelectorAll(
      ".formation-buttons button"
  )
  .forEach(button => {

    button.addEventListener(
      "click",
      () => {

        const name =
          button.dataset.formation;

        const config =
          formationSliderMap[name];

        if (!config) return;

        backsSlider.value =
          config.backs;

        volanteSlider.value =
          config.volante;

        topSlider.value =
          config.top;

        updateFormationButtons();
        redrawAllPlayers();
      }
    );
});

document
  .querySelectorAll('input[type="range"]')
  .forEach(slider => {
    slider.addEventListener(
      "input",
      () => {
        updateFormationButtons();
        redrawAllPlayers();
      }
    );
});