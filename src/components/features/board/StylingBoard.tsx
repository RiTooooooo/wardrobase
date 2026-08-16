"use client";

import { useCallback, useRef, useState } from "react";
import type { PointerEvent, ReactElement } from "react";

import {
  autoGridPosition,
  boundsOf,
  clampPosition,
  nextZIndex,
  toCanvasPosition,
} from "@/domain/styling/boardLayout";
import type { Season } from "@/domain/item/season";

import type {
  BoardItem,
  CarpetColor,
  DrawerItem,
  GhostState,
} from "./boardTypes";
import { BoardCanvas } from "./BoardCanvas";
import { BoardControls } from "./BoardControls";
import { ClosetDrawer } from "./ClosetDrawer";
import { GhostOverlay } from "./GhostOverlay";
import styles from "./StylingBoard.module.css";
import { useBoardItems } from "./useBoardItems";
import { useDrag } from "./useDrag";
import { useIsNarrow } from "./useIsNarrow";

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
  const isNarrow = useIsNarrow();
  const [ghost, setGhost] = useState<GhostState | null>(null);
  /* カーペットの色。保存しない見た目の設定なので、ここで完結させる */
  const [carpetColor, setCarpetColor] = useState<CarpetColor>("black");
  const [isPending, setIsPending] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);
  const draggingItemRef = useRef<DrawerItem | null>(null);

  const items = useBoardItems({
    initial: initialBoardItems ?? [],
    itemSize: ITEM_SIZE,
    canvasRef,
  });

  const placedIds = items.boardItems.map((bi) => bi.itemId);

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

      const pos = toCanvasPosition(
        state.clientX, state.clientY, rect, ITEM_SIZE,
      );
      const clamped = clampPosition(
        pos.x, pos.y, { width: rect.width, height: rect.height }, ITEM_SIZE,
      );

      items.add({
        itemId: item.id,
        x: clamped.x,
        y: clamped.y,
        zIndex: nextZIndex(items.boardItems),
        scale: 1,
      });
    },
    [items],
  );

  const { onPointerDown: startDrawerDrag } = useDrag({
    onMove: handleDrawerDragMove,
    onEnd: handleDrawerDragEnd,
  });

  /*
   * 狭い画面ではタップで配置する。
   * 置き先は既にある枚数から機械的に決め、あとから指で動かせるようにする。
   */
  const handlePick = useCallback(
    function pick(item: DrawerItem): void {
      const canvas = canvasRef.current;
      const bounds = boundsOf(
        canvas === null ? null : canvas.getBoundingClientRect(),
      );
      const pos = autoGridPosition(items.boardItems.length, bounds, ITEM_SIZE);

      items.add({
        itemId: item.id,
        x: pos.x,
        y: pos.y,
        zIndex: nextZIndex(items.boardItems),
        scale: 1,
      });
    },
    [items],
  );

  function handleDrawerItemDragStart(
    item: DrawerItem,
    e: PointerEvent,
  ): void {
    draggingItemRef.current = item;
    startDrawerDrag(e);
  }

  return (
    <div className={styles.board}>
      <ClosetDrawer
        items={drawerItems}
        placedIds={placedIds}
        onDragStart={handleDrawerItemDragStart}
        onPick={isNarrow ? handlePick : undefined}
      />
      <BoardCanvas
        ref={canvasRef}
        boardItems={items.boardItems}
        drawerItems={drawerItems}
        carpetColor={carpetColor}
        onCarpetColorChange={setCarpetColor}
        onReposition={items.reposition}
        onResize={items.resize}
        onBringToFront={items.bringToFront}
        onSendToBack={items.sendToBack}
        onRemove={items.remove}
      />
      <BoardControls
        boardItems={items.boardItems}
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
