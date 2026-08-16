"use client";

import { forwardRef } from "react";
import type { ReactElement } from "react";

import type { BoardItem, CarpetColor, DrawerItem } from "./boardTypes";
import { CARPET_COLORS } from "./boardTypes";
import styles from "./BoardCanvas.module.css";
import { CanvasItem } from "./CanvasItem";

type Props = {
  boardItems: BoardItem[];
  drawerItems: DrawerItem[];
  carpetColor: CarpetColor;
  onCarpetColorChange: (color: CarpetColor) => void;
  onReposition: (itemId: string, x: number, y: number) => void;
  onResize: (itemId: string, scale: number) => void;
  onBringToFront: (itemId: string) => void;
  onSendToBack: (itemId: string) => void;
  onRemove: (itemId: string) => void;
};

const CARPET_LABELS: Record<CarpetColor, string> = {
  black: "ブラック",
  white: "ホワイト",
};

const CANVAS_CLASS: Record<CarpetColor, string> = {
  black: styles.canvas,
  white: `${styles.canvas} ${styles.canvasWhite}`,
};

function findDrawerItem(
  items: DrawerItem[],
  itemId: string,
): DrawerItem | undefined {
  return items.find((i) => i.id === itemId);
}

export const BoardCanvas = forwardRef<HTMLDivElement, Props>(
  function BoardCanvas(
    {
      boardItems, drawerItems, carpetColor, onCarpetColorChange,
      onReposition, onResize, onBringToFront, onSendToBack, onRemove,
    },
    ref,
  ): ReactElement {
    const sorted = [...boardItems].sort((a, b) => a.zIndex - b.zIndex);

    return (
      <div ref={ref} className={CANVAS_CLASS[carpetColor]}>
        {sorted.map((bi) => (
          <CanvasItem
            key={bi.itemId}
            boardItem={bi}
            drawerItem={findDrawerItem(drawerItems, bi.itemId)}
            onReposition={onReposition}
            onResize={onResize}
            onBringToFront={onBringToFront}
            onSendToBack={onSendToBack}
            onRemove={onRemove}
          />
        ))}
        {boardItems.length === 0 ? (
          /*
            置き方は画面幅で変わる（横並びはドラッグ、縦積みはタップ）。
            案内も CSS で出し分ける。
          */
          <p className={styles.hint}>
            <span className={styles.hintWide}>
              左の引き出しからアイテムをドラッグして配置してください
            </span>
            <span className={styles.hintNarrow}>
              上のクローゼットを開き、アイテムをタップして配置してください
            </span>
          </p>
        ) : null}
        {/*
          カーペットの色替え。地図アプリの表示切替と同じく、対象の上に置く。
          保存されない見た目の設定なので、保存フォームには混ぜない。
        */}
        <div
          className={styles.carpetPicker}
          role="group"
          aria-label="カーペットの色"
        >
          {CARPET_COLORS.map((color) => (
            <button
              key={color}
              type="button"
              className={
                color === carpetColor
                  ? `${styles.carpetBtn} ${styles.carpetBtnSelected}`
                  : styles.carpetBtn
              }
              aria-pressed={color === carpetColor}
              onClick={() => onCarpetColorChange(color)}
            >
              {CARPET_LABELS[color]}
            </button>
          ))}
        </div>
      </div>
    );
  },
);
