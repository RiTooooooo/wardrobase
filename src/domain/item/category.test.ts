import { describe, expect, it } from "vitest";

import {
  CATEGORIES,
  CATEGORY_LABELS,
  SUB_CATEGORIES,
  isCategory,
} from "./category";

describe("isCategory", () => {
  it("定義済みのカテゴリに対して true を返す", () => {
    expect(isCategory("TOPS")).toBe(true);
    expect(isCategory("ACCESSORY")).toBe(true);
  });

  it("未定義の文字列に対して false を返す", () => {
    expect(isCategory("HAT")).toBe(false);
    expect(isCategory("")).toBe(false);
  });

  it("小文字は受け付けない", () => {
    expect(isCategory("tops")).toBe(false);
  });

  it("文字列以外の値に対して false を返す", () => {
    expect(isCategory(null)).toBe(false);
    expect(isCategory(0)).toBe(false);
  });
});

describe("カテゴリの定義", () => {
  it("すべてのカテゴリにラベルがある", () => {
    for (const category of CATEGORIES) {
      expect(CATEGORY_LABELS[category]).toBeTruthy();
    }
  });

  it("すべてのカテゴリにサブカテゴリ候補がある", () => {
    for (const category of CATEGORIES) {
      expect(SUB_CATEGORIES[category].length).toBeGreaterThan(0);
    }
  });
});
