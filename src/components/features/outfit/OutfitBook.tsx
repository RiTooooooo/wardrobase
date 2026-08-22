"use client";

import { useState } from "react";
import type { ChangeEvent, ReactElement } from "react";

import Link from "next/link";

import { useIsNarrow } from "@/components/hooks/useIsNarrow";

import { findGroupIndexByDate } from "./bookPaging";
import type { DateGroup } from "./lookbookTypes";
import styles from "./OutfitBook.module.css";
import { SinglePageBook } from "./SinglePageBook";
import { SpreadBook } from "./SpreadBook";

/*
 * コーデ記録のルックブック。見出し行（タイトル・日付検索・記録ボタン）と
 * 本体をまとめて持つ。日付検索が見出しと本の間に1行挟まると
 * 本の上に空白の帯ができるため、見出し行の右側に同居させている。
 *
 * 本は広い画面で見開き2ページ、狭い画面で1ページ表示に切り替える。
 */

type Props = {
  groups: DateGroup[];
  totalCount: number;
};

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

export function OutfitBook({ groups, totalCount }: Props): ReactElement {
  const isNarrow = useIsNarrow();
  const [searchDate, setSearchDate] = useState("");
  const { focusGroup, notFound } = searchByDate(groups, searchDate);

  function handleDateChange(e: ChangeEvent<HTMLInputElement>): void {
    setSearchDate(e.target.value);
  }

  return (
    <>
      <header className={styles.header}>
        <div className={styles.titleArea}>
          <h1 className={styles.title}>Outfits</h1>
          <span className={styles.count}>
            <span className={styles.countNumber}>{totalCount}</span> records
          </span>
        </div>
        <div className={styles.headerActions}>
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
              <span className={styles.searchEmpty}>
                この日の記録はありません
              </span>
            ) : null}
          </div>
          <Link className={styles.addButton} href="/outfits/new">
            コーデを記録
          </Link>
        </div>
      </header>
      {groups.length === 0 ? (
        <EmptyState />
      ) : (
        <Book isNarrow={isNarrow} groups={groups} focusGroup={focusGroup} />
      )}
    </>
  );
}

function Book({
  isNarrow,
  groups,
  focusGroup,
}: {
  isNarrow: boolean;
  groups: DateGroup[];
  focusGroup: number | null;
}): ReactElement {
  if (isNarrow) {
    return <SinglePageBook groups={groups} focusGroup={focusGroup} />;
  }
  return <SpreadBook groups={groups} focusGroup={focusGroup} />;
}

function EmptyState(): ReactElement {
  return (
    <p className={styles.empty}>
      コーデ記録がまだありません。
      <Link className={styles.emptyLink} href="/outfits/new">
        最初のコーデを記録する
      </Link>
    </p>
  );
}
