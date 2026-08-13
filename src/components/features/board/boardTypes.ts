import type { Category } from "@/domain/item/category";

/*
 * ボード上のアイテムの基準サイズ（拡大率1.0のとき）。
 * 拡大率をかけた値が実際の表示サイズになるため、配置計算と表示で共有する。
 */
export const BOARD_ITEM_SIZE = { width: 160, height: 200 } as const;

export type DrawerItem = {
  id: string;
  name: string;
  imageUrl: string | null;
  category: Category;
};

export type BoardItem = {
  itemId: string;
  x: number;
  y: number;
  zIndex: number;
  /** ボード上での拡大率。縦横同じ比率で変わる */
  scale: number;
};

export type GhostState = {
  itemId: string;
  name: string;
  imageUrl: string | null;
  clientX: number;
  clientY: number;
};

export type DragState = {
  clientX: number;
  clientY: number;
  dx: number;
  dy: number;
};
