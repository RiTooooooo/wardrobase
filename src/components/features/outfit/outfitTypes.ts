import type { Category } from "@/domain/item/category";

export type PickerItem = {
  id: string;
  name: string;
  imageUrl: string | null;
  category: Category;
};

export type OutfitFormValues = {
  wornOn: string;
  itemIds: string[];
  satisfaction?: number;
  weather?: string;
  memo?: string;
};
