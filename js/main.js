/**
 * main.js
 *
 * アプリケーションのエントリポイント。
 * DOMContentLoaded 後に各モジュールを初期化する。
 *
 * 初期化順序（依存関係があるため順番を守ること）:
 *   1. initializeTeamSelects()      — 3 段チーム選択 UI・初期ユニフォーム適用
 *   2. initFlickFormationUI()       — 隠しボタンを DOM に生成
 *   3. initializeFormationButtons() — 生成済みボタンに click リスナーを登録
 *   4. スライダー input イベント登録
 *   5. フォーム submit イベント登録（スクワッド確定）
 *   6. initPlayerNameToggle()       — フィールド長押しで選手名を表示/非表示
 *   7. redrawAllPlayers()           — 初期描画
 */

import { initializeTeamSelects } from './team-colors.js';
import {
  initializeFormationButtons,
  updateFormationButtons,
  createInputs,
  redrawAllPlayers,
  renewSquad,
} from './ui-events.js';
import { initFlickFormationUI } from './formation-flick-ui.js';

// ─── 選手名トグル ─────────────────────────────────────────────────────────────

/**
 * フィールドを長押し（500ms）すると .field-show-names クラスを #field に付与し、
 * 全選手ノードの下に名前を表示する。もう一度長押しすると非表示に戻る。
 *
 * CSS 側で .field-show-names .player::after { content: attr(data-name); ... } を定義すること。
 */
function initPlayerNameToggle() {
  const field = document.getElementById('field');
  if (!field) return;

  let pressTimer = null;

  function startPress(e) {
    // 選手ノード上の操作（ドラッグ）と競合しない
    if (e.target.closest('.player')) return;
    pressTimer = setTimeout(() => {
      field.classList.toggle('field-show-names');
      pressTimer = null;
    }, 500);
  }

  function cancelPress() {
    if (pressTimer !== null) {
      clearTimeout(pressTimer);
      pressTimer = null;
    }
  }

  field.addEventListener('mousedown',   startPress);
  field.addEventListener('mouseup',     cancelPress);
  field.addEventListener('mouseleave',  cancelPress);
  field.addEventListener('mousemove',   cancelPress);   // ③ マウス移動でもキャンセル

  // touchstart は passive:false にして、長押し中のスクロールを防ぐ
  field.addEventListener('touchstart',  startPress,  { passive: false });
  field.addEventListener('touchend',    cancelPress);
  field.addEventListener('touchcancel', cancelPress);
  field.addEventListener('touchmove',   cancelPress);   // ③ スクロール開始でキャンセル
}

// ─── 初期化 ──────────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  document.querySelector('.forms-wrapper.infopart').style.display = 'flex';

  // 1. チーム選択（内部で createInputs も呼ぶ）
  initializeTeamSelects();

  // 2 & 3. フリック UI → ボタンリスナー
  initFlickFormationUI();
  initializeFormationButtons();

  // 4. スライダー変更 → 再描画
  document.querySelectorAll('input[type="range"]').forEach(slider => {
    slider.addEventListener('input', () => {
      updateFormationButtons();
      redrawAllPlayers();
    });
  });

  // 5. スクワッド送信（番号反映ボタン）
  document.querySelector('form')?.addEventListener('submit', event => {
    event.preventDefault();
    renewSquad('inputsHome',    null, true);
    renewSquad('inputsAway',    null, false);
    renewSquad('inputsHome-sp', null, true);
    renewSquad('inputsAway-sp', null, false);
  });

  // 6. 長押しで選手名トグル
  initPlayerNameToggle();

  // 7. 初期描画
  redrawAllPlayers();
});
