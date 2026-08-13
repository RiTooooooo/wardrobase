import { describe, expect, it } from "vitest";

import {
  autoGridPosition,
  boundsOf,
  clampPosition,
  clampScale,
  MAX_SCALE,
  MIN_SCALE,
  nextZIndex,
  prevZIndex,
  scaleFromDrag,
  toCanvasPosition,
} from "./boardLayout";

const BOUNDS = { width: 800, height: 600 };
const ITEM_SIZE = { width: 100, height: 120 };
const ITEM_WIDTH = 160;

describe("clampPosition", () => {
  it("キャンバス内の座標はそのまま返す", () => {
    const result = clampPosition(100, 200, BOUNDS, ITEM_SIZE);

    expect(result).toEqual({ x: 100, y: 200 });
  });

  it("左端を超えたら0に補正する", () => {
    const result = clampPosition(-50, 200, BOUNDS, ITEM_SIZE);

    expect(result).toEqual({ x: 0, y: 200 });
  });

  it("上端を超えたら0に補正する", () => {
    const result = clampPosition(100, -30, BOUNDS, ITEM_SIZE);

    expect(result).toEqual({ x: 100, y: 0 });
  });

  it("右端を超えたらキャンバス幅−アイテム幅に補正する", () => {
    const result = clampPosition(750, 200, BOUNDS, ITEM_SIZE);

    expect(result).toEqual({ x: 700, y: 200 });
  });

  it("下端を超えたらキャンバス高さ−アイテム高さに補正する", () => {
    const result = clampPosition(100, 550, BOUNDS, ITEM_SIZE);

    expect(result).toEqual({ x: 100, y: 480 });
  });
});

describe("nextZIndex", () => {
  it("空配列のとき1を返す", () => {
    expect(nextZIndex([])).toBe(1);
  });

  it("既存の最大値+1を返す", () => {
    const items = [{ zIndex: 3 }, { zIndex: 1 }, { zIndex: 5 }];

    expect(nextZIndex(items)).toBe(6);
  });
});

describe("clampScale", () => {
  it("範囲内の倍率はそのまま返す", () => {
    expect(clampScale(1.4)).toBe(1.4);
  });

  it("小さくしすぎたら下限で止める", () => {
    expect(clampScale(0.1)).toBe(MIN_SCALE);
  });

  it("大きくしすぎたら上限で止める", () => {
    expect(clampScale(5)).toBe(MAX_SCALE);
  });

  it("数値でない値は等倍に戻す", () => {
    expect(clampScale(Number.NaN)).toBe(1);
  });
});

describe("scaleFromDrag", () => {
  it("右下へ引くと大きくなる", () => {
    // 幅160のアイテムを右へ80px引く → 240/160 = 1.5倍
    expect(scaleFromDrag(1, 80, ITEM_WIDTH)).toBeCloseTo(1.5);
  });

  it("左上へ引くと小さくなる", () => {
    expect(scaleFromDrag(1, -80, ITEM_WIDTH)).toBeCloseTo(0.5);
  });

  it("掴んだ時点の倍率を基準にする", () => {
    // 既に1.5倍のものをさらに引く
    expect(scaleFromDrag(1.5, 80, ITEM_WIDTH)).toBeCloseTo(2);
  });

  it("下限を超えて縮まない", () => {
    expect(scaleFromDrag(1, -1000, ITEM_WIDTH)).toBe(MIN_SCALE);
  });
});

describe("boundsOf", () => {
  it("実寸が渡されたらその大きさを使う", () => {
    expect(boundsOf({ width: 1300, height: 950 })).toEqual({
      width: 1300,
      height: 950,
    });
  });

  it("実寸が取れないときは既定値に落とす", () => {
    expect(boundsOf(null)).toEqual({ width: 800, height: 600 });
  });

  it("実寸を使うと、既定値では届かない右下まで配置できる", () => {
    const 実寸 = boundsOf({ width: 1300, height: 950 });
    const 既定 = boundsOf(null);

    // 同じ操作でも、キャンバスが大きければその分だけ遠くへ置ける
    expect(clampPosition(1500, 1000, 実寸, ITEM_SIZE)).toEqual({
      x: 1200,
      y: 830,
    });
    expect(clampPosition(1500, 1000, 既定, ITEM_SIZE)).toEqual({
      x: 700,
      y: 480,
    });
  });
});

describe("prevZIndex", () => {
  it("空配列のとき0を返す", () => {
    expect(prevZIndex([])).toBe(0);
  });

  it("既存の最小値-1を返す", () => {
    const items = [{ zIndex: 3 }, { zIndex: 1 }, { zIndex: 5 }];

    expect(prevZIndex(items)).toBe(0);
  });
});

describe("toCanvasPosition", () => {
  const CANVAS_RECT = { left: 200, top: 100 };

  it("クライアント座標からキャンバス座標に変換する", () => {
    const result = toCanvasPosition(350, 250, CANVAS_RECT, ITEM_SIZE);

    expect(result).toEqual({ x: 100, y: 90 });
  });

  it("アイテム中心がドロップ位置に来るようオフセットする", () => {
    const result = toCanvasPosition(250, 160, CANVAS_RECT, ITEM_SIZE);

    expect(result).toEqual({ x: 0, y: 0 });
  });
});

describe("autoGridPosition", () => {
  it("index 0 は左上に配置する", () => {
    const result = autoGridPosition(0, BOUNDS, ITEM_SIZE);

    expect(result.x).toBeGreaterThanOrEqual(0);
    expect(result.y).toBeGreaterThanOrEqual(0);
  });

  it("連続するインデックスは異なる位置を返す", () => {
    const pos0 = autoGridPosition(0, BOUNDS, ITEM_SIZE);
    const pos1 = autoGridPosition(1, BOUNDS, ITEM_SIZE);

    const isDifferent = pos0.x !== pos1.x || pos0.y !== pos1.y;
    expect(isDifferent).toBe(true);
  });

  it("キャンバス内に収まる", () => {
    for (let i = 0; i < 20; i++) {
      const pos = autoGridPosition(i, BOUNDS, ITEM_SIZE);
      expect(pos.x).toBeGreaterThanOrEqual(0);
      expect(pos.x).toBeLessThanOrEqual(BOUNDS.width - ITEM_SIZE.width);
      expect(pos.y).toBeGreaterThanOrEqual(0);
      expect(pos.y).toBeLessThanOrEqual(BOUNDS.height - ITEM_SIZE.height);
    }
  });
});
