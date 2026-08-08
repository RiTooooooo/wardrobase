import { z } from "zod";

function emptyToUndefined(value: unknown): unknown {
  return value === "" ? undefined : value;
}

const optionalMemo = z.preprocess(
  emptyToUndefined,
  z.string().max(1000, "メモは1000文字以内で入力してください").optional(),
);

const SEASON_VALUES = ["SPRING", "SUMMER", "AUTUMN", "WINTER"] as const;

export const createStylingSchema = z.object({
  name: z.string().min(1, "名前を入力してください").max(100, "名前は100文字以内で入力してください"),
  itemIds: z
    .array(z.string().uuid())
    .min(1, "アイテムを1つ以上選択してください"),
  seasons: z.array(z.enum(SEASON_VALUES)).default([]),
  memo: optionalMemo,
});

export type CreateStylingInput = z.infer<typeof createStylingSchema>;

const boardItemSchema = z.object({
  itemId: z.string().uuid(),
  x: z.number(),
  y: z.number(),
  zIndex: z.number().int(),
});

export const boardStylingSchema = z.object({
  name: z
    .string()
    .min(1, "名前を入力してください")
    .max(100, "名前は100文字以内で入力してください"),
  items: z
    .array(boardItemSchema)
    .min(1, "アイテムを1つ以上配置してください"),
  seasons: z.array(z.enum(SEASON_VALUES)).default([]),
  memo: optionalMemo,
});

export type BoardStylingInput = z.infer<typeof boardStylingSchema>;
