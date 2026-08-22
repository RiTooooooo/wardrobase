import { createStylingWithBoard } from "@/infrastructure/prisma/stylingRepository";
import type { BoardStylingInput } from "@/schemas/styling";

/** 他人のアイテムが混ざっていた場合は null を返す */
export async function registerStylingBoard(
  userId: string,
  input: BoardStylingInput,
): Promise<string | null> {
  const styling = await createStylingWithBoard(userId, {
    name: input.name,
    items: input.items,
    seasons: input.seasons,
    memo: input.memo,
  });

  return styling === null ? null : styling.id;
}
