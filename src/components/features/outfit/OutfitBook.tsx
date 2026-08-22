"use client";

import type { ReactElement } from "react";

import { useIsNarrow } from "@/components/hooks/useIsNarrow";

import type { DateGroup } from "./lookbookTypes";
import { SinglePageBook } from "./SinglePageBook";
import { SpreadBook } from "./SpreadBook";

/*
 * コーデ記録を1冊のルックブックとして見せる。
 *
 * 広い画面は見開き2ページ、狭い画面は1ページ表示に切り替える。
 * 見開きのまま縮めると1ページの幅が足りなくなるため、
 * 表示の仕方ごとコンポーネントを分けている。
 */
export function OutfitBook({ groups }: { groups: DateGroup[] }): ReactElement {
  const isNarrow = useIsNarrow();

  if (isNarrow) {
    return <SinglePageBook groups={groups} />;
  }
  return <SpreadBook groups={groups} />;
}
