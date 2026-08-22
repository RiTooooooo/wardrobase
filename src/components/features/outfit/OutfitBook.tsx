"use client";

import { useState } from "react";
import type { ChangeEvent, ReactElement } from "react";

import { useIsNarrow } from "@/components/hooks/useIsNarrow";

import { findGroupIndexByDate } from "./bookPaging";
import type { DateGroup } from "./lookbookTypes";
import styles from "./OutfitBook.module.css";
import { SinglePageBook } from "./SinglePageBook";
import { SpreadBook } from "./SpreadBook";

/*
 * コーデ記録を1冊のルックブックとして見せる。
 *
 * 広い画面は見開き2ページ、狭い画面は1ページ表示に切り替える。
 * 見開きのまま縮めると1ページの幅が足りなくなるため、
 * 表示の仕方ごとコンポーネントを分けている。
 */
type DateSearch = {
  /** 開くべきグループ番号。検索していない・見つからないときは null */
  focusGroup: number | null;
  notFound: boolean;
};

function searchByDate(groups: DateGroup[], date: string): DateSearch {
  if (date === "") {
    return { focusGroup: null, notFound: false };
  }

  const index = findGroupIndexByDate(groups, date);
  if (index === -1) {
    return { focusGroup: null, notFound: true };
  }
  return { focusGroup: index, notFound: false };
}

export function OutfitBook({ groups }: { groups: DateGroup[] }): ReactElement {
  const isNarrow = useIsNarrow();
  const [searchDate, setSearchDate] = useState("");
  const { focusGroup, notFound } = searchByDate(groups, searchDate);

  function handleDateChange(e: ChangeEvent<HTMLInputElement>): void {
    setSearchDate(e.target.value);
  }

  return (
    <>
      <div className={styles.search}>
        <label className={styles.searchLabel}>
          日付で開く
          <input
            type="date"
            className={styles.searchInput}
            value={searchDate}
            onChange={handleDateChange}
          />
        </label>
        {notFound ? (
          <span className={styles.searchEmpty}>この日の記録はありません</span>
        ) : null}
      </div>
      {isNarrow ? (
        <SinglePageBook groups={groups} focusGroup={focusGroup} />
      ) : (
        <SpreadBook groups={groups} focusGroup={focusGroup} />
      )}
    </>
  );
}
