import { describe, expect, it } from "vitest";

import { fitBoardPreview } from "./previewLayout";

describe("fitBoardPreview", () => {
  it("アイテムが無ければ空を返す", () => {
    expect(fitBoardPreview([], 2.5, 480)).toEqual([]);
  });

  it("1点はプレビューの中央に置かれる", () => {
    const [rect] = fitBoardPreview(
      [{ x: 0, y: 0, width: 160, height: 200 }],
      2.5,
      480,
    );
    // 収める幅は max(160, 200*2.5, 480) = 500
    expect(rect.width).toBeCloseTo(32);
    expect(rect.height).toBeCloseTo(100);
    expect(rect.left).toBeCloseTo(34);
    expect(rect.top).toBeCloseTo(0);
  });

  it("複数点は相対配置を保ったまま全体が枠に収まる", () => {
    const rects = fitBoardPreview(
      [
        { x: 0, y: 0, width: 160, height: 200 },
        { x: 340, y: 100, width: 160, height: 200 },
      ],
      2.5,
      480,
    );
    // 全体は 500x300。枠のアスペクト2.5に合わせ 750x300 に中央寄せされる
    expect(rects[0].left).toBeCloseTo((125 / 750) * 100);
    expect(rects[0].top).toBeCloseTo(0);
    expect(rects[0].width).toBeCloseTo((160 / 750) * 100);
    expect(rects[0].height).toBeCloseTo((200 / 300) * 100);
    expect(rects[1].left).toBeCloseTo(((340 + 125) / 750) * 100);
    expect(rects[1].top).toBeCloseTo((100 / 300) * 100);
  });

  it("全体が小さくても minSpan より拡大しない", () => {
    const [rect] = fitBoardPreview(
      [{ x: 5, y: 5, width: 10, height: 10 }],
      2,
      300,
    );
    // 収める幅は max(10, 20, 300) = 300、高さ150。10x10 が中央に小さく置かれる
    expect(rect.width).toBeCloseTo((10 / 300) * 100);
    expect(rect.height).toBeCloseTo((10 / 150) * 100);
    expect(rect.left).toBeCloseTo((145 / 300) * 100);
    expect(rect.top).toBeCloseTo((70 / 150) * 100);
  });

  it("原点から離れた配置でも枠の中央に寄る", () => {
    const [rect] = fitBoardPreview(
      [{ x: 1000, y: 800, width: 160, height: 200 }],
      2.5,
      480,
    );
    expect(rect.left).toBeCloseTo(34);
    expect(rect.top).toBeCloseTo(0);
  });
});
