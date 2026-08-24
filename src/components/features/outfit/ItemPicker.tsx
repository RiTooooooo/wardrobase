"use client";

import { useState } from "react";
import type { ReactElement } from "react";

import type { Category } from "@/domain/item/category";
import { CATEGORIES, CATEGORY_LABELS, isCategory } from "@/domain/item/category";

import styles from "./ItemPicker.module.css";
import { ItemPickerSummary } from "./ItemPickerSummary";
import type { PickerItem } from "./outfitTypes";

type Props = {
  items: PickerItem[];
  selected: string[];
  disabled: boolean;
  error?: string;
  onToggle: (itemId: string) => void;
};

type Section = { category: Category; items: PickerItem[] };

/** 「すべて」を表す値。ワードローブの絞り込みと同じ方針 */
const ALL = "__all__";

/*
 * アイテムが増えても破綻しないよう、平置きせずカテゴリで区切る。
 * アイテムの無いカテゴリは出さない。絞り込み中は該当カテゴリだけに絞る。
 */
function toSections(items: PickerItem[], filter: Category | null): Section[] {
  return CATEGORIES.filter(
    (category) => filter === null || category === filter,
  )
    .map((category) => ({
      category,
      items: items.filter((item) => item.category === category),
    }))
    .filter((section) => section.items.length > 0);
}

/* 選ぶものが無いカテゴリはプルダウンにも出さない */
function toChoices(items: PickerItem[]): Category[] {
  return CATEGORIES.filter((category) =>
    items.some((item) => item.category === category),
  );
}

export function ItemPicker({
  items,
  selected,
  disabled,
  error,
  onToggle,
}: Props): ReactElement {
  /* 表示の絞り込みだけで、選択状態には影響しない。null は「すべて」 */
  const [filter, setFilter] = useState<Category | null>(null);

  if (items.length === 0) {
    return (
      <div className={styles.wrapper}>
        <span className={styles.label}>アイテム</span>
        <p className={styles.empty}>
          アイテムが登録されていません。先にアイテムを登録してください。
        </p>
      </div>
    );
  }

  function handleFilterChange(value: string): void {
    setFilter(isCategory(value) ? value : null);
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.head}>
        <span className={styles.label}>アイテムを選択</span>
        <label className={styles.filter}>
          <span className={styles.filterLabel}>カテゴリ</span>
          <select
            className={styles.select}
            value={filter ?? ALL}
            disabled={disabled}
            onChange={(e) => handleFilterChange(e.target.value)}
          >
            <option value={ALL}>All</option>
            {toChoices(items).map((category) => (
              <option key={category} value={category}>
                {CATEGORY_LABELS[category]}
              </option>
            ))}
          </select>
        </label>
      </div>
      <ItemPickerSummary
        items={items}
        selected={selected}
        disabled={disabled}
        onToggle={onToggle}
      />
      {toSections(items, filter).map((section) => (
        <section key={section.category} className={styles.section}>
          {/* 絞り込み中は1カテゴリしか出ず、見出しはプルダウンと重複するため省く */}
          {filter === null ? (
            <p className={styles.sectionTitle}>
              {CATEGORY_LABELS[section.category]}
              <span className={styles.sectionCount}>
                {section.items.length}
              </span>
            </p>
          ) : null}
          <div className={styles.grid}>
            {section.items.map((item) => (
              <PickerCell
                key={item.id}
                item={item}
                isSelected={selected.includes(item.id)}
                disabled={disabled}
                onToggle={onToggle}
              />
            ))}
          </div>
        </section>
      ))}
      {error ? <p className={styles.error}>{error}</p> : null}
    </div>
  );
}

function PickerCell({
  item,
  isSelected,
  disabled,
  onToggle,
}: {
  item: PickerItem;
  isSelected: boolean;
  disabled: boolean;
  onToggle: (id: string) => void;
}): ReactElement {
  const className = isSelected
    ? `${styles.item} ${styles.itemSelected}`
    : styles.item;

  return (
    <button
      type="button"
      className={className}
      disabled={disabled}
      onClick={() => onToggle(item.id)}
      aria-pressed={isSelected}
      aria-label={item.name}
    >
      {item.imageUrl ? (
        <img
          className={styles.itemImage}
          src={item.imageUrl}
          alt={item.name}
          loading="lazy"
        />
      ) : (
        <span className={styles.itemPlaceholder}>{item.name}</span>
      )}
      {isSelected ? <span className={styles.checkmark}>✓</span> : null}
    </button>
  );
}
