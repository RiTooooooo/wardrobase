"use client";

import { useCallback, useRef, useState } from "react";
import type { PointerEvent, ReactElement } from "react";

import {
  clampPosition,
  nextZIndex,
  prevZIndex,
  toCanvasPosition,
} from "@/domain/styling/boardLayout";
import type { Season } from "@/domain/item/season";

import type { BoardItem, DrawerItem, GhostState } from "./boardTypes";
import { BoardCanvas } from "./BoardCanvas";
import { BoardControls } from "./BoardControls";
import { ClosetDrawer } from "./ClosetDrawer";
import { GhostOverlay } from "./GhostOverlay";
import styles from "./StylingBoard.module.css";
import { useDrag } from "./useDrag";

type ActionResult = { ok: true; id: string } | { ok: false; message: string };

type Props = {
  drawerItems: DrawerItem[];
  initialBoardItems?: BoardItem[];
  initialName?: string;
  initialSeasons?: Season[];
  initialMemo?: string;
  onSubmitAction: (data: unknown) => Promise<ActionResult>;
  redirectTo: string;
};

const CANVAS_BOUNDS = { width: 800, height: 600 };
const ITEM_SIZE = { width: 160, height: 200 };

export function StylingBoard({
  drawerItems,
  initialBoardItems,
  initialName,
  initialSeasons,
  initialMemo,
  onSubmitAction,
  redirectTo,
}: Props): ReactElement {
  const [boardItems, setBoardItems] = useState<BoardItem[]>(
    initialBoardItems ?? [],
  );
  const [ghost, setGhost] = useState<GhostState | null>(null);
  const [isPending, setIsPending] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);
  const draggingItemRef = useRef<DrawerItem | null>(null);

  const placedIds = boardItems.map((bi) => bi.itemId);

  const handleDrawerDragMove = useCallback(
    function onMove(state: { clientX: number; clientY: number }): void {
      const item = draggingItemRef.current;
      if (item === null) return;
      setGhost({
        itemId: item.id,
        name: item.name,
        imageUrl: item.imageUrl,
        clientX: state.clientX,
        clientY: state.clientY,
      });
    },
    [],
  );

  const handleDrawerDragEnd = useCallback(
    function onEnd(state: { clientX: number; clientY: number }): void {
      setGhost(null);
      const item = draggingItemRef.current;
      draggingItemRef.current = null;
      if (item === null) return;
      const canvas = canvasRef.current;
      if (canvas === null) return;
      const rect = canvas.getBoundingClientRect();
      if (!isInRect(state.clientX, state.clientY, rect)) return;

      setBoardItems((prev) => {
        if (prev.some((bi) => bi.itemId === item.id)) return prev;
        const pos = toCanvasPosition(
          state.clientX, state.clientY, rect, ITEM_SIZE,
        );
        const clamped = clampPosition(
          pos.x, pos.y, CANVAS_BOUNDS, ITEM_SIZE,
        );
        const z = nextZIndex(prev);

        return [...prev, { itemId: item.id, x: clamped.x, y: clamped.y, zIndex: z }];
      });
    },
    [],
  );

  const { onPointerDown: startDrawerDrag } = useDrag({
    onMove: handleDrawerDragMove,
    onEnd: handleDrawerDragEnd,
  });

  function handleDrawerItemDragStart(
    item: DrawerItem,
    e: PointerEvent,
  ): void {
    draggingItemRef.current = item;
    startDrawerDrag(e);
  }

  const handleReposition = useCallback(
    function reposition(itemId: string, x: number, y: number): void {
      const clamped = clampPosition(x, y, CANVAS_BOUNDS, ITEM_SIZE);
      setBoardItems((prev) =>
        prev.map((bi) =>
          bi.itemId === itemId ? { ...bi, x: clamped.x, y: clamped.y } : bi,
        ),
      );
    },
    [],
  );

  const handleBringToFront = useCallback(
    function bringToFront(itemId: string): void {
      setBoardItems((prev) => {
        const z = nextZIndex(prev);

        return prev.map((bi) =>
          bi.itemId === itemId ? { ...bi, zIndex: z } : bi,
        );
      });
    },
    [],
  );

  const handleSendToBack = useCallback(
    function sendToBack(itemId: string): void {
      setBoardItems((prev) => {
        const z = prevZIndex(prev);

        return prev.map((bi) =>
          bi.itemId === itemId ? { ...bi, zIndex: z } : bi,
        );
      });
    },
    [],
  );

  const handleRemove = useCallback(
    function remove(itemId: string): void {
      setBoardItems((prev) => prev.filter((bi) => bi.itemId !== itemId));
    },
    [],
  );

  return (
    <div className={styles.board}>
      <ClosetDrawer
        items={drawerItems}
        placedIds={placedIds}
        onDragStart={handleDrawerItemDragStart}
      />
      <BoardCanvas
        ref={canvasRef}
        boardItems={boardItems}
        drawerItems={drawerItems}
        onReposition={handleReposition}
        onBringToFront={handleBringToFront}
        onSendToBack={handleSendToBack}
        onRemove={handleRemove}
      />
      <BoardControls
        boardItems={boardItems}
        initialName={initialName}
        initialSeasons={initialSeasons}
        initialMemo={initialMemo}
        onSubmitAction={onSubmitAction}
        redirectTo={redirectTo}
        isPending={isPending}
        onPendingChange={setIsPending}
      />
      {ghost !== null ? <GhostOverlay ghost={ghost} /> : null}
    </div>
  );
}

function isInRect(x: number, y: number, rect: DOMRect): boolean {
  return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
}
