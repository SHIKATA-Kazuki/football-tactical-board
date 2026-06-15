// =====================================================
// チームマスターデータ
// home/awayバリアントを含む全情報を1エントリに集約
//
// 各チームエントリの構造:
//   name        : 表示名
//   members     : 背番号 → 選手名 のマップ
//   formation   : デフォルトフォーメーション
//   bestMember  : スタメン背番号リスト (11名)
//
//   chip        : チップ表示用 { color, text }
//   uniform     : ユニフォーム { style, color, text, shadowsize }
//
//   away?       : アウェイバリアント。未定義の場合はホームと同一扱い
//     ├ chip    : アウェイ用チップ
//     ├ uniform : アウェイ用ユニフォーム
//     ├ formation
//     └ bestMember
// =====================================================

// 神戸の選手リスト（複数バリアントで共用）
const KOBE_MEMBERS = {
  1: '前川',  2: '飯野',  3: 'ﾄｩｰﾚﾙ', 4: '山川',  5: '郷家',
  6: '扇原',  7: '井手口', 8: 'ｲﾆｴｽﾀ', 9: '宮代',  10: '大迫',
  11: '武藤', 12: 'MOVI', 13: '大樹',  14: '乾',   15: 'ｼﾞｴｺﾞ',
  16: 'ｶｴﾀｰﾉ', 17: '吉田', 18: '井出', 19: '満田', 20: 'None',
  21: '新井', 22: '本山', 23: '広瀬',  24: '酒井', 25: '鍬先',
  26: 'ﾊﾟﾄﾘｯｷ', 27: 'ｴﾘｷ', 28: '濱崎', 29: '小松', 30: '山内',
  31: '岩波', 32: 'ﾘｯｷ',  33: '橋本', 35: '富永', 41: '永戸',
  44: '日高', 71: '権田', 80: 'ﾝﾄﾞｶ',
};

const KOBE_MEMBERS25 = {
  1: '前川',  2: '飯野',  3: 'ﾄｩｰﾚﾙ', 4: '山川',  5: '斎藤',
  6: '扇原',  7: '井手口', 8: 'ｲﾆｴｽﾀ', 9: '宮代',  10: '大迫',
  11: '武藤', 12: 'MOVI', 13: '大樹',  14: '汰木',   15: '本多',
  16: 'ｶｴﾀｰﾉ', 17: '吉田', 18: '井出', 19: '満田', 20: 'None',
  21: '新井', 22: '本山', 23: '広瀬',  24: '酒井', 25: '鍬先',
  26: 'ﾊﾟﾄﾘｯｷ', 27: 'ｴﾘｷ', 28: '濱崎', 29: '小松', 30: '山内',
  31: '岩波', 32: 'ﾘｯｷ',  33: '橋本', 35: '富永', 41: '永戸',
  44: '日高', 71: '権田', 80: 'ﾝﾄﾞｶ',
};

const KOBE_MEMBERS24 = {
  1: '前川',  2: '飯野',  3: 'ﾄｩｰﾚﾙ', 4: '山川', 
  6: '扇原',  7: '井手口', 8: 'ｲﾆｴｽﾀ', 9: '宮代',  10: '大迫',
  11: '武藤', 12: 'MOVI', 13: '大樹',  14: '汰木',   15: '本多',
  16: '斎藤', 17: '吉田', 18: '井出', 19: '初瀬', 20: 'None',
  21: '新井', 22: '大樹', 23: '広瀬',  24: '酒井', 25: '鍬先',
  26: 'ﾊﾟﾄﾘｯｷ', 27: 'ｴﾘｷ', 28: '濱崎', 29: '小松', 30: '山内',
  31: '岩波', 32: 'ﾘｯｷ',  33: '橋本', 35: '富永', 41: '永戸',
  44: '日高', 81: '菊池', 96: '山口',
};
const KOBE_MEMBERS23 = {
  1: '前川',  2: '飯野',  3: 'ﾄｩｰﾚﾙ', 4: 'None',  5: '山口',
  6: '扇原',  7: '井手口', 8: 'ｲﾆｴｽﾀ', 9: '宮代',  10: '大迫',
  11: '武藤', 12: 'MOVI', 13: '大樹',  14: '汰木',   15: '本多',
  16: '斎藤', 17: '吉田', 18: '井出', 19: '初瀬', 20: 'None',
  21: '新井', 22: '大樹', 23: '山川',  24: '酒井', 25: '鍬先',
  26: 'ﾊﾟﾄﾘｯｷ', 27: 'ｴﾘｷ', 28: '濱崎', 29: '小松', 30: '山内',
  31: '岩波', 32: 'ﾘｯｷ',  33: '橋本', 35: '富永', 41: '永戸',
  44: '日高', 81: '菊池', 
};
const JAPAN = {
  1: '彩艶',  2: '菅原',  3: '谷口', 4: '板倉',  5: '長友',
  6: '町野',  7: '田中碧', 8: '久保', 9: '後藤',  10: '堂安律',
  11: '前田', 12: '大迫', 13: '中村',  14: '伊東',   15: '鎌田',
  16: '渡辺', 17: '唯人', 18: '上田', 19: '小川', 20: '瀬古',
  21: '伊藤', 22: '冨安', 23: '早川',  24: '佐野', 25: '淳之介',
  26: '塩貝', 27: 'ｴﾘｷ'
};

export const TEAMS = {

  default: {
    name: '未選択',
    members: {
       1: 'GK', 2: 'RB', 3: 'CB', 4: 'CB',  5: 'LB',
       6: 'AC', 7: 'RWG', 8: 'BtB', 9: 'ST', 10: '#10', 11: 'LWG',
    },
    formation:  ['442'],
    bestMember: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
    chip:    { color: 'rgba(255, 255, 255, 0.92)', text: '#4b4040' },
    uniform: {
      style: 'linear-gradient(40deg, #ccc 0 45%, #eee 25% 65%, #ccc 55% 100%)',
      color: '#eee', text: '#4b4040', shadowsize: 0.5,
    },
  },

  kobe: {
    name: '神戸',
    members: KOBE_MEMBERS,
    formation:  ['4123'],
    bestMember: [1, 24, 3, 16, 15, 25, 11, 7, 10, 5, 41],
    chip:    { color: 'rgba(220, 20, 60, 0.92)', text: '#fff' },
    uniform: {
      style: 'linear-gradient(90deg, black 2%, crimson 2% 16%, black 16% 30%, crimson 30% 42%, black 42% 58%, crimson 58% 72%, black 72% 86%, crimson 86% 98%, black 98%)',
      color: 'black', text: 'white', shadowsize: 0,
    },
    away: {
      chip:    { color: 'rgba(220, 20, 60, 0.92)', text: '#fff' },
      uniform: {
        style: 'linear-gradient(90deg, gray 2%, white 2% 16%, gray 16% 30%, white 30% 42%, gray 42% 58%, white 58% 72%, gray 72% 86%, white 86% 98%, gray 98%)',
        color: '#e6b422', text: 'black', shadowsize: 0.4,
      },
      formation:  ['4123'],
      bestMember: [1, 24, 4, 3, 41, 6, 11, 7, 29, 5, 13],
    },
  },

  // 25年度ユニフォーム
  kobe25: {
    name: '神戸',
    members: KOBE_MEMBERS25,
    formation:  ['4123'],
    bestMember: [1, 24, 3, 4, 41, 6, 27, 7, 13, 9, 23],
    chip:    { color: 'rgba(220, 20, 60, 0.92)', text: '#fff' },
    uniform: {
      style: 'linear-gradient(40deg, crimson 0 45%, black 25% 65%, crimson 55% 100%)',
      color: 'crimson', text: '#fff', shadowsize: 0,
    },
    away: {
      chip:    { color: 'rgba(220, 20, 60, 0.92)', text: '#fff' },
      uniform: {
        style: 'linear-gradient(40deg, white 0 45%, black 25% 65%, white 55% 100%)',
        color: '#e6b422', text: 'black', shadowsize: 0.5,
      },
      formation:  ['4123'],
      bestMember: [1, 24, 4, 3, 41, 6, 11, 7, 29, 5, 13],
    },
  },

  kobe24: {
    name: '神戸',
    members: KOBE_MEMBERS24,
    formation:  ['4123'],
    bestMember: [1, 24, 3, 4, 19, 6, 11, 96, 10, 18, 23],
    chip:    { color: 'rgba(220, 20, 60, 0.92)', text: '#fff' },
    uniform: {
      style: 'linear-gradient(130deg, black 25%, crimson 100%)',
      color: 'crimson', text: '#fff', shadowsize: 0,
    },
    away: {
      chip:    { color: 'rgba(255, 255, 255, 0.92)', text: 'rgba(160, 66, 73, 0.92)' },
      uniform: {
        style: 'linear-gradient(180deg, white 0% 80%, rgba(160, 66, 73, 0.92) 80% 100%)',        
        color: 'rgba(160, 66, 73, 0.92)', text: 'rgba(160, 66, 73, 0.92)', shadowsize: 0.1,
      },
      formation:  ['4123'],
      bestMember: [1, 24, 4, 3, 41, 6, 11, 7, 29, 5, 13],
    },
  },
  kobe23: {
    name: '神戸',
    members: KOBE_MEMBERS23,
    formation:  ['4123'],
    bestMember: [1, 24, 3, 23, 19, 16, 22, 5, 10, 18, 11],
    chip:    { color: 'rgba(220, 20, 60, 0.92)', text: '#fff' },
    uniform: {
      style: 'linear-gradient(130deg, crimson 25%, black 100%)',
      color: 'crimson', text: '#fff', shadowsize: 0,
    },
    away: {
      chip:    { color: 'rgba(255, 255, 255, 0.92)', text: 'rgba(160, 66, 73, 0.92)' },
      uniform: {
        style: 'linear-gradient(130deg, white 25%, gray 100%)',        
        color: 'black', text: 'black', shadowsize: 0.1,
      },
      formation:  ['4123'],
      bestMember: [1, 24, 4, 3, 41, 6, 11, 7, 29, 5, 13],
    },
  },

  // 30周年ユニフォームバリアント
  kobe_30th: {
    name: '神戸',
    members: KOBE_MEMBERS25,
    formation:  ['4123'],
    bestMember: [1, 24, 3, 4, 41, 6, 27, 7, 13, 9, 23],
    chip:    { color: 'rgba(255, 255, 255, 0.92)', text: '#fff' },
    uniform: {
      style: 'linear-gradient(90deg, black 2%, white 2% 16%, black 16% 30%, white 30% 42%, black 42% 58%, white 58% 72%, black 72% 86%, white 86% 98%, black 98%)',
      color: '#e6b422', text: 'black', shadowsize: 0.8,
    },
  },

  japan: {
    name: '日本2026W杯',
    members: JAPAN,
    formation:  ['3421'],
    bestMember: [1, 22, 4, 3, 11, 24, 10, 15, 18, 8, 13],
    chip:    { color: 'rgba(0, 0, 200, 0.9)', text: '#fff' },
    uniform: {
      style: 'linear-gradient(to bottom, red 0% 7%, white 7% 17%, blue 10% 100% )',
      color: 'blue', text: '#fff', shadowsize: 0.1,
    },
    away: {
      chip:    { color: 'rgba(0, 0, 200, 0.9)', text: '#fff' },
      uniform: {
        style: 'linear-gradient(to bottom, white 0%, white 66%, blue 66%, blue 85%, red 85%, red 100%)',
        color: 'white', text: 'blue', shadowsize: 0.5,
      },
      formation:  ['4213'],
      bestMember: [1, 34, 13, 33, 2, 6, 11, 8, 9, 40, 30],
    },
  },
  yokohamaFM: {
    name: '横浜FM',
    members: {},
    formation:  ['4213'],
    bestMember: [1, 34, 13, 33, 2, 6, 11, 8, 9, 40, 30],
    chip:    { color: 'rgba(0, 0, 200, 0.9)', text: '#fff' },
    uniform: {
      style: 'linear-gradient(to bottom, blue 0%, blue 72%, white 72%, white 80%, red 80%, red 100%)',
      color: 'blue', text: '#fff', shadowsize: 0.5,
    },
    away: {
      chip:    { color: 'rgba(0, 0, 200, 0.9)', text: '#fff' },
      uniform: {
        style: 'linear-gradient(to bottom, white 0%, white 66%, blue 66%, blue 85%, red 85%, red 100%)',
        color: 'white', text: 'blue', shadowsize: 0.5,
      },
      formation:  ['4213'],
      bestMember: [1, 34, 13, 33, 2, 6, 11, 8, 9, 40, 30],
    },
  },

  urawa: {
    name: '浦和',
    members: {},
    formation:  ['4231'],
    bestMember: [1, 4, 22, 5, 88, 13, 77, 25, 36, 45, 8],
    chip:    { color: 'rgb(231, 0, 43)', text: '#fff' },
    uniform: {
      style: 'linear-gradient(to bottom, rgb(231, 0, 43) 0% 72%, white 72% 80%, black 80% 100%)',
      color: 'rgb(231, 0, 43)', text: '#fff', shadowsize: 0.5,
    },
    away: {
      chip:    { color: 'rgba(231, 0, 43, 0.9)', text: '#fff' },
      uniform: {
        style: 'linear-gradient(to bottom, white 0%, white 85%, black 85%, black 100%)',
        color: null, text: '#000', shadowsize: 0,
      },
      formation:  ['4231'],
      bestMember: [1, 4, 22, 5, 88, 13, 77, 25, 36, 45, 8],
    },
  },

  antlers: {
    name: '鹿島',
    members: {
       1: '早川',  2: '安西',  3: '金',    4: '千田',  5: '関川',
       6: '三竿',  7: 'None',  8: 'None',  9: 'ﾚｵｾｱﾗ', 10: '柴崎',
      11: '田川', 13: '知念', 17: 'ｴｳﾍﾞﾙ', 19: '帥岡', 22: '濃野',
      23: '津久井', 24: 'None', 25: '小池', 27: '松村', 40: 'UMA',
      55: '植田', 71: '荒木', 77: 'ﾁｬｳﾞﾘｯﾁ',
    },
    formation:  ['4231'],
    bestMember: [1, 22, 55, 5, 2, 10, 27, 6, 9, 40, 71],
    chip:    { color: 'rgba(139, 0, 0, 0.9)', text: '#fff' },
    uniform: {
      style: 'linear-gradient(to bottom, rgb(23, 28, 45) 0% 30%, rgb(183, 24, 64) 30% 35%, rgb(23, 28, 45) 35% 55%, rgb(183, 24, 64) 55% 60%, rgb(23, 28, 45) 60% 80%, rgb(183, 24, 64) 80% 85%, rgb(23, 28, 45) 85% 100%)',
      color: 'rgb(183, 24, 64)', text: '#fff', shadowsize: 0.5,
    },
    away: {
      chip:    { color: 'rgba(139, 0, 0, 0.9)', text: '#fff' },
      uniform: {
        style: 'linear-gradient(0deg, white 0 30%, black 30% 70%, white 70%)',
        color: null, text: '#cccccc', shadowsize: 0,
      },
      formation:  ['4231'],
      bestMember: [1, 22, 55, 5, 2, 10, 27, 6, 9, 40, 71],
    },
  },

  kashiwa: {
    name: '柏',
    members: {},
    formation:  ['3421'],
    bestMember: [25, 42, 4, 26, 2, 39, 24, 21, 10, 8, 16],
    chip:    { color: 'rgba(255, 255, 0, 0.92)', text: '#fff' },
    uniform: {
      style: 'linear-gradient(90deg, yellow 30%, black 30%, black 35%, yellow 35%, yellow 40%, black 40%, black 60%, yellow 60%, yellow 65%, black 65%, black 70%, yellow 70%)',
      color: 'yellow', text: '#000', shadowsize: 0.8,
    },
    away: {
      chip:    { color: 'rgba(255, 255, 0, 0.92)', text: '#fff' },
      uniform: {
        style: 'linear-gradient(to bottom, gray 20%, white 20%)',
        color: null, text: '#000', shadowsize: 0,
      },
      formation:  ['3421'],
      bestMember: [25, 42, 4, 26, 2, 39, 24, 21, 10, 8, 16],
    },
  },

  gohsaka: {
    name: 'G大阪',
    members: {},
    formation:  ['4231'],
    bestMember: [1, 3, 5, 4, 21, 16, 17, 10, 23, 11, 97],
    chip:    { color: 'rgba(0, 0, 255, 0.92)', text: '#fff' },
    uniform: {
      style: 'repeating-linear-gradient(90deg, blue 0 10px, black 10px 20px)',
      color: null, text: '#fff', shadowsize: 0.5,
    },
    away: {
      chip:    { color: 'rgba(0, 0, 255, 0.92)', text: '#fff' },
      uniform: {
        style: 'linear-gradient(to bottom, white 60%, blue 60%)',
        color: null, text: '#000', shadowsize: 0,
      },
      formation:  ['4231'],
      bestMember: [1, 3, 5, 4, 21, 16, 17, 10, 23, 11, 97],
    },
  },

  hiroshima: {
    name: '広島',
    members: {},
    formation:  ['3421'],
    bestMember: [1, 33, 4, 19, 13, 14, 15, 6, 10, 9, 11],
    chip:    { color: 'rgba(81, 48, 143, 0.92)', text: '#fff' },
    uniform: {
      style: 'rgb(81, 48, 143)',
      color: 'rgb(81, 48, 143)', text: '#fff', shadowsize: 0.5,
    },
    away: {
      chip:    { color: 'rgba(81, 48, 143, 0.92)', text: '#fff' },
      uniform: {
        style: 'linear-gradient(90deg, rgb(81,48,143) 0 10%, white 10% 90%, rgb(81,48,143) 90% 100%)',
        color: null, text: '#000', shadowsize: 0,
      },
      formation:  ['3421'],
      bestMember: [1, 33, 4, 19, 13, 14, 15, 6, 10, 9, 11],
    },
  },

  shimizu: {
    name: '清水',
    members: {},
    formation:  ['4123'],
    bestMember: [1, 5, 14, 51, 28, 81, 11, 6, 9, 23, 7],
    chip:    { color: 'rgb(240, 146, 5)', text: '#003D6B' },
    uniform: {
      style: 'rgb(240, 146, 5)',
      color: 'rgb(240, 146, 5)', text: '#003D6B', shadowsize: 0.5,
    },
  },

  kawasaki: {
    name: '川崎',
    members: {},
    formation:  ['4231'],
    bestMember: [49, 29, 2, 28, 13, 6, 17, 8, 9, 14, 23],
    chip:    { color: 'rgba(0, 180, 0, 0.9)', text: '#fff' },
    uniform: {
      style: 'rgb(0, 180, 0)',
      color: 'rgb(0, 180, 0)', text: '#fff', shadowsize: 0.5,
    },
  },

};

// =====================================================
// 後方互換レイヤー
// 既存の teamColors / teamUniformColor / infomation /
// team_member キー形式に依存しているコードのために
// TEAMS から自動生成して export する。
// 移行が完了したら削除してください。
// =====================================================

function buildLegacyKey(teamKey, isAway) {
  return isAway ? `${teamKey}_AwayVer` : teamKey;
}

function buildChipEntry(chip, name) {
  return { name, color: chip.color, text: chip.text };
}

function buildUniformEntry(uniform, name) {
  return { name, style: uniform.style, color: uniform.color ?? undefined, text: uniform.text, shadowsize: uniform.shadowsize };
}

function buildInfoEntry(team) {
  return { formation_key: team.formation, BestMember: team.bestMember };
}

export const teamColors       = {};
export const teamUniformColor = {};
export const information      = {};
export const team_member      = {};
/** @deprecated typo版。新規コードでは information を使ってください */
export const infomation       = information;

for (const [key, team] of Object.entries(TEAMS)) {
  const homeKey = key;

  teamColors[homeKey]       = buildChipEntry(team.chip, team.name);
  teamUniformColor[homeKey] = buildUniformEntry(team.uniform, team.name);
  information[homeKey]      = buildInfoEntry(team);
  team_member[homeKey]      = team.members;

  if (team.away) {
    const awayKey = buildLegacyKey(key, true);
    teamColors[awayKey]       = buildChipEntry(team.away.chip, team.name);
    teamUniformColor[awayKey] = buildUniformEntry(team.away.uniform, team.name);
    information[awayKey]      = { formation_key: team.away.formation, BestMember: team.away.bestMember };
    team_member[awayKey]      = team.members;    // 選手名はホームと同じ
  }
}

/* 終了 */
