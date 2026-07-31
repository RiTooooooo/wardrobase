import { createItem } from "@/infrastructure/prisma/itemRepository";
import type { CreateItemInput } from "@/schemas/item";

/**
 * 未入力（undefined）を DB の NULL に寄せる。
 * 各フィールドで `?? null` を並べると complexity 上限に当たるため関数にしている。
 */
function orNull<T>(value: T | undefined): T | null {
  if (value === undefined) {
    return null;
  }

  return value;
}

/**
 * アイテムを登録する。
 *
 * userId は必ず呼び出し元（Server Function）がセッションから取得して渡す。
 * この層でセッションを触らないのは、テストで DB もサーバーも不要にするため。
 */
export async function registerItem(
  userId: string,
  input: CreateItemInput,
): Promise<string> {
  const item = await createItem(userId, {
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

  return item.id;
}
