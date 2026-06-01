document.addEventListener("DOMContentLoaded", () => {

const homeChip = document.querySelector('.home-chip');
const awayChip = document.querySelector('.away-chip');
const homeSelect = document.getElementById('homeTeamSelect');
const awaySelect = document.getElementById('awayTeamSelect');
  
// チームごとの色設定
const teamColors = {
    kobe:   { name: '神戸',    color: 'rgba(220, 20, 60, 0.92)', text: '#fff' },
    marinos:{ name: '横浜FM', color: 'rgba(0, 0, 200, 0.9)',     text: '#fff' },
    antlers:{ name: '鹿島',   color: 'rgba(139, 0, 0, 0.9)',     text: '#fff' },
    kashiwa:  { name: '柏',     color: 'rgba(255,255,0,0.92)',   text: '#fff' },
    gohsaka:   { name: 'G大阪',     color: 'rgba(0, 0, 255, 0.92)',    text: '#fff' },
    hiroshima:  { name: '広島',     color: 'rgba(81,48,143, 0.92)',      text: '#fff' },        
    shimizu:  { name: '清水',     color: 'rgb(240, 146, 5)',      text: '#003D6B' },        
    kobe_AwayVer:   { name: '神戸',    color: 'rgba(220, 20, 60, 0.92)', text: '#fff' },
    kobe_30th:   { name: '神戸',    color: 'rgba(220, 20, 60, 0.92)', text: '#fff' },
    marinos_AwayVer:{ name: '横浜FM', color: 'rgba(0, 0, 200, 0.9)',     text: '#fff' },
    antlers_AwayVer:{ name: '鹿島',   color: 'rgba(139, 0, 0, 0.9)',     text: '#fff' },
    kashiwa_AwayVer:  { name: '柏',     color: 'rgba(255,255,0,0.92)',   text: '#fff' },
    gohsaka_AwayVer:   { name: 'G大阪',     color: 'rgba(0, 0, 255, 0.92)',    text: '#fff' },
    hiroshima_AwayVer:  { name: '広島',     color: 'rgba(81,48,143, 0.92)',      text: '#fff' }        
};

//チームユニフォーム
const teamStyles = {
  kobe: {
    name: '神戸',
    style: 'linear-gradient(40deg, crimson 0 45%, black 25% 65%, crimson 55% 100%)',
    text: '#fff'
  },
  marinos: {
    name: '横浜FM',
    style: 'linear-gradient(to bottom, blue 0%, blue 72%, white 72%, white 90%, red 90%, red 100%)',
    text: '#fff'
  },
  antlers:{ 
    name: '鹿島',   
    style: 'linear-gradient(140deg, black  20%, rgb(183, 24, 64) 50%, black 80% )',    
    text: '#fff' 
  },
  kashiwa:  { 
    name: '柏',     
    style: 'linear-gradient(to bottom, black 20%, yellow 20%)', 
    text: '#000' 
  },
  gohsaka:   { 
    name: 'G大阪',     
    style: 'repeating-linear-gradient(90deg, blue 0 10px, black 10px 20px)',   
    text: '#fff' 
  },
  hiroshima:  { 
    name: '広島',     
    style:
      'rgb(81,48,143)',
      // 'repeating-linear-gradient(0deg, rgb(81,48,143) 0 20px, black 20px 40px),',    
    text: '#fff' 
  },
  kobe_AwayVer: {
    name: '神戸 ',
    style: 'linear-gradient(40deg, white 0 45%, black 25% 65%, white 55% 100%)',
    text: '#e6b422'
  },
  shimizu: {
    name: '清水 ',
    style: 'rgb(240, 146, 5)',
    text: '#003D6B'
  },
  kobe_30th: {
    name: '神戸 ',
    style: 'repeating-linear-gradient(90deg, white 0 10px, black 10px 20px)',
    text: '#e6b422'
  },
  marinos_AwayVer: {
    name: '横浜FM ',
    style: 'linear-gradient(to bottom, white 0%, white 66%, blue 66%, blue 85%, red 85%, red 100%)',
    text: '#000'
  },
  antlers_AwayVer:{ 
    name: '鹿島 ',   
    style: 'linear-gradient(0deg, white  0 30%, black 30% 70%, white 70% )',    
    text: '#cccccc' 
  },
  kashiwa_AwayVer:  { 
    name: '柏 ',     
    style: 'linear-gradient(to bottom, gray 20%, white 20%)', 
    text: '#000' 
  },
  gohsaka_AwayVer:   { 
    name: 'G大阪 ',     
    style: 'linear-gradient(to bottom, white 60%, blue 60%)',   
    text: '#000' 
  },
  hiroshima_AwayVer:  { 
    name: '広島 ',     
    style:
      'linear-gradient(90deg, rgb(81,48,143) 0 10%, white 10% 90%, rgb(81,48,143) 90% 100%)',
      // 'repeating-linear-gradient(0deg, rgb(81,48,143) 0 20px, black 20px 40px),',    
    text: '#000'
  }
};

// ホーム変更イベント
homeSelect.addEventListener('change', () => {
  const t = teamColors[homeSelect.value];
  homeChip.style.background = t.color;
  homeChip.style.color = t.text;
  homeChip.textContent = `${t.name}`;
});

// アウェイ変更イベント
awaySelect.addEventListener('change', () => {
  const t = teamColors[awaySelect.value];
  awayChip.style.background = t.color;
  awayChip.style.color = t.text;
  awayChip.textContent = `${t.name}`;
});
// ===== 入力欄生成 =====================================================

function createInputs(containerId) {
  const container = document.getElementById(containerId);
  container.innerHTML = "";
  var role ={ 
     0:'GK        ',
     1:'Back(R)   ',
     2:'Back      ',
     3:'Back      ',
     4:'Back(L)   ',
     5:'Anchor    ',
     6:'Atack(R)  ',
     7:'Box to Box',
     8:'Striker   ',
     9:'Ace       ',
    10:'Atack(L)  ',
  }
  let numbers;
  if (containerId === "inputsHome") {
    numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
  } else {
    numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
  }      
  for (let i = 0; i <= 10; i++) {
    container.innerHTML += `
      <div>
        ${role[i]} <input type="number" name="number${i+1}" value="${numbers[i]}" required>
      </div>
    `;
  }
}

createInputs("inputsHome");
createInputs("inputsAway");

// ===== 位置データ ===================
const anchor = [50, 50];
// onst anchor = [50, 50+13];

//GK, LSB?, LCB, RCB, RCB
const relativeFormations_442 = [
  [0, 48], [37, 25], [13, 30], [-13, 30], [-37, 25],
  [-15, 8], [28, -5], [15,8], [10, -22], [-10, -22], [-28, -5]
];
const relativeFormations_424 = [
  [0, 48], [37, 25], [13, 30], [-13, 30], [-37, 25],
  [-19, 0], [32, -20], [19, 0], [10, -22], [-10, -22], [-32, -20]
];
const relativeFormations_442_diamond = [
  [0, 48], [37, 25], [13, 30], [-13, 30], [-37, 25],
  [-30, 3], [30, 3], [0, 8], [15, -22], [0, -6], [-15, -22]
]; 
const relativeFormations_4114= [
  [0, 48], [37, 25], [13, 30], [-13, 30], [-37, 25],
  [0, 8], [32, -22], [0, -6], [11, -22], [-11, -22], [-32, -22]
]; 
const relativeFormations_4132= [
  [0, 48], [37, 25], [13, 30], [-13, 30], [-37, 25],
  [0, 8], [32, -10], [0, -6], [11, -22], [-11, -22], [-32, -10]
]; 
const relativeFormations_2134= [
  [0, 48], [37, -3], [13, 30], [-13, 30], [-37, -3],
  [0, 8], [32, -22], [0, -6],  [11, -22], [-11, -22],[-32, -22]
]; 
const relativeFormations_442block = [
  [0, 48], [37, 25], [13, 30], [-13, 30], [-37, 25],
  [-13, 11],  [37, 6], [13, 11],[12, -15], [-12, -15], [-37, 6]
];
const relativeFormations_4123 = [
  [0, 48], [37, 25], [13, 30], [-13, 30], [-37, 25],
  [0, 13], [27, -17], [15, -4], [0, -22], [-15, -4],  [-27, -17]
];
const relativeFormations_4141 = [
  [0, 48], [37, 28], [13, 30], [-13, 30], [-37, 28],
  [0, 13], [37, -6], [14, -4], [0, -22], [-14, -4], [-37, -6]
];
const relativeFormations_4150 = [
  [0, 48], [37, 25], [13, 30], [-13, 30], [-37, 25],
  [0, 15], [27, -17], [20, 2], [0, -10], [-20, 2], [-27, -17]
];
const relativeFormations_433 = [
  [0, 48], [37, 25], [13, 30], [-13, 30], [-37, 25],
  [0, 3], [27, -17], [20, 1], [0, -22], [-20, 1], [-27, -17]
];
const relativeFormations_4231 = [
  [0, 48], [37, 25], [13, 30], [-13, 30], [-37, 25],
  [-15, 8], [27, -7], [15, 8], [0, -22], [0, -7], [-27, -7]
];
const relativeFormations_4321 = [
  [0, 48], [37, 25], [13, 30], [-13, 30], [-37, 25],
  [-27, 7], [25, 7], [0, 10], [0, -22], [17, -12], [-17, -12]
];
const relativeFormations_343 = [
  [0, 48], [25, 23], [0, 30], [-25, 23], [-40,3], 
  [-15, 8], [40, 3], [15, 8], [0, -22], [25, -17], [-25, -17]
];
const relativeFormations_343_diamond = [
  [0, 48], [20, 3], [25, 23],  [-25, 23], [-20,3],
  [0, 30], [35, -17], [0, 10], [0, -22], [0, -7], [-35, -17]
];
const relativeFormations_3421R = [
  [0, 48], [40, 3], [25, 23], [0, 30], [-25, 23], 
  [-15, 8], [17, -12], [15, 8], [0, -22], [-17, -12], [-40,3]
];
const relativeFormations_3421 = [
  [0, 48], [25, 23], [0, 30], [-25, 23], [-40,3], 
  [-15, 8], [40, 3], [15, 8], [0, -22], [17, -12], [-17, -12]
];
const relativeFormations_325 = [
  [0, 48], [25, 23], [0, 30], [-25, 23], [-40,-17], 
  [-15, 8], [40,-17], [15, 8], [0, -22], [17, -12], [-17, -12]
];
const relativeFormations_352W = [
  [0, 48], [25, 23], [0, 30], [-25, 23], [-40,-3], 
  [-19, 8], [40, -3], [19, 8], [14, -22], [0, -7], [-14, -22]
];
const relativeFormations_352M = [
  [0, 48], [25, 23], [0, 30], [-25, 23], [-40,3], 
  [-19, -1], [40, 3], [19, -1], [14, -22], [0, 8],  [-14, -22]
];
const relativeFormations_334 = [
  [0, 48], [25, 23], [0, 30], [-25, 23], [-30,-12], 
  [0, 3], [30, -12], [20, 1], [10, -22], [-20, 1], [-10, -22]
];
const relativeFormations_541 = [
  [0, 48], [20, 28], [0, 28], [-20, 28], [-40,28], 
  [-10, 8], [40, 28], [10, 8], [0, -9], [28, 8], [-28, 8]
];
const relativeFormations_253 = [
  [0, 48], [40, 5], [13, 30], [-13, 30], [-40, 5],
  [0, 8], [29, -19], [17, -4], [0, -19],[-17, -4], [-29, -19]
];
const relativeFormations_235 = [
  [0, 48], [27, -2], [13, 30], [-13, 30], [-27, -2],
  [0, 0], [40, -24], [19, -15], [0, -23], [-19, -15], [-40, -24]
];

function toAbsolutePositions(relativeFormations, anchor) {
  return relativeFormations.map(([dx, dy]) => [ anchor[0] + dx, anchor[1] + dy ]);
}

const formations = {
  "442": toAbsolutePositions(relativeFormations_442, anchor),
  "424": toAbsolutePositions(relativeFormations_424, anchor),
  "442block": toAbsolutePositions(relativeFormations_442block, anchor),
  "4123": toAbsolutePositions(relativeFormations_4123, anchor),
  "4141": toAbsolutePositions(relativeFormations_4141, anchor),
  "433": toAbsolutePositions(relativeFormations_433, anchor),
  "442_diamond": toAbsolutePositions(relativeFormations_442_diamond, anchor),
  "4114": toAbsolutePositions(relativeFormations_4114, anchor),
  "4132": toAbsolutePositions(relativeFormations_4132, anchor),
  "2134": toAbsolutePositions(relativeFormations_2134, anchor),
  "4231": toAbsolutePositions(relativeFormations_4231, anchor),
  "4321": toAbsolutePositions(relativeFormations_4321, anchor),
  "4150": toAbsolutePositions(relativeFormations_4150, anchor),
  "343": toAbsolutePositions(relativeFormations_343, anchor),
  "343_diamond": toAbsolutePositions(relativeFormations_343_diamond, anchor),
  "3421R": toAbsolutePositions(relativeFormations_3421R, anchor),
  "3421": toAbsolutePositions(relativeFormations_3421, anchor),
  "325": toAbsolutePositions(relativeFormations_325, anchor),
  "352W": toAbsolutePositions(relativeFormations_352W, anchor),
  "352M": toAbsolutePositions(relativeFormations_352M, anchor),
  "334": toAbsolutePositions(relativeFormations_334, anchor),
  "541": toAbsolutePositions(relativeFormations_541, anchor),
  "253": toAbsolutePositions(relativeFormations_253, anchor),
  "235": toAbsolutePositions(relativeFormations_235, anchor)
};

// ===== 描画ロジック ====================================================
const homePlayers = []; // DOM要素
const awayPlayers = []; // DOM要素

function readPlayersFromForm(formEl) {
  const fd = new FormData(formEl);
  const arr = [];
  for (let i = 1; i <= 11; i++) {
    arr.push({ number: fd.get(`number${i}`), name: fd.get(`name${i}`) });
  }
  return arr;
}

function placePlayers(players, positions, isOpponent) {
  const field = document.getElementById("field");
  const arr = isOpponent ? awayPlayers : homePlayers;
  // 要素数を合わせる
  while (arr.length < players.length) {
    const div = document.createElement("div");
    div.className = isOpponent ? "player away" : "player home"; // ← home/awayクラスを付与
    field.appendChild(div);
    arr.push(div);
  }
  while (arr.length > players.length) {
    const removed = arr.pop();
    removed.remove();
  }
  // 位置とテキスト更新
  for (let i = 0; i < players.length; i++) {
    const el = arr[i];
    // 念のためクラスを再設定（先に作った要素を流用するため）
    el.className = isOpponent ? "player away" : "player home";
    el.style.left = `${positions[i][0]}%`;
    el.style.top = `${positions[i][1]}%`;
    el.innerHTML = `<strong>${players[i].number}</strong>`;
  }
}

// ===== イベントハンドラ ===============================================
document.getElementById("playerFormHome").addEventListener("submit", function(e) {
  e.preventDefault();
  const players = readPlayersFromForm(e.target);
  const f = document.getElementById("formationSelectHome").value;
  const pos = formations[f];
  if (!pos) return; // 念のため
  placePlayers(players, pos, false);
});

document.getElementById("playerFormAway").addEventListener("submit", function(e) {
  e.preventDefault();
  const players = readPlayersFromForm(e.target);
  const f = document.getElementById("formationSelectAway").value;
  const pos = formations[f];
  if (!pos) return;
  // 相手側は反転（ピッチ逆サイド）
  const flipped = pos.map(([x, y]) => [100 - x, 100 - y]);
  placePlayers(players, flipped, true);
});

// （任意）ページ読み込み時に仮表示
window.addEventListener('load', () => {
  // 自チームだけ即時描画（好みでコメントアウト可）
  const homeForm = document.getElementById('playerFormHome');
  const players = readPlayersFromForm(homeForm);
  placePlayers(players, formations['4123'], false);
});

function updateTeamColor(isHome, teamKey) {
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

homeSelect.addEventListener('change', () => updateHomeColor(homeSelect.value));
awaySelect.addEventListener('change', () => updateAwayColor(awaySelect.value));

document.getElementById('homeTeamSelect').addEventListener('change', e => {
  updateTeamColor(true, e.target.value);
});
document.getElementById('awayTeamSelect').addEventListener('change', e => {
  updateTeamColor(false, e.target.value);
});

// ホーム側
document.querySelectorAll('.home-formations button').forEach(btn => {
    btn.addEventListener('click', e => {
      document.querySelectorAll('.home-formations button').forEach(b => b.classList.remove('active'));
      const button = e.currentTarget; // ← これに変更
      button.classList.add('active');
      const f = button.dataset.formation; // ← ここも修正
    
    const players = readPlayersFromForm(document.getElementById("playerFormHome"));
    const pos = formations[f];
    if (pos) placePlayers(players, pos, false);
  });
});

// アウェイ側
document.querySelectorAll('.away-formations button').forEach(btn => {
    btn.addEventListener('click', e => {
      document.querySelectorAll('.away-formations button').forEach(b => b.classList.remove('active'));
      const button = e.currentTarget; // ← これに変更
      button.classList.add('active');
      const f = button.dataset.formation; // ← ここも修正
    
    const players = readPlayersFromForm(document.getElementById("playerFormAway"));
    const pos = formations[f];
    if (pos) {
      const flipped = pos.map(([x, y]) => [100 - x, 100 - y]);
      placePlayers(players, flipped, true);
    }
  });
});

//////////関数の定義//////////
function applyFormation(formation){
  const players = readPlayersFromForm(
    document.getElementById("playerFormHome")
  );
  placePlayers(players, formation, false);
}

function interpolateFormation(f1, f2, t) {
  const result = [];

  for (let i = 0; i < f1.length; i++) {
    const x = f1[i][0] + (f2[i][0] - f1[i][0]) * t;
    const y = f1[i][1] + (f2[i][1] - f1[i][1]) * t;
    result.push([x, y]);
  }

  return result;
}

function interpolate3(t, f0, f1, f2){    
  let interpolated;
  if(t>0.5){
    interpolated = interpolateFormation(f1, f2, (t-0.5)*2);
  }
  else{
    interpolated = interpolateFormation(f0, f1, t*2);
  }
  applyFormation(interpolated);
}

function interpolate4(t, f0, f1, f2, f3){    
  let interpolated;
  if(t>0.66){
    interpolated = interpolateFormation(f2, f3, (t-0.66)*3);
  }
  else if(t>0.33){
    interpolated = interpolateFormation(f1, f2, (t-0.33)*3);
  }
  else{
    interpolated = interpolateFormation(f0, f1, t*3);
  }
  applyFormation(interpolated); 
}
//////////関数の定義(終)//////////
const topSig = document.getElementById("topSlider"); 
const volanteSig = document.getElementById("volanteSlider"); 
const backsSig = document.getElementById("backsSlider");

topSig.addEventListener("input", updateFormationFromSignals);
volanteSig.addEventListener("input", updateFormationFromSignals);
backsSig.addEventListener("input", updateFormationFromSignals);
    
let f_base = formations["4123"];

// 現状これでOK
function updateFormationFromSignals() {    
  const topVal = parseFloat(topSig.value);
  const volanteVal = parseFloat(volanteSig.value);
  const backsVal = parseFloat(backsSig.value);    
  let formationKey;    
  if (backsVal == 1) {
    if (volanteVal < 0.1) {
      formationKey = "4123";
    }
    else { 
      if (topVal == 1) formationKey = "442";
      else formationKey = "4231";
    }
  } else {
    if (volanteVal == 0) {
      formationKey = "352M";
    }else{
      if (topVal == 1) formationKey = "352M";
      else formationKey = "3421";
    }
  }    
  const formation = formations[formationKey]; 
  f_base = formations[formationKey];   
  const players = readPlayersFromForm(
    document.getElementById("playerFormHome")
  );    
  placePlayers(players, formation, false);
}

// TOPの数変え
topSig.addEventListener("input", e => {
  const t = parseFloat(e.target.value);
  let f0 = formations["4150"];
  const volanteVal = parseFloat(volanteSig.value);  
  const backsVal = parseFloat(backsSig.value);    
  if (backsVal > 0.5){
    if (volanteVal > 0.5){
      f0 = formations["4231"];
      const f2 = formations["442"];      
      const f3 = formations["424"];      
      interpolate4(t, f0, f_base, f2, f3);
      if(t>0.5){
        f_base = formations["442"]
      }else{
        f_base = formations["4123"]
      }     
    }else{
      const f2 = formations["442_diamond"];      
      const f3 = formations["4132"];      
      interpolate4(t, f0, f_base, f2, f3);
      if(t>0.33){
        f_base = formations["442_diamond"]
      }else{
        f_base = formations["4123"]
      }     
    }
  }else{
    if (volanteVal > 0.5){
      const f2 = formations["352W"];      
      interpolate3(t, f0, f_base, f2);
    }else{
      const f2 = formations["334"];      
      interpolate3(t, f0, f_base, f2);
    }
  }
});

// Anchorが降りるoption
const slider = document.getElementById("systemSlider");
slider.addEventListener("input", e => {
  const t = parseFloat(e.target.value);
  const f0 = formations["343_diamond"];
  const interpolated = interpolateFormation(f0, f_base, t);      
  applyFormation(interpolated);        
});

// 両方SBが上がるミドルブロック形成
const sideslider = document.getElementById("sideSlider");
sideslider.addEventListener("input", e => {
  const backsVal = parseFloat(backsSig.value);
  const topVal = parseFloat(topSig.value);  
  if (backsVal == 1) {
    let t = parseFloat(e.target.value);
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
    const t = parseFloat(e.target.value);
    const f0 = formations["541"];
    // const f1 = formations["3421"];
    const f2 = formations["325"];        
    interpolate3(t, f0, f_base, f2);
  }
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

// 初期色設定
updateHomeColor(homeSelect.value);
updateAwayColor(awaySelect.value);
});
