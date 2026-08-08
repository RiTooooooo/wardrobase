"use client";

import { useCallback, useRef } from "react";
import type { ReactElement } from "react";

import type { BoardItem, DragState, DrawerItem } from "./boardTypes";
import styles from "./CanvasItem.module.css";
import { useDrag } from "./useDrag";

type Props = {
  boardItem: BoardItem;
  drawerItem: DrawerItem | undefined;
  onReposition: (itemId: string, x: number, y: number) => void;
  onBringToFront: (itemId: string) => void;
  onSendToBack: (itemId: string) => void;
  onRemove: (itemId: string) => void;
};

export function CanvasItem({
  boardItem,
  drawerItem,
  onReposition,
  onBringToFront,
  onSendToBack,
  onRemove,
}: Props): ReactElement {
  const elRef = useRef<HTMLDivElement>(null);
  const originRef = useRef({ x: boardItem.x, y: boardItem.y });

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

  function handlePointerDown(e: React.PointerEvent): void {
    onBringToFront(boardItem.itemId);
    originRef.current = { x: boardItem.x, y: boardItem.y };
    onPointerDown(e);
  }

  const name = drawerItem?.name ?? "";

  return (
    <div
      ref={elRef}
      className={styles.item}
      style={{
        transform: `translate(${boardItem.x}px, ${boardItem.y}px)`,
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
