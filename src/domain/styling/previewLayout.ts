/*
 * ボードの配置をカードのプレビューへ縮小して収めるための計算。
 *
 * 配置座標はボード編集時のキャンバス基準の絶対値なので、そのままでは
 * 大きさの違うプレビュー枠に置けない。全アイテムを含む外接矩形を取り、
 * 枠のアスペクト比に合わせて中央寄せし、位置と大きさを枠に対する
 * パーセントへ変換する。パーセントにしておけば、枠の実寸（レスポンシブで
 * 変わる）をサーバー側で知らなくても正しく描ける。
 */

export type PreviewItem = {
  x: number;
  y: number;
  width: number;
  height: number;
};

/** 位置・大きさとも、プレビュー枠に対するパーセント（0〜100） */
export type PreviewRect = {
  left: number;
  top: number;
  width: number;
  height: number;
};

/**
 * @param aspect プレビュー枠の縦横比（幅 / 高さ）
 * @param minSpan 収める幅の下限（ボード座標系）。点数が少ないときに
 *   アイテムが巨大化しないよう、これ未満には拡大しない
 */
export function fitBoardPreview(
  items: readonly PreviewItem[],
  aspect: number,
  minSpan: number,
): PreviewRect[] {
  if (items.length === 0) return [];

  const minX = Math.min(...items.map((i) => i.x));
  const minY = Math.min(...items.map((i) => i.y));
  const maxX = Math.max(...items.map((i) => i.x + i.width));
  const maxY = Math.max(...items.map((i) => i.y + i.height));

  const fitWidth = Math.max(maxX - minX, (maxY - minY) * aspect, minSpan);
  const fitHeight = fitWidth / aspect;
  const offsetX = (fitWidth - (maxX - minX)) / 2 - minX;
  const offsetY = (fitHeight - (maxY - minY)) / 2 - minY;

  return items.map((i) => ({
    left: ((i.x + offsetX) / fitWidth) * 100,
    top: ((i.y + offsetY) / fitHeight) * 100,
    width: (i.width / fitWidth) * 100,
    height: (i.height / fitHeight) * 100,
  }));
}
