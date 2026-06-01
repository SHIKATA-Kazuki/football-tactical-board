export const teamColors = {
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

export const teamStyles = {
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

export const playerRoles = { 
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
    10:'Atack(L)  '
};

// infomation ={
//   kobe :{
//     formations: "4123",
//     BestMember: [1, 24, 4, 3, 41, 6, 11, 7, 29, 5, 13],
//   },
//   hiroshima :{
//     formations: "3421",
//     BestMember: [1, 33, 4, 19, 13, 14, 15, 6, 10, 9, 11],
//   },
//   kashima :{
//     formations: "4231",
//     BestMember: [1, 22, 55, 5, 16, 10, 27, 6, 9, 11, 40],
//   },
//   shimizu :{
//     formations: "4123",
//     BestMember: [1, 5, 14, 51, 28, 81, 11, 6, 9, 23, 7],
//   },
//   kawasaki :{
//     formations: "4231",
//     BestMember: [49, 29, 2, 28, 13, 6, 17, 8, 9, 14, 23],
//   },
//   yokohamaFM :{
//     formations: "4213",
//     BestMember: [1, 34, 13, 33, 2, 6, 11, 8, 9, 40, 30],
//   },
//   urawa :{
//     formations: "4231",
//     BestMember: [1, 4, 22, 5, 88, 13, 77, 25, 36, 45, 8],
//   },
//   default :{
//     formations: "4213",
//     BestMember: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
//   }
// }