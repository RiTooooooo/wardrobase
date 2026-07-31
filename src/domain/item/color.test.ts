import { describe, expect, it } from "vitest";

import { COLOR_META, COLOR_VALUES, isColor } from "./color";

describe("isColor", () => {
  it("プリセットの色に対して true を返す", () => {
    expect(isColor("WHITE")).toBe(true);
    expect(isColor("OTHER")).toBe(true);
  });

  it("プリセットにない色に対して false を返す", () => {
    expect(isColor("PINK")).toBe(false);
    expect(isColor("")).toBe(false);
  });

  it("小文字は受け付けない", () => {
    expect(isColor("white")).toBe(false);
  });

  it("文字列以外の値に対して false を返す", () => {
    expect(isColor(null)).toBe(false);
    expect(isColor(["WHITE"])).toBe(false);
  });
});

describe("色の定義", () => {
  it("すべての色にラベルと hex がある", () => {
    for (const value of COLOR_VALUES) {
      expect(COLOR_META[value].label).toBeTruthy();
      expect(COLOR_META[value].hex).toMatch(/^#[0-9a-f]{6}$/);
    }
  });

  it("値が重複していない", () => {
    expect(new Set(COLOR_VALUES).size).toBe(COLOR_VALUES.length);
  });
});
