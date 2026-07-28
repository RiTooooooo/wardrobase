import { describe, expect, it } from "vitest";

import { SEASONS, isSeason } from "./season";

describe("isSeason", () => {
  it("定義済みの季節文字列に対して true を返す", () => {
    for (const season of SEASONS) {
      expect(isSeason(season)).toBe(true);
    }
  });

  it("未定義の文字列に対して false を返す", () => {
    expect(isSeason("rainy")).toBe(false);
    expect(isSeason("")).toBe(false);
  });

  it("文字列以外の値に対して false を返す", () => {
    expect(isSeason(null)).toBe(false);
    expect(isSeason(undefined)).toBe(false);
    expect(isSeason(1)).toBe(false);
  });
});
