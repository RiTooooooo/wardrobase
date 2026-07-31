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
