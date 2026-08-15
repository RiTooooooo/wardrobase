import { describe, expect, it } from "vitest";

import {
  clampPosition,
  clampScale,
  MAX_SCALE,
  MIN_SCALE,
  scaledSize,
  scaleFromDrag,
} from "./boardLayout";

/* ボード上のアイテムの大きさに関する計算 */

const ITEM_WIDTH = 160;

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

describe("scaledSize", () => {
  it("拡大率をかけた大きさを返す", () => {
    expect(scaledSize({ width: 160, height: 200 }, 0.5)).toEqual({
      width: 80,
      height: 100,
    });
  });

  it("等倍ならそのまま", () => {
    expect(scaledSize({ width: 160, height: 200 }, 1)).toEqual({
      width: 160,
      height: 200,
    });
  });

  it("小さいアイテムほど下端まで寄せられる", () => {
    const bounds = { width: 800, height: 600 };
    const base = { width: 160, height: 200 };

    // 等倍なら 600-200=400 で止まる
    expect(clampPosition(0, 999, bounds, scaledSize(base, 1)).y).toBe(400);
    // 半分の大きさなら 600-100=500 まで行ける
    expect(clampPosition(0, 999, bounds, scaledSize(base, 0.5)).y).toBe(500);
  });
});
