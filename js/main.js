/**
 * main.js
 *
 * アプリケーションのエントリポイント。
 *
 * 初期化順序（依存関係があるため順番を守ること）:
 *   1. initializeTeamSelects()      — 3 段チーム選択 UI・初期ユニフォーム・初期配置
 *   2. initFlickFormationUI()       — 隠しボタンを DOM に生成
 *   3. initializeFormationButtons() — 生成済みボタンに click リスナーを登録
 *   4. スライダー input イベント登録
 *   5. フォーム submit イベント登録（番号反映）
 *   6. initPlayerNameToggle()       — フィールド長押しで選手名を表示/非表示
 *   7. 追加機能（描画レイヤー・ボール・距離表示・道具レール）
 *   8. redrawAllPlayers()           — 初期描画（フリック UI の選択表示もここで同期）
 *   9. 共有リンクからの復元 → 履歴の開始
 */

import { initializeTeamSelects } from './team-colors.js';
import {
  initializeFormationButtons,
  redrawAllPlayers,
  applySquadNumbers,
  updateFormationButtons,
  getCurrentFormation,
} from './ui-events.js';
import { initFlickFormationUI } from './formation-flick-ui.js';
import { initDrawing } from './drawing.js';
import { initBall } from './ball.js';
import { initAnalysis } from './analysis.js';
import { initToolbar } from './toolbar.js';
import { initFlipUI } from './flip-ui.js';
import { initLayout } from './layout.js';
import { restoreFromUrl } from './share.js';
import { initHistory } from './history.js';
import { commit } from './bus.js';

// ─── 選手名トグル ─────────────────────────────────────────────────────────────

/**
 * フィールドの空いている所を長押し（500ms）すると #field に
 * .field-show-names を付け外しし、選手名バッジを表示/非表示する。
 */
function initPlayerNameToggle() {
  const field = document.getElementById('field');
  if (!field) return;

  const LONG_PRESS_MS  = 500;
  const MOVE_TOLERANCE = 8;   // px。わずかな手ぶれではキャンセルしない
  let pressTimer = null;
  let startX = 0;
  let startY = 0;

  function cancelPress() {
    if (pressTimer !== null) {
      clearTimeout(pressTimer);
      pressTimer = null;
    }
  }

  field.addEventListener('pointerdown', e => {
    if (e.target.closest('.player')) return;   // 選手ドラッグと競合させない
    startX = e.clientX;
    startY = e.clientY;
    cancelPress();
    pressTimer = setTimeout(() => {
      field.classList.toggle('field-show-names');
      pressTimer = null;
      commit();
    }, LONG_PRESS_MS);
  });
  field.addEventListener('pointermove', e => {
    if (pressTimer === null) return;
    if (Math.hypot(e.clientX - startX, e.clientY - startY) > MOVE_TOLERANCE) cancelPress();
  });
  ['pointerup', 'pointercancel', 'pointerleave'].forEach(type =>
    field.addEventListener(type, cancelPress)
  );
  // 長押しでスマホのコンテキストメニューが出ないようにする
  field.addEventListener('contextmenu', e => {
    if (!e.target.closest('.player')) e.preventDefault();
  });
}

// ─── 初期化 ──────────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', async () => {
  const formsWrapper = document.querySelector('.forms-wrapper.infopart');
  if (formsWrapper) formsWrapper.style.display = 'flex';

  // 1. チーム選択（内部で createInputs と初期フォーメーション適用も行う）
  initializeTeamSelects();

  // 2 & 3. フリック UI → ボタンリスナー
  initFlickFormationUI();
  initializeFormationButtons();

  // 4. スライダー変更 → 再描画（ボタンのアクティブ表示も redraw 内で更新）
  document.querySelectorAll('#forPC input[type="range"]').forEach(slider => {
    slider.addEventListener('input', () => {
      redrawAllPlayers();
      commit({ debounce: true });
    });
  });

  // 5. 番号反映（ホーム・アウェイ両方のフォーム）
  //    【修正】以前は querySelector('form') で最初のフォームしか拾っておらず、
  //    アウェイ側のボタンを押すとページがリロードされていた。
  document.querySelectorAll('form.squad-form').forEach(form => {
    form.addEventListener('submit', event => {
      event.preventDefault();
      applySquadNumbers(form.id === 'playerFormHome');
    });
  });

  // 6. 長押しで選手名トグル
  initPlayerNameToggle();

  // 7. 追加機能
  initDrawing();
  initBall();
  initAnalysis();
  initToolbar();
  initFlipUI();

  // 8. 初期描画（フリック UI はチーム初期化より後に作られるので、選択表示をここで同期）
  redrawAllPlayers();
  const awayKey = getCurrentFormation('away');
  if (awayKey) updateFormationButtons(awayKey, 'away');

  // 9. 共有リンク（#b=...）があれば盤面を復元し、そこから履歴を始める
  await restoreFromUrl();
  initHistory();

  // 10. 画面にぴったり収める（スクロールさせない）
  initLayout();
});
