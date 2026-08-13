"use client";

import { useCallback, useState } from "react";

import {
  boundsOf,
  clampPosition,
  clampScale,
  nextZIndex,
  prevZIndex,
} from "@/domain/styling/boardLayout";

import type { BoardItem } from "./boardTypes";

/*
 * ボードに置いたアイテムの状態と、その操作をまとめる。
 * StylingBoard はドラッグの受け渡しと組み立てに専念させる。
 */

type Args = {
  initial: BoardItem[];
  itemSize: { width: number; height: number };
  /** 配置できる範囲を測るためのカーペット本体 */
  canvasRef: { current: HTMLDivElement | null };
};

export type BoardItemActions = {
  boardItems: BoardItem[];
  add: (item: BoardItem) => void;
  reposition: (itemId: string, x: number, y: number) => void;
  resize: (itemId: string, scale: number) => void;
  bringToFront: (itemId: string) => void;
  sendToBack: (itemId: string) => void;
  remove: (itemId: string) => void;
};

export function useBoardItems({
  initial,
  itemSize,
  canvasRef,
}: Args): BoardItemActions {
  const [boardItems, setBoardItems] = useState<BoardItem[]>(initial);

  const add = useCallback(function addItem(item: BoardItem): void {
    setBoardItems((prev) =>
      prev.some((bi) => bi.itemId === item.itemId) ? prev : [...prev, item],
    );
  }, []);

  const reposition = useCallback(
    function repositionItem(itemId: string, x: number, y: number): void {
      const canvas = canvasRef.current;
      const rect = canvas === null ? null : canvas.getBoundingClientRect();
      const clamped = clampPosition(x, y, boundsOf(rect), itemSize);

      setBoardItems((prev) =>
        prev.map((bi) =>
          bi.itemId === itemId ? { ...bi, x: clamped.x, y: clamped.y } : bi,
        ),
      );
    },
    [canvasRef, itemSize],
  );

  const resize = useCallback(
    function resizeItem(itemId: string, scale: number): void {
      setBoardItems((prev) =>
        prev.map((bi) =>
          bi.itemId === itemId ? { ...bi, scale: clampScale(scale) } : bi,
        ),
      );
    },
    [],
  );

  const bringToFront = useCallback(function toFront(itemId: string): void {
    setBoardItems((prev) =>
      prev.map((bi) =>
        bi.itemId === itemId ? { ...bi, zIndex: nextZIndex(prev) } : bi,
      ),
    );
  }, []);

  const sendToBack = useCallback(function toBack(itemId: string): void {
    setBoardItems((prev) =>
      prev.map((bi) =>
        bi.itemId === itemId ? { ...bi, zIndex: prevZIndex(prev) } : bi,
      ),
    );
  }, []);

  const remove = useCallback(function removeItem(itemId: string): void {
    setBoardItems((prev) => prev.filter((bi) => bi.itemId !== itemId));
  }, []);

  return {
    boardItems,
    add,
    reposition,
    resize,
    bringToFront,
    sendToBack,
    remove,
  };
}
