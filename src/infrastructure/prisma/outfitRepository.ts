import type { Item, Outfit } from "@/generated/prisma/client";

import { prisma } from "./client";

export type OutfitWithItems = Outfit & {
  items: Array<{ itemId: string; item: Item }>;
};

export type CreateOutfitData = {
  wornOn: Date;
  itemIds: string[];
  satisfaction?: number;
  weather?: string;
  memo?: string;
};

const INCLUDE_ITEMS = {
  items: { include: { item: true } },
} as const;

export async function findOutfitsByUser(
  userId: string,
): Promise<OutfitWithItems[]> {
  return prisma.outfit.findMany({
    where: { userId, deletedAt: null },
    orderBy: { wornOn: "desc" },
    include: INCLUDE_ITEMS,
  });
}

export async function findOutfitById(
  userId: string,
  id: string,
): Promise<OutfitWithItems | null> {
  return prisma.outfit.findFirst({
    where: { id, userId, deletedAt: null },
    include: INCLUDE_ITEMS,
  });
}

export async function createOutfit(
  userId: string,
  data: CreateOutfitData,
): Promise<Outfit> {
  return prisma.$transaction(async (tx) => {
    const outfit = await tx.outfit.create({
      data: {
        userId,
        wornOn: data.wornOn,
        satisfaction: data.satisfaction ?? null,
        weather: data.weather ?? null,
        memo: data.memo ?? null,
        items: {
          create: data.itemIds.map((itemId) => ({ itemId })),
        },
      },
    });

    await createWearLogs(tx, userId, outfit.id, data.itemIds, data.wornOn);

    return outfit;
  });
}

export async function updateOutfit(
  userId: string,
  id: string,
  data: CreateOutfitData,
): Promise<number> {
  return prisma.$transaction(async (tx) => {
    const result = await tx.outfit.updateMany({
      where: { id, userId, deletedAt: null },
      data: {
        wornOn: data.wornOn,
        satisfaction: data.satisfaction ?? null,
        weather: data.weather ?? null,
        memo: data.memo ?? null,
      },
    });

    if (result.count === 0) return 0;

    await tx.outfitItem.deleteMany({ where: { outfitId: id } });
    await tx.outfitItem.createMany({
      data: data.itemIds.map((itemId) => ({ outfitId: id, itemId })),
    });

    await tx.wearLog.deleteMany({ where: { outfitId: id } });
    await createWearLogs(tx, userId, id, data.itemIds, data.wornOn);

    return result.count;
  });
}

export async function softDeleteOutfit(
  userId: string,
  id: string,
): Promise<number> {
  return prisma.$transaction(async (tx) => {
    const result = await tx.outfit.updateMany({
      where: { id, userId, deletedAt: null },
      data: { deletedAt: new Date() },
    });

    if (result.count > 0) {
      await tx.wearLog.deleteMany({ where: { outfitId: id } });
    }

    return result.count;
  });
}

type TransactionClient = Parameters<
  Parameters<typeof prisma.$transaction>[0]
>[0];

async function createWearLogs(
  tx: TransactionClient,
  userId: string,
  outfitId: string,
  itemIds: string[],
  wornOn: Date,
): Promise<void> {
  for (const itemId of itemIds) {
    await tx.wearLog.upsert({
      where: { itemId_wornOn: { itemId, wornOn } },
      create: { userId, itemId, wornOn, outfitId },
      update: {},
    });
  }
}
