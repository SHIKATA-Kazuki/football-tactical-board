import {createInputs, readPlayersFromForm} from './players.js';
import { initializeTeamSelects } from './team-colors.js';
import {formations, formationSliderMap} from './formations.js';
import {placePlayers, getBaseFormationName} from './field-renderer.js';
import { updateFormationFromSignals, initializeFormationButtons, addTop, HMLblock, updateFormationButtons} from './ui-events.js';
import { applyFormation, interpolateFormation, interpolate3, interpolate4 } from './inter-functions.js';
// configは？

document.addEventListener("DOMContentLoaded", () => {

  /* =====================================================
     チームセレクト
  ===================================================== */
  const homeSelect =
    document.getElementById("homeTeamSelect");

  const awaySelect =
    document.getElementById("awayTeamSelect");

  const homeChip =
    document.querySelector(".home-chip");

  const awayChip =
    document.querySelector(".away-chip");


  homeSelect.addEventListener("change", () => {

    const t =
      teamColors[homeSelect.value];

    homeChip.style.background = t.color;
    homeChip.style.color = t.text;
    homeChip.textContent = t.name;
  });


  awaySelect.addEventListener("change", () => {

    const t =
      teamColors[awaySelect.value];

    awayChip.style.background = t.color;
    awayChip.style.color = t.text;
    awayChip.textContent = t.name;
  });


  /* =====================================================
     初期化
  ===================================================== */

  createInputs("inputsHome");
  createInputs("inputsAway");

  initializeTeamSelects();
  initializeFormationButtons();


  /* =====================================================
     スライダー
  ===================================================== */

  const topSlider =
    document.getElementById("topSlider");

  const volanteSlider =
    document.getElementById("volanteSlider");

  const backsSlider =
    document.getElementById("backsSlider");

  const sideSlider =
    document.getElementById("sideSlider");

  const systemSlider =
    document.getElementById("systemSlider");

  const sidebackSlider =
    document.getElementById("sidebackSlider");

  function redrawAllPlayers() {
    const BASE_FORMATION_NAME = getBaseFormationName();

    let formation =
      structuredClone(
        formations[BASE_FORMATION_NAME]
      );


    /* ---------------------------------
       スライダー値取得
    --------------------------------- */
    const topVal =
      parseFloat(topSlider.value);

    const volanteVal =
      parseFloat(volanteSlider.value);

    const backsVal =
      parseFloat(backsSlider.value);

    const sideVal =
      parseFloat(sideSlider.value);

    const systemVal =
      parseFloat(systemSlider.value);

    const sidebackVal =
      parseFloat(sidebackSlider.value);




    /* ---------------------------------
       描画
    --------------------------------- */
    applyFormation(formation);

  }


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


  /* =====================================================
     初期描画
  ===================================================== */
  redrawAllPlayers();

});

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