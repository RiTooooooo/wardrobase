"use client";

import type { ReactElement } from "react";

import { SEASON_GROUPS } from "@/domain/item/season";

import styles from "./FilterRow.module.css";
import type { SortKey, WardrobeFilters } from "./wardrobeTypes";

/*
 * 検索・季節・並び替えの1行。
 * 常設せず、見出し右の虫めがねボタンで開いたときだけ現れる。
 */
export function FilterRow({
  filters,
  onChange,
}: {
  filters: WardrobeFilters;
  onChange: (filters: WardrobeFilters) => void;
}): ReactElement {
  return (
    <div className={styles.row}>
      <input
        className={styles.searchInput}
        type="text"
        placeholder="名前・ブランド・メモで検索"
        aria-label="アイテムを検索"
        value={filters.query}
        onChange={(e) => onChange({ ...filters, query: e.target.value })}
      />
      <div className={styles.seasons} aria-label="季節で絞り込む">
        {SEASON_GROUPS.map((group) => (
          <SeasonChip
            key={group}
            label={group}
            isActive={filters.season === group}
            onClick={() =>
              onChange({
                ...filters,
                season: filters.season === group ? null : group,
              })
            }
          />
        ))}
      </div>
      <select
        className={styles.sortSelect}
        aria-label="並び替え"
        value={filters.sort}
        onChange={(e) => onChange({ ...filters, sort: e.target.value as SortKey })}
      >
        <option value="createdAt-desc">新しい順</option>
        <option value="createdAt-asc">古い順</option>
        <option value="price-desc">価格が高い順</option>
        <option value="price-asc">価格が安い順</option>
      </select>
    </div>
  );
}

function SeasonChip({
  label,
  isActive,
  onClick,
}: {
  label: string;
  isActive: boolean;
  onClick: () => void;
}): ReactElement {
  const className = isActive ? `${styles.chip} ${styles.chipActive}` : styles.chip;

  return (
    <button
      type="button"
      className={className}
      aria-pressed={isActive}
      onClick={onClick}
    >
      {label}
    </button>
  );
}
