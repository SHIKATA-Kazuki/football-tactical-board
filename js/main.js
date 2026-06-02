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

  /* =====================================================
     チームセレクト
  ===================================================== */
  const homeSelect = document.getElementById("homeTeamSelect");
  const awaySelect = document.getElementById("awayTeamSelect");
  const homeChip   = document.querySelector(".home-chip");
  const awayChip   = document.querySelector(".away-chip");

  homeSelect.addEventListener("change", () => {
    const t = teamColors[homeSelect.value];
    homeChip.style.background = t.color;
    homeChip.style.color      = t.text;
    homeChip.textContent      = t.name;
  });

  awaySelect.addEventListener("change", () => {
    const t = teamColors[awaySelect.value];
    awayChip.style.background = t.color;
    awayChip.style.color      = t.text;
    awayChip.textContent      = t.name;
  });

  /* =====================================================
     初期化
  ===================================================== */
  createInputs("inputsHome", infomation[homeSelect.value]["BestMember"]);
  createInputs("inputsAway", infomation[awaySelect.value]?.["BestMember"]);

  initializeTeamSelects();
  initializeFormationButtons();

  /* =====================================================
     スライダー — DOMContentLoaded 内で取得してイベント登録
  ===================================================== */
  const topSlider     = document.getElementById("topSlider");
  const volanteSlider = document.getElementById("volanteSlider");
  const backsSlider   = document.getElementById("backsSlider");

  // スライダーが動いたとき：手動移動フラグは保持したまま再描画
  document.querySelectorAll('input[type="range"]').forEach(slider => {
    slider.addEventListener("input", () => {
      updateFormationButtons();
      redrawAllPlayers();
    });
  });

  // フォーメーションボタンが押されたとき：フラグをリセットしてフル再描画
  document.querySelectorAll(".home-formations button").forEach(button => {
    button.addEventListener("click", () => {
      const name   = button.dataset.formation;
      const config = formationSliderMap[name];
      if (!config) return;

      backsSlider.value   = config.backs;
      volanteSlider.value = config.volante;
      topSlider.value     = config.top;

      updateFormationButtons();
      redrawAllPlayers({ resetManual: true, side: 'home' });
    });
  });

  document.querySelectorAll(".away-formations button").forEach(button => {
    button.addEventListener("click", () => {
      const name   = button.dataset.formation;
      const config = formationSliderMap[name];
      if (!config) return;

      updateFormationButtons();
      redrawAllPlayers({ resetManual: true, side: 'away' });
    });
  });

  redrawAllPlayers();
});
