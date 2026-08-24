"use client";

import type { ReactElement, ReactNode } from "react";

import { SEASONS } from "@/domain/item/season";

import { SeasonChips, SortSelect, step } from "./FilterControls";
import { FilterSheet } from "./FilterSheet";
import type { WardrobeFilters as Filters } from "./wardrobeTypes";
import styles from "./WardrobeFilters.module.css";

type Props = {
  filters: Filters;
  onChange: (filters: Filters) => void;
  /** 行の先頭に置く操作（「アイテムを追加」リンク） */
  addAction?: ReactNode;
};

/* カテゴリは引き出し（WardrobeCloset）が担うため、チップは季節だけ */
const SEARCH_STEP = SEASONS.length;

export function WardrobeFilters({
  filters,
  onChange,
  addAction,
}: Props): ReactElement {
  function setSeason(value: string | null): void {
    onChange({ ...filters, season: value });
  }

  return (
    <div className={styles.wrapper}>
      {/* 追加ボタンと絞り込みを1列に。狭い画面では絞り込みがシートに畳まれる */}
      <div className={styles.actionsRow}>
        {addAction}
        <FilterSheet filters={filters} onChange={onChange} />
      </div>
      <div className={styles.row}>
        <div className={styles.chipRow}>
          <SeasonChips selected={filters.season} onSelect={setSeason} />
        </div>
        <input
          className={styles.searchInput}
          style={step(SEARCH_STEP)}
          type="text"
          placeholder="ブランド・メモで検索"
          value={filters.query}
          onChange={(e) => onChange({ ...filters, query: e.target.value })}
        />
        <SortSelect
          value={filters.sort}
          onChange={(sort) => onChange({ ...filters, sort })}
        />
      </div>
    </div>
  );
}
