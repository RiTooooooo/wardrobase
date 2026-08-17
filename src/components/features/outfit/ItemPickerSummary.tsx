"use client";

import type { ReactElement } from "react";

import styles from "./ItemPickerSummary.module.css";
import type { PickerItem } from "./outfitTypes";

type Props = {
  items: PickerItem[];
  selected: string[];
  disabled: boolean;
  onToggle: (id: string) => void;
};

/* 選択順を保ったまま、選択中のアイテムを引く */
function toSelectedItems(
  items: PickerItem[],
  selected: string[],
): PickerItem[] {
  return selected
    .map((id) => items.find((item) => item.id === id))
    .filter((item): item is PickerItem => item !== undefined);
}

/*
 * 選択中のアイテムを常に見えるところへ並べる。
 * 一覧はスクロールや絞り込みで流れていくため、ここが無いと
 * 「いま何を選んでいるか」が画面から消えてしまう。タップで選択から外せる。
 */
export function ItemPickerSummary({
  items,
  selected,
  disabled,
  onToggle,
}: Props): ReactElement | null {
  const selectedItems = toSelectedItems(items, selected);
  if (selectedItems.length === 0) return null;

  return (
    <div className={styles.summary}>
      <p className={styles.summaryLabel}>
        選択中 {selectedItems.length}点
        <span className={styles.summaryHint}>タップで外せます</span>
      </p>
      <div className={styles.summaryRow}>
        {selectedItems.map((item) => (
          <button
            key={item.id}
            type="button"
            className={styles.summaryItem}
            disabled={disabled}
            onClick={() => onToggle(item.id)}
            aria-label={`${item.name}を選択から外す`}
          >
            {item.imageUrl ? (
              <img
                className={styles.summaryImage}
                src={item.imageUrl}
                alt=""
                loading="lazy"
              />
            ) : (
              <span className={styles.summaryPlaceholder}>{item.name}</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
