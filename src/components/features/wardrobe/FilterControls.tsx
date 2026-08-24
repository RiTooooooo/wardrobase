"use client";

import type { CSSProperties, ReactElement } from "react";

import { SEASON_LABELS, SEASONS } from "@/domain/item/season";

import type { SortKey } from "./wardrobeTypes";
import styles from "./WardrobeFilters.module.css";

/*
 * 絞り込みの部品。
 * 広い画面のフィルタ行（WardrobeFilters）と、
 * 狭い画面のシート（FilterSheet）の両方から使う。
 */

function chipClass(isActive: boolean): string {
  return `${styles.chip} ${isActive ? styles.chipActive : ""}`;
}

/** 表示を1つずつずらすための通し番号 */
export function step(index: number): CSSProperties {
  return { "--step": index } as CSSProperties;
}

export function SeasonChips({
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
          style={step(i)}
          onClick={() => onSelect(selected === s ? null : s)}
        >
          {SEASON_LABELS[s]}
        </button>
      ))}
    </div>
  );
}

export function SortSelect({
  value,
  onChange,
}: {
  value: SortKey;
  onChange: (v: SortKey) => void;
}): ReactElement {
  return (
    <select
      className={styles.sortSelect}
      style={step(SEASONS.length + 1)}
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
