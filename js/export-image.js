/**
 * export-image.js
 *
 * フィールドを PNG 画像として保存する。
 *
 * html-to-image を使う（ブラウザ自身の描画を SVG foreignObject 経由で取り込むので、
 * グラデーションのユニフォームや transform の位置ずれが起きにくい）。
 * ライブラリは最初に使うときだけ読み込む。CDN が使えない環境では
 * 同じフォルダの vendor/html-to-image.js を読みにいく。
 */

import { toast } from './bus.js';

const SOURCES = [
  'https://cdn.jsdelivr.net/npm/html-to-image@1.11.11/dist/html-to-image.js',
  new URL('./vendor/html-to-image.js', import.meta.url).href,
];
// 読み込めなかった画像（ユニフォーム SVG など）の代わりに使う透明 1px
const TRANSPARENT_PX = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';

let loader = null;

function loadScript(src) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.onload  = () => (window.htmlToImage ? resolve(window.htmlToImage) : reject(new Error('no global')));
    script.onerror = () => { script.remove(); reject(new Error(`load failed: ${src}`)); };
    document.head.appendChild(script);
  });
}

function loadLibrary() {
  if (window.htmlToImage) return Promise.resolve(window.htmlToImage);
  loader ??= (async () => {
    for (const src of SOURCES) {
      try { return await loadScript(src); } catch { /* 次の候補へ */ }
    }
    loader = null;
    throw new Error('html-to-image を読み込めませんでした');
  })();
  return loader;
}

function timestamp() {
  const d = new Date();
  const pad = n => String(n).padStart(2, '0');
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}`;
}

export async function saveFieldImage() {
  const field = document.getElementById('field');
  if (!field) return;

  let lib;
  try {
    lib = await loadLibrary();
  } catch {
    toast('画像化ライブラリを読み込めませんでした。ネット接続か vendor フォルダを確認してください');
    return;
  }

  field.classList.add('is-capturing');   // 動きを止めた状態で撮る
  try {
    const dataUrl = await lib.toPng(field, {
      pixelRatio: Math.min(3, (window.devicePixelRatio || 1) * 1.5),
      backgroundColor: '#12291f',
      width:  field.offsetWidth,
      height: field.offsetHeight,
      style: { margin: '0' },            // 余白込みで撮るとずれるため
      imagePlaceholder: TRANSPARENT_PX,
    });
    const link = document.createElement('a');
    link.download = `formation-${timestamp()}.png`;
    link.href = dataUrl;
    link.click();
    toast('画像を保存しました');
  } catch (err) {
    console.warn('[export-image]', err);
    toast('画像を作れませんでした');
  } finally {
    field.classList.remove('is-capturing');
  }
}
