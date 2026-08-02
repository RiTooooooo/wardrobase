import { updateItem } from "@/infrastructure/prisma/itemRepository";
import type { CreateItemInput } from "@/schemas/item";

function orNull<T>(value: T | undefined): T | null {
  if (value === undefined) {
    return null;
  }

  return value;
}

export async function updateItemUseCase(
  userId: string,
  itemId: string,
  input: CreateItemInput,
): Promise<number> {
  return updateItem(userId, itemId, {
    name: input.name,
    category: input.category,
    subCategory: orNull(input.subCategory),
    color: input.color,
    seasons: input.seasons,
    brand: orNull(input.brand),
    price: orNull(input.price),
    purchasedAt: orNull(input.purchasedAt),
    memo: orNull(input.memo),
    imagePath: orNull(input.imagePath),
  });
}
