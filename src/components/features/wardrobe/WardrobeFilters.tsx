"use client";

import type { CSSProperties, ReactElement } from "react";

import { SEASON_LABELS, SEASONS } from "@/domain/item/season";

import { FilterSelects } from "./FilterSelects";
import type { SortKey, WardrobeFilters as Filters } from "./wardrobeTypes";
import styles from "./WardrobeFilters.module.css";

type Props = {
  filters: Filters;
  onChange: (filters: Filters) => void;
};

/* カテゴリは引き出し（WardrobeCloset）が担うため、チップは季節だけ */
const SEASON_STEP_OFFSET = 0;
const SEARCH_STEP = SEASON_STEP_OFFSET + SEASONS.length;

function chipClass(isActive: boolean): string {
  return `${styles.chip} ${isActive ? styles.chipActive : ""}`;
}

/** 表示を1つずつずらすための通し番号 */
function step(index: number): CSSProperties {
  return { "--step": index } as CSSProperties;
}

export function WardrobeFilters({
  filters,
  onChange,
}: Props): ReactElement {
  function setSeason(value: string | null): void {
    onChange({ ...filters, season: value });
  }

  return (
    <div className={styles.wrapper}>
      {/* 狭い画面ではチップの代わりにプルダウンを出す（CSSで出し分ける） */}
      <FilterSelects
        season={filters.season}
        onSeasonChange={setSeason}
      />
      <div className={styles.row}>
        <div className={styles.chipRow}>
          <SeasonChips
            selected={filters.season}
            onSelect={setSeason}
          />
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

function SeasonChips({
  selected,
  onSelect,
}: {
  selected: string | null;
  onSelect: (v: string | null) => void;
}): ReactElement {
  return (
    <div className={styles.chips}>
      {SEASONS.map((s, i) => (
        <button
          key={s}
          type="button"
          className={chipClass(selected === s)}
          style={step(SEASON_STEP_OFFSET + i)}
          onClick={() => onSelect(selected === s ? null : s)}
        >
          {SEASON_LABELS[s]}
        </button>
      ))}
    </div>
  );
}

function SortSelect({
  value,
  onChange,
}: {
  value: SortKey;
  onChange: (v: SortKey) => void;
}): ReactElement {
  return (
    <select
      className={styles.sortSelect}
      style={step(SEARCH_STEP + 1)}
      value={value}
      onChange={(e) => onChange(e.target.value as SortKey)}
    >
      <option value="createdAt-desc">新しい順</option>
      <option value="createdAt-asc">古い順</option>
      <option value="price-desc">価格が高い順</option>
      <option value="price-asc">価格が安い順</option>
    </select>
  );
}
