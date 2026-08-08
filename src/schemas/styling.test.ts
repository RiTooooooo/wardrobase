import { describe, expect, it } from "vitest";

import { boardStylingSchema, createStylingSchema } from "./styling";

const VALID = {
  name: "仕事の日の定番",
  itemIds: ["550e8400-e29b-41d4-a716-446655440000"],
};

describe("createStylingSchema", () => {
  it("必須項目だけで成功する", () => {
    const result = createStylingSchema.safeParse(VALID);

    expect(result.success).toBe(true);
  });

  it("名前が空のとき失敗する", () => {
    const result = createStylingSchema.safeParse({ ...VALID, name: "" });

    expect(result.success).toBe(false);
  });

  it("名前が100文字を超えると失敗する", () => {
    const result = createStylingSchema.safeParse({
      ...VALID,
      name: "あ".repeat(101),
    });

    expect(result.success).toBe(false);
  });

  it("アイテムが空配列のとき失敗する", () => {
    const result = createStylingSchema.safeParse({ ...VALID, itemIds: [] });

    expect(result.success).toBe(false);
  });

  it("アイテムIDがUUID形式でないとき失敗する", () => {
    const result = createStylingSchema.safeParse({
      ...VALID,
      itemIds: ["not-a-uuid"],
    });

    expect(result.success).toBe(false);
  });

  it("季節はデフォルトで空配列になる", () => {
    const result = createStylingSchema.safeParse(VALID);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.seasons).toEqual([]);
    }
  });

  it("有効な季節値を受け付ける", () => {
    const result = createStylingSchema.safeParse({
      ...VALID,
      seasons: ["SPRING", "WINTER"],
    });

    expect(result.success).toBe(true);
  });

  it("無効な季節値を拒否する", () => {
    const result = createStylingSchema.safeParse({
      ...VALID,
      seasons: ["RAINY"],
    });

    expect(result.success).toBe(false);
  });

  it("メモが空文字のとき undefined になる", () => {
    const result = createStylingSchema.safeParse({ ...VALID, memo: "" });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.memo).toBeUndefined();
    }
  });
});

const VALID_BOARD = {
  name: "夏の定番",
  items: [
    { itemId: "550e8400-e29b-41d4-a716-446655440000", x: 100, y: 50, zIndex: 1 },
  ],
};

describe("boardStylingSchema", () => {
  it("必須項目だけで成功する", () => {
    const result = boardStylingSchema.safeParse(VALID_BOARD);

    expect(result.success).toBe(true);
  });

  it("アイテムが空配列のとき失敗する", () => {
    const result = boardStylingSchema.safeParse({
      ...VALID_BOARD,
      items: [],
    });

    expect(result.success).toBe(false);
  });

  it("アイテムIDがUUID形式でないとき失敗する", () => {
    const result = boardStylingSchema.safeParse({
      ...VALID_BOARD,
      items: [{ itemId: "not-uuid", x: 0, y: 0, zIndex: 0 }],
    });

    expect(result.success).toBe(false);
  });

  it("座標が数値でないとき失敗する", () => {
    const result = boardStylingSchema.safeParse({
      ...VALID_BOARD,
      items: [{ itemId: "550e8400-e29b-41d4-a716-446655440000", x: "a", y: 0, zIndex: 0 }],
    });

    expect(result.success).toBe(false);
  });

  it("zIndexが整数でないとき失敗する", () => {
    const result = boardStylingSchema.safeParse({
      ...VALID_BOARD,
      items: [{ itemId: "550e8400-e29b-41d4-a716-446655440000", x: 0, y: 0, zIndex: 1.5 }],
    });

    expect(result.success).toBe(false);
  });
});
