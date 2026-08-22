import type { DateGroup } from "./lookbookTypes";

/*
 * ルックブックのページ割り。
 * 記録のある日3日分で1ページ（暦の3日刻みにしないのは、
 * 記録の無い日で空白ページが量産されるのを避けるため）。
 */

export type TurnDirection = "next" | "prev";

/** めくり中の状態。base はめくりの手前側（若い方）の番号 */
export type Flip = { base: number; dir: TurnDirection };

export type Spread = { left: DateGroup[]; right: DateGroup[] };

export const DAYS_PER_PAGE = 3;

export function chunkPages(groups: DateGroup[]): DateGroup[][] {
  const pages: DateGroup[][] = [];
  for (let i = 0; i < groups.length; i += DAYS_PER_PAGE) {
    pages.push(groups.slice(i, i + DAYS_PER_PAGE));
  }
  return pages;
}

export function toSpreads(groups: DateGroup[]): Spread[] {
  const pages = chunkPages(groups);
  /* 最後が左ページで終わるなら、右は白紙のページにする */
  if (pages.length % 2 === 1) {
    pages.push([]);
  }

  const spreads: Spread[] = [];
  for (let i = 0; i < pages.length; i += 2) {
    spreads.push({ left: pages[i], right: pages[i + 1] });
  }
  return spreads;
}

/** 指定した日付（YYYY-MM-DD）の記録がどのグループにあるか。無ければ -1 */
export function findGroupIndexByDate(
  groups: DateGroup[],
  date: string,
): number {
  return groups.findIndex((group) => group.date === date);
}
