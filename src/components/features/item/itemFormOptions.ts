import type { Category } from "@/domain/item/category";
import {
  CATEGORIES,
  CATEGORY_LABELS,
  SUB_CATEGORIES,
} from "@/domain/item/category";
import { COLOR_META, COLOR_VALUES } from "@/domain/item/color";

/**
 * ItemForm が使う選択肢の組み立て。
 *
 * フォーム本体から切り出しているのは、1ファイル200行の上限に収めるため。
 * ドメインの定義（category.ts / color.ts）から選択肢の形に変換するだけで、
 * ここに業務ルールは置かない。
 */
export interface Option {
  value: string;
  label: string;
}

export const CATEGORY_OPTIONS: Option[] = CATEGORIES.map((value) => ({
  value,
  label: CATEGORY_LABELS[value],
}));

export const COLOR_OPTIONS: Option[] = COLOR_VALUES.map((value) => ({
  value,
  label: COLOR_META[value].label,
}));

export function subCategoryOptionsOf(category: Category | ""): Option[] {
  if (category === "") {
    return [];
  }

  return SUB_CATEGORIES[category].map((value) => ({ value, label: value }));
}

export function subCategoryPlaceholder(category: Category | ""): string {
  if (category === "") {
    return "先にカテゴリを選択";
  }

  return "選択してください";
}
