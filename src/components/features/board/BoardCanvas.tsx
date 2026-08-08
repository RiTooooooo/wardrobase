"use client";

import { forwardRef } from "react";
import type { ReactElement } from "react";

import type { BoardItem, DrawerItem } from "./boardTypes";
import styles from "./BoardCanvas.module.css";
import { CanvasItem } from "./CanvasItem";

type Props = {
  boardItems: BoardItem[];
  drawerItems: DrawerItem[];
  onReposition: (itemId: string, x: number, y: number) => void;
  onBringToFront: (itemId: string) => void;
  onSendToBack: (itemId: string) => void;
  onRemove: (itemId: string) => void;
};

function findDrawerItem(
  items: DrawerItem[],
  itemId: string,
): DrawerItem | undefined {
  return items.find((i) => i.id === itemId);
}

export const BoardCanvas = forwardRef<HTMLDivElement, Props>(
  function BoardCanvas(
    { boardItems, drawerItems, onReposition, onBringToFront, onSendToBack, onRemove },
    ref,
  ): ReactElement {
    const sorted = [...boardItems].sort((a, b) => a.zIndex - b.zIndex);

    return (
      <div ref={ref} className={styles.canvas}>
        {sorted.map((bi) => (
          <CanvasItem
            key={bi.itemId}
            boardItem={bi}
            drawerItem={findDrawerItem(drawerItems, bi.itemId)}
            onReposition={onReposition}
            onBringToFront={onBringToFront}
            onSendToBack={onSendToBack}
            onRemove={onRemove}
          />
        ))}
        {boardItems.length === 0 ? (
          <p className={styles.hint}>
            左の引き出しからアイテムをドラッグして配置してください
          </p>
        ) : null}
      </div>
    );
  },
);
