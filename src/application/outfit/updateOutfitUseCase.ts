import { updateOutfit } from "@/infrastructure/prisma/outfitRepository";
import type { CreateOutfitInput } from "@/schemas/outfit";

export async function updateOutfitUseCase(
  userId: string,
  outfitId: string,
  input: CreateOutfitInput,
): Promise<number> {
  return updateOutfit(userId, outfitId, {
    wornOn: input.wornOn,
    itemIds: input.itemIds,
    satisfaction: input.satisfaction,
    weather: input.weather,
    memo: input.memo,
  });
}
