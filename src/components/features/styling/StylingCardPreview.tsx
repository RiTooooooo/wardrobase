import type { CSSProperties, ReactElement } from "react";

import { BOARD_ITEM_SIZE } from "@/components/features/board/boardTypes";
import type {
  PreviewItem,
  PreviewRect,
} from "@/domain/styling/previewLayout";
import { fitBoardPreview } from "@/domain/styling/previewLayout";

import styles from "./StylingCardPreview.module.css";

export type PreviewCardItem = {
  name: string;
  imageUrl: string | null;
  /** ボード上の配置。ボード保存を経ていない古いスタイリングでは null */
  x: number | null;
  y: number | null;
  zIndex: number;
  scale: number;
};

/*
 * カードのプレビュー。ボードの配置をそのまま縮小したミニボードとして、
 * 編集画面と同じ黒カーペットの上に描く。
 */

/** プレビュー枠の縦横比。CSS の aspect-ratio (5 / 2) と揃えること */
const PREVIEW_ASPECT = 5 / 2;

/* 点数が少なくてもアイテムが巨大化しない拡大上限（ボード座標系の幅） */
const MIN_SPAN = 640;

/* 座標なしアイテムの仮の並び幅。ボード編集画面のフォールバックと同じ値 */
const FALLBACK_STEP = 110;

export function StylingCardPreview({
  items,
}: {
  items: PreviewCardItem[];
}): ReactElement {
  const rects = fitBoardPreview(
    items.map(toPreviewItem),
    PREVIEW_ASPECT,
    MIN_SPAN,
  );

  return (
    <div className={styles.canvas}>
      <div className={styles.canvasInner}>
        {items.map((item, index) => (
          <div
            key={index}
            className={styles.boardItem}
            style={toRectStyle(rects[index], item.zIndex)}
          >
            {item.imageUrl !== null ? (
              <img
                className={styles.image}
                src={item.imageUrl}
                alt={item.name}
                loading="lazy"
              />
            ) : (
              <span className={styles.boardName}>{item.name}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function toPreviewItem(item: PreviewCardItem, index: number): PreviewItem {
  return {
    /* 座標が無いものは、ボード編集画面を開いたときと同じ仮の並びで置く */
    x: item.x ?? index * FALLBACK_STEP,
    y: item.y ?? 0,
    width: BOARD_ITEM_SIZE.width * item.scale,
    height: BOARD_ITEM_SIZE.height * item.scale,
  };
}

function toRectStyle(rect: PreviewRect, zIndex: number): CSSProperties {
  return {
    left: `${rect.left}%`,
    top: `${rect.top}%`,
    width: `${rect.width}%`,
    height: `${rect.height}%`,
    zIndex,
  };
}
