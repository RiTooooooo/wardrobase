import { describe, expect, it } from "vitest";

import { createOutfitSchema } from "./outfit";

const VALID = {
  wornOn: "2026-08-01",
  itemIds: ["550e8400-e29b-41d4-a716-446655440000"],
};

describe("createOutfitSchema", () => {
  it("必須項目だけで成功する", () => {
    const result = createOutfitSchema.safeParse(VALID);

    expect(result.success).toBe(true);
  });

  it("日付の文字列を Date に変換する", () => {
    const result = createOutfitSchema.safeParse(VALID);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.wornOn).toBeInstanceOf(Date);
    }
  });

  it("日付が空のとき失敗する", () => {
    const result = createOutfitSchema.safeParse({ ...VALID, wornOn: "" });

    expect(result.success).toBe(false);
  });

  it("アイテムが空配列のとき失敗する", () => {
    const result = createOutfitSchema.safeParse({ ...VALID, itemIds: [] });

    expect(result.success).toBe(false);
  });

  it("アイテムIDがUUID形式でないとき失敗する", () => {
    const result = createOutfitSchema.safeParse({
      ...VALID,
      itemIds: ["not-a-uuid"],
    });

    expect(result.success).toBe(false);
  });

  it("お気に入り度が1〜5の範囲で成功する", () => {
    const result = createOutfitSchema.safeParse({
      ...VALID,
      satisfaction: 3,
    });

    expect(result.success).toBe(true);
  });

  it("お気に入り度が0のとき失敗する", () => {
    const result = createOutfitSchema.safeParse({
      ...VALID,
      satisfaction: 0,
    });

    expect(result.success).toBe(false);
  });

  it("お気に入り度が6のとき失敗する", () => {
    const result = createOutfitSchema.safeParse({
      ...VALID,
      satisfaction: 6,
    });

    expect(result.success).toBe(false);
  });

  it("任意項目が空文字のとき undefined になる", () => {
    const result = createOutfitSchema.safeParse({
      ...VALID,
      weather: "",
      memo: "",
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.weather).toBeUndefined();
      expect(result.data.memo).toBeUndefined();
    }
  });
});
