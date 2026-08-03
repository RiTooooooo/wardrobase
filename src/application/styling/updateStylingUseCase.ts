import { updateStyling } from "@/infrastructure/prisma/stylingRepository";
import type { CreateStylingInput } from "@/schemas/styling";

export async function updateStylingUseCase(
  userId: string,
  stylingId: string,
  input: CreateStylingInput,
): Promise<number> {
  return updateStyling(userId, stylingId, {
    name: input.name,
    itemIds: input.itemIds,
    seasons: input.seasons,
    memo: input.memo,
  });
}
