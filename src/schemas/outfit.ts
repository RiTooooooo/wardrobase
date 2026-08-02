import { z } from "zod";

function emptyToUndefined(value: unknown): unknown {
  return value === "" ? undefined : value;
}

const optionalWeather = z.preprocess(
  emptyToUndefined,
  z.string().max(100, "天気メモは100文字以内で入力してください").optional(),
);

const optionalMemo = z.preprocess(
  emptyToUndefined,
  z.string().max(1000, "メモは1000文字以内で入力してください").optional(),
);

const MAX_SATISFACTION = 5;

const optionalSatisfaction = z.preprocess(
  emptyToUndefined,
  z.coerce
    .number()
    .int()
    .min(1, "満足度は1〜5で入力してください")
    .max(MAX_SATISFACTION, "満足度は1〜5で入力してください")
    .optional(),
);

export const createOutfitSchema = z.object({
  wornOn: z.coerce.date({ message: "日付を入力してください" }),
  itemIds: z
    .array(z.string().uuid())
    .min(1, "アイテムを1つ以上選択してください"),
  satisfaction: optionalSatisfaction,
  weather: optionalWeather,
  memo: optionalMemo,
});

export type CreateOutfitInput = z.infer<typeof createOutfitSchema>;
