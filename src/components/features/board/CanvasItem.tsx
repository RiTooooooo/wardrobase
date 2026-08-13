"use client";

import { useCallback, useRef } from "react";
import type { ReactElement } from "react";

import { scaleFromDrag } from "@/domain/styling/boardLayout";

import type { BoardItem, DragState, DrawerItem } from "./boardTypes";
import { BOARD_ITEM_SIZE } from "./boardTypes";
import styles from "./CanvasItem.module.css";
import { useDrag } from "./useDrag";

type Props = {
  boardItem: BoardItem;
  drawerItem: DrawerItem | undefined;
  onReposition: (itemId: string, x: number, y: number) => void;
  onResize: (itemId: string, scale: number) => void;
  onBringToFront: (itemId: string) => void;
  onSendToBack: (itemId: string) => void;
  onRemove: (itemId: string) => void;
};

export function CanvasItem({
  boardItem,
  drawerItem,
  onReposition,
  onResize,
  onBringToFront,
  onSendToBack,
  onRemove,
}: Props): ReactElement {
  const elRef = useRef<HTMLDivElement>(null);
  const originRef = useRef({ x: boardItem.x, y: boardItem.y });
  const startScaleRef = useRef(boardItem.scale);

  const handleMove = useCallback(
    function onMove(state: DragState): void {
      const el = elRef.current;
      if (el === null) return;
      const nx = originRef.current.x + state.dx;
      const ny = originRef.current.y + state.dy;
      el.style.transform = `translate(${nx}px, ${ny}px)`;
    },
    [],
  );

  const handleEnd = useCallback(
    function onEnd(state: DragState): void {
      const nx = originRef.current.x + state.dx;
      const ny = originRef.current.y + state.dy;
      originRef.current = { x: nx, y: ny };
      onReposition(boardItem.itemId, nx, ny);
    },
    [boardItem.itemId, onReposition],
  );

  const { onPointerDown } = useDrag({ onMove: handleMove, onEnd: handleEnd });

  /*
   * つまみを引いている間は state を更新せず、要素の寸法を直接書き換える。
   * 一手ごとに再描画すると、掴んだ位置とアイテムがずれて追従が重くなる。
   */
  const handleResizeMove = useCallback(
    function onResizeMove(state: DragState): void {
      const el = elRef.current;
      if (el === null) return;
      const next = scaleFromDrag(
        startScaleRef.current, state.dx, BOARD_ITEM_SIZE.width,
      );
      el.style.width = `${BOARD_ITEM_SIZE.width * next}px`;
      el.style.height = `${BOARD_ITEM_SIZE.height * next}px`;
    },
    [],
  );

  const handleResizeEnd = useCallback(
    function onResizeEnd(state: DragState): void {
      const next = scaleFromDrag(
        startScaleRef.current, state.dx, BOARD_ITEM_SIZE.width,
      );
      startScaleRef.current = next;
      onResize(boardItem.itemId, next);
    },
    [boardItem.itemId, onResize],
  );

  const resizeDrag = useDrag({
    onMove: handleResizeMove,
    onEnd: handleResizeEnd,
  });

  function handlePointerDown(e: React.PointerEvent): void {
    onBringToFront(boardItem.itemId);
    originRef.current = { x: boardItem.x, y: boardItem.y };
    onPointerDown(e);
  }

  function handleResizePointerDown(e: React.PointerEvent): void {
    // つまみの操作をアイテム自体の移動として扱わない
    e.stopPropagation();
    onBringToFront(boardItem.itemId);
    startScaleRef.current = boardItem.scale;
    resizeDrag.onPointerDown(e);
  }

  const name = drawerItem?.name ?? "";

  return (
    <div
      ref={elRef}
      className={styles.item}
      style={{
        transform: `translate(${boardItem.x}px, ${boardItem.y}px)`,
        width: BOARD_ITEM_SIZE.width * boardItem.scale,
        height: BOARD_ITEM_SIZE.height * boardItem.scale,
        zIndex: boardItem.zIndex,
      }}
      onPointerDown={handlePointerDown}
    >
      {drawerItem?.imageUrl ? (
        <img
          className={styles.image}
          src={drawerItem.imageUrl}
          alt={name}
          draggable={false}
        />
      ) : (
        <span className={styles.placeholder}>{name}</span>
      )}
      <button
        type="button"
        className={styles.resizeHandle}
        aria-label={`${name}の大きさを変える`}
        onPointerDown={handleResizePointerDown}
      />
      <div
        className={styles.toolbar}
        onPointerDown={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className={styles.toolBtn}
          onClick={() => onBringToFront(boardItem.itemId)}
          aria-label={`${name}を最前面へ`}
        >
          最前面
        </button>
        <button
          type="button"
          className={styles.toolBtn}
          onClick={() => onSendToBack(boardItem.itemId)}
          aria-label={`${name}を最背面へ`}
        >
          最背面
        </button>
        <button
          type="button"
          className={styles.removeBtn}
          onClick={() => onRemove(boardItem.itemId)}
          aria-label={`${name}を削除`}
        >
          削除
        </button>
      </div>
    </div>
  );
}
