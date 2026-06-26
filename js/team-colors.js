/**
 * team-colors.js
 *
 * チーム選択・ユニフォームモード切り替えを管理する。
 *
 * 責務:
 *   - チーム → 年度 → 試合 の 3 段連動セレクト
 *   - H / A ユニフォーム切り替えボタン
 *   - チップ・選手要素へのユニフォーム適用
 *
 * HTML に必要な要素（ホーム側、アウェイ側も同様）:
 *   .home-team-select    チームセレクト
 *   .home-season-select  年度セレクト
 *   .home-lineup-select  試合セレクト
 *   .uniform-home-btn / .uniform-away-btn  H/A 切り替えボタン
 *   .home-chip           チップ表示
 */

import { TEAM_CATALOG, TEAMS, information, getSeasons, getLineups, getLineup } from './config.js';
import { createInputs, redrawAllPlayers_if_team_changed, updateFormationButtons } from './ui-events.js';
import { placePlayers } from './players.js';

// ─── 状態 ────────────────────────────────────────────────────────────────────

let awayInitialized = false;

/** @type {{ home: 'home'|'away', away: 'home'|'away' }} */
const uniformMode = { home: 'home', away: 'home' };

/** 現在選択されているラインナップキー */
const currentSelection = {
  home: { teamId: 'default', seasonId: '-', lineupId: 'best' },
  away: { teamId: 'default', seasonId: '-', lineupId: 'best' },
};

// ─── セレクト UI の動的構築 ──────────────────────────────────────────────────

/**
 * 年度セレクトを teamId に合わせて再構築する。
 * @param {HTMLSelectElement} seasonEl
 * @param {string} teamId
 * @param {string|null} selectSeasonId  選択状態にしたい年度ID（null = 先頭）
 */
function rebuildSeasonSelect(seasonEl, teamId, selectSeasonId = null) {
  const seasons = getSeasons(teamId);
  seasonEl.innerHTML = '';
  for (const [seasonId, seasonDef] of Object.entries(seasons)) {
    const opt = document.createElement('option');
    opt.value       = seasonId;
    opt.textContent = seasonDef.label;
    seasonEl.appendChild(opt);
  }
  if (selectSeasonId && seasonEl.querySelector(`option[value="${selectSeasonId}"]`)) {
    seasonEl.value = selectSeasonId;
  }
}

/**
 * 試合セレクトを teamId + seasonId に合わせて再構築する。
 * @param {HTMLSelectElement} lineupEl
 * @param {string} teamId
 * @param {string} seasonId
 * @param {string|null} selectLineupId  選択状態にしたい試合ID（null = 先頭）
 */
function rebuildLineupSelect(lineupEl, teamId, seasonId, selectLineupId = null) {
  const lineups = getLineups(teamId, seasonId);
  lineupEl.innerHTML = '';
  for (const [lineupId, lineup] of Object.entries(lineups)) {
    const opt = document.createElement('option');
    opt.value       = lineupId;
    opt.textContent = lineup.label;
    lineupEl.appendChild(opt);
  }
  if (selectLineupId && lineupEl.querySelector(`option[value="${selectLineupId}"]`)) {
    lineupEl.value = selectLineupId;
  }
}

// ─── ユニフォームデータの解決 ────────────────────────────────────────────────

function resolveUniform(lineup, mode) {
  return mode === 'away' && lineup.away ? lineup.away.uniform : lineup.uniform;
}

function resolveChip(lineup) {
  return lineup.chip;
}

function resolveFormation(lineup, mode) {
  return mode === 'away' && lineup.away ? lineup.away.formation : lineup.formation;
}

// ─── ユニフォーム DOM 適用 ───────────────────────────────────────────────────

/**
 * 選手要素にユニフォームスタイルを適用する。
 * @param {HTMLElement} el
 * @param {object} uniform
 */
function applyUniformToPlayer(el, uniform) {
  if (uniform.svg) {
    el.style.background         = '';
    el.style.backgroundImage    = `url('./uniform/${uniform.svg}.svg')`;
    el.style.backgroundSize     = 'cover';
    el.style.backgroundPosition = 'center';
    el.style.backgroundColor    = 'transparent';
    // shorthand による上書きを防ぐため再セット
    el.style.backgroundImage    = `url('./uniform/${uniform.svg}.svg')`;
  } else {
    el.style.backgroundImage    = '';
    el.style.backgroundSize     = '';
    el.style.backgroundPosition = '';
    el.style.background = uniform.style;
  }

  el.style.color = uniform.text;

  if (uniform.color) {
    const s = uniform.shadowsize;
    el.style.textShadow = [
      `-${s}px  ${s}px 0 ${uniform.color}`,
      `-${s}px -${s}px 0 ${uniform.color}`,
      ` ${s}px  ${s}px 0 ${uniform.color}`,
      ` ${s}px -${s}px 0 ${uniform.color}`,
    ].join(', ');
  } else {
    el.style.textShadow = '';
  }
}

/**
 * チップ・選手ビジュアルをラインナップに合わせて更新する。
 * @param {boolean} isHome
 * @param {object}  lineup
 */
function applyUniform(isHome, lineup) {
  const side    = isHome ? 'home' : 'away';
  const mode    = uniformMode[side];
  const teamId  = currentSelection[side].teamId;
  const teamDef = TEAM_CATALOG[teamId];

  const chip    = resolveChip(lineup);
  const uniform = resolveUniform(lineup, mode);

  // ── チップ ──────────────────────────────────────────────────────────────────
  const chipEl = document.querySelector(isHome ? '.home-chip' : '.away-chip');
  if (chipEl) {
    chipEl.style.background = chip.color;
    chipEl.style.color      = uniform.text;
    chipEl.textContent      = teamDef?.label ?? '';
  }

  // ── 選手要素 ─────────────────────────────────────────────────────────────────
  document.querySelectorAll(isHome ? '.player.home' : '.player.away')
    .forEach(p => applyUniformToPlayer(p, uniform));

  // ── H/A 切り替えボタン ───────────────────────────────────────────────────────
  const btnHomeKey = isHome ? '.uniform-home-btn'      : '.away-uniform-home-btn';
  const btnAwayKey = isHome ? '.uniform-away-btn'      : '.away-uniform-away-btn';
  const btnHome    = document.querySelector(btnHomeKey);
  const btnAway    = document.querySelector(btnAwayKey);
  const hasAway    = !!lineup.away;

  btnHome?.classList.toggle('is-active', mode === 'home');
  if (btnAway) {
    btnAway.classList.toggle('is-active', mode === 'away');
    btnAway.disabled = !hasAway;
  }
}

// ─── ラインナップ適用（コア処理）────────────────────────────────────────────

/**
 * 選択されたラインナップをフィールドに反映する。
 * @param {boolean} isHome
 * @param {string}  teamId
 * @param {string}  seasonId
 * @param {string}  lineupId
 */
function applyLineup(isHome, teamId, seasonId, lineupId) {
  const side   = isHome ? 'home' : 'away';
  const lineup = getLineup(teamId, seasonId, lineupId);
  if (!lineup) return;

  currentSelection[side] = { teamId, seasonId, lineupId };
  uniformMode[side] = 'home';

  applyUniform(isHome, lineup);

  // スクワッド入力フィールドを更新
  createInputs(isHome ? 'inputsHome'    : 'inputsAway',    lineup.bestMember, isHome);
  createInputs(isHome ? 'inputsHome-sp' : 'inputsAway-sp', lineup.bestMember, isHome);

  const formation = resolveFormation(lineup, 'home');
  if (!formation) return;

  if (isHome) {
    redrawAllPlayers_if_team_changed(formation, 'home');
    updateFormationButtons(formation, 'home');
  } else {
    awayInitialized = true;
    redrawAllPlayers_if_team_changed(formation, 'away');
    updateFormationButtons(formation, 'away');
  }
}

// ─── 3 段セレクトのイベント ──────────────────────────────────────────────────

/**
 * 1 サイド（ホームまたはアウェイ）の 3 段セレクトを初期化する。
 * @param {boolean} isHome
 */
function initTripleSelect(isHome) {
  const side      = isHome ? 'home' : 'away';
  const teamEl    = document.querySelector(`.${side}-team-select`);
  const seasonEl  = document.querySelector(`.${side}-season-select`);
  const lineupEl  = document.querySelector(`.${side}-lineup-select`);

  if (!teamEl || !seasonEl || !lineupEl) {
    console.warn(`[TeamColors] ${side} の 3 段セレクト要素が見つかりません`);
    return;
  }

  // ── チームセレクト変更 ────────────────────────────────────────────────────────
  teamEl.addEventListener('change', () => {
    const teamId   = teamEl.value;
    const seasons  = getSeasons(teamId);
    const seasonId = Object.keys(seasons)[0] ?? '-';

    rebuildSeasonSelect(seasonEl, teamId);
    rebuildLineupSelect(lineupEl, teamId, seasonId);

    applyLineup(isHome, teamId, seasonId, lineupEl.value || 'best');
  });

  // ── 年度セレクト変更 ──────────────────────────────────────────────────────────
  seasonEl.addEventListener('change', () => {
    const teamId   = teamEl.value;
    const seasonId = seasonEl.value;

    rebuildLineupSelect(lineupEl, teamId, seasonId);

    applyLineup(isHome, teamId, seasonId, lineupEl.value || 'best');
  });

  // ── 試合セレクト変更 ──────────────────────────────────────────────────────────
  lineupEl.addEventListener('change', () => {
    applyLineup(isHome, teamEl.value, seasonEl.value, lineupEl.value);
  });

  // ── 初期表示 ──────────────────────────────────────────────────────────────────
  const initTeamId   = teamEl.value;
  const initSeasons  = getSeasons(initTeamId);
  const initSeasonId = Object.keys(initSeasons)[0] ?? '-';

  rebuildSeasonSelect(seasonEl, initTeamId);
  rebuildLineupSelect(lineupEl, initTeamId, initSeasonId);

  applyLineup(isHome, initTeamId, initSeasonId, lineupEl.value || 'best');
}

// ─── 公開 API ────────────────────────────────────────────────────────────────

/**
 * ユニフォームモード（ホーム or アウェイ）を切り替える。
 * @param {boolean}        isHome
 * @param {'home'|'away'}  mode
 */
export function switchUniformMode(isHome, mode) {
  const side = isHome ? 'home' : 'away';
  const sel  = currentSelection[side];
  const lineup = getLineup(sel.teamId, sel.seasonId, sel.lineupId);
  if (!lineup) return;

  uniformMode[side] = mode;
  applyUniform(isHome, lineup);
}

/**
 * 3 段チーム選択 UI を初期化する。
 * DOMContentLoaded 後に呼ぶこと。
 */
export function initializeTeamSelects() {
  initTripleSelect(true);   // ホーム
  initTripleSelect(false);  // アウェイ

  // H/A 切り替えボタン
  document.querySelector('.uniform-home-btn')
    ?.addEventListener('click', () => switchUniformMode(true,  'home'));
  document.querySelector('.uniform-away-btn')
    ?.addEventListener('click', () => switchUniformMode(true,  'away'));
  document.querySelector('.away-uniform-home-btn')
    ?.addEventListener('click', () => switchUniformMode(false, 'home'));
  document.querySelector('.away-uniform-away-btn')
    ?.addEventListener('click', () => switchUniformMode(false, 'away'));
}

/**
 * 現在のホーム側の選択情報を返す（ui-events.js の createInputs 用）。
 * @param {boolean} isHome
 * @returns {{ teamId:string, seasonId:string, lineupId:string }}
 */
export function getCurrentSelection(isHome) {
  return { ...currentSelection[isHome ? 'home' : 'away'] };
}

/** アウェイチームが初期化済みかどうか */
export function isAwayInitialized() {
  return awayInitialized;
}
