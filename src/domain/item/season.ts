export const SEASONS = ["spring", "summer", "autumn", "winter"] as const;

export type Season = (typeof SEASONS)[number];

export function isSeason(value: unknown): value is Season {
  return (
    typeof value === "string" &&
    (SEASONS as readonly string[]).includes(value)
  );
}
