import { createStylingWithBoard } from "@/infrastructure/prisma/stylingRepository";
import type { BoardStylingInput } from "@/schemas/styling";

export async function registerStylingBoard(
  userId: string,
  input: BoardStylingInput,
): Promise<string> {
  const styling = await createStylingWithBoard(userId, {
    name: input.name,
    items: input.items,
    seasons: input.seasons,
    memo: input.memo,
  });

  return styling.id;
}
