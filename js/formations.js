/**
 * formations.js
 *
 * フォーメーション座標の計算と、スライダー↔フォーメーション名のマッピングを提供する。
 *
 * 座標系:
 *   [x, y] — フィールドを 0〜100 % として表す。
 *   アンカー(anchor) を原点に、オフセット(dx, dy) を加算して最終座標を生成する。
 *   DF / FW / SB は戦術スライダーの値から計算されるライン高さ。
 */

// ─── フォーメーション座標定義 ────────────────────────────────────────────────

/**
 * 各フォーメーションのベース相対座標 [dx, dy] の配列。
 * インデックスは選手番号 - 1（0 = GK）。
 *
 * @param {number} DF  DFラインの高さオフセット（デフォルト 26）
 * @param {number} FW  FWラインの高さオフセット（デフォルト -22）
 * @param {number} sb  SBオフセット（内部計算値）
 * @param {number} wb  WBオフセット（内部計算値）
 * @returns {Record<string, [number,number][]>}
 */
function buildCoordinates(DF, FW, sb, wb) {
  return {
    // ── 4バック系 ──────────────────────────────────────────────────────────────
    '442': [
      [0, 48],
      [ 37, DF - sb], [ 13, DF], [-13, DF], [-37, DF - sb],
      [-15, DF * 0.2], [28, FW * 0.45], [15, DF * 0.2],
      [ 10, FW], [-10, FW], [-28, FW * 0.45],
    ],
    '442◇': [
      [0, 48],
      [ 37, DF - sb], [13, DF], [-13, DF], [-37, DF - sb],
      [ 0, DF * 0.5], [20, 0], [0, FW * 0.5],
      [15, FW], [-15, FW], [-20, 0],
    ],
    '4123': [
      [0, 48],
      [ 37, DF - sb], [13, DF], [-13, DF], [-37, DF - sb],
      [ 0, DF * 0.4], [27, FW * 0.8], [15, FW * 0.2],
      [ 0, FW], [-15, FW * 0.2], [-27, FW * 0.8],
    ],
    '4231': [
      [0, 48],
      [ 37, DF - sb], [13, DF], [-13, DF], [-37, DF - sb],
      [-15, DF * 0.2], [27, FW * 0.45], [15, DF * 0.2],
      [ 0, FW], [0, FW * 0.45], [-27, FW * 0.45],
    ],
    '4213': [
      [0, 48],
      [ 37, DF - sb], [13, DF], [-13, DF], [-37, DF - sb],
      [-15, DF * 0.3], [27, FW * 0.8], [15, DF * 0.3],
      [ 0, FW], [0, FW * 0.2], [-27, FW * 0.8],
    ],
    '4321': [
      [0, 48],
      [ 37, DF - sb], [13, DF], [-13, DF], [-37, DF - sb],
      [-27, DF * 0.2], [25, DF * 0.2], [0, DF * 0.2],
      [ 0, FW], [17, FW * 0.4], [-17, FW * 0.4],
    ],
    '433': [
      [0, 48],
      [ 37, DF - sb], [13, DF], [-13, DF], [-37, DF - sb],
      [ 0, DF * 0.1], [27, FW * 0.8], [20, FW * 0.1],
      [ 0, FW], [-20, FW * 0.1], [-27, FW * 0.8],
    ],
    '4132': [
      [0, 48],
      [ 37, DF - sb], [13, DF], [-13, DF], [-37, DF - sb],
      [ 0, DF * 0.2], [32, FW * 0.4], [0, FW * 0.2],
      [11, FW], [-11, FW], [-32, FW * 0.4],
    ],
    '460': [
      [0, 48],
      [ 37, DF - sb], [13, DF], [-13, DF], [-37, DF - sb],
      [ 0, 15], [27, FW * 0.8], [20, 2],
      [ 0, -10], [-20, 2], [-27, FW * 0.8],
    ],
    // ハイプレス・前線数的有利
    '424': [
      [0, 48],
      [ 37, DF - sb], [13, DF], [-13, DF], [-37, DF - sb],
      [-19, 0], [32, -20], [19, 0],
      [10, FW], [-10, FW], [-32, -20],
    ],
    '4114': [
      [0, 48],
      [ 37, DF - sb], [13, DF], [-13, DF], [-37, DF - sb],
      [ 0, DF * 0.2], [32, FW], [0, FW * 0.4],
      [11, FW], [-11, FW], [-32, FW],
    ],
    '2134': [
      [0, 48],
      [ 37, DF * 0.2], [13, DF], [-13, DF], [-37, DF * 0.2],
      [ 0, 0], [32, FW], [0, FW * 0.5],
      [11, FW], [-11, FW], [-32, FW],
    ],
    '253': [
      [0, 48],
      [40, 5], [13, DF], [-13, DF], [-40, 5],
      [ 0, 0], [29, -19], [17, -4],
      [ 0, -19], [-17, -4], [-29, -19],
    ],
    '235': [
      [0, 48],
      [27, -2], [13, DF], [-13, DF], [-27, -2],
      [ 0, 0], [40, -24], [19, -15],
      [ 0, -DF - 3], [-19, -15], [-40, -24],
    ],
    // ブロック守備
    '442block': [
      [0, 48],
      [ 37, DF - sb], [13, DF], [-13, DF], [-37, DF - sb],
      [-13, 11], [37, 6], [13, 11],
      [12, -15], [-12, -15], [-37, 6],
    ],
    '4141': [
      [0, 48],
      [37, DF], [13, DF], [-13, DF], [-37, DF],
      [ 0, 13], [37, -6], [14, -4],
      [ 0, FW], [-14, -4], [-37, -6],
    ],
    '4411': [
      [0, 48],
      [37, DF], [13, DF], [-13, DF], [-37, DF],
      [-13, 0], [37, 0.1 * FW], [13, 0],
      [ 0, FW], [0, 0.5 * FW], [-37, 0.1 * FW],
    ],
    '451': [
      [0, 48],
      [37, DF], [13, DF], [-13, DF], [-37, DF],
      [ 0, 0], [40, 0.1 * FW], [20, 0.05 * FW],
      [ 0, FW], [-20, 0.05 * FW], [-40, 0.1 * FW],
    ],

    // ── 3バック系 ──────────────────────────────────────────────────────────────
    '343◇': [
      [0, 48],
      [25, DF * 0.2], [30, DF - 3 - sb], [-30, DF - 3 - sb], [-25, DF * 0.2],
      [ 0, DF], [35, FW * 0.8], [0, DF * 0.2],
      [ 0, FW], [0, FW * 0.45], [-35, FW * 0.8],
    ],
    '343': [
      [0, 48],
      [25, DF * 0.9], [0, DF], [-25, DF * 0.9], [-40, -wb],
      [-15, 0], [40, -wb], [15, 0],
      [ 0, FW], [25, FW * 0.8], [-25, FW * 0.8],
    ],
    '3421': [
      [0, 48],
      [25, DF * 0.9], [0, DF], [-25, DF * 0.9], [-40, -wb],
      [-15, DF * 0.2], [40, -wb], [15, DF * 0.2],
      [ 0, FW], [17, FW * 0.4], [-17, FW * 0.4],
    ],
    '3421R': [
      [0, 48],
      [40, 3], [25, DF * 0.9], [0, DF], [-25, DF * 0.9],
      [-15, 0], [17, -12], [15, 0],
      [ 0, FW], [-17, -12], [-40, 3],
    ],
    '352W': [
      [0, 48],
      [25, DF * 0.9], [0, DF], [-25, DF * 0.9], [-40, -wb],
      [-19, DF * 0.2], [40, -wb], [19, DF * 0.2],
      [14, FW], [0, FW * 0.4], [-14, FW],
    ],
    '352M': [
      [0, 48],
      [25, DF * 0.9], [0, DF], [-25, DF * 0.9], [-40, -wb],
      [ 0, DF * 0.3], [40, -wb], [19, FW * 0.3],     // 5=ボランチ(中央),  7=右WB高め
      [14, FW], [-19, FW * 0.3], [-14, FW],            // 9=左WG
    ],
    '325': [
      [0, 48],
      [25, DF * 0.9], [0, DF], [-25, DF * 0.9], [-40, FW * 0.8],
      [-15, 0], [40, FW * 0.8], [15, 0],
      [ 0, FW], [17, -12], [-17, -12],
    ],
    '334': [
      [0, 48],
      [25, DF * 0.9], [0, DF], [-25, DF * 0.9], [-30, -12],
      [ 0, 3], [30, -12], [20, 1],
      [10, FW], [-20, 1], [-10, FW],
    ],
    '541': [
      [0, 48],
      [20, DF], [0, DF], [-20, DF], [-40, DF],
      [-10, 0], [40, DF], [10, 0],
      [ 0, FW], [28, 0], [-28, 0],
    ],
    '532': [
      [0, 48],
      [20, DF], [0, DF], [-20, DF], [-40, DF],
      [ 0, 0], [40, DF], [15, 0],
      [12, FW], [-15, 0], [-12, FW],
    ],

    // ── 個別定義が必要な jp バリアント ─────────────────────────────────────────
    // 座標値自体がベースフォーメーションと大きく異なるため、スワップでは表現できない。
    // 352Mjp / 4231jp はスワップで生成するため、ここには定義しない。

    '4123jp': [
      // 4123 の LB(idx4) が左SH位置に上がり、左CB(idx3) が LB に下がった配置
      [0, 48],
      [ 37, DF - sb], [13, DF], [-37, DF - sb], [-35, FW * 0.6],
      [-13, DF], [35, FW * 0.6], [0, DF * 0.4],
      [ 0, FW], [15, FW * 0.2], [-15, FW * 0.2],
    ],
    '343◇jp': [
      // 343◇ とは選手配置の思想が根本的に異なる別バリアント
      [0, 48],
      [25, DF * 0.9], [0, DF], [-25, DF * 0.9], [-35, FW * 0.8], [-30, DF * 0.2],
      [30, DF * 0.2], [0, DF * 0.2],
      [ 0, FW], [35, FW * 0.8], [0, FW * 0.45],
    ],

    'assemble': [
      [0, 48],[0, 48],[0, 48],[0, 48],[0, 48],
      [0, 48],[0, 48],[0, 48],[0, 48],[0, 48],[0, 48],
    ],
  };
}

// ─── バリアント生成（インデックス置換）──────────────────────────────────────
//
// jp バリアントのうち、ベースフォーメーションとの差異が
// 「選手インデックスの入れ替え」だけで説明できるものをここで生成する。
//
// 置換テーブルの読み方:
//   SWAP_RULES['352M']['jp'] = [0,1,2,3,4, 7,6,5, 8,9,10] の場合、
//   出力の idx5 = ベースの idx7 の座標、出力の idx7 = ベースの idx5 の座標、という意味。
//   (GK = idx0 は常に [0] のまま固定)
/**
 * @typedef {Object} SwapRule
 * @property {number[]} perm   長さ 11 の置換テーブル。
 *                             出力[i] = ベース[perm[i]] の座標を使う。
 * @property {number[]} mirrorX  x 座標を反転するインデックスのリスト（省略時は空）。
 */

/** @type {Record<string, Record<string, SwapRule>>} */
const SWAP_RULES = {
  '352M': {
    jp: {
      perm:    [0, 1, 2, 3, 4,  7, 6, 5,  8, 9, 10],
      //              変化なし   5←7 6←  7←5  変化なし
      mirrorX: [5, 9],  // idx5(元idx7の[+19,y]→[-19,y])、idx9([-19,y]→[+19,y])
    },
  },
  '4231': {
    jp: {
      perm:    [0,  2, 3, 4, 10,  5, 1, 7,  8, 6, 9],
      //           1←2 2←3 3←4 4←10  5←  6←1 7←  8←  9←6 10←9
      mirrorX: [],
    },
  },
  '442block': {
    _idea: {
      // perm:    [0, 1, 2, 5, 3, 9, 6, 7, 8,  10, 4],
      perm: [0, 1, 2, 4, 10, 3, 6, 7, 8,  5, 9],
      // perm: [0, 1, 2, 3, 4, 5, 6, 7, 8,  9, 10],
      //           6←4 4←5 10←6 5←11  11←10
      mirrorX: [],
    },
  },
  '532': {
    _idea: {
      perm: [0, 6, 1, 3, 4, 2, 7, 5, 8,  10, 9],
      // perm: [0, 1, 2, 3, 4, 5, 6, 7, 8,  9, 10],
      // 2←3 3←6 6←8 7←2 8←7 10←11 11←10
      mirrorX: [],
    },
  },
};

/**
 * 置換テーブルをベース座標配列に適用し、バリアント座標配列を返す。
 *
 * @param {[number,number][]} base   ベースフォーメーションの座標配列（長さ 11）
 * @param {SwapRule}          rule
 * @returns {[number,number][]}
 */
function applySwap(base, rule) {
  const out = rule.perm.map(srcIdx => [...base[srcIdx]]);
  for (const i of (rule.mirrorX ?? [])) {
    out[i][0] *= -1;
  }
  return out;
}

// ─── 公開 API ────────────────────────────────────────────────────────────────

/**
 * 指定フォーメーションの絶対座標配列を返す。
 *
 * バリアント名（末尾が 'jp' 等）が渡された場合は SWAP_RULES を参照して
 * ベースフォーメーションから動的に生成する。
 * SWAP_RULES に対応がない場合は buildCoordinates の個別定義にフォールバックする。
 *
 * @param {string} formation フォーメーション名（例: '352M', '352Mjp', '4231jp'）
 * @param {Object} [options]
 * @param {[number,number]} [options.anchor=[50,50]] フィールド上の基準点（%）
 * @param {number}          [options.DF=26]          DFラインの高さ
 * @param {number}          [options.FW=-22]         FWラインの高さ
 * @param {number}          [options.SB=0.3]         SBスライダー値
 * @returns {[number,number][] | undefined}
 */
function relativeCoords(formation, { DF = 26, FW = -22, SB = 0.3 } = {}) {
  const sb = (SB - 0.3) * (5 / 0.3) + DF * 0.2;
  const wb = 2.3 * (SB - 0.3) * (5 / 0.3) + FW * 0.2;

  const coords = buildCoordinates(DF, FW, sb, wb);

  // ── バリアント解決 ──────────────────────────────────────────────────────────
  // 'baseNamevariant' の形式（例: '352Mjp'）を検出し、
  // SWAP_RULES に登録があればベース座標から生成する。
  let base = coords[formation];

  if (!base) {
    for (const [baseName, variants] of Object.entries(SWAP_RULES)) {
      for (const [suffix, rule] of Object.entries(variants)) {
        if (formation === baseName + suffix) {
          const baseCoords = coords[baseName];
          if (baseCoords) base = applySwap(baseCoords, rule);
          break;
        }
      }
      if (base) break;
    }
  }
  return base?.map(([dx, dy]) => [dx, dy]);
}

/**
 * 指定フォーメーションの絶対座標配列を返す。
 *
 * @param {string} formation フォーメーション名（例: '352M', '352Mjp', '4231jp'）
 * @param {Object} [options]
 * @param {[number,number]} [options.anchor=[50,50]] フィールド上の基準点（%）
 * @param {number}          [options.DF=26]          DFラインの高さ
 * @param {number}          [options.FW=-22]         FWラインの高さ
 * @param {number}          [options.SB=0.3]         SBスライダー値
 * @param {Record<string,'R'|'L'>} [options.flips]   左右反転ユニットの選択（下記参照）
 * @returns {[number,number][] | undefined}
 */
export function formations(formation, { anchor = [50, 50], DF = 26, FW = -22, SB = 0.3, flips = null } = {}) {
  let rel = relativeCoords(formation, { DF, FW, SB });
  if (!rel) return undefined;
  if (flips) rel = applyMirror(rel, mirrorSources(formation, flips));
  return rel.map(([dx, dy]) => [anchor[0] + dx, anchor[1] + dy]);
}

// ─── 左右反転ユニット ────────────────────────────────────────────────────────
//
// フォーメーションの「形」（10 か所の立ち位置）は左右対称だが、
// 「誰がどこに立つか」は非対称なことが多い（例: 3421 で右 SB だけが CB に残る）。
// この非対称な部分を「ユニット」として切り出し、左右反転を選べるようにする。
//
// 反転の規則:
//   - 左右で対になる役割（RB↔LB, CB3↔CB4, RWG↔LWG）は、相手の位置の鏡像へ
//   - 対のない役割（AC, BtB, ST, #10）は、自分の位置の鏡像へ
//
// ユニットは座標から自動で求める（手で定義しない）:
//   1. 対になる役割は両方含む
//   2. ユニットが占める場所の集合が左右対称（反転しても他の選手とぶつからない）
//   3. 反転すると実際に位置が変わる
//   4. それ以上分けられない最小のもの
//
// 選択はユニット ID ごとに「どちら側か」（'R' / 'L'）で持つ。0/1 ではなく側で持つので、
// 3421 で「左SBが残る」を選んだあと 352W に切り替えても同じ意味が引き継がれる。

/** 役割名（インデックス = 背番号 − 1） */
export const ROLE_NAMES = ['GK', 'RB', 'CB3', 'CB4', 'LB', 'AC', 'RWG', 'BtB', 'ST', '#10', 'LWG'];

/** 左右で対になる役割（インデックス）。ここにないものは自分自身と対 */
export const MIRROR_PARTNER = [0, 4, 3, 2, 1, 5, 10, 7, 8, 9, 6];

const PAIR_UNITS = {
  'RB-LB':   { id: 'SB', label: '残るSB' },     // 深い位置（CB 側）に残る SB の側
  'RWG-LWG': { id: 'WG', label: '下がるWG' },
  'CB3-CB4': { id: 'CB', label: '下がるCB' },
};
const FEATURE_PRIORITY = ['#10', 'AC', 'ST', 'BtB'];

/**
 * @typedef {Object} MirrorUnit
 * @property {string}   id       ユニット ID（例 'SB', 'AC-BtB'）
 * @property {number[]} members  反転で位置が変わる選手のインデックス
 * @property {string}   label    UI 表示名（例 '残るSB', 'AC の位置'）
 * @property {['R'|'L','R'|'L']} sides  [座標どおりの側, 反転したときの側]
 * @property {[number,number]|null} lead  側を決める対（例 RB/LB）。ない場合 null
 */

const unitCache = new Map();
const r1 = v => Math.round(v * 10) / 10 || 0;
const posKey = ([x, y]) => `${r1(x)},${r1(y)}`;
const sideOf = x => (x > 0 ? 'R' : 'L');
const otherSide = s => (s === 'R' ? 'L' : 'R');

/**
 * フォーメーションの左右反転ユニットを返す（座標から自動導出・キャッシュ）。
 * @param {string} formation
 * @returns {MirrorUnit[]}
 */
export function getMirrorUnits(formation) {
  if (unitCache.has(formation)) return unitCache.get(formation);
  const p = relativeCoords(formation);
  if (!p) return [];

  const P = MIRROR_PARTNER;
  const changes = i => posKey([-p[P[i]][0], p[P[i]][1]]) !== posKey(p[i]);

  // 条件 1〜3 を満たす集合を総当たりし、「位置が変わる選手」の集合として集める
  const candidates = new Map();
  for (let mask = 1; mask < (1 << 10); mask++) {
    const S = [];
    for (let i = 0; i < 10; i++) if (mask >> i & 1) S.push(i + 1);
    if (S.some(i => !S.includes(P[i]))) continue;
    const orig = S.map(i => posKey(p[i])).sort().join('|');
    const mirr = S.map(i => posKey([-p[i][0], p[i][1]])).sort().join('|');
    if (orig !== mirr) continue;
    const changed = S.filter(changes);
    if (changed.length) candidates.set(changed.join(','), changed);
  }

  // 条件 4: 他の候補を真に含むものを除き、重ならないものだけ採用
  const sorted = [...candidates.values()].sort((a, b) => a.length - b.length);
  const atoms = [];
  for (const S of sorted) {
    if (atoms.some(A => A.some(i => S.includes(i)))) continue;
    atoms.push(S);
  }

  const units = atoms.map(members => describeUnit(members, p));
  unitCache.set(formation, units);
  return units;
}

function describeUnit(members, p) {
  const P = MIRROR_PARTNER;
  const pairs = members.filter(i => P[i] !== i && i < P[i]).map(i => [i, P[i]]);

  if (pairs.length) {
    // 側を決める対: RB/LB が非対称ならそれを優先、なければ縦の差が最も大きい対
    const ydiff = ([a, b]) => Math.abs(p[a][1] - p[b][1]);
    const asym  = ([a, b]) => posKey([-p[b][0], p[b][1]]) !== posKey(p[a]);
    const lead = pairs.find(([a, b]) => a === 1 && b === 4 && asym([a, b]))
      ?? [...pairs].sort((x, y) => ydiff(y) - ydiff(x))[0];
    const name = `${ROLE_NAMES[lead[0]]}-${ROLE_NAMES[lead[1]]}`;
    const meta = PAIR_UNITS[name] ?? { id: name, label: `${name} の深い側` };
    // 後ろに残る方: より自陣寄り（y が大きい）、同じ深さなら中央寄り
    const [a, b] = lead;
    const stays = (r1(p[a][1]) !== r1(p[b][1]))
      ? (p[a][1] > p[b][1] ? a : b)
      : (Math.abs(p[a][0]) <= Math.abs(p[b][0]) ? a : b);
    const deeper = stays;
    const s0 = sideOf(p[deeper][0]);
    return { id: meta.id, members, label: meta.label, sides: [s0, otherSide(s0)], lead };
  }

  const roleOf = i => ROLE_NAMES[i];
  const featured = FEATURE_PRIORITY.map(n => ROLE_NAMES.indexOf(n))
    .find(i => members.includes(i) && Math.abs(p[i][0]) > 0.5)
    ?? members.find(i => Math.abs(p[i][0]) > 0.5) ?? members[0];
  const s0 = sideOf(p[featured][0]);
  return {
    id: members.map(roleOf).join('-'),
    members,
    label: `${roleOf(featured)} の位置`,
    sides: [s0, otherSide(s0)],
    lead: null,
  };
}

/** 選択（'R'/'L'）がそのユニットを反転させるかどうか */
export function isUnitFlipped(unit, flips) {
  const want = flips?.[unit.id];
  return !!want && want !== unit.sides[0];
}

/**
 * 各選手が「どのスロットの鏡像に立つか」を返す。
 * 反転していない選手は自分のスロット（mirror=false）。
 * @returns {{ src:number, mirror:boolean }[]}
 */
export function mirrorSources(formation, flips) {
  const src = Array.from({ length: 11 }, (_, i) => ({ src: i, mirror: false }));
  for (const unit of getMirrorUnits(formation)) {
    if (!isUnitFlipped(unit, flips)) continue;
    for (const i of unit.members) src[i] = { src: MIRROR_PARTNER[i], mirror: true };
  }
  return src;
}

function applyMirror(rel, sources) {
  return sources.map(({ src, mirror }) => {
    const [x, y] = rel[src];
    return mirror ? [-x, y] : [x, y];
  });
}

/**
 * スライダー 3 値をフォーメーション名に変換する（8 種の主要フォーメーション）。
 *
 * @param {number} backs   0 or 1
 * @param {number} volante 0 or 1
 * @param {number} top     0 or 1
 * @returns {string}
 */
export function getFormationName(backs, volante, top) {
  if (backs > 0.5) {
    if (volante > 0.5) return top > 0.5 ? '442'  : '4231';
    else               return top > 0.5 ? '442◇' : '4123';
  } else {
    if (volante > 0.5) return top > 0.5 ? '352W' : '3421';
    else               return top > 0.5 ? '352M' : '343◇';
  }
}

/**
 * フォーメーション → スライダー初期値のマップ。
 * backs / volante / top の各値は 0 or 1。
 *
 * @type {Record<string, {backs:number, volante:number, top:number}>}
 */
export const formationSliderMap = {
  // ── 主要 8 フォーメーション ─────────────────────────────────────────────────
  '4123':   { backs: 1, volante: 0, top: 0 },
  '442':    { backs: 1, volante: 1, top: 1 },
  '442◇':  { backs: 1, volante: 0, top: 1 },
  '4231':   { backs: 1, volante: 1, top: 0 },
  '3421':   { backs: 0, volante: 1, top: 0 },
  '352W':   { backs: 0, volante: 1, top: 1 },
  '352M':   { backs: 0, volante: 0, top: 1 },
  '343◇':  { backs: 0, volante: 0, top: 0 },

  // ── 派生フォーメーション ────────────────────────────────────────────────────
  '343◇jp': { backs: 0, volante: 0, top: 0 },
  '4123jp': { backs: 1, volante: 0, top: 0 },
  '460':    { backs: 1, volante: 1, top: 0 },
  '4213':   { backs: 1, volante: 1, top: 0 },
  '433':    { backs: 1, volante: 0, top: 0 },
  '3421R':  { backs: 0, volante: 1, top: 0 },
  '4132':   { backs: 1, volante: 0, top: 1 },
  '4321':   { backs: 1, volante: 0, top: 0 },
  '4150':   { backs: 1, volante: 0, top: 0 },
  '343':    { backs: 0, volante: 1, top: 0 },

  // ── ハイプレス・前線数的有利 ────────────────────────────────────────────────
  '424':    { backs: 1, volante: 1, top: 1 },
  '4114':   { backs: 1, volante: 0, top: 1 },
  '2134':   { backs: 1, volante: 0, top: 1 },
  '235':    { backs: 1, volante: 0, top: 0 },
  '253':    { backs: 1, volante: 0, top: 0 },
  '334':    { backs: 0, volante: 0, top: 1 },
  '325':    { backs: 0, volante: 1, top: 0 },

  // ── ブロック守備 ─────────────────────────────────────────────────────────────
  '442block': { backs: 1, volante: 1, top: 1 },
  '4141':     { backs: 1, volante: 0, top: 0 },
  '4411':     { backs: 1, volante: 1, top: 0 },
  '451':      { backs: 1, volante: 0, top: 0 },
  '541':      { backs: 0, volante: 1, top: 0 },
  '532':      { backs: 0, volante: 0, top: 1 },
};
