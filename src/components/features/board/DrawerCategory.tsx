"use client";

import type { PointerEvent, ReactElement } from "react";

import type { DrawerItem } from "./boardTypes";
import styles from "./DrawerCategory.module.css";

type Props = {
  items: DrawerItem[];
  placedIds: string[];
  onDragStart: (item: DrawerItem, e: PointerEvent) => void;
  /*
   * 指定するとドラッグではなくタップで配置する。
   * 狭い画面では引き出しからカーペットまで指を運ぶ距離が長く、
   * スクロールとも競合して誤操作しやすいため。
   */
  onPick?: (item: DrawerItem) => void;
};

export function DrawerCategory({
  items,
  placedIds,
  onDragStart,
  onPick,
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
          onPick={onPick}
        />
      ))}
    </div>
  );
}

type ThumbHandlers = {
  onPointerDown?: (e: PointerEvent) => void;
  onClick?: () => void;
  "aria-label": string;
};

/*
 * onPick があるときはタップで配置、無いときはドラッグで配置。
 * 両方を同時に付けるとタップでドラッグが始まって二重に反応するため、
 * どちらか一方だけを渡す。
 */
function pickHandlers(
  item: DrawerItem,
  onDragStart: (item: DrawerItem, e: PointerEvent) => void,
  onPick?: (item: DrawerItem) => void,
): ThumbHandlers {
  if (onPick !== undefined) {
    return {
      onClick: function place(): void {
        onPick(item);
      },
      "aria-label": `${item.name}を配置する`,
    };
  }

  return {
    onPointerDown: function startDrag(e: PointerEvent): void {
      onDragStart(item, e);
    },
    "aria-label": item.name,
  };
}

function DrawerThumb({
  item,
  isPlaced,
  onDragStart,
  onPick,
}: {
  item: DrawerItem;
  isPlaced: boolean;
  onDragStart: (item: DrawerItem, e: PointerEvent) => void;
  onPick?: (item: DrawerItem) => void;
}): ReactElement {
  const className = isPlaced
    ? `${styles.thumb} ${styles.thumbPlaced}`
    : styles.thumb;

  return (
    <button
      type="button"
      className={className}
      {...pickHandlers(item, onDragStart, onPick)}
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
