import type { Category } from "@/domain/item/category";

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
