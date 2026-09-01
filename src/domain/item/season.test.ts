import { describe, expect, it } from "vitest";

import {
  SEASONS,
  SEASON_GROUPS,
  SEASON_GROUP_MEMBERS,
  SEASON_LABELS,
  isSeason,
  isSeasonGroup,
  seasonGroupsOf,
} from "./season";

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

describe("シーズングループ（SS / AW）", () => {
  it("SS は春・夏、AW は秋・冬を束ねる", () => {
    expect(SEASON_GROUP_MEMBERS.SS).toEqual(["SPRING", "SUMMER"]);
    expect(SEASON_GROUP_MEMBERS.AW).toEqual(["AUTUMN", "WINTER"]);
  });

  it("すべての季節がちょうど1つのグループに属する", () => {
    const all = SEASON_GROUPS.flatMap((group) => SEASON_GROUP_MEMBERS[group]);
    expect([...all].sort()).toEqual([...SEASONS].sort());
    expect(new Set(all).size).toBe(SEASONS.length);
  });
});

describe("isSeasonGroup", () => {
  it("定義済みのグループに対して true を返す", () => {
    expect(isSeasonGroup("SS")).toBe(true);
    expect(isSeasonGroup("AW")).toBe(true);
  });

  it("未定義の値に対して false を返す", () => {
    expect(isSeasonGroup("SPRING")).toBe(false);
    expect(isSeasonGroup("")).toBe(false);
    expect(isSeasonGroup(null)).toBe(false);
  });
});

describe("seasonGroupsOf", () => {
  it("空の季節リストからは空のグループを返す", () => {
    expect(seasonGroupsOf([])).toEqual([]);
  });

  it("メンバーが1つでも含まれればそのグループを返す", () => {
    expect(seasonGroupsOf(["SPRING"])).toEqual(["SS"]);
    expect(seasonGroupsOf(["AUTUMN"])).toEqual(["AW"]);
  });

  it("グループは重複せず SS → AW の順で返る", () => {
    expect(seasonGroupsOf(["WINTER", "SPRING", "SUMMER"])).toEqual([
      "SS",
      "AW",
    ]);
  });
});
