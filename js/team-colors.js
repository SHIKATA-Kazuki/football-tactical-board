import { TEAMS, information } from './config.js';
import { createInputs, redrawAllPlayers_if_team_changed, updateFormationButtons } from './ui-events.js';
import { placePlayers } from './players.js';

let awayInitialized = false;

// ユニフォームモード: 'home' | 'away'
const uniformMode = { home: 'home', away: 'home' };

// =====================================================
// ユニフォームデータの解決
// =====================================================
function resolveUniform(teamDef, mode) {
  return mode === 'away' && teamDef.away
    ? teamDef.away.uniform
    : teamDef.uniform;
}

function resolveChip(teamDef, mode) {
  return mode === 'away' && teamDef.away
    ? teamDef.away.chip
    : teamDef.chip;
}

function resolveFormation(teamDef, mode) {
  return mode === 'away' && teamDef.away
    ? teamDef.away.formation
    : teamDef.formation;
}

// =====================================================
// ユニフォームを DOM に適用
//   svg フィールドがあれば background-image で表示、
//   なければ style（グラデーション等）にフォールバック
// =====================================================
function applyUniform(isHome, teamKey) {
  const side    = isHome ? 'home' : 'away';
  const mode    = uniformMode[side];
  const teamDef = TEAMS[teamKey];
  if (!teamDef) return;

  const chipData    = resolveChip(teamDef, mode);
  const uniformData = resolveUniform(teamDef, mode);

  // チップ更新
  const chip = document.querySelector(isHome ? '.home-chip' : '.away-chip');
  if (chip) {
    chip.style.background = chipData.color;
    chip.style.color      = uniformData.text;
    chip.textContent      = teamDef.name;
  }

  // ユニフォーム更新
  document.querySelectorAll(isHome ? '.player.home' : '.player.away')
    .forEach(p => {
      if (uniformData.svg) {
        // SVGファイルを background-image で表示
        p.style.backgroundImage = `url('./uniform/${uniformData.svg}.svg')`;
        p.style.backgroundSize  = 'cover';
        p.style.backgroundPosition = 'center';
        // CSS background プロパティと競合しないよう background-color は透明に
        p.style.backgroundColor = 'transparent';
        // style グラデーションは無効化
        p.style.background = '';
        // 再セット（backgroundImage が background の shorthand で消えるのを防ぐ）
        p.style.backgroundImage = `url('./uniform/${uniformData.svg}.svg')`;
        p.style.backgroundSize  = 'cover';
        p.style.backgroundPosition = 'center';
      } else {
        // フォールバック: 従来のグラデーション
        p.style.backgroundImage    = '';
        p.style.backgroundSize     = '';
        p.style.backgroundPosition = '';
        p.style.background = uniformData.style;
      }

      p.style.color = uniformData.text;

      if (uniformData.color) {
        const s = uniformData.shadowsize;
        p.style.textShadow = [
          `-${s}px  ${s}px 0 ${uniformData.color}`,
          `-${s}px -${s}px 0 ${uniformData.color}`,
          ` ${s}px  ${s}px 0 ${uniformData.color}`,
          ` ${s}px -${s}px 0 ${uniformData.color}`,
        ].join(', ');
      } else {
        p.style.textShadow = '';
      }
    });

  // ホーム/アウェイ切り替えボタンのアクティブ状態
  const btnHome = document.querySelector(isHome ? '.uniform-home-btn' : '.away-uniform-home-btn');
  const btnAway = document.querySelector(isHome ? '.uniform-away-btn' : '.away-uniform-away-btn');
  const hasAway = !!teamDef.away;
  if (btnHome) btnHome.classList.toggle('is-active', mode === 'home');
  if (btnAway) {
    btnAway.classList.toggle('is-active', mode === 'away');
    btnAway.disabled = !hasAway;
  }
}

// =====================================================
// チーム変更時（セレクト change）
// =====================================================
function updateTeamColor(isHome, teamKey) {
  const homeSelect = document.getElementById('homeTeamSelect');
  const awaySelect = document.getElementById('awayTeamSelect');
  const side       = isHome ? 'home' : 'away';

  uniformMode[side] = 'home';
  applyUniform(isHome, teamKey);

  createInputs('inputsHome', information[homeSelect.value]?.BestMember, true);
  if (awayInitialized) {
    createInputs('inputsAway', information[awaySelect.value]?.BestMember, false);
  }

  const teamDef   = TEAMS[teamKey];
  if (!teamDef) return;
  const formation = resolveFormation(teamDef, uniformMode[side]);
  if (!formation) return;

  if (isHome) {
    redrawAllPlayers_if_team_changed(formation);
    updateFormationButtons(formation, 'home');
  } else {
    awayInitialized = true;
    redrawAllPlayers_if_team_changed(formation, 'away');
    updateFormationButtons(formation, 'away');
  }
}

// =====================================================
// ユニフォームモード切り替え
// =====================================================
export function switchUniformMode(isHome, mode) {
  const side    = isHome ? 'home' : 'away';
  const select  = document.getElementById(isHome ? 'homeTeamSelect' : 'awayTeamSelect');
  const teamKey = select?.value;
  if (!teamKey) return;

  uniformMode[side] = mode;
  applyUniform(isHome, teamKey);
}

// =====================================================
// セレクトボックス＆切り替えボタン初期化
// =====================================================
export function initializeTeamSelects() {
  const homeSelect = document.getElementById('homeTeamSelect');
  const awaySelect = document.getElementById('awayTeamSelect');

  homeSelect.addEventListener('change', e => updateTeamColor(true,  e.target.value));
  awaySelect.addEventListener('change', e => updateTeamColor(false, e.target.value));

  document.querySelector('.uniform-home-btn')
    ?.addEventListener('click', () => switchUniformMode(true,  'home'));
  document.querySelector('.uniform-away-btn')
    ?.addEventListener('click', () => switchUniformMode(true,  'away'));

  document.querySelector('.away-uniform-home-btn')
    ?.addEventListener('click', () => switchUniformMode(false, 'home'));
  document.querySelector('.away-uniform-away-btn')
    ?.addEventListener('click', () => switchUniformMode(false, 'away'));

  updateTeamColor(true, homeSelect.value);
}

export function isAwayInitialized() {
  return awayInitialized;
}
