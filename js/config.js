export const teamColors = {
    kobe:   { name: '神戸',    color: 'rgba(220, 20, 60, 0.92)', text: '#fff' },
    default:   { name: '未選択',    color: 'rgba(255, 255, 255, 0.92)', text: '#4b4040' },
    yokohamaFM:{ name: '横浜FM', color: 'rgba(0, 0, 200, 0.9)',     text: '#fff' },
    urawa:  { name: '浦和',     color: 'rgb(231, 0, 43)',     text: '#fff' },
    antlers:{ name: '鹿島',   color: 'rgba(139, 0, 0, 0.9)',     text: '#fff' },
    kashiwa:  { name: '柏',     color: 'rgba(255,255,0,0.92)',   text: '#fff' },
    gohsaka:   { name: 'G大阪',     color: 'rgba(0, 0, 255, 0.92)',    text: '#fff' },
    hiroshima:  { name: '広島',     color: 'rgba(81,48,143, 0.92)',      text: '#fff' },        
    shimizu:  { name: '清水',     color: 'rgb(240, 146, 5)',      text: '#003D6B' },        
    kobe_AwayVer:   { name: '神戸',    color: 'rgba(220, 20, 60, 0.92)', text: '#fff' },
    kobe_30th:   { name: '神戸',    color: 'rgba(220, 20, 60, 0.92)', text: '#fff' },
    yokohamaFM_AwayVer:{ name: '横浜FM', color: 'rgba(0, 0, 200, 0.9)',     text: '#fff' },
    urawa_AwayVer:{ name: '浦和', color: 'rgba(231, 0, 43, 0.9)',     text: '#fff' },
    antlers_AwayVer:{ name: '鹿島',   color: 'rgba(139, 0, 0, 0.9)',     text: '#fff' },
    kashiwa_AwayVer:  { name: '柏',     color: 'rgba(255,255,0,0.92)',   text: '#fff' },
    gohsaka_AwayVer:   { name: 'G大阪',     color: 'rgba(0, 0, 255, 0.92)',    text: '#fff' },
    hiroshima_AwayVer:  { name: '広島',     color: 'rgba(81,48,143, 0.92)',      text: '#fff' }        
};

export const teamUniformColor = {
  kobe: {
    name: '神戸',
    style: 'linear-gradient(40deg, crimson 0 45%, black 25% 65%, crimson 55% 100%)',
    text: '#fff',
    // color:'crimson',
  },
  default: {
    name: '未選択',
    style: 'linear-gradient(40deg, #ccc 0 45%, #eee 25% 65%, #ccc 55% 100%)',
    text: '#4b4040',
    color:'#eee',
  },
  yokohamaFM: {
    name: '横浜FM',
    style: 'linear-gradient(to bottom, blue 0%, blue 72%, white 72%, white 80%, red 80%, red 100%)',
    text: '#fff',
    color:'blue',
  },
  urawa: {
    name: '浦和',
    style: 'linear-gradient(to bottom, rgb(231, 0, 43) 0% 72%, white 72% 80%, black 80% 100%)',
    text: '#fff',
    color:'rgb(231, 0, 43)',
  },
  antlers:{ 
    name: '鹿島',   
    style: 'linear-gradient(140deg, black  20%, rgb(183, 24, 64) 50%, black 80% )',    
    style: 'linear-gradient(to bottom, rgb(23, 28, 45) 0% 30%, rgb(183, 24, 64) 30% 35%, rgb(23, 28, 45) 35% 55%, rgb(183, 24, 64) 55% 60%, rgb(23, 28, 45) 60% 80%, rgb(183, 24, 64) 80% 85%, rgb(23, 28, 45) 85% 100%)',    
    text: '#fff' ,
    color:'rgb(183, 24, 64)',
  },
  kashiwa:  { 
    name: '柏',     
    style: 'linear-gradient(90deg, yellow 30%, black 30%,black 35%,yellow 35%, yellow 40%, black 40%, black 60%, yellow 60%, yellow 65%, black 65%, black 70%, yellow 70%)', 
    text: '#000',
    color:'yellow',
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
    text: '#fff',
    color:'rgb(81,48,143)',
  },
  kobe_AwayVer: {
    name: '神戸 ',
    style: 'linear-gradient(40deg, white 0 45%, black 25% 65%, white 55% 100%)',
    text: '#e6b422'
  },
  shimizu: {
    name: '清水 ',
    style: 'rgb(240, 146, 5)',
    text: '#003D6B',
    color:'rgb(240, 146, 5)',
  },
  kobe_30th: {
    name: '神戸 ',
    style: 'repeating-linear-gradient(90deg, white 0 10px, black 10px 20px)',
    text: '#e6b422'
  },
  yokohamaFM_AwayVer: {
    name: '横浜FM ',
    style: 'linear-gradient(to bottom, white 0%, white 66%, blue 66%, blue 85%, red 85%, red 100%)',
    text: 'blue',
    color:'white',
  },
  urawa_AwayVer: {
    name: '浦和 ',
    style: 'linear-gradient(to bottom, white 0%, white 85%, black 85%, black 100%)',
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

export const playerRoles = { 
     0:'GK ',
     1:'RB',
     2:'CB',
     3:'CB',
     4:'LB',
     5:'AC ',
     6:'RWG',
     7:'BtB',
     8:'ST',
     9:'#10',
    10:'LWG'
};

export const infomation ={
  kobe :{
    formation_key: ["4123"],
    BestMember: [1, 24, 3, 16, 15, 25, 11, 7, 10, 5, 41],
    // BestMember: [1, 24, 4, 3, 41, 6, 11, 7, 29, 5, 13],
  },
  hiroshima :{
    formation_key: ["3421"],
    BestMember: [1, 33, 4, 19, 13, 14, 15, 6, 10, 9, 11],
  },
  antlers :{
    formation_key: ["4231"],
    BestMember: [1, 22, 55, 5, 2, 10, 27, 6, 9, 40,71],
  },
  shimizu :{
    formation_key: ["4123"],
    BestMember: [1, 5, 14, 51, 28, 81, 11, 6, 9, 23, 7],
  },
  kawasaki :{
    formation_key: ["4231"],
    BestMember: [49, 29, 2, 28, 13, 6, 17, 8, 9, 14, 23],
  },
  yokohamaFM :{
    formation_key: ["4213"],
    BestMember: [1, 34, 13, 33, 2, 6, 11, 8, 9, 40, 30],
  },
  urawa :{
    formation_key: ["4231"],
    BestMember: [1, 4, 22, 5, 88, 13, 77, 25, 36, 45, 8],
  },
  gohsaka :{
    formation_key: ["4231"],
    BestMember: [1, 3, 5, 4, 21, 16, 17, 10, 23, 11, 97],
  },
  kashiwa :{
    formation_key: ["3421"],
    BestMember: [25, 42, 4, 26, 2, 39, 24, 21, 10, 8, 16],
  },
  default :{
    formation_key: ["442"],
    BestMember: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
  },
  kobe_AwayVer :{
    formation_key: ["4123"],
    BestMember: [1, 24, 4, 3, 41, 6, 11, 7, 29, 5, 13],
  },
  hiroshima_AwayVer :{
    formation_key: ["3421"],
    BestMember: [1, 33, 4, 19, 13, 14, 15, 6, 10, 9, 11],
  },
  antlers_AwayVer :{
    formation_key: ["4231"],
    BestMember: [1, 22, 55, 5, 2, 10, 27, 6, 9, 40,71],
  },
  shimizu_AwayVer :{
    formation_key: ["4123"],
    BestMember: [1, 5, 14, 51, 28, 81, 11, 6, 9, 23, 7],
  },
  kawasaki_AwayVer :{
    formation_key: ["4231"],
    BestMember: [49, 29, 2, 28, 13, 6, 17, 8, 9, 14, 23],
  },
  yokohamaFM_AwayVer :{
    formation_key: ["4213"],
    BestMember: [1, 34, 13, 33, 2, 6, 11, 8, 9, 40, 30],
  },
  urawa_AwayVer :{
    formation_key: ["4231"],
    BestMember: [1, 4, 22, 5, 88, 13, 77, 25, 36, 45, 8],
  },
  kashiwa_AwayVer :{
    formation_key: ["3421"],
    BestMember: [25, 42, 4, 26, 2, 39, 24, 21, 10, 8, 16],
  },
}

/* 終了 */