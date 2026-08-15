"use client";

import type { PointerEvent, ReactElement } from "react";

import type { DrawerItem } from "./boardTypes";
import styles from "./DrawerCategory.module.css";

type Props = {
  items: DrawerItem[];
  placedIds: string[];
  onDragStart: (item: DrawerItem, e: PointerEvent) => void;
};

export function DrawerCategory({
  items,
  placedIds,
  onDragStart,
}: Props): ReactElement {
  if (items.length === 0) {
    return (
      <p className={styles.empty}>このカテゴリにアイテムがありません</p>
    );
  }

  return (
    <div className={styles.grid}>
      {items.map((item) => (
        <DrawerThumb
          key={item.id}
          item={item}
          isPlaced={placedIds.includes(item.id)}
          onDragStart={onDragStart}
        />
      ))}
    </div>
  );
}

function DrawerThumb({
  item,
  isPlaced,
  onDragStart,
}: {
  item: DrawerItem;
  isPlaced: boolean;
  onDragStart: (item: DrawerItem, e: PointerEvent) => void;
}): ReactElement {
  const className = isPlaced
    ? `${styles.thumb} ${styles.thumbPlaced}`
    : styles.thumb;

  return (
    <button
      type="button"
      className={className}
      onPointerDown={(e) => onDragStart(item, e)}
      aria-label={item.name}
    >
      {item.imageUrl ? (
        <div className={styles.thumbImageWrap}>
          <img
            className={styles.thumbImage}
            src={item.imageUrl}
            alt={item.name}
            loading="lazy"
            draggable={false}
          />
        </div>
      ) : (
        <span className={styles.thumbName}>{item.name}</span>
      )}
      <span className={styles.thumbLabel}>{item.name}</span>
    </button>
  );
}
