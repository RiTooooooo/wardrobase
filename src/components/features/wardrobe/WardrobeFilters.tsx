"use client";

import type { ReactElement } from "react";

import { CATEGORIES, CATEGORY_LABELS } from "@/domain/item/category";
import { SEASON_LABELS, SEASONS } from "@/domain/item/season";

import type { SortKey, WardrobeFilters as Filters } from "./wardrobeTypes";
import styles from "./WardrobeFilters.module.css";

type Props = {
  filters: Filters;
  onChange: (filters: Filters) => void;
};

function chipClass(isActive: boolean): string {
  return `${styles.chip} ${isActive ? styles.chipActive : ""}`;
}

export function WardrobeFilters({
  filters,
  onChange,
}: Props): ReactElement {
  function setCategory(value: string | null): void {
    onChange({ ...filters, category: value });
  }

  function setSeason(value: string | null): void {
    onChange({ ...filters, season: value });
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.row}>
        <CategoryChips
          selected={filters.category}
          onSelect={setCategory}
        />
      </div>
      <div className={styles.row}>
        <SeasonChips
          selected={filters.season}
          onSelect={setSeason}
        />
        <input
          className={styles.searchInput}
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

function CategoryChips({
  selected,
  onSelect,
}: {
  selected: string | null;
  onSelect: (v: string | null) => void;
}): ReactElement {
  return (
    <div className={styles.chips}>
      <button
        type="button"
        className={chipClass(selected === null)}
        onClick={() => onSelect(null)}
      >
        すべて
      </button>
      {CATEGORIES.map((cat) => (
        <button
          key={cat}
          type="button"
          className={chipClass(selected === cat)}
          onClick={() => onSelect(selected === cat ? null : cat)}
        >
          {CATEGORY_LABELS[cat]}
        </button>
      ))}
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
      {SEASONS.map((s) => (
        <button
          key={s}
          type="button"
          className={chipClass(selected === s)}
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
