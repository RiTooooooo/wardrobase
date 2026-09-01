import { SEASON_GROUP_MEMBERS, isSeasonGroup } from "@/domain/item/season";

import type { WardrobeFilters, WardrobeItem } from "./wardrobeTypes";

function matchesQuery(item: WardrobeItem, query: string): boolean {
  if (query === "") return true;
  const q = query.toLowerCase();
  const targets = [item.name, item.brand, item.memo];
  return targets.some((t) => t !== null && t.toLowerCase().includes(q));
}

function matchesCategory(item: WardrobeItem, cat: string | null): boolean {
  return cat === null || item.category === cat;
}

function matchesColor(item: WardrobeItem, color: string | null): boolean {
  return color === null || item.color === color;
}

/* 季節はシーズングループ（SS / AW）で絞る。メンバーのどれかを持てば一致 */
function matchesSeason(item: WardrobeItem, group: string | null): boolean {
  if (group === null) return true;
  if (!isSeasonGroup(group)) return false;
  return SEASON_GROUP_MEMBERS[group].some((season) =>
    item.seasons.includes(season),
  );
}

function matchesFilters(
  item: WardrobeItem,
  filters: WardrobeFilters,
): boolean {
  return (
    matchesCategory(item, filters.category) &&
    matchesColor(item, filters.color) &&
    matchesSeason(item, filters.season) &&
    matchesQuery(item, filters.query)
  );
}

function priceOf(item: WardrobeItem): number {
  return item.price ?? -1;
}

const SORT_COMPARATORS: Record<
  WardrobeFilters["sort"],
  (a: WardrobeItem, b: WardrobeItem) => number
> = {
  "createdAt-desc": (a, b) => b.createdAt.localeCompare(a.createdAt),
  "createdAt-asc": (a, b) => a.createdAt.localeCompare(b.createdAt),
  "price-desc": (a, b) => priceOf(b) - priceOf(a),
  "price-asc": (a, b) => priceOf(a) - priceOf(b),
};

export function filterAndSort(
  items: readonly WardrobeItem[],
  filters: WardrobeFilters,
): WardrobeItem[] {
  return items
    .filter((item) => matchesFilters(item, filters))
    .sort(SORT_COMPARATORS[filters.sort]);
}
