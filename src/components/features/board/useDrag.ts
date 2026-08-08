"use client";

import { useCallback, useRef } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";

import type { DragState } from "./boardTypes";

type DragHandlers = {
  onMove?: (state: DragState) => void;
  onEnd: (state: DragState) => void;
};

type UseDragReturn = {
  onPointerDown: (e: ReactPointerEvent) => void;
};

export function useDrag({ onMove, onEnd }: DragHandlers): UseDragReturn {
  const startRef = useRef({ x: 0, y: 0 });

  const handlePointerDown = useCallback(
    function handleDown(e: ReactPointerEvent): void {
      e.preventDefault();
      const el = e.currentTarget as HTMLElement;
      el.setPointerCapture(e.pointerId);
      startRef.current = { x: e.clientX, y: e.clientY };

      function handleMove(ev: globalThis.PointerEvent): void {
        const state: DragState = {
          clientX: ev.clientX,
          clientY: ev.clientY,
          dx: ev.clientX - startRef.current.x,
          dy: ev.clientY - startRef.current.y,
        };
        onMove?.(state);
      }

      function handleUp(ev: globalThis.PointerEvent): void {
        el.releasePointerCapture(ev.pointerId);
        el.removeEventListener("pointermove", handleMove);
        el.removeEventListener("pointerup", handleUp);
        el.removeEventListener("pointercancel", handleUp);
        const state: DragState = {
          clientX: ev.clientX,
          clientY: ev.clientY,
          dx: ev.clientX - startRef.current.x,
          dy: ev.clientY - startRef.current.y,
        };
        onEnd(state);
      }

      el.addEventListener("pointermove", handleMove);
      el.addEventListener("pointerup", handleUp);
      el.addEventListener("pointercancel", handleUp);
    },
    [onMove, onEnd],
  );

  return { onPointerDown: handlePointerDown };
}
