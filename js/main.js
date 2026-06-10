import { teamColors, infomation } from './config.js';
import { initializeTeamSelects } from './team-colors.js';
import {formationSliderMap } from './formations_new.js';
import {
  initializeFormationButtons,
  updateFormationButtons,
  createInputs,
  redrawAllPlayers
} from './ui-events.js';
import { initFlickFormationUI } from "./formation-flick-ui.js";


document.addEventListener("DOMContentLoaded", () => {
  const homeSelect = document.getElementById("homeTeamSelect");
  const awaySelect = document.getElementById("awayTeamSelect");

  // document.querySelector('.forms-wrapper.infopart').style.display = 'block';
  document.querySelector('.forms-wrapper.infopart').style.display = 'flex';

  /* =====================================================
     初期化
  ===================================================== */
  // const thevalue1 = "kobe"
  // const thevalue2 = "kobe"
  // console.log(thevalue) 
  initializeTeamSelects();      // home を描画、away は描画しない
  initializeFormationButtons(); // ボタンにイベント付与
    // ① フリックUIを構築（隠しボタンも自動生成）

  initFlickFormationUI();
  // ② 既存のリスナー登録（隠しボタンに対して querySelectorAll が走る）
  initializeFormationButtons();

  createInputs("inputsHome", infomation[homeSelect.value]?.["BestMember"],true);
  createInputs("inputsAway", infomation[awaySelect.value]?.["BestMember"],false);
  createInputs("inputsHome-sp", infomation[homeSelect.value]?.["BestMember"],true);
  createInputs("inputsAway-sp", infomation[awaySelect.value]?.["BestMember"],false);
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
