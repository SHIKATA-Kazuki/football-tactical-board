/**
 * state.js
 *
 * 盤面全体の状態を 1 つのオブジェクトとして取り出し・復元する。
 * 「元に戻す」と「共有リンク」の両方がこれを使う。
 *
 * エクスポート:
 *   serializeState()
 *   restoreState(state)
 *   encodeState(state)  → Promise<string>  URL に載せられる文字列
 *   decodeState(text)   → Promise<object>
 */

import {
  getCurrentFormation,
  setFormationKeys,
  getFlipState,
  setFlipState,
  setSliderValue,
  syncJoystickKnobs,
  redrawBoth,
} from './ui-events.js';
import {
  wingStick,
  compressStick,
  sliderVal,
  getManualPositions,
  setManualPositions,
} from './players.js';
import { getCurrentSelection, getUniformMode, setTeamSelection } from './team-colors.js';
import { getBallState, setBallState } from './ball.js';
import { getDrawings, setDrawings } from './drawing.js';
import { isAnalysisVisible, setAnalysisVisible } from './analysis.js';
import { getPhases, setPhases } from './phases.js';

const VERSION = 1;
const SLIDERS = ['backsSlider', 'volanteSlider', 'topSlider', 'sidbackUpDown', 'lineSlider'];
const round = v => Math.round(v * 1000) / 1000;

// ─── 取り出し ────────────────────────────────────────────────────────────────

function readNumbers(containerId) {
  return Array.from({ length: 11 }, (_, i) => {
    const input = document.querySelector(`#${containerId} input[name="number${i + 1}"]`);
    return input ? Number(input.value) : i + 1;
  });
}

export function serializeState() {
  const team = isHome => ({
    ...getCurrentSelection(isHome),
    mode: getUniformMode(isHome),
  });
  return {
    v: VERSION,
    team:   { home: team(true), away: team(false) },
    num:    { home: readNumbers('inputsHome'), away: readNumbers('inputsAway') },
    f:      { home: getCurrentFormation('home'), away: getCurrentFormation('away') },
    flip:   getFlipState(),
    s:      SLIDERS.map(id => sliderVal(id)),
    wing:   [round(wingStick.x), round(wingStick.y)],
    comp:   [round(compressStick.x), round(compressStick.y)],
    manual: { home: getManualPositions('home'), away: getManualPositions('away') },
    ball:   getBallState(),
    draw:   getDrawings(),
    phases: getPhases(),
    view:   {
      names:    document.getElementById('field')?.classList.contains('field-show-names') ?? false,
      analysis: isAnalysisVisible(),
    },
  };
}

// ─── 復元 ────────────────────────────────────────────────────────────────────

function writeNumbers(containerId, numbers = []) {
  numbers.forEach((n, i) => {
    const input = document.querySelector(`#${containerId} input[name="number${i + 1}"]`);
    if (!input || !Number.isFinite(n)) return;
    input.value = n;
    input.dispatchEvent(new Event('input'));   // 横の選手名を更新
  });
}

export function restoreState(state) {
  if (!state || state.v !== VERSION) return false;

  // 1. チーム（入力欄とフォーメーションがチームの初期値に作り直される）
  if (state.team?.home) setTeamSelection(true,  state.team.home);
  if (state.team?.away) setTeamSelection(false, state.team.away);

  // 2. 背番号
  writeNumbers('inputsHome', state.num?.home);
  writeNumbers('inputsAway', state.num?.away);

  // 3. スライダー・スティック
  (state.s ?? []).forEach((v, i) => {
    if (SLIDERS[i] && Number.isFinite(v)) setSliderValue(SLIDERS[i], v);
  });
  [wingStick.x, wingStick.y]         = state.wing ?? [0, 0];
  [compressStick.x, compressStick.y] = state.comp ?? [0, 0];
  syncJoystickKnobs();

  // 4. フォーメーション・手動配置・ボール
  setFormationKeys(state.f ?? {});
  setFlipState(state.flip ?? {});
  setManualPositions('home', state.manual?.home);
  setManualPositions('away', state.manual?.away);
  setBallState(state.ball ?? {}, { redraw: false });
  redrawBoth();

  // 5. 描画・局面・表示
  setDrawings(state.draw ?? []);
  setPhases(state.phases ?? []);
  document.getElementById('field')?.classList.toggle('field-show-names', !!state.view?.names);
  setAnalysisVisible(!!state.view?.analysis);
  return true;
}

// ─── URL 用エンコード ────────────────────────────────────────────────────────
// JSON → deflate 圧縮（対応ブラウザのみ）→ base64url。
// 先頭 1 文字で形式を区別する: 'z' = 圧縮あり、'j' = 圧縮なし。

const toBase64Url = bytes => {
  let bin = '';
  bytes.forEach(b => { bin += String.fromCharCode(b); });
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};
const fromBase64Url = text => {
  const bin = atob(text.replace(/-/g, '+').replace(/_/g, '/'));
  return Uint8Array.from(bin, c => c.charCodeAt(0));
};

async function pipe(bytes, stream) {
  const out = new Blob([bytes]).stream().pipeThrough(stream);
  return new Uint8Array(await new Response(out).arrayBuffer());
}

export async function encodeState(state) {
  const bytes = new TextEncoder().encode(JSON.stringify(state));
  if ('CompressionStream' in window) {
    return 'z' + toBase64Url(await pipe(bytes, new CompressionStream('deflate-raw')));
  }
  return 'j' + toBase64Url(bytes);
}

export async function decodeState(text) {
  const kind = text[0];
  let bytes = fromBase64Url(text.slice(1));
  if (kind === 'z') bytes = await pipe(bytes, new DecompressionStream('deflate-raw'));
  else if (kind !== 'j') throw new Error('unknown format');
  return JSON.parse(new TextDecoder().decode(bytes));
}
