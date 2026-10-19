/**
 * share.js
 *
 * 共有リンクの作成と、URL からの盤面復元。
 * 盤面は URL の #b= 以降に入るので、サーバー側の保存は不要。
 */

import { serializeState, restoreState, encodeState, decodeState } from './state.js';
import { toast } from './bus.js';

const PREFIX = '#b=';

export async function copyShareLink() {
  const code = await encodeState(serializeState());
  const url  = `${location.origin}${location.pathname}${location.search}${PREFIX}${code}`;
  history.replaceState(null, '', url);

  try {
    await navigator.clipboard.writeText(url);
    toast('共有リンクをコピーしました');
  } catch {
    // http 配信や権限拒否でクリップボードが使えない場合
    window.prompt('このリンクをコピーしてください', url);
  }
}

/** URL に盤面が含まれていれば復元する。復元できたら true */
export async function restoreFromUrl() {
  if (!location.hash.startsWith(PREFIX)) return false;
  try {
    const state = await decodeState(location.hash.slice(PREFIX.length));
    return restoreState(state);
  } catch (err) {
    console.warn('[share] 共有リンクを読み込めませんでした', err);
    toast('共有リンクの盤面を読み込めませんでした。リンクが途中で切れていないか確認してください');
    return false;
  }
}
