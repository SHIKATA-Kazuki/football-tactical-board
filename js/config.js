/**
 * config.js
 *
 * チームマスターデータ。
 * 階層構造: TEAM_CATALOG[チームID][年度ID][試合ID]
 *
 * 各エントリが持つフィールド:
 *   label      : 試合ラベル（例: "4/12 vs 浦和"）
 *   members    : 背番号→選手名の辞書
 *   formation  : デフォルトフォーメーション名の配列
 *   bestMember : スターティング11の背番号配列（インデックス順）
 *   chip       : チップ UI 用の色定義
 *   uniform    : ホームユニフォーム定義
 *   away?      : アウェイユニフォーム・フォーメーション定義（省略可）
 *
 * ユニフォームフィールド:
 *   svg        : './uniform/{name}.svg' のファイル名部分（拡張子なし）
 *   style      : svg がない場合の CSS background 値
 *   color      : テキストシャドウ用の基調色（null で無効）
 *   text       : 文字色
 *   shadowsize : テキストシャドウのサイズ（px）
 */

// ─── 選手名簿 ────────────────────────────────────────────────────────────────

const JAPAN_MEMBERS = {
   1: '彩艶',   2: '菅原',   3: '谷口',   4: '板倉',   5: '長友',
   6: '町野',   7: '田中碧',  8: '久保',   9: '後藤',  10: '堂安律',
  11: '前田',  12: '大迫',  13: '中村',  14: '伊東',  15: '鎌田',
  16: '渡辺',  17: '唯人',  18: '上田',  19: '小川',  20: '瀬古',
  21: '伊藤',  22: '冨安',  23: '早川',  24: '佐野',  25: '淳之介',
  26: '塩貝',  27: 'ｴﾘｷ',
};
const JAPAN_MEMBERS_best = {
   1: '彩艶',   2: '菅原',   3: '谷口',   4: '瀬古',   5: '渡邉',
   6: '藤田',   7: '三笘',  8: '南野',   9: '町野',  10: '堂安律',
  11: '前田',  12: '大迫',  13: '中村',  14: '伊東',  15: '鎌田',
  16: '渡辺',  17: '田中',  18: '上田',  19: '小川',  20: '久保',
  21: '伊藤',  22: '冨安',  23: '早川',  24: '佐野',  25: '淳之介',
};
const BRAZIL_MEMBERS = {
   7: 'Vini'
};

const KOBE_MEMBERS_BASE = {
   1: '前川',   2: '飯野',   3: 'ﾄｩｰﾚﾙ',  4: '山川',   5: '郷家',
   6: '扇原',   7: '井手口',  8: 'ｲﾆｴｽﾀ',  9: '宮代',  10: '大迫',
  11: '武藤',  12: 'MOVI',  13: '大樹',  14: '乾',    15: 'ｼﾞｴｺﾞ',
  16: 'ｶｴﾀｰﾉ', 17: '吉田',  18: '井出',  19: '満田',  21: '新井',
  22: '本山',  23: '広瀬',  24: '酒井',  25: '鍬先',  26: 'ﾊﾟﾄﾘｯｷ',
  27: 'ｴﾘｷ',   28: '濱崎',  29: '小松',  30: '山内',  31: '岩波',
  32: 'ﾘｯｷ',   33: '橋本',  35: '富永',  41: '永戸',  44: '日高',
  71: '権田',  80: 'ﾝﾄﾞｶ',
};

const KOBE_MEMBERS_25 = { ...KOBE_MEMBERS_BASE, 5: '斎藤', 14: '汰木', 15: '本多' };

const KOBE_MEMBERS_24 = {
   1: '前川',   2: '飯野',   3: 'ﾄｩｰﾚﾙ',  4: '山川',   6: '扇原',
   7: '井手口',  8: 'ｲﾆｴｽﾀ',  9: '宮代',  10: '大迫',  11: '武藤',
  12: 'MOVI',  13: '大樹',  14: '汰木',  15: '本多',  16: '斎藤',
  17: '吉田',  18: '井出',  19: '初瀬',  21: '新井',  22: '大樹',
  23: '広瀬',  24: '酒井',  25: '鍬先',  26: 'ﾊﾟﾄﾘｯｷ', 27: 'ｴﾘｷ',
  28: '濱崎',  29: '小松',  30: '山内',  31: '岩波',  32: 'ﾘｯｷ',
  33: '橋本',  35: '富永',  41: '永戸',  44: '日高',  81: '菊池', 96: '山口',
};

const KOBE_MEMBERS_23 = { ...KOBE_MEMBERS_24, 5: '山口', 16: '斎藤', 19: '初瀬', 23: '山川' };

const ANTLERS_MEMBERS = {
   1: '早川',   2: '安西',   3: '金',     4: '千田',   5: '関川',
   6: '三竿',   9: 'ﾚｵｾｱﾗ', 10: '柴崎',  11: '田川',  13: '知念',
  17: 'ｴｳﾍﾞﾙ', 19: '帥岡',  22: '濃野',  23: '津久井', 25: '小池',
  27: '松村',  55: '植田',  71: '荒木',  77: 'ﾁｬｳﾞﾘｯﾁ',
};

// ─── ユニフォーム定義（共有リソース）────────────────────────────────────────

const UNI = {
  default_home: {
    chip:    { color: 'rgba(0, 0, 0, 0.92)', text: '#ffffff' },
    home: { style: 'linear-gradient(40deg,#222 0 50%,#000 50% 100%)', color: '#c0be38', text: '#ffffff', shadowsize: 0 },
  },
  default: {
    chip:    { color: 'rgba(255,255,255,0.92)', text: '#4b4040' },
    home: { svg: 'default', style: 'linear-gradient(40deg,#ccc 0 45%,#eee 25% 65%,#ccc 55% 100%)', color: '#eee', text: '#4b4040', shadowsize: 0.5 },
  },
  japan: {
    chip:    { color: 'rgba(0,0,200,0.9)', text: '#fff' },
    home: { svg: 'japan2026_home', style: 'linear-gradient(to bottom,red 0% 7%,white 7% 17%,blue 10% 100%)', color: 'blue', text: '#fff', shadowsize: 0.1 },
    away: { svg: 'japan2026_away', style: 'linear-gradient(to bottom,white 0%,white 66%,blue 66%,blue 85%,red 85%,red 100%)', color: 'white', text: 'black', shadowsize: 0.5 },
  },
  kobe_crimson: {
    chip:    { color: 'rgba(220,20,60,0.92)', text: '#fff' },
    home: { style: 'linear-gradient(40deg,crimson 0 45%,black 25% 65%,crimson 55% 100%)', color: 'crimson', text: '#fff', shadowsize: 0 },
    away: { style: 'linear-gradient(40deg,white 0 45%,black 25% 65%,white 55% 100%)', color: '#e6b422', text: 'black', shadowsize: 0.5 },
  },
  kobe_hyaku: {
    chip:    { color: 'rgba(220,20,60,0.92)', text: '#fff' },
    home: { style: 'linear-gradient(90deg, black 2%, crimson 2% 16%, black 16% 30%, crimson 30% 42%, black 42% 58%, crimson 58% 72%, black 72% 86%, crimson 86% 98%, black 98%)', color: 'crimson', text: '#fff', shadowsize: 0 },
    away: { style: 'linear-gradient(90deg, gray 2%, white 2% 16%, gray 16% 30%, white 30% 42%, gray 42% 58%, white 58% 72%, gray 72% 86%, white 86% 98%, gray 98%)', color: '#e6b422', text: 'black', shadowsize: 0.4 },
  },
  kobe_black: {
    chip:    { color: 'rgba(220,20,60,0.92)', text: '#fff' },
    home: { style: 'linear-gradient(130deg,black 25%,crimson 100%)', color: 'crimson', text: '#fff', shadowsize: 0 },
    away: { style: 'linear-gradient(180deg,white 0% 80%,rgba(160,66,73,0.92) 80% 100%)', color: 'rgba(160,66,73,0.92)', text: 'rgba(160,66,73,0.92)', shadowsize: 0.1 },
  },
  kobe_dark_crimson: {
    chip:    { color: 'rgba(220,20,60,0.92)', text: '#fff' },
    home: { style: 'linear-gradient(130deg,crimson 25%,black 100%)', color: 'crimson', text: '#fff', shadowsize: 0 },
    away: { style: 'linear-gradient(130deg,white 25%,gray 100%)', color: 'black', text: 'black', shadowsize: 0.1 },
  },
  kobe_30th: {
    chip:    { color: 'rgba(220,20,60,0.92)', text: '#fff' },
    home: { svg: 'kobe_30th', style: 'linear-gradient(90deg,black 2%,white 2% 16%,black 16% 30%,white 30% 42%,black 42% 58%,white 58% 72%,black 72% 86%,white 86% 98%,black 98%)', color: '#e6b422', text: 'black', shadowsize: 0.8 },
  },
  yokohamaFM: {
    chip:    { color: 'rgba(0,0,200,0.9)', text: '#fff' },
    home: { 
      // svg: 'yokohamaFM_home', 
      style: 'blue', 
      // style: 'linear-gradient(to bottom,blue 0%,blue 72%,white 72%,white 80%,red 80%,red 100%)', 
      color: 'blue', 
      text: '#fff', 
      shadowsize: 0.5,
      circle: 'rgb(231,0,43)'
    },
    away: {style: 'white', color: 'white', text: 'blue', shadowsize: 0.5, circle: 'rgb(231,0,43)'},
  },
  urawa: {
    chip:    { color: 'rgb(231,0,43)', text: '#fff' },
    home: { style: 'red', color: 'rgb(231,0,43)', text: '#fff', shadowsize: 0.5, circle: 'rgb(0, 0, 0)'},
    away: { style: 'white', color: 'white', text: '#000', shadowsize: 0 , circle: 'rgb(231,0,43)'},
  },
  antlers: {
    chip:    { color: 'rgba(139,0,0,0.9)', text: '#fff' },
    home: { svg: 'antlers_home', style: 'linear-gradient(to bottom,rgb(23,28,45) 0% 30%,rgb(183,24,64) 30% 35%,rgb(23,28,45) 35% 55%,rgb(183,24,64) 55% 60%,rgb(23,28,45) 60% 80%,rgb(183,24,64) 80% 85%,rgb(23,28,45) 85% 100%)', color: 'rgb(183,24,64)', text: '#fff', shadowsize: 0.5 },
    away: { svg: 'antlers_away', style: 'linear-gradient(0deg,white 0 30%,black 30% 70%,white 70%)', color: null, text: '#cccccc', shadowsize: 0 },
  },
  kashiwa: {
    chip:    { color: 'rgba(255,255,0,0.92)', text: '#fff' },
    home: { style: 'linear-gradient(90deg, yellow 30%, black 30%, black 35%, yellow 35%, yellow 40%, black 40%, black 60%, yellow 60%, yellow 65%, black 65%, black 70%, yellow 70%)', color: 'yellow', text: '#000', shadowsize: 0.8 },
    away: { svg: 'kashiwa_away', style: 'linear-gradient(to bottom,gray 20%,white 20%)', color: null, text: '#000', shadowsize: 0 },
  },
  gohsaka: {
    chip:    { color: 'rgba(0,0,255,0.92)', text: '#fff' },
    home: { svg: 'gohsaka_home', style: 'repeating-linear-gradient(90deg,blue 0 10px,black 10px 20px)', color: null, text: '#fff', shadowsize: 0.5 },
    away: { svg: 'gohsaka_away', style: 'linear-gradient(to bottom,white 60%,blue 60%)', color: null, text: '#000', shadowsize: 0 },
  },
  hiroshima: {
    chip:    { color: 'rgba(81,48,143,0.92)', text: '#fff' },
    home: {style: 'rgb(81,48,143)', color: 'rgb(81,48,143)', text: '#fff', shadowsize: 0.5, circle: 'rgb(255, 255, 255)' },
    away: {style: 'white', color: null, text: '#000', shadowsize: 0, circle: 'rgb(81,48,143)'},
  },
  shimizu: {
    chip:    { color: 'rgb(240,146,5)', text: '#003D6B' },
    home: { svg: 'shimizu_home', style: 'rgb(240,146,5)', color: 'rgb(240,146,5)', text: '#003D6B', shadowsize: 0.5, circle: '#003D6B' },
  },
  brazil: {
    chip:    { color: 'rgb(236, 240, 5)', text: '#35b614' },
    home: { style: 'rgb(236, 240, 5)', color: 'rgb(236, 240, 5)', text: '#35b614', shadowsize: 0, circle: '#0d51e4' },
  },
  kawasaki: {
    chip:    { color: 'rgba(0,180,0,0.9)', text: '#fff' },
    home: { svg: 'kawasaki_home', style: 'rgb(0,180,0)', color: 'rgb(0,180,0)', text: '#fff', shadowsize: 0.5 },
  },
};

// ─── ヘルパー: エントリ生成 ──────────────────────────────────────────────────

/**
 * TEAM_CATALOG エントリを簡潔に生成するヘルパー。
 * @param {string} label
 * @param {Record<number,string>} members
 * @param {string} uniKey
 * @param {string[]} formation
 * @param {number[]} bestMember
 * @param {{ formation:string[], bestMember:number[] }|null} awayOverride
 */
function entry(label, members, uniKey, formation, bestMember, awayOverride = null) {
  const u = UNI[uniKey];
  const base = {
    label,
    members,
    formation,
    bestMember,
    chip:    u.chip,
    uniform: u.home,
  };
  if (awayOverride && u.away) {
    base.away = {
      chip:       u.chip,
      uniform:    u.away,
      formation:  awayOverride.formation,
      bestMember: awayOverride.bestMember,
    };
  }
  return base;
}

// ─── チームカタログ（3 段階階層） ────────────────────────────────────────────
//
// 構造: TEAM_CATALOG[チームID][年度ID][試合ID]
//   チームID : 'kobe', 'japan', ... など
//   年度ID   : '2026', '2025', ... など（表示順を保つため配列ではなく順序付きオブジェクト）
//   試合ID   : 'best', '0412_urawa', ... など
//
// 「best」キーはそのシーズンのベストイレブン（デフォルト選択）。

export const TEAM_CATALOG = {

  // ── デフォルト（未選択）──────────────────────────────────────────────────────
  default_home: {
    label: '未選択',
    seasons: {
      '-': {
        label: '-',
        lineups: {
          best: entry('デフォルト', {
            1:'GK', 2:'RB', 3:'CB', 4:'CB', 5:'LB',
            6:'AC', 7:'RWG', 8:'BtB', 9:'ST', 10:'#10', 11:'LWG',
          }, 'default_home', ['442'], [1,2,3,4,5,6,7,8,9,10,11]),
        },
      },
    },
  },
  default: {
    label: '未選択',
    seasons: {
      '-': {
        label: '-',
        lineups: {
          best: entry('デフォルト', {
            1:'GK', 2:'RB', 3:'CB', 4:'CB', 5:'LB',
            6:'AC', 7:'RWG', 8:'BtB', 9:'ST', 10:'#10', 11:'LWG',
          }, 'default', ['442'], [1,2,3,4,5,6,7,8,9,10,11]),
        },
      },
    },
  },

  // ── ヴィッセル神戸 ──────────────────────────────────────────────────────────
  kobe: {
    label: '神戸',
    seasons: {
      'classic': {
        label: '百年構想',
        lineups: {
          best: entry('ベスト11', KOBE_MEMBERS_BASE, 'kobe_hyaku',
            ['4123'], [1,24,3,16,15,25,11,7,10,5,41],
            { formation: ['4123'], bestMember: [1,24,4,3,41,6,11,7,29,5,13] }),
        },
      },
      '30th': {
        label: '30周年',
        lineups: {
          best: entry('30周年ユニ', KOBE_MEMBERS_BASE, 'kobe_30th',
            ['4123'], [1,24,3,4,41,6,27,7,13,9,23]),
        },
      },
      '2025': {
        label: '2025',
        lineups: {
          best: entry('ベスト11', KOBE_MEMBERS_25, 'kobe_crimson',
            ['4123'], [1,24,3,4,41,6,27,7,13,9,23],
            { formation: ['4123'], bestMember: [1,24,3,4,41,6,27,7,13,9,23] }),
        },
      },
      '2024': {
        label: '2024',
        lineups: {
          best: entry('ベスト11', KOBE_MEMBERS_24, 'kobe_black',
            ['4123'], [1,24,3,4,19,6,11,96,10,18,23],
            { formation: ['4123'], bestMember: [1,24,4,3,41,6,11,7,29,5,13] }),
        },
      },
      '2023': {
        label: '2023',
        lineups: {
          best: entry('ベスト11', KOBE_MEMBERS_23, 'kobe_dark_crimson',
            ['4123'], [1,24,3,23,19,16,22,5,10,18,11],
            { formation: ['4123'], bestMember: [1,24,4,3,41,6,11,7,29,5,13] }),
        },
      },
    },
  },

  // ── 日本代表 ────────────────────────────────────────────────────────────────
  japan: {
    label: '日本代表',
    seasons: {
      'Worldcup': {
        label: '2026W杯',
        lineups: {
          dutch: entry('オランダ戦', JAPAN_MEMBERS, 'japan',
            ['3421'], [1,16,3,21,13,15,10,24,18,8,11],
            { formation: ['4213'], bestMember: [1,34,13,33,2,6,11,8,9,40,30] }),
          tunisia: entry('チュニジア戦', JAPAN_MEMBERS, 'japan',
            ['3421'], [1,22,4,21,13,7,10,24,18,14,15],
            { formation: ['4213'], bestMember: [1,34,13,33,2,6,11,8,9,40,30] }),
          norway: entry('ノルウェー戦', JAPAN_MEMBERS, 'japan',
            ['3421'], [1,16,4,21,13,15,2,7,18,10,11],
            { formation: ['4213'], bestMember: [1,34,13,33,2,6,11,8,9,40,30] }),
          brazil: entry('ブラジル戦', JAPAN_MEMBERS, 'japan',
            ['3421'], [1,22,3,21,13,15,10,24,18,14,11],
            { formation: ['4213'], bestMember: [1,22,3,21,13,15,10,24,18,14,11] }),
        },
      },
      'exhibition': {
        label: '親善試合',
        lineups: {
          england: entry('イングランド戦', JAPAN_MEMBERS_best, 'japan',
            ['3421'], [1,5,3,21,13,15,10,24,18,14,7],
            { formation: ['4213'], bestMember: [1,34,13,33,2,6,11,8,9,40,30] }),
          brazil: entry('ブラジル戦', JAPAN_MEMBERS_best, 'japan',
            ['3421'], [1,3,4,25,13,15,10,24,18,20,8],
            { formation: ['4213'], bestMember: [1,34,13,33,2,6,11,8,9,40,30] }),
        },
      },
    },
  },
  
  brazil: {
    label: 'ブラジル代表',
    seasons: {
      '2026': {
        label: '2026W杯',
        lineups: {
          best: entry('32', BRAZIL_MEMBERS, 'brazil',
            ['4123'], [1,13,4,3,16,5,26,8,9,20,7],
            { formation: ['4123'], bestMember: [1,13,4,3,16,5,26,8,9,20,7] }),
        },
      },
    },
  },

  // ── 横浜F・マリノス ─────────────────────────────────────────────────────────
  yokohamaFM: {
    label: '横浜FM',
    seasons: {
      '2025': {
        label: '2025',
        lineups: {
          best: entry('ベスト11', {}, 'yokohamaFM',
            ['4213'], [1,34,13,33,2,6,11,8,9,40,30],
            { formation: ['4213'], bestMember: [1,34,13,33,2,6,11,8,9,40,30] }),
        },
      },
    },
  },

  // ── 浦和レッズ ──────────────────────────────────────────────────────────────
  urawa: {
    label: '浦和',
    seasons: {
      '2025': {
        label: '2025',
        lineups: {
          best: entry('ベスト11', {}, 'urawa',
            ['4231'], [1,4,22,5,88,13,77,25,36,45,8],
            { formation: ['4231'], bestMember: [1,4,22,5,88,13,77,25,36,45,8] }),
        },
      },
    },
  },

  // ── 鹿島アントラーズ ────────────────────────────────────────────────────────
  antlers: {
    label: '鹿島',
    seasons: {
      '2025': {
        label: '2025',
        lineups: {
          best: entry('ベスト11', ANTLERS_MEMBERS, 'antlers',
            ['4231'], [1,22,55,5,2,10,27,6,9,40,71],
            { formation: ['4231'], bestMember: [1,22,55,5,2,10,27,6,9,40,71] }),
        },
      },
    },
  },

  // ── 柏レイソル ──────────────────────────────────────────────────────────────
  kashiwa: {
    label: '柏',
    seasons: {
      '2025': {
        label: '2025',
        lineups: {
          best: entry('ベスト11', {}, 'kashiwa',
            ['3421'], [25,42,4,26,2,39,24,21,10,8,16],
            { formation: ['3421'], bestMember: [25,42,4,26,2,39,24,21,10,8,16] }),
        },
      },
    },
  },

  // ── ガンバ大阪 ──────────────────────────────────────────────────────────────
  gohsaka: {
    label: 'G大阪',
    seasons: {
      '2025': {
        label: '2025',
        lineups: {
          best: entry('ベスト11', {}, 'gohsaka',
            ['4231'], [1,3,5,4,21,16,17,10,23,11,97],
            { formation: ['4231'], bestMember: [1,3,5,4,21,16,17,10,23,11,97] }),
        },
      },
    },
  },

  // ── サンフレッチェ広島 ──────────────────────────────────────────────────────
  hiroshima: {
    label: '広島',
    seasons: {
      '2025': {
        label: '2025',
        lineups: {
          best: entry('ベスト11', {}, 'hiroshima',
            ['3421'], [1,33,4,19,13,14,15,6,10,9,11],
            { formation: ['3421'], bestMember: [1,33,4,19,13,14,15,6,10,9,11] }),
        },
      },
    },
  },

  // ── 清水エスパルス ──────────────────────────────────────────────────────────
  shimizu: {
    label: '清水',
    seasons: {
      '2025': {
        label: '2025',
        lineups: {
          best: entry('ベスト11', {}, 'shimizu',
            ['4123'], [1,5,14,51,28,81,11,6,9,23,7]),
        },
      },
    },
  },

  // ── 川崎フロンターレ ────────────────────────────────────────────────────────
  kawasaki: {
    label: '川崎',
    seasons: {
      '2025': {
        label: '2025',
        lineups: {
          best: entry('ベスト11', {}, 'kawasaki',
            ['4231'], [49,29,2,28,13,6,17,8,9,14,23]),
        },
      },
    },
  },
};

// ─── カタログ参照ヘルパー ────────────────────────────────────────────────────

/**
 * チームID・年度ID・試合IDからエントリを返す。
 * いずれかが見つからない場合は null。
 *
 * @param {string} teamId
 * @param {string} seasonId
 * @param {string} lineupId
 * @returns {object|null}
 */
export function getLineup(teamId, seasonId, lineupId) {
  return TEAM_CATALOG[teamId]?.seasons?.[seasonId]?.lineups?.[lineupId] ?? null;
}

/**
 * チームIDのシーズン一覧を返す。
 * @param {string} teamId
 * @returns {Record<string,{label:string, lineups:object}>}
 */
export function getSeasons(teamId) {
  return TEAM_CATALOG[teamId]?.seasons ?? {};
}

/**
 * シーズンのラインナップ一覧を返す。
 * @param {string} teamId
 * @param {string} seasonId
 * @returns {Record<string,object>}
 */
export function getLineups(teamId, seasonId) {
  return TEAM_CATALOG[teamId]?.seasons?.[seasonId]?.lineups ?? {};
}

// ─── 後方互換レイヤー ────────────────────────────────────────────────────────
// team-colors.js / ui-events.js が直接参照するフラットなオブジェクト。
// TEAM_CATALOG から自動生成する。

export const TEAMS        = {};   // チームID → TeamDef（team-colors.js 用）
export const information  = {};   // 旧キー  → { BestMember }（ui-events.js 用）
export const team_member  = {};   // 旧キー  → members

for (const [teamId, teamDef] of Object.entries(TEAM_CATALOG)) {
  for (const [seasonId, seasonDef] of Object.entries(teamDef.seasons ?? {})) {
    for (const [lineupId, lineup] of Object.entries(seasonDef.lineups ?? {})) {
      // 旧キー: "kobe", "kobe_2024_best", ...
      // 最初のエントリ（best）が旧来の teamKey に対応する
      const legacyKey = lineupId === 'best' && seasonId === Object.keys(teamDef.seasons)[0]
        ? teamId
        : `${teamId}__${seasonId}__${lineupId}`;

      TEAMS[legacyKey] = {
        name:       teamDef.label,
        members:    lineup.members,
        formation:  lineup.formation,
        bestMember: lineup.bestMember,
        chip:       lineup.chip,
        uniform:    lineup.uniform,
        away:       lineup.away ? {
          chip:       lineup.away.chip,
          uniform:    lineup.away.uniform,
          formation:  lineup.away.formation,
          bestMember: lineup.away.bestMember,
        } : undefined,
      };

      information[legacyKey] = {
        formation_key: lineup.formation,
        BestMember:    lineup.bestMember,
      };
      team_member[legacyKey] = lineup.members;

      if (lineup.away) {
        const awayKey = `${legacyKey}_AwayVer`;
        TEAMS[awayKey]       = { ...TEAMS[legacyKey], uniform: lineup.away.uniform };
        information[awayKey] = { formation_key: lineup.away.formation, BestMember: lineup.away.bestMember };
        team_member[awayKey] = lineup.members;
      }
    }
  }
}
