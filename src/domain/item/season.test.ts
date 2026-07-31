import { describe, expect, it } from "vitest";

import { SEASONS, SEASON_LABELS, isSeason } from "./season";

describe("isSeason", () => {
  it("定義済みの季節文字列に対して true を返す", () => {
    expect(isSeason("SPRING")).toBe(true);
    expect(isSeason("WINTER")).toBe(true);
  });

  it("未定義の文字列に対して false を返す", () => {
    expect(isSeason("AUTUMN_LATE")).toBe(false);
    expect(isSeason("")).toBe(false);
  });

  it("小文字は受け付けない（DBのenum値と揃えているため）", () => {
    expect(isSeason("spring")).toBe(false);
  });

  it("文字列以外の値に対して false を返す", () => {
    expect(isSeason(null)).toBe(false);
    expect(isSeason(1)).toBe(false);
    expect(isSeason(undefined)).toBe(false);
  });
});

describe("SEASON_LABELS", () => {
  it("すべての季節にラベルが定義されている", () => {
    for (const season of SEASONS) {
      expect(SEASON_LABELS[season]).toBeTruthy();
    }
  });
});
