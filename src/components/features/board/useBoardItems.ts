"use client";

import { useCallback, useState } from "react";

import {
  boundsOf,
  clampPosition,
  clampScale,
  nextZIndex,
  prevZIndex,
  scaledSize,
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

  /*
   * 配置できる範囲は「見た目の大きさ」で決まる。
   * 基準サイズのまま丸めると、小さくしたアイテムが下端・右端の手前で止まる。
   * 拡大率は state にあるため、更新関数の中で対象を見てから計算する。
   */
  const reposition = useCallback(
    function repositionItem(itemId: string, x: number, y: number): void {
      const canvas = canvasRef.current;
      const rect = canvas === null ? null : canvas.getBoundingClientRect();
      const bounds = boundsOf(rect);

      setBoardItems((prev) =>
        prev.map((bi) => {
          if (bi.itemId !== itemId) return bi;
          const size = scaledSize(itemSize, bi.scale);
          const clamped = clampPosition(x, y, bounds, size);

          return { ...bi, x: clamped.x, y: clamped.y };
        }),
      );
    },
    [canvasRef, itemSize],
  );

  /* 大きくした結果はみ出す場合があるので、位置も合わせて丸め直す */
  const resize = useCallback(
    function resizeItem(itemId: string, scale: number): void {
      const canvas = canvasRef.current;
      const rect = canvas === null ? null : canvas.getBoundingClientRect();
      const bounds = boundsOf(rect);

      setBoardItems((prev) =>
        prev.map((bi) => {
          if (bi.itemId !== itemId) return bi;
          const next = clampScale(scale);
          const size = scaledSize(itemSize, next);
          const clamped = clampPosition(bi.x, bi.y, bounds, size);

          return { ...bi, scale: next, x: clamped.x, y: clamped.y };
        }),
      );
    },
    [canvasRef, itemSize],
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
