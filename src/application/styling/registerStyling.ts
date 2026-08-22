import { createStyling } from "@/infrastructure/prisma/stylingRepository";
import type { CreateStylingInput } from "@/schemas/styling";

/** 他人のアイテムが混ざっていた場合は null を返す */
export async function registerStyling(
  userId: string,
  input: CreateStylingInput,
): Promise<string | null> {
  const styling = await createStyling(userId, {
    name: input.name,
    itemIds: input.itemIds,
    seasons: input.seasons,
    memo: input.memo,
  });

  return styling === null ? null : styling.id;
}
