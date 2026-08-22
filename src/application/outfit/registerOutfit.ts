import { createOutfit } from "@/infrastructure/prisma/outfitRepository";
import type { CreateOutfitInput } from "@/schemas/outfit";

/** 他人のアイテムが混ざっていた場合は null を返す */
export async function registerOutfit(
  userId: string,
  input: CreateOutfitInput,
): Promise<string | null> {
  const outfit = await createOutfit(userId, {
    wornOn: input.wornOn,
    itemIds: input.itemIds,
    satisfaction: input.satisfaction,
    weather: input.weather,
    memo: input.memo,
  });

  return outfit === null ? null : outfit.id;
}
