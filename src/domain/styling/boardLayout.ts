export type Position = { x: number; y: number };
export type CanvasBounds = { width: number; height: number };
export type ItemSize = { width: number; height: number };
export type RectLike = { left: number; top: number };

const GAP = 16;

/*
 * ボード上での拡大率。
 * 小さすぎると掴めず、大きすぎるとキャンバスを覆ってしまうため範囲を決める。
 */
export const MIN_SCALE = 0.5;
export const MAX_SCALE = 2.5;

export function clampScale(scale: number): number {
  if (!Number.isFinite(scale)) return 1;

  return Math.max(MIN_SCALE, Math.min(scale, MAX_SCALE));
}

/*
 * リサイズつまみのドラッグ量を倍率に変える。
 * 掴んだ時点の見た目の幅に対して、横へ動かした分だけ伸ばす。
 * 縦横は同じ比率で変わるので、横の移動量だけ見れば足りる。
 */
export function scaleFromDrag(
  startScale: number,
  dx: number,
  baseWidth: number,
): number {
  const startWidth = baseWidth * startScale;

  return clampScale((startWidth + dx) / baseWidth);
}

/* キャンバスの実寸が取れないときの保険 */
const FALLBACK_BOUNDS: CanvasBounds = { width: 800, height: 600 };

/*
 * 配置できる範囲はキャンバスの実寸から決める。
 * 固定値にすると、画面が広くてキャンバスが大きいときに
 * 右下の領域へアイテムを動かせなくなる。
 */
export function boundsOf(rect: CanvasBounds | null): CanvasBounds {
  if (rect === null) return FALLBACK_BOUNDS;

  return { width: rect.width, height: rect.height };
}

export function clampPosition(
  x: number,
  y: number,
  bounds: CanvasBounds,
  itemSize: ItemSize,
): Position {
  const maxX = bounds.width - itemSize.width;
  const maxY = bounds.height - itemSize.height;

  return {
    x: Math.max(0, Math.min(x, maxX)),
    y: Math.max(0, Math.min(y, maxY)),
  };
}

export function nextZIndex(
  items: readonly { zIndex: number }[],
): number {
  if (items.length === 0) return 1;

  return Math.max(...items.map((i) => i.zIndex)) + 1;
}

export function prevZIndex(
  items: readonly { zIndex: number }[],
): number {
  if (items.length === 0) return 0;

  return Math.min(...items.map((i) => i.zIndex)) - 1;
}

export function toCanvasPosition(
  clientX: number,
  clientY: number,
  canvasRect: RectLike,
  itemSize: ItemSize,
): Position {
  const rawX = clientX - canvasRect.left - itemSize.width / 2;
  const rawY = clientY - canvasRect.top - itemSize.height / 2;

  return { x: Math.max(0, rawX), y: Math.max(0, rawY) };
}

export function autoGridPosition(
  index: number,
  bounds: CanvasBounds,
  itemSize: ItemSize,
): Position {
  const cols = Math.max(1, Math.floor(bounds.width / (itemSize.width + GAP)));
  const col = index % cols;
  const row = Math.floor(index / cols);
  const rawX = col * (itemSize.width + GAP);
  const rawY = row * (itemSize.height + GAP);

  return clampPosition(rawX, rawY, bounds, itemSize);
}
