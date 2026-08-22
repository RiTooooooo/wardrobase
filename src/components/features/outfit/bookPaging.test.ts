import { describe, expect, it } from "vitest";

import {
  chunkPages,
  DAYS_PER_PAGE,
  findGroupIndexByDate,
  toSpreads,
} from "./bookPaging";
import type { DateGroup } from "./lookbookTypes";

function group(date: string): DateGroup {
  return { date, label: date, entries: [] };
}

const seven = [
  "2026-08-01",
  "2026-08-02",
  "2026-08-03",
  "2026-08-04",
  "2026-08-05",
  "2026-08-06",
  "2026-08-07",
].map(group);

describe("chunkPages", () => {
  it("3日分ずつのページに割る", () => {
    const pages = chunkPages(seven);
    expect(pages.length).toBe(Math.ceil(seven.length / DAYS_PER_PAGE));
    expect(pages[0].length).toBe(DAYS_PER_PAGE);
    expect(pages.at(-1)?.length).toBe(seven.length % DAYS_PER_PAGE || DAYS_PER_PAGE);
  });

  it("空なら空のまま", () => {
    expect(chunkPages([])).toEqual([]);
  });
});

describe("toSpreads", () => {
  it("ページが奇数なら右を白紙で埋める", () => {
    const spreads = toSpreads(seven);
    expect(spreads.at(-1)?.right).toEqual([]);
  });

  it("見開きは左右2ページを持つ", () => {
    const spreads = toSpreads(seven);
    expect(spreads[0].left.length).toBe(DAYS_PER_PAGE);
    expect(spreads[0].right.length).toBe(DAYS_PER_PAGE);
  });
});

describe("findGroupIndexByDate", () => {
  it("一致する日付の位置を返す", () => {
    expect(findGroupIndexByDate(seven, "2026-08-05")).toBe(4);
  });

  it("記録の無い日は -1", () => {
    expect(findGroupIndexByDate(seven, "2026-12-31")).toBe(-1);
  });
});
