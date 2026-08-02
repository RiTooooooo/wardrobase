"use client";

import type { ReactElement } from "react";

import styles from "./ItemPicker.module.css";
import type { PickerItem } from "./outfitTypes";

type Props = {
  items: PickerItem[];
  selected: string[];
  disabled: boolean;
  error?: string;
  onToggle: (itemId: string) => void;
};

export function ItemPicker({
  items,
  selected,
  disabled,
  error,
  onToggle,
}: Props): ReactElement {
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

  return (
    <div className={styles.wrapper}>
      <span className={styles.label}>アイテムを選択</span>
      <div className={styles.grid}>
        {items.map((item) => (
          <PickerCell
            key={item.id}
            item={item}
            isSelected={selected.includes(item.id)}
            disabled={disabled}
            onToggle={onToggle}
          />
        ))}
      </div>
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
