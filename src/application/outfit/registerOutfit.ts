import { createOutfit } from "@/infrastructure/prisma/outfitRepository";
import type { CreateOutfitInput } from "@/schemas/outfit";

export async function registerOutfit(
  userId: string,
  input: CreateOutfitInput,
): Promise<string> {
  const outfit = await createOutfit(userId, {
    wornOn: input.wornOn,
    itemIds: input.itemIds,
    satisfaction: input.satisfaction,
    weather: input.weather,
    memo: input.memo,
  });

  return outfit.id;
}
