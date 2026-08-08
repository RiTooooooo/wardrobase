import { updateStylingBoard } from "@/infrastructure/prisma/stylingRepository";
import type { BoardStylingInput } from "@/schemas/styling";

export async function updateStylingBoardUseCase(
  userId: string,
  stylingId: string,
  input: BoardStylingInput,
): Promise<number> {
  return updateStylingBoard(userId, stylingId, {
    name: input.name,
    items: input.items,
    seasons: input.seasons,
    memo: input.memo,
  });
}
