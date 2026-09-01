/**
 * 季節。
 *
 * 値は Prisma の `Season` enum と同じ文字列にしてある。
 * domain 層は `@prisma/client` を import しない（conventions.md §2）が、
 * 値を揃えておけば変換層が要らず、取り違えも起きない。
 * スキーマ側を変更したらこちらも必ず合わせること。
 */
export const SEASONS = ["SPRING", "SUMMER", "AUTUMN", "WINTER"] as const;

export type Season = (typeof SEASONS)[number];

export const SEASON_LABELS: Record<Season, string> = {
  SPRING: "春",
  SUMMER: "夏",
  AUTUMN: "秋",
  WINTER: "冬",
};

export function isSeason(value: unknown): value is Season {
  return (
    typeof value === "string" && (SEASONS as readonly string[]).includes(value)
  );
}

/*
 * シーズングループ。UI ではファッションの通例に合わせて
 * SS（春夏）/ AW（秋冬）の2択で見せる。
 * 保存は従来どおり4値の Season で行い、ここは束ね方だけを定義する。
 */
export const SEASON_GROUPS = ["SS", "AW"] as const;

export type SeasonGroup = (typeof SEASON_GROUPS)[number];

export const SEASON_GROUP_MEMBERS: Record<SeasonGroup, readonly Season[]> = {
  SS: ["SPRING", "SUMMER"],
  AW: ["AUTUMN", "WINTER"],
};

export function isSeasonGroup(value: unknown): value is SeasonGroup {
  return (
    typeof value === "string" &&
    (SEASON_GROUPS as readonly string[]).includes(value)
  );
}

/** 季節の配列を、含まれるグループの一覧（SS → AW の順・重複なし）に畳む */
export function seasonGroupsOf(seasons: readonly Season[]): SeasonGroup[] {
  return SEASON_GROUPS.filter((group) =>
    SEASON_GROUP_MEMBERS[group].some((season) => seasons.includes(season)),
  );
}
