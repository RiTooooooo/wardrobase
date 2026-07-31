import { describe, expect, it } from "vitest";

import { createItemSchema } from "./item";

const VALID = {
  name: "ヘビーウェイトTシャツ",
  category: "TOPS",
  color: "WHITE",
  seasons: ["SPRING", "SUMMER"],
};

describe("createItemSchema", () => {
  it("必須項目だけで成功する", () => {
    const result = createItemSchema.safeParse(VALID);

    expect(result.success).toBe(true);
  });

  it("アイテム名が空のとき失敗する", () => {
    const result = createItemSchema.safeParse({ ...VALID, name: "" });

    expect(result.success).toBe(false);
  });

  it("未定義のカテゴリを拒否する", () => {
    const result = createItemSchema.safeParse({ ...VALID, category: "HAT" });

    expect(result.success).toBe(false);
  });

  it("プリセットにない色を拒否する", () => {
    const result = createItemSchema.safeParse({ ...VALID, color: "PINK" });

    expect(result.success).toBe(false);
  });

  it("季節は空配列でもよい", () => {
    const result = createItemSchema.safeParse({ ...VALID, seasons: [] });

    expect(result.success).toBe(true);
  });

  it("任意項目が空文字のとき undefined になる", () => {
    const result = createItemSchema.safeParse({
      ...VALID,
      brand: "",
      price: "",
      purchasedAt: "",
      memo: "",
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.brand).toBeUndefined();
      expect(result.data.price).toBeUndefined();
      expect(result.data.purchasedAt).toBeUndefined();
    }
  });

  it("価格の文字列を数値に変換する", () => {
    const result = createItemSchema.safeParse({ ...VALID, price: "12000" });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.price).toBe(12000);
    }
  });

  it("価格が負のとき失敗する", () => {
    const result = createItemSchema.safeParse({ ...VALID, price: "-1" });

    expect(result.success).toBe(false);
  });

  it("価格が小数のとき失敗する", () => {
    const result = createItemSchema.safeParse({ ...VALID, price: "1000.5" });

    expect(result.success).toBe(false);
  });

  it("購入日の文字列を Date に変換する", () => {
    const result = createItemSchema.safeParse({
      ...VALID,
      purchasedAt: "2024-03-15",
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.purchasedAt).toBeInstanceOf(Date);
    }
  });
});
