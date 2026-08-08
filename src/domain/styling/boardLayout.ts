export type Position = { x: number; y: number };
export type CanvasBounds = { width: number; height: number };
export type ItemSize = { width: number; height: number };
export type RectLike = { left: number; top: number };

const GAP = 16;

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
