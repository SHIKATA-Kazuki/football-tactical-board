import { applyFormation, interpolateFormation, interpolate3, interpolate4 } from './inter-functions.js';
import {formations} from './formations.js';
import { readPlayersFromForm } from './players.js';
import { placePlayers } from './field-renderer.js';

// let f_base = formations["4123"];

const topSig     = document.getElementById("topSlider");
const volanteSig = document.getElementById("volanteSlider");
const backsSig   = document.getElementById("backsSlider");

export function updateFormationFromSignals() {    
  const topVal     = parseFloat(topSig.value    );
  const volanteVal = parseFloat(volanteSig.value);
  const backsVal   = parseFloat(backsSig.value  );
  
  let formationKey;
  if (backsVal == 1) {
      if (volanteVal < 0.1) {
          formationKey = "4123";
      } else {
          if (topVal == 1) formationKey = "442";
          else formationKey = "4231";
      }
  } else {
      if (volanteVal == 0) {
          formationKey = "352M";
      } else {
          if (topVal == 1) formationKey = "352M";
          else formationKey = "3421";
      }
  }
  
  f_base = formations[formationKey];
  const players = readPlayersFromForm(
      document.getElementById("playerFormHome")
  );
  placePlayers(players, formations[formationKey], false);
  return f_base;
}

// OK
export function initializeFormationButtons() {
  // Home side
  document.querySelectorAll('.home-formations button').forEach(btn => {
    btn.addEventListener('click', e => {
      document.querySelectorAll('.home-formations button').forEach(b => b.classList.remove('active'));
      const button = e.currentTarget;
      button.classList.add('active');
      const f = button.dataset.formation;

      const players = readPlayersFromForm(document.getElementById("playerFormHome"));
      const pos = formations[f];
      if (pos) placePlayers(players, pos, false);
    });
  });

  // Away side
  document.querySelectorAll('.away-formations button').forEach(btn => {
    btn.addEventListener('click', e => {
      document.querySelectorAll('.away-formations button').forEach(b => b.classList.remove('active'));
      const button = e.currentTarget;
      button.classList.add('active');
      const f = button.dataset.formation;
      
      const players = readPlayersFromForm(document.getElementById("playerFormAway"));
      const pos = formations[f];
      if (pos) {
        const flipped = pos.map(([x, y]) => [100 - x, 100 - y]);
        placePlayers(players, flipped, true);
      }
    });
  });
}

export function addTop(t, f_base, volanteSig, backsSig) {
  let f0 = formations["4150"];
  const volanteVal = parseFloat(volanteSig.value);  
  const backsVal = parseFloat(backsSig.value);    
  if (backsVal > 0.5){
    if (volanteVal > 0.5){
      f0 = formations["4231"];
      const f1 = formations["442"];      
      const f3 = formations["424"];            
      f_base = formations["442"] 
      interpolate4(t, f0, f1, f_base, f3);
    }else{
      const f2 = formations["4132"];       
      const f3 = formations["4114"];      
      interpolate4(t, f0, f_base, f2, f3);
    }
  }else{
    if (volanteVal > 0.5){
      const f2 = formations["352W"];      
      interpolate3(t, f0, f_base, f2);
    }else{
      const f2 = formations["334"];      
      interpolate3(t, f0, f_base, f2);
    }
  };
  return f_base;
}

export function HMLblock(t, f_base, backsSig) {
  const backsVal = parseFloat(backsSig.value);
  const topVal = parseFloat(topSig.value);  
  if (backsVal == 1) {
    let f0 = formations["442block"];
    let f2 = formations["2134"];          
    if (topVal > 0.5){
      interpolate3(t, f0, f_base, f2);
    }else{
      const f2 = formations["253"];
      const f3 = formations["235"];          
      interpolate4(t, f0, f_base, f2, f3);
    }
  }else{
    const f0 = formations["541"];
    // const f1 = formations["3421"];
    const f2 = formations["325"];        
    interpolate3(t, f0, f_base, f2);
  }
}