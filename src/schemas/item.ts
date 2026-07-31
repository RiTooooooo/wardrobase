import { z } from "zod";

import { CATEGORIES } from "@/domain/item/category";
import { COLOR_VALUES } from "@/domain/item/color";
import { SEASONS } from "@/domain/item/season";

/**
 * アイテムの入力スキーマ。
 *
 * フォームから来る値は全て文字列なので、数値・日付は coerce で変換する。
 * 未入力は空文字で届くため、preprocess で undefined に寄せてから optional を効かせる。
 */

const MAX_PRICE = 10_000_000;

function emptyToUndefined(value: unknown): unknown {
  return value === "" ? undefined : value;
}

const optionalSubCategory = z.preprocess(
  emptyToUndefined,
  z.string().max(50, "サブカテゴリは50文字以内で入力してください").optional(),
);

const optionalBrand = z.preprocess(
  emptyToUndefined,
  z.string().max(100, "ブランド名は100文字以内で入力してください").optional(),
);

const optionalMemo = z.preprocess(
  emptyToUndefined,
  z.string().max(1000, "メモは1000文字以内で入力してください").optional(),
);

const optionalPrice = z.preprocess(
  emptyToUndefined,
  z.coerce
    .number()
    .int("価格は整数で入力してください")
    .min(0, "価格は0以上で入力してください")
    .max(MAX_PRICE, "価格が大きすぎます")
    .optional(),
);

const optionalPurchasedAt = z.preprocess(
  emptyToUndefined,
  z.coerce.date().optional(),
);

const optionalImagePath = z.preprocess(
  emptyToUndefined,
  z.string().max(300).optional(),
);

export const createItemSchema = z.object({
  name: z
    .string()
    .min(1, "アイテム名を入力してください")
    .max(100, "アイテム名は100文字以内で入力してください"),
  category: z.enum(CATEGORIES, { message: "カテゴリを選択してください" }),
  subCategory: optionalSubCategory,
  color: z.enum(COLOR_VALUES, { message: "色を選択してください" }),
  seasons: z.array(z.enum(SEASONS)),
  brand: optionalBrand,
  price: optionalPrice,
  purchasedAt: optionalPurchasedAt,
  memo: optionalMemo,
  imagePath: optionalImagePath,
});

export type CreateItemInput = z.infer<typeof createItemSchema>;
