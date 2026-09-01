"use client";

import type { ReactElement } from "react";

import { CATEGORIES, CATEGORY_LABELS } from "@/domain/item/category";
import type { Category } from "@/domain/item/category";

import styles from "./CategoryChips.module.css";
import type { WardrobeItem } from "./wardrobeTypes";

/*
 * カテゴリの絞り込みチップ。件数を添えて中身の見当を付けられるようにする。
 * 0件のカテゴリは押せない薄色にして、空の一覧に飛ばさない。
 */
export function CategoryChips({
  items,
  selected,
  onSelect,
}: {
  items: WardrobeItem[];
  selected: string | null;
  onSelect: (category: string | null) => void;
}): ReactElement {
  return (
    <div className={styles.chips} aria-label="カテゴリで絞り込む">
      <Chip
        label="すべて"
        count={items.length}
        isActive={selected === null}
        onClick={() => onSelect(null)}
      />
      {CATEGORIES.map((category) => (
        <Chip
          key={category}
          label={CATEGORY_LABELS[category]}
          count={countByCategory(items, category)}
          isActive={selected === category}
          onClick={() => onSelect(selected === category ? null : category)}
        />
      ))}
    </div>
  );
}

function countByCategory(items: WardrobeItem[], category: Category): number {
  return items.filter((item) => item.category === category).length;
}

function Chip({
  label,
  count,
  isActive,
  onClick,
}: {
  label: string;
  count: number;
  isActive: boolean;
  onClick: () => void;
}): ReactElement {
  const className = isActive ? `${styles.chip} ${styles.chipActive}` : styles.chip;

  return (
    <button
      type="button"
      className={className}
      disabled={count === 0}
      aria-pressed={isActive}
      onClick={onClick}
    >
      {label}
      <span className={styles.count}>{count}</span>
    </button>
  );
}
