import {createInputs, readPlayersFromForm} from './players.js';
import {placePlayers} from './field-renderer.js';
import {formations} from './formations.js';
import { initializeTeamSelects } from './team-colors.js';
import { updateFormationFromSignals, initializeFormationButtons, addTop, HMLblock} from './ui-events.js';
import { applyFormation, interpolateFormation, interpolate3, interpolate4 } from './inter-functions.js';
// configは？

document.addEventListener("DOMContentLoaded", () => {
  const homeSelect = document.getElementById('homeTeamSelect');
  const awaySelect = document.getElementById('awayTeamSelect');
  // ホーム変更イベント
  const homeChip = document.querySelector('.home-chip');
  const awayChip = document.querySelector('.away-chip');
  homeSelect.addEventListener('change', () => {
    const t = teamColors[homeSelect.value];
    homeChip.style.background = t.color;
    homeChip.style.color = t.text;
    homeChip.textContent = `${t.name}`;
  });

  // homeSelect.addEventListener('change', () => updateHomeColor(homeSelect.value));
  // awaySelect.addEventListener('change', () => updateAwayColor(awaySelect.value));

  // アウェイ変更イベント
  awaySelect.addEventListener('change', () => {
    const t = teamColors[awaySelect.value];
    awayChip.style.background = t.color;
    awayChip.style.color = t.text;
    awayChip.textContent = `${t.name}`;
  });
  // ===== 入力欄生成 =====================================================

  createInputs("inputsHome");
  createInputs("inputsAway");
  
  initializeTeamSelects()//チームユニフォーム
  initializeFormationButtons();//描画ロジック

  // 
  const topSig = document.getElementById("topSlider"); 
  const volanteSig = document.getElementById("volanteSlider"); 
  const backsSig = document.getElementById("backsSlider");

  window.f_base = formations["4123"];

  topSig.addEventListener("input",     updateFormationFromSignals);
  volanteSig.addEventListener("input", updateFormationFromSignals);
  backsSig.addEventListener("input",   updateFormationFromSignals);


  // TOPの数変え
  topSig.addEventListener("input", e => {
    const t = parseFloat(e.target.value);
    f_base = addTop(t, f_base, volanteSig, backsSig);
  });

  // 両方SBが上がるミドルブロック形成
  const sideslider = document.getElementById("sideSlider");
  sideslider.addEventListener("input", e => {
    const t = parseFloat(e.target.value);
    HMLblock(t, f_base, backsSig);
  });

  // Anchorが降りるoption
  const slider = document.getElementById("systemSlider");
  slider.addEventListener("input", e => {
    const t = parseFloat(e.target.value);
    const f0 = formations["343_diamond"];
    const interpolated = interpolateFormation(f0, f_base, t);      
    applyFormation(interpolated);        
  });

  // SBが上がる3back化
  const sidebackslider = document.getElementById("sidebackSlider");
  sidebackslider.addEventListener("input", e => {    
    const topVal = parseFloat(topSig.value);
    let t = parseFloat(e.target.value);
    let f0 = formations["3421"];
    let f2 = formations["3421R"];
    interpolate3(t, f0, f_base, f2);
  });
  console.log(f_base)
});