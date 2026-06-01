import { placePlayers } from './field-renderer.js';
import { readPlayersFromForm } from './players.js';

export function applyFormation(formation){
  const players = readPlayersFromForm(
    document.getElementById("playerFormHome")
  );
  placePlayers(players, formation, false);
}

export function interpolateFormation(f1, f2, t) {
  const result = [];

  for (let i = 0; i < f1.length; i++) {
    const x = f1[i][0] + (f2[i][0] - f1[i][0]) * t;
    const y = f1[i][1] + (f2[i][1] - f1[i][1]) * t;
    result.push([x, y]);
  }

  return result;
}

export function interpolate3(t, f0, f1, f2){    
  let interpolated;
  if(t>0.5){
    interpolated = interpolateFormation(f1, f2, (t-0.5)*2);
  }
  else{
    interpolated = interpolateFormation(f0, f1, t*2);
  }
  applyFormation(interpolated);
}

export function interpolate4(t, f0, f1, f2, f3){    
  let interpolated;
  if(t>0.66){
    interpolated = interpolateFormation(f2, f3, (t-0.6666)*3);
  }
  else if(t>0.33){
    interpolated = interpolateFormation(f1, f2, (t-0.3333)*3);
  }
  else{
    interpolated = interpolateFormation(f0, f1, t*3);
  }
  applyFormation(interpolated); 
}